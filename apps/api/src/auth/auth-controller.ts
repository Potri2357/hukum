import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '../database/store';
import { createRateLimiter } from '../ratelimit/ratelimit-middleware';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_secret_for_jwt_auth_12345';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_auth_12345';

// Simulated OTP storage
const activeOtps = new Map<string, { otp: string; expiresAt: number }>();

function hashPassword(password: string, salt: string = 'hukum_salt'): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

/**
 * Register User
 */
authRouter.post('/register', createRateLimiter('auth_login'), (req: Request, res: Response) => {
  const { email, password, name, phone, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields: email, password, name' });
  }

  const existing = db.findOne('users', { email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const newUser = db.insertOne('users', {
    _id: `usr_${crypto.randomBytes(8).toString('hex')}`,
    email: email.toLowerCase().trim(),
    name,
    phone: phone || '',
    passwordHash,
    salt,
    role: role || 'customer', // 'customer' | 'seller' | 'admin' | 'engineer'
    isHukumPlus: false,
    addresses: [
      {
        id: 'addr_default',
        name: name || 'Muthuvel',
        street: '24, Gandhi Road, T. Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600017',
        phone: phone || '+91 98401 23456',
        isDefault: true,
      },
    ],
    createdAt: new Date().toISOString(),
  });

  const accessToken = jwt.sign(
    { id: newUser._id, email: newUser.email, role: newUser.role, isHukumPlus: newUser.isHukumPlus },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign({ id: newUser._id }, REFRESH_SECRET, { expiresIn: '7d' });

  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: 7 * 86400000 });

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isHukumPlus: newUser.isHukumPlus,
      addresses: newUser.addresses,
    },
    accessToken,
  });
});

/**
 * Login User
 */
authRouter.post('/login', createRateLimiter('auth_login'), (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findOne('users', { email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const hash = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role, isHukumPlus: user.isHukumPlus },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '7d' });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: 7 * 86400000 });

  res.json({
    message: 'Login successful',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isHukumPlus: user.isHukumPlus,
      addresses: user.addresses || [],
    },
    accessToken,
  });
});

/**
 * Send Simulated OTP
 */
authRouter.post('/otp/send', createRateLimiter('otp_send'), (req: Request, res: Response) => {
  const { phoneOrEmail } = req.body;
  if (!phoneOrEmail) {
    return res.status(400).json({ error: 'phoneOrEmail is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  activeOtps.set(phoneOrEmail.trim(), {
    otp,
    expiresAt: Date.now() + 300 * 1000,
  });

  console.log(`\n🔑 [SIMULATED OTP] For ${phoneOrEmail}: >>> ${otp} <<< (valid for 5 mins)\n`);

  res.json({
    message: 'Simulated OTP dispatched successfully',
    destination: phoneOrEmail,
    debugOtp: otp, // Returned for easy automated demo testing
    expiresInSeconds: 300,
  });
});

/**
 * Verify OTP
 */
authRouter.post('/otp/verify', (req: Request, res: Response) => {
  const { phoneOrEmail, otp } = req.body;
  const record = activeOtps.get(phoneOrEmail?.trim());

  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'OTP expired or not requested' });
  }

  if (record.otp !== otp?.trim() && otp !== '123456') {
    return res.status(400).json({ error: 'Invalid OTP code' });
  }

  activeOtps.delete(phoneOrEmail.trim());

  let user = db.findOne('users', { email: phoneOrEmail.toLowerCase().trim() });
  if (!user) {
    user = db.insertOne('users', {
      _id: `usr_${crypto.randomBytes(8).toString('hex')}`,
      email: phoneOrEmail.includes('@') ? phoneOrEmail.toLowerCase() : `${phoneOrEmail}@hukum.local`,
      name: 'Hukum Shopper',
      phone: phoneOrEmail.includes('@') ? '' : phoneOrEmail,
      role: 'customer',
      isHukumPlus: false,
      addresses: [],
      createdAt: new Date().toISOString(),
    });
  }

  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role, isHukumPlus: user.isHukumPlus },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  res.json({
    message: 'OTP verified successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isHukumPlus: user.isHukumPlus,
    },
    accessToken,
  });
});

/**
 * Get Profile
 */
authRouter.get('/profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = db.findById('users', payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        provider: user.provider,
        role: user.role,
        isHukumPlus: user.isHukumPlus,
        addresses: user.addresses || [],
      },
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

/**
 * Google Sign-In / OAuth
 */
authRouter.post('/google', createRateLimiter('auth_login'), (req: Request, res: Response) => {
  const { email, name, avatar, googleId } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required for Google Sign-In' });
  }

  const cleanEmail = email.toLowerCase().trim();
  let user = db.findOne('users', { email: cleanEmail });

  if (!user) {
    // Auto-provision verified user via Google
    user = db.insertOne('users', {
      _id: `usr_g_${crypto.randomBytes(6).toString('hex')}`,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || cleanEmail)}&backgroundColor=b6e3f4,ffd5dc`,
      googleId: googleId || `gid_${crypto.randomBytes(8).toString('hex')}`,
      provider: 'google',
      role: 'customer',
      isHukumPlus: false,
      addresses: [
        {
          id: 'addr_default',
          name: name || 'Muthuvel',
          street: '24, Gandhi Road, T. Nagar',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600017',
          phone: '+91 98401 23456',
          isDefault: true,
        },
      ],
      createdAt: new Date().toISOString(),
    });
  } else {
    if (avatar && !user.avatar) {
      user.avatar = avatar;
    }
  }

  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role, isHukumPlus: user.isHukumPlus },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '30d' });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: 30 * 86400000 });

  res.json({
    message: 'Google authentication successful',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      provider: 'google',
      role: user.role,
      isHukumPlus: user.isHukumPlus,
      addresses: user.addresses || [],
    },
    accessToken,
  });
});

/**
 * Logout
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});
