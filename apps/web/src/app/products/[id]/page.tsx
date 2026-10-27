'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Shield,
  Truck,
  RotateCcw,
  Share2,
  Check,
  ShoppingCart,
  Zap,
  MapPin,
  Store,
  Heart,
  Tag,
  CreditCard,
  CheckCircle2,
  Award,
  ChevronRight,
} from 'lucide-react';

const CATEGORY_FALLBACKS: Record<string, string> = {
  'Mobiles & Tablets': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80',
  'Laptops & Computers': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  'Audio & Soundbars': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  'Smart Watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  'Cameras & Drones': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
  'Gaming & Desk': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
  'Bikes & Automotive': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
  'Beauty & Makeup': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
  'Textiles & Ethnic Wear': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
  'Sneakers & Fashion': 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
};
const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [pincode, setPincode] = useState('560038');
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState('Delivery by Tomorrow, 11 PM | Free ₹70');
  const [selectedStorage, setSelectedStorage] = useState('256 GB');
  const [selectedColor, setSelectedColor] = useState('Default');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Clean Share Link State
  const [shortUrl, setShortUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Cart State
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/v1/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          setSelectedImage(
            data.product?.media?.[0] ||
              data.product?.image ||
              CATEGORY_FALLBACKS[data.product?.category] ||
              DEFAULT_FALLBACK_IMAGE
          );
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch('/api/v1/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: window.location.href,
          type: 'product',
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
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const res = await fetch('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2000);
      }
    } catch {
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/checkout');
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.trim().length === 6) {
      setPincode(pincodeInput.trim());
      setPincodeStatus(`Delivery by Tomorrow, 11 PM to ${pincodeInput.trim()} | Free ₹70`);
      setPincodeInput('');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-9 h-9 border-4 border-spark-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-ink-700">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-2xl font-black text-ink-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-ink-500 mb-6">The requested product could not be located in our catalog.</p>
        <Link href="/" className="px-6 py-2.5 rounded-full btn-primary text-sm font-bold">
          Back to Store
        </Link>
      </div>
    );
  }

  const currentPrice = product.minPrice || product.price;
  const originalPrice = product.originalPrice || Math.round(currentPrice * 1.25);
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const storageOptions = ['128 GB', '256 GB', '512 GB', '1 TB'];
  const colorOptions = [
    { name: 'Natural Titanium', colorHex: '#C5C5C0' },
    { name: 'Space Black', colorHex: '#2E2D32' },
    { name: 'Titanium Gray', colorHex: '#8E8E93' },
  ];

  return (
    <div className="pb-20">
      {/* Flipkart Breadcrumb Navigation */}
      <nav className="text-xs text-ink-500 mb-6 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1">
        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
        <Link href={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-amber-600 transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
        <span className="text-ink-400">{product.brand}</span>
        <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
        <span className="text-ink-900 font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Flipkart Sticky Image Gallery + Dual CTA Buttons (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-4">
            {/* Main 1:1 Aspect Ratio Image Frame */}
            <div className="aspect-square rounded-2xl bg-white/80 backdrop-blur-xl border border-white/80 p-6 flex items-center justify-center relative neuromorphic-card overflow-hidden shadow-md">
              {/* Wishlist Heart */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white text-ink-700 transition-all shadow-sm border border-white/80"
                title="Add to Wishlist"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-ink-400'
                  }`}
                />
              </button>

              {/* Discount Pill */}
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm border border-emerald-400/40">
                  {discount}% OFF
                </span>
              )}

              <img
                src={selectedImage}
                alt={product.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    CATEGORY_FALLBACKS[product?.category] || DEFAULT_FALLBACK_IMAGE;
                }}
                className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Thumbnail Carousel */}
            {product.media && product.media.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {product.media.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 p-1 bg-white/85 backdrop-blur-md transition-all ${
                      selectedImage === img
                        ? 'border-spark-500 ring-2 ring-spark-200'
                        : 'border-white/80 opacity-75 hover:opacity-100 shadow-2xs'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          CATEGORY_FALLBACKS[product?.category] || DEFAULT_FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Flipkart-Style Dual Action Buttons Directly Under Image */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="py-4 rounded-xl btn-primary text-ink-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-glow transition-all"
              >
                {addSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-800" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-ink-900" /> ADD TO CART
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="py-4 rounded-xl btn-buy-now text-ink-900 font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Zap className="w-4 h-4 fill-ink-900 text-ink-900" /> BUY NOW
              </button>
            </div>

            {/* Clean Consumer Share Chip */}
            <div className="p-3.5 rounded-xl bg-white/80 backdrop-blur-xl border border-white/80 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-ink-900">Share with family & friends</span>
              </div>

              <button
                onClick={handleShare}
                disabled={isSharing}
                className="px-3 py-1.5 rounded-lg bg-surface-alt hover:bg-line border border-line text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-amber-600" /> Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Flipkart Product Details, Offers, Variants & Specs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Badges */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-spark-100 px-2 py-0.5 rounded border border-spark-200">
                {product.brand}
              </span>
              <span className="text-xs text-ink-400 font-bold">·</span>
              <span className="text-xs text-ink-500 font-medium">SKU: {product.sku || 'HKM-PROD-01'}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-ink-900 tracking-tight leading-snug mb-3">
              {product.title}
            </h1>

            {/* Ratings & Flipkart Assured Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1 bg-emerald-700 text-white px-2 py-0.5 rounded text-xs font-black shadow-sm">
                <span>{(product.ratingAvg || 4.8).toFixed(1)}</span>
                <Star className="w-3 h-3 fill-white text-white" />
              </div>
              <span className="text-xs text-ink-500 font-semibold">
                {(product.ratingCount || 14280).toLocaleString()} Ratings & Reviews
              </span>

              {/* Flipkart Assured Badge */}
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-spark-500 text-ink-900 text-xs font-black italic px-2 py-0.5 rounded shadow-sm">
                <span>Assured</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 fill-blue-700" />
              </div>

              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                {(product.soldCount || 35000).toLocaleString()}+ Bought this month
              </span>
            </div>
          </div>

          {/* Pricing Box (Flipkart Style) */}
          <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/80 neuromorphic-card shadow-sm">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block mb-1">
              Special Price Offer
            </span>
            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <span className="text-3xl md:text-4xl font-black text-ink-900 tabular-nums">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-base text-ink-400 line-through tabular-nums">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-black text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded">
                Save ₹{(originalPrice - currentPrice).toLocaleString('en-IN')} ({discount}% off)
              </span>
            </div>
            <p className="text-xs text-ink-500 font-medium">
              Inclusive of all taxes. No Cost EMI available starting from ₹{Math.round(currentPrice / 12).toLocaleString('en-IN')}/month.
            </p>
          </div>

          {/* Flipkart Bank Offers Strip (Chip UI) */}
          <div className="rounded-2xl border border-white/80 p-5 bg-white/80 backdrop-blur-xl space-y-3 shadow-sm">
            <h3 className="text-xs font-black text-ink-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-600" /> Available Bank Offers
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-ink-700">
                <span className="text-emerald-700 font-bold flex-shrink-0">Bank Offer:</span>
                <span>5% Unlimited Cashback on Hukum Axis Bank Credit Card</span>
              </div>
              <div className="flex items-start gap-2 text-ink-700">
                <span className="text-emerald-700 font-bold flex-shrink-0">Special Price:</span>
                <span>Get extra ₹3,000 off (price inclusive of discount)</span>
              </div>
              <div className="flex items-start gap-2 text-ink-700">
                <span className="text-emerald-700 font-bold flex-shrink-0">Partner Offer:</span>
                <span>Sign up for Hukum Pay Later and get ₹500 Gift Voucher on your order</span>
              </div>
              <div className="flex items-start gap-2 text-ink-700">
                <span className="text-emerald-700 font-bold flex-shrink-0">No Cost EMI:</span>
                <span>Avail No Cost EMI on HDFC, ICICI, and SBI Credit Cards</span>
              </div>
            </div>
          </div>

          {/* Variant Selector: Storage & Color Chips (Chip UI) */}
          <div className="rounded-2xl border border-white/80 p-5 bg-white/80 backdrop-blur-xl space-y-4 shadow-sm">
            <div>
              <span className="text-xs font-bold text-ink-700 block mb-2">Select Storage:</span>
              <div className="flex flex-wrap items-center gap-2">
                {storageOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedStorage(opt)}
                    className={`chip chip-filter cursor-pointer ${
                      selectedStorage === opt ? 'active' : ''
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-ink-700 block mb-2">Select Color:</span>
              <div className="flex flex-wrap items-center gap-2">
                {colorOptions.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col.name)}
                    className={`chip chip-filter flex items-center gap-2 cursor-pointer ${
                      selectedColor === col.name ? 'active' : ''
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: col.colorHex }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pincode & Delivery Checker */}
          <div className="rounded-2xl border border-white/80 p-5 bg-white/80 backdrop-blur-xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" /> Delivery Options
              </span>
              <span className="text-xs text-ink-500">Delivering to: <strong className="text-ink-900">{pincode}</strong></span>
            </div>

            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="px-3.5 py-2 text-xs rounded-xl border border-line focus:border-spark-500 focus:outline-none font-mono font-bold max-w-xs bg-white/90"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl btn-primary text-xs font-bold"
              >
                Check
              </button>
            </form>

            <div className="pt-2 border-t border-line/60 text-xs space-y-1.5 text-ink-700">
              <p className="font-bold text-emerald-700 flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> {pincodeStatus}
              </p>
              <p className="text-ink-500">Cash on Delivery available on this item</p>
              <p className="text-ink-500">7-Day Replacement Policy</p>
            </div>
          </div>

          {/* Flipkart Multi-Seller Marketplace Offers ("Buy from other sellers") */}
          <div className="rounded-2xl border border-white/80 p-5 bg-white/80 backdrop-blur-xl shadow-sm">
            <h3 className="text-sm font-bold text-ink-900 mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-600" />
              Buy from other sellers ({product.sellerOffers?.length || 2} offers available)
            </h3>
            <div className="divide-y divide-line/60">
              {(product.sellerOffers || [
                { sellerName: 'OmniTech Retail Corp', rating: 4.8, deliveryDays: 2, price: currentPrice },
                { sellerName: 'Apex Digital Hub', rating: 4.6, deliveryDays: 3, price: Math.round(currentPrice * 1.02) },
              ]).map((offer: any, idx: number) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-ink-900">{offer.sellerName}</p>
                    <p className="text-[11px] text-ink-500 flex items-center">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-1" />
                      <span>{offer.rating} · Delivery in {offer.deliveryDays} days</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-ink-900 tabular-nums">
                      ₹{offer.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={handleAddToCart}
                      className="px-3 py-1 rounded-lg border border-line hover:border-spark-500 text-xs font-bold bg-white/90"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Specifications Table */}
          <div className="rounded-2xl border border-white/80 p-5 bg-white/80 backdrop-blur-xl shadow-sm">
            <h3 className="text-sm font-bold text-ink-900 mb-4 pb-2 border-b border-line/60">
              Product Specifications & Details
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {product.specs ? (
                Object.entries(product.specs).map(([k, v]: [string, any]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-line/60">
                    <dt className="text-ink-500 font-medium">{k}</dt>
                    <dd className="text-ink-900 font-semibold text-right">{String(v)}</dd>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between py-2 border-b border-line/60">
                    <dt className="text-ink-500">Brand</dt>
                    <dd className="text-ink-900 font-semibold">{product.brand}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-line/60">
                    <dt className="text-ink-500">Category</dt>
                    <dd className="text-ink-900 font-semibold">{product.category}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {/* Consumer Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
            <div className="p-3.5 rounded-xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm">
              <Shield className="w-5 h-5 mx-auto text-amber-600 mb-1" />
              <p className="font-bold text-ink-900">1 Year Warranty</p>
              <p className="text-[10px] text-ink-500">Brand Authorized</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm">
              <RotateCcw className="w-5 h-5 mx-auto text-amber-600 mb-1" />
              <p className="font-bold text-ink-900">7-Day Replacement</p>
              <p className="text-[10px] text-ink-500">Doorstep Return</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm">
              <Award className="w-5 h-5 mx-auto text-amber-600 mb-1" />
              <p className="font-bold text-ink-900">Hukum Assured</p>
              <p className="text-[10px] text-ink-500">Quality Verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
