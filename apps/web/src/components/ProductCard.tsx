'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, Check, Heart, Zap, CheckCircle2 } from 'lucide-react';

export interface Product {
  _id: string;
  slug?: string;
  title: string;
  brand?: string;
  category: string;
  price: number;
  minPrice?: number;
  originalPrice?: number;
  discountPct?: number;
  media?: string[];
  image?: string;
  ratingAvg?: number;
  ratingCount?: number;
  soldCount?: number;
  isDeal?: boolean;
  inStock?: boolean;
}

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const currentPrice = product.minPrice || product.price;
  const originalPrice = product.originalPrice || Math.round(currentPrice * 1.25);
  const discount =
    product.discountPct || Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const displayImage =
    product.media?.[0] || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  const targetSlug = product.slug || product._id;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1600);
    } catch {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1600);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBuying(true);
    try {
      await fetch('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });
    } catch {
      // Proceed to checkout anyway
    } finally {
      setIsBuying(false);
      router.push('/checkout');
    }
  };

  return (
    <div className="group relative neuromorphic-card p-3 hover:border-spark-400 flex flex-col justify-between bg-white transition-all duration-200">
      {/* 1:1 Aspect Ratio Image Box */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#FAFBFD] mb-2.5 p-2 flex items-center justify-center border border-line/60">
        {/* Wishlist Heart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white text-ink-700 transition-all shadow-2xs border border-line/60"
          title="Add to Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-ink-400'
            }`}
          />
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">
            {discount}% OFF
          </span>
        )}

        <Link href={`/products/${targetSlug}`} className="w-full h-full flex items-center justify-center">
          <img
            src={displayImage}
            alt={product.title}
            loading="lazy"
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Metadata */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-700 bg-spark-50 px-1.5 py-0.5 rounded border border-spark-200/60">
            {product.brand || product.category}
          </span>

          {/* Flipkart-Style Assured Pill */}
          <div className="flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-spark-500 text-ink-900 text-[9px] font-black italic px-1.5 py-0.5 rounded shadow-2xs">
            <span>Assured</span>
            <CheckCircle2 className="w-2.5 h-2.5 text-blue-700 fill-blue-700" />
          </div>
        </div>

        {/* Title */}
        <Link href={`/products/${targetSlug}`} className="block">
          <h3 className="font-bold text-xs text-ink-900 line-clamp-2 hover:text-amber-600 transition-colors mb-1.5 leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Ratings Pill */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="inline-flex items-center gap-0.5 bg-emerald-700 text-white px-1.5 py-0.5 rounded text-[10px] font-black">
            <span>{(product.ratingAvg || 4.5).toFixed(1)}</span>
            <Star className="w-2.5 h-2.5 fill-white text-white" />
          </div>
          <span className="text-[10px] text-ink-500 font-medium truncate">
            ({(product.ratingCount || 1200).toLocaleString()})
          </span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-sm font-black text-ink-900 tabular-nums">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {originalPrice > currentPrice && (
            <span className="text-[11px] text-ink-400 line-through tabular-nums">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
          <span className="text-[10px] font-extrabold text-emerald-700">
            {discount}% off
          </span>
        </div>
      </div>

      {/* Action Footer: Delivery Pill + BUY NOW & Add to Cart */}
      <div className="pt-2 border-t border-line/80 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-ink-500 font-bold">
          <span className="flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Free 2-Day Delivery
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isAdded}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 border ${
              isAdded
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-surface-alt hover:bg-spark-100 text-ink-900 border-line hover:border-spark-300'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 text-ink-700" /> Add
              </>
            )}
          </button>

          {/* Direct BUY NOW Button in Website Spark Yellow Palette */}
          <button
            onClick={handleBuyNow}
            disabled={isBuying}
            className="py-1.5 px-2 rounded-lg bg-gradient-to-r from-spark-400 via-spark-500 to-amber-500 text-ink-900 border border-amber-500/40 text-[11px] font-black flex items-center justify-center gap-1 shadow-xs hover:shadow-glow transition-all active:scale-95"
          >
            <Zap className="w-3 h-3 fill-ink-900 text-ink-900" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
