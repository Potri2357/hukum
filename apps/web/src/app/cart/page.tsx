'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  ShieldCheck,
  Share2,
  Check,
  ArrowRight,
  ShoppingCart,
  Zap,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Short Link Share
  const [shortUrl, setShortUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/v1/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, delta: number) => {
    try {
      const res = await fetch('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: delta }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch {
      // Ignore error
    }
  };

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      const res = await fetch('/api/v1/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponInput.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setCart(data.cart);
        setCouponMsg({ text: data.message, isError: false });
      } else {
        setCouponMsg({ text: data.error, isError: true });
      }
    } catch {
      setCouponMsg({ text: 'Failed to apply coupon', isError: true });
    }
  };

  const shareCart = async () => {
    try {
      const res = await fetch('/api/v1/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: window.location.href,
          type: 'cart',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShortUrl(data.shortUrl);
        await navigator.clipboard.writeText(data.shortUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }
    } catch {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-spark-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-ink-700">Loading your cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-ink-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-spark-500" />
            Shopping Cart ({items.reduce((s: number, i: any) => s + i.quantity, 0)} items)
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Prices and stock are re-validated live in real-time.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={shareCart}
            className="px-4 py-2 rounded-full border border-line bg-white hover:bg-surface-alt text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Cart Link Copied!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-600" /> Share Cart Link
              </>
            )}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-surface-alt rounded-3xl p-16 text-center border border-line">
          <ShoppingCart className="w-16 h-16 text-ink-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-ink-900 mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-ink-500 max-w-sm mx-auto mb-6">
            Explore our curated selection of flagship smartphones, noise-cancelling headphones, and more.
          </p>
          <Link href="/" className="px-8 py-3 rounded-full btn-primary text-sm font-bold inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item: any) => (
              <div
                key={item.productId}
                className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 p-4 sm:p-5 flex gap-4 sm:gap-6 items-center justify-between shadow-sm"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white/60 backdrop-blur-md border border-white/80 flex-shrink-0 p-2 flex items-center justify-center shadow-inner">
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                    }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-ink-900 truncate mb-1">{item.title}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-black text-base text-ink-900 tabular-nums">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs text-ink-300 line-through tabular-nums">
                        ₹{item.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-line rounded-lg overflow-hidden bg-surface-alt">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="p-1.5 hover:bg-line text-ink-700 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-ink-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="p-1.5 hover:bg-line text-ink-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => updateQuantity(item.productId, -item.quantity)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-black text-base text-ink-900 tabular-nums">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Coupon (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Code Input */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700 mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-spark-500" /> Apply Coupon
              </h3>
              <form onSubmit={applyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="e.g. HUKUM500 or SPARK10"
                  className="flex-1 px-3 py-2 rounded-xl border border-line text-xs uppercase font-bold tracking-wider focus:outline-none focus:border-spark-500 bg-white/90"
                />
                <button type="submit" className="px-4 py-2 rounded-xl btn-primary text-xs font-bold">
                  Apply
                </button>
              </form>
              {couponMsg && (
                <p
                  className={`text-xs mt-2 font-semibold ${
                    couponMsg.isError ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/80 p-6 shadow-md">
              <h3 className="font-black text-base text-ink-900 mb-4 pb-4 border-b border-line/60">
                Price Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-500">Subtotal ({items.length} items)</span>
                  <span className="font-bold text-ink-900 tabular-nums">
                    ₹{(cart?.subtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {cart?.regularSavings > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Retail Savings</span>
                    <span className="font-bold tabular-nums">
                      -₹{(cart.regularSavings).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {cart?.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount ({cart.appliedCoupon})</span>
                    <span className="font-bold tabular-nums">
                      -₹{(cart.couponDiscount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-ink-500">Delivery Fee</span>
                  <span className="font-bold text-emerald-700">
                    {cart?.shipping === 0 ? 'FREE' : `₹${cart?.shipping}`}
                  </span>
                </div>

                <div className="pt-4 border-t border-line flex justify-between items-baseline">
                  <span className="text-sm font-black text-ink-900">Total Payable</span>
                  <span className="text-xl font-black text-ink-900 tabular-nums">
                    ₹{(cart?.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full mt-6 py-3.5 rounded-full btn-primary text-sm font-black text-center flex items-center justify-center gap-2 shadow-glow block"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
