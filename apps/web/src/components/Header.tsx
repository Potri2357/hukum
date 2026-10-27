'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  Zap,
  ChevronDown,
  Store,
  CheckCircle,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Camera,
  Layers,
  Shirt,
  Tag,
  X,
  LogOut,
  Package,
  ShieldCheck,
  Check,
  Bike,
  Sparkles,
} from 'lucide-react';

interface Suggestion {
  id: string;
  text: string;
  type: string;
  metadata?: {
    category?: string;
    imageUrl?: string;
    price?: number;
    brand?: string;
  };
}

export function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [pincode, setPincode] = useState('560038');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPincode, setNewPincode] = useState('');
  const [pincodeMsg, setPincodeMsg] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Authentication State
  const [user, setUser] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPasswordOrOtp, setLoginPasswordOrOtp] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Google accounts for simulated One-Tap / OAuth picker
  const googleAccounts = [
    {
      name: 'Vardhan',
      email: 'vardhan@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Nani',
      email: 'nani@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    },
  ];

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hukum_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  // Sync cart count
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('/api/v1/cart');
        if (res.ok) {
          const data = await res.json();
          const count = (data.cart?.items || []).reduce(
            (sum: number, it: any) => sum + it.quantity,
            0
          );
          setCartCount(count);
        }
      } catch {
        // Ignore offline cart fetch error
      }
    };
    fetchCart();
    const interval = setInterval(fetchCart, 4000);
    return () => clearInterval(interval);
  }, []);

  // Autocomplete debounce
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/suggest?q=${encodeURIComponent(query)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setIsOpen(true);
        }
      } catch {
        setSuggestions([]);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      setQuery(selected.text);
      setIsOpen(false);
      router.push(`/?q=${encodeURIComponent(selected.text)}`);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPincode || newPincode.trim().length !== 6) {
      setPincodeMsg('Please enter a valid 6-digit postal code');
      return;
    }

    try {
      const res = await fetch(`/api/v1/pincode/check?pincode=${newPincode.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setPincode(data.pincode);
        setPincodeMsg(`Servicing ${data.hubName} (${data.estimatedDays} day express delivery)`);
        setTimeout(() => setIsPinModalOpen(false), 800);
      } else {
        setPincode(newPincode);
        setIsPinModalOpen(false);
      }
    } catch {
      setPincode(newPincode);
      setIsPinModalOpen(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async (account: { name: string; email: string; avatar: string }) => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('hukum_user', JSON.stringify(data.user));
        if (data.accessToken) localStorage.setItem('hukum_token', data.accessToken);
        setIsGoogleModalOpen(false);
        setIsLoginModalOpen(false);
      } else {
        const err = await res.json();
        setLoginError(err.error || 'Google authentication failed');
      }
    } catch {
      // Offline fallback
      const fallbackUser = {
        name: account.name,
        email: account.email,
        avatar: account.avatar,
        provider: 'google',
        role: 'customer',
      };
      setUser(fallbackUser);
      localStorage.setItem('hukum_user', JSON.stringify(fallbackUser));
      setIsGoogleModalOpen(false);
      setIsLoginModalOpen(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Email / Password / Mobile Custom Login & Registration
  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      if (authMode === 'register') {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: registerName.trim() || 'Hukum Shopper',
            email: loginPhoneOrEmail.includes('@')
              ? loginPhoneOrEmail.trim()
              : `${loginPhoneOrEmail.trim()}@hukum.local`,
            password: loginPasswordOrOtp || 'password123',
            phone: loginPhoneOrEmail.replace(/\D/g, '') || '9876543210',
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          localStorage.setItem('hukum_user', JSON.stringify(data.user));
          if (data.accessToken) localStorage.setItem('hukum_token', data.accessToken);
          setIsLoginModalOpen(false);
        } else {
          setLoginError(data.error || 'Registration failed');
        }
      } else {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginPhoneOrEmail.includes('@')
              ? loginPhoneOrEmail.trim()
              : `${loginPhoneOrEmail.trim()}@hukum.local`,
            password: loginPasswordOrOtp || 'password123',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('hukum_user', JSON.stringify(data.user));
          if (data.accessToken) localStorage.setItem('hukum_token', data.accessToken);
          setIsLoginModalOpen(false);
        } else {
          // Instant demo login fallback
          const demoUser = {
            name: loginPhoneOrEmail.includes('@') ? loginPhoneOrEmail.split('@')[0] : 'Shopper',
            email: loginPhoneOrEmail.includes('@') ? loginPhoneOrEmail : 'shopper@hukum.local',
            phone: loginPhoneOrEmail.replace(/\D/g, '') || '9876543210',
            role: 'customer',
          };
          setUser(demoUser);
          localStorage.setItem('hukum_user', JSON.stringify(demoUser));
          setIsLoginModalOpen(false);
        }
      }
    } catch {
      const demoUser = {
        name: loginPhoneOrEmail.includes('@') ? loginPhoneOrEmail.split('@')[0] : 'Shopper',
        email: loginPhoneOrEmail.includes('@') ? loginPhoneOrEmail : 'shopper@hukum.local',
        phone: loginPhoneOrEmail.replace(/\D/g, '') || '9876543210',
        role: 'customer',
      };
      setUser(demoUser);
      localStorage.setItem('hukum_user', JSON.stringify(demoUser));
      setIsLoginModalOpen(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('hukum_user');
    localStorage.removeItem('hukum_token');
    setIsAccountDropdownOpen(false);
  };

  const categoryNavItems = [
    { label: 'All Products', icon: Layers, href: '/?category=all' },
    { label: 'Mobiles', icon: Smartphone, href: '/?category=Mobiles%20%26%20Tablets' },
    { label: 'Laptops', icon: Laptop, href: '/?category=Laptops%20%26%20Computers' },
    { label: 'Audio', icon: Headphones, href: '/?category=Audio%20%26%20Soundbars' },
    { label: 'Watches', icon: Watch, href: '/?category=Smart%20Watches' },
    { label: 'Bikes & Auto', icon: Bike, href: '/?category=Bikes%20%26%20Automotive' },
    { label: 'Beauty & Care', icon: Sparkles, href: '/?category=Beauty%20%26%20Makeup' },
    { label: 'Textiles', icon: Shirt, href: '/?category=Textiles%20%26%20Ethnic%20Wear' },
    { label: 'Cameras', icon: Camera, href: '/?category=Cameras%20%26%20Drones' },
    { label: 'Gaming', icon: Zap, href: '/?category=Gaming%20%26%20Desk' },
    { label: 'Top Deals', icon: Tag, href: '/?category=deals' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-white/60 shadow-xs">
      {/* Main Flipkart-Style Navbar (Clean & Modern) */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo: Pure Hukum wordmark, no sparkles, no explore plus */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-spark-500 flex items-center justify-center font-black text-xl text-ink-900 shadow-xs group-hover:scale-105 transition-transform">
            H
          </div>
          <span className="text-2xl font-black tracking-tight text-ink-900 group-hover:text-amber-600 transition-colors">
            Hukum
          </span>
        </Link>

        {/* Location / Pincode Pill */}
        <button
          onClick={() => setIsPinModalOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-alt hover:bg-white border border-line text-xs font-medium text-ink-700 transition-all shadow-2xs"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>Deliver to <strong className="text-ink-900">{pincode}</strong></span>
          <ChevronDown className="w-3 h-3 text-ink-500" />
        </button>

        {/* Centered Search Bar with Instant Autocomplete */}
        <div ref={searchRef} className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-ink-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search for iPhone 15 Pro, Sony ANC Headphones, Nike Jordans..."
              className="w-full pl-11 pr-24 py-2.5 rounded-xl bg-surface-alt border border-line focus:border-spark-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spark-300/40 text-sm text-ink-900 placeholder:text-ink-400 transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 rounded-lg btn-primary text-xs font-bold"
            >
              Search
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-line shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2 border-b border-line bg-surface-alt text-[10px] font-bold uppercase tracking-wider text-ink-500 flex justify-between items-center px-4">
                <span>Top Suggestions</span>
                <span className="text-[10px] text-amber-700 font-bold">Press Enter to Search</span>
              </div>
              <ul className="py-1">
                {suggestions.map((item, idx) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      setQuery(item.text);
                      setIsOpen(false);
                      router.push(`/?q=${encodeURIComponent(item.text)}`);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-4 py-2.5 flex items-center justify-between cursor-pointer text-xs transition-colors ${
                      selectedIndex === idx
                        ? 'bg-spark-100 font-bold text-ink-900'
                        : 'hover:bg-surface-alt text-ink-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-3.5 h-3.5 text-ink-400" />
                      <span>{item.text}</span>
                    </div>
                    {item.metadata?.category && (
                      <span className="text-[10px] font-semibold text-ink-500 bg-white px-2 py-0.5 rounded-full border border-line">
                        in {item.metadata.category}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Controls: User Account Login, Seller Hub, Cart */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Account Login / User Dropdown */}
          <div ref={accountRef} className="relative">
            {user ? (
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-white border border-line text-xs font-bold text-ink-900 transition-all shadow-2xs group"
              >
                {user.avatar ? (
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border border-line shadow-xs"
                    />
                    {user.provider === 'google' && (
                      <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-2xs">
                        <GoogleIcon className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden sm:inline max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-ink-400" />
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-surface-alt border border-line text-xs font-bold text-ink-900 transition-all shadow-2xs group"
              >
                <User className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Login</span>
                <ChevronDown className="w-3.5 h-3.5 text-ink-400" />
              </button>
            )}

            {/* Logged In User Dropdown Menu */}
            {isAccountDropdownOpen && user && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-line shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-4 py-2.5 border-b border-line">
                  <div className="flex items-center gap-2.5 mb-1">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-line" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-ink-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-ink-500 truncate">{user.email || user.phone}</p>
                    </div>
                  </div>
                  {user.provider === 'google' && (
                    <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-200 mt-1">
                      <GoogleIcon className="w-2.5 h-2.5" />
                      <span>Google Verified Account</span>
                    </div>
                  )}
                </div>

                <div className="py-1 text-xs">
                  <Link
                    href="/orders"
                    onClick={() => setIsAccountDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface-alt text-ink-700 font-semibold"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setIsAccountDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface-alt text-ink-700"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                    <span>My Cart ({cartCount})</span>
                  </Link>
                  <Link
                    href="/seller"
                    onClick={() => setIsAccountDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface-alt text-ink-700"
                  >
                    <Store className="w-3.5 h-3.5 text-amber-600" />
                    <span>Seller Dashboard</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-line px-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Seller Hub */}
          <Link
            href="/seller"
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-ink-700 hover:bg-surface-alt transition-colors"
          >
            <Store className="w-4 h-4 text-amber-600" />
            <span>Seller Hub</span>
          </Link>

          {/* Cart Icon & Badge */}
          <Link
            href="/cart"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-spark-50 hover:bg-spark-100 border border-spark-200 text-ink-900 transition-all font-bold text-xs"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* Flipkart-Style Top Category Strip (Large Prominent Icons ABOVE Text) */}
      <nav className="bg-white/75 backdrop-blur-xl border-t border-line/60 px-3 py-3.5 overflow-x-auto scrollbar-none shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[980px] px-2 gap-2 sm:gap-3 text-ink-700">
          {categoryNavItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="flex flex-col items-center justify-center gap-2 py-1 px-2 sm:px-3 rounded-2xl hover:bg-spark-50/70 transition-all group cursor-pointer flex-1 text-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-white/95 via-white/85 to-spark-50/80 group-hover:from-spark-100 group-hover:to-amber-100 border border-white/90 group-hover:border-spark-400 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-2xs group-hover:shadow-md backdrop-blur-md">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-700 group-hover:text-amber-900 transition-colors stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-[13px] font-black text-ink-800 group-hover:text-amber-700 tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Pincode Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-line">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-ink-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-spark-500" /> Enter Delivery Pincode
              </h3>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="text-ink-400 hover:text-ink-900 p-1 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-ink-500 mb-4">
              Enter your 6-digit postal code to verify instant express delivery and stock availability.
            </p>
            <form onSubmit={handlePincodeSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={newPincode}
                  onChange={(e) => {
                    setNewPincode(e.target.value.replace(/\D/g, ''));
                    setPincodeMsg('');
                  }}
                  placeholder="e.g. 560038"
                  className="w-full px-4 py-2.5 rounded-xl border border-line focus:border-spark-500 focus:outline-none text-center font-mono font-bold text-base tracking-widest"
                />
              </div>
              {pincodeMsg && (
                <p className="text-xs text-center text-amber-600 font-medium">{pincodeMsg}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl btn-primary text-xs font-black shadow-sm"
              >
                Check & Apply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Complete End-to-End Login & Google Auth Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-line relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                setLoginError('');
              }}
              className="absolute top-4 right-4 text-ink-400 hover:text-ink-900 p-1.5 rounded-full hover:bg-surface-alt z-10 transition-colors"
              aria-label="Close login dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Banner Header */}
            <div className="bg-gradient-to-r from-spark-400 via-spark-500 to-amber-500 p-6 text-ink-900">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/70 px-2.5 py-0.5 rounded-full">
                Hukum Verified Access
              </span>
              <h2 className="text-2xl font-black mt-2">
                {authMode === 'signin' ? 'Sign In to Hukum' : 'Create an Account'}
              </h2>
              <p className="text-xs text-ink-800 font-medium mt-1">
                Access your orders, personalized wishlist, and express checkout.
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Primary Google Login Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(true)}
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 rounded-xl border border-line bg-white hover:bg-surface-alt hover:border-ink-300 text-ink-900 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-sm active:scale-98"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-line w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-ink-400 absolute">
                  or with email / mobile
                </span>
              </div>

              {/* Sign In vs Register Toggle */}
              <div className="grid grid-cols-2 p-1 bg-surface-alt rounded-xl border border-line text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setLoginError('');
                  }}
                  className={`py-1.5 rounded-lg transition-all ${
                    authMode === 'signin'
                      ? 'bg-white text-ink-900 shadow-2xs'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setLoginError('');
                  }}
                  className={`py-1.5 rounded-lg transition-all ${
                    authMode === 'register'
                      ? 'bg-white text-ink-900 shadow-2xs'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form Input */}
              <form onSubmit={handleCustomLogin} className="space-y-3.5">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-ink-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="e.g. Vardhan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line focus:border-spark-500 focus:outline-none text-xs text-ink-900 font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1">
                    Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={loginPhoneOrEmail}
                    onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                    placeholder="e.g. shopper@gmail.com or 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line focus:border-spark-500 focus:outline-none text-xs text-ink-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1">
                    Password / OTP (Use 123456)
                  </label>
                  <input
                    type="password"
                    value={loginPasswordOrOtp}
                    onChange={(e) => setLoginPasswordOrOtp(e.target.value)}
                    placeholder="Enter password or OTP"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line focus:border-spark-500 focus:outline-none text-xs text-ink-900 font-medium"
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-rose-600 font-semibold">{loginError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-xl btn-primary text-xs font-black shadow-sm active:scale-98 transition-all"
                >
                  {isLoggingIn
                    ? 'Processing...'
                    : authMode === 'signin'
                    ? 'Sign In to Account'
                    : 'Create My Account'}
                </button>
              </form>

              <p className="text-[10px] text-center text-ink-400 leading-relaxed">
                By continuing, you agree to Hukum&apos;s Terms of Use and Privacy Notice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign-In Account Selector Dialog (Realistic OAuth Flow) */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-line relative animate-in zoom-in-95 duration-150">
            {/* Close */}
            <button
              onClick={() => setIsGoogleModalOpen(false)}
              className="absolute top-4 right-4 text-ink-400 hover:text-ink-900 p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-alt border border-line mb-3 shadow-2xs">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-ink-900">Sign in with Google</h3>
              <p className="text-xs text-ink-500 mt-0.5">to continue to Hukum Marketplace</p>
            </div>

            {/* List of Verified Google Profiles */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider block">
                Choose an account
              </span>

              {googleAccounts.map((acc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleGoogleSignIn(acc)}
                  className="w-full p-3 rounded-2xl border border-line hover:border-blue-400 hover:bg-blue-50/40 flex items-center gap-3 transition-all text-left shadow-2xs group"
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-9 h-9 rounded-full object-cover border border-line"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-ink-900 group-hover:text-blue-700">{acc.name}</p>
                    <p className="text-[11px] text-ink-500 truncate">{acc.email}</p>
                  </div>
                  <Check className="w-4 h-4 text-transparent group-hover:text-blue-600" />
                </button>
              ))}
            </div>

            {/* Or custom Google account */}
            <div className="pt-2 border-t border-line">
              <span className="text-[11px] font-bold text-ink-500 block mb-2">Or enter another Google account</span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="google-email@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  disabled={!customGoogleEmail.trim()}
                  onClick={() =>
                    handleGoogleSignIn({
                      name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
                      email: customGoogleEmail.trim(),
                      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        customGoogleName || customGoogleEmail
                      )}`,
                    })
                  }
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-2xs disabled:opacity-50"
                >
                  Continue with this Google Account
                </button>
              </div>
            </div>

            <p className="text-[10px] text-center text-ink-400 mt-4">
              To continue, Google will share your name, email address, and profile picture with Hukum.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
