import { Router, Request, Response } from 'express';
import { db } from '../database/store';

export const cartRouter = Router();

export interface CartItem {
  productId: string;
  sku?: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  sellerId?: string;
}

const COUPONS: Record<string, { discountPct?: number; flatDiscount?: number; minSpend: number }> = {
  HUKUM500: { flatDiscount: 500, minSpend: 2000 },
  SPARK10: { discountPct: 10, minSpend: 1000 },
  FIRSTORDER: { discountPct: 15, minSpend: 500 },
};

function getCartForUser(userId: string) {
  let cart = db.findOne('carts', { userId });
  if (!cart) {
    cart = db.insertOne('carts', {
      _id: `cart_${userId}`,
      userId,
      items: [],
      savedForLater: [],
      appliedCoupon: null,
      updatedAt: new Date().toISOString(),
    });
  }
  return cart;
}

function calculateTotals(items: CartItem[], appliedCouponCode: string | null) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalSubtotal = items.reduce(
    (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
    0
  );
  const regularSavings = Math.max(0, originalSubtotal - subtotal);

  let couponDiscount = 0;
  if (appliedCouponCode && COUPONS[appliedCouponCode]) {
    const coupon = COUPONS[appliedCouponCode];
    if (subtotal >= coupon.minSpend) {
      if (coupon.flatDiscount) {
        couponDiscount = coupon.flatDiscount;
      } else if (coupon.discountPct) {
        couponDiscount = Math.round((subtotal * coupon.discountPct) / 100);
      }
    }
  }

  const shipping = subtotal > 499 ? 0 : 40;
  const total = Math.max(0, subtotal - couponDiscount + shipping);

  return {
    subtotal,
    originalSubtotal,
    regularSavings,
    couponDiscount,
    shipping,
    total,
  };
}

/**
 * Get Cart
 */
cartRouter.get('/cart', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'guest_user';
  const cart = getCartForUser(userId);
  const totals = calculateTotals(cart.items || [], cart.appliedCoupon);

  res.json({
    cart: {
      ...cart,
      ...totals,
    },
  });
});

/**
 * Add / Update Cart Item
 */
cartRouter.post('/cart/items', (req: Request, res: Response) => {
  const { userId = 'guest_user', productId, quantity = 1, sku } = req.body;

  const product = db.findById('products', productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const cart = getCartForUser(userId);
  const items: CartItem[] = cart.items || [];
  const existingIdx = items.findIndex((it) => it.productId === productId && it.sku === sku);

  if (existingIdx !== -1) {
    items[existingIdx].quantity += quantity;
    if (items[existingIdx].quantity <= 0) {
      items.splice(existingIdx, 1);
    }
  } else if (quantity > 0) {
    items.push({
      productId: product._id,
      sku: sku || product.sku || 'SKU-DEFAULT',
      title: product.title,
      price: product.minPrice || product.price,
      originalPrice: product.originalPrice || (product.minPrice || product.price) * 1.25,
      image: product.media?.[0] || product.image,
      quantity,
    });
  }

  db.updateOne('carts', cart._id, { items, updatedAt: new Date().toISOString() });
  const totals = calculateTotals(items, cart.appliedCoupon);

  res.json({
    message: 'Cart updated',
    cart: {
      ...cart,
      items,
      ...totals,
    },
  });
});

/**
 * Apply Coupon
 */
cartRouter.post('/cart/coupon', (req: Request, res: Response) => {
  const { userId = 'guest_user', couponCode } = req.body;
  const code = String(couponCode).toUpperCase().trim();

  if (!COUPONS[code]) {
    return res.status(400).json({ error: 'Invalid coupon code. Try HUKUM500 or SPARK10' });
  }

  const cart = getCartForUser(userId);
  const items: CartItem[] = cart.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (subtotal < COUPONS[code].minSpend) {
    return res.status(400).json({
      error: `Coupon requires a minimum order value of ₹${COUPONS[code].minSpend}`,
    });
  }

  db.updateOne('carts', cart._id, { appliedCoupon: code });
  const totals = calculateTotals(items, code);

  res.json({
    message: `Coupon ${code} applied successfully!`,
    cart: {
      ...cart,
      appliedCoupon: code,
      ...totals,
    },
  });
});
