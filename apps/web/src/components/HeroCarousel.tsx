'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, ShieldCheck, Zap, ShoppingCart, CheckCircle2 } from 'lucide-react';

const slides = [
  {
    id: 'prod_ip15_pro',
    tag: 'FESTIVAL FLAGSHIP DEAL',
    title: 'Apple iPhone 15 Pro Max',
    subtitle: 'Forged in Natural Titanium · A17 Pro Chip · 5x Optical Zoom',
    price: 154900,
    originalPrice: 159900,
    discount: '₹5,000 OFF',
    slug: 'apple-iphone-15-pro-max-256gb',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    accentColor: 'from-amber-400/15 via-spark-500/10 to-transparent',
  },
  {
    id: 'prod_macbook_air_m3',
    tag: 'PRO PRODUCTIVITY ULTRABOOK',
    title: 'Apple MacBook Air M3',
    subtitle: '13.6" Liquid Retina · 16GB Unified Memory · 18h Battery',
    price: 134900,
    originalPrice: 144900,
    discount: '7% OFF',
    slug: 'apple-macbook-air-m3-13inch',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    accentColor: 'from-blue-500/15 via-spark-500/10 to-transparent',
  },
  {
    id: 'prod_sony_wh1000xm5',
    tag: 'INDUSTRY LEADING ANC',
    title: 'Sony WH-1000XM5',
    subtitle: 'Auto NC Optimizer · 8 Microphones · 30-Hour Playtime',
    price: 26990,
    originalPrice: 34990,
    discount: '23% OFF',
    slug: 'sony-wh-1000xm5-anc-headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    accentColor: 'from-spark-500/20 via-amber-600/10 to-transparent',
  },
  {
    id: 'prod_s24_ultra',
    tag: 'GALAXY AI TITANIUM',
    title: 'Samsung Galaxy S24 Ultra 5G',
    subtitle: 'Built-in S Pen · 200MP Quad Telephoto · Snapdragon 8 Gen 3',
    price: 139999,
    originalPrice: 149999,
    discount: '₹10,000 OFF',
    slug: 'samsung-galaxy-s24-ultra-512gb',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
    accentColor: 'from-amber-500/15 via-yellow-400/10 to-transparent',
  },
  {
    id: 'prod_ps5_slim',
    tag: 'NEXT-GEN GAMING CONSOLE',
    title: 'Sony PlayStation 5 Slim',
    subtitle: 'Ultra-High Speed 1TB SSD · 4K 120Hz · DualSense Haptics',
    price: 44990,
    originalPrice: 54990,
    discount: '18% OFF',
    slug: 'sony-playstation-5-slim-console',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
    accentColor: 'from-indigo-500/15 via-spark-500/10 to-transparent',
  },
];

export function HeroCarousel() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBuying(true);
    try {
      await fetch('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: slide.id,
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
    <div className="relative overflow-hidden rounded-2xl bg-white border border-line mb-6 shadow-sm neuromorphic-card">
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.accentColor} pointer-events-none`} />

      <div className="max-w-7xl mx-auto px-5 py-6 sm:px-8 sm:py-7 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left Copy (Compact & High Contrast) */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-spark-100 text-amber-800 text-[11px] font-black tracking-wider uppercase mb-2 border border-spark-200">
            <Sparkles className="w-3 h-3 text-amber-600 fill-amber-600" />
            <span>{slide.tag}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-ink-900 tracking-tight leading-tight mb-1.5">
            {slide.title}
          </h2>

          <p className="text-xs sm:text-sm text-ink-500 mb-4 font-medium max-w-xl truncate">
            {slide.subtitle}
          </p>

          <div className="flex items-baseline gap-2.5 mb-5">
            <span className="text-2xl sm:text-3xl font-black text-ink-900 tabular-nums">
              ₹{slide.price.toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-ink-400 line-through tabular-nums">
              ₹{slide.originalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {slide.discount}
            </span>
            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-spark-500 text-ink-900 text-[10px] font-black italic px-1.5 py-0.5 rounded shadow-2xs">
              <span>Assured</span>
              <CheckCircle2 className="w-2.5 h-2.5 text-blue-700 fill-blue-700" />
            </div>
          </div>

          {/* Action CTAs: Direct BUY NOW in Website Spark Yellow Palette */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleBuyNow}
              disabled={isBuying}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-spark-400 via-spark-500 to-amber-500 text-ink-900 border border-amber-500/40 text-xs font-black flex items-center gap-1.5 shadow-sm hover:shadow-glow transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-ink-900 text-ink-900" />
              <span>BUY NOW</span>
            </button>

            <Link
              href={`/products/${slide.slug}`}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-surface-alt border border-line text-ink-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <span>Explore Specs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Media Frame (Compact Strict 1:1 Aspect Ratio) */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-[#FAFBFD] border border-line p-3 flex items-center justify-center flex-shrink-0 relative shadow-2xs overflow-hidden group">
          <Link href={`/products/${slide.slug}`} className="w-full h-full flex items-center justify-center">
            <img
              src={slide.image}
              alt={slide.title}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${
              current === idx ? 'w-6 bg-spark-500' : 'w-2 bg-line'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
