'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ProductCard, Product } from '@/components/ProductCard';
import {
  Clock,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Filter,
  X,
  Star,
  Check,
  Search,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; sort?: string };
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.category || 'all');
  const [selectedSort, setSelectedSort] = useState(searchParams.sort || 'popularity');

  // Filter States
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [minDiscountFilter, setMinDiscountFilter] = useState<number>(0);
  const [hukumAssuredOnly, setHukumAssuredOnly] = useState<boolean>(false);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync activeCategory with URL searchParams
  useEffect(() => {
    setActiveCategory(searchParams.category || 'all');
    // Reset filters when switching category
    setSelectedBrands([]);
    setSelectedPriceRange('all');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setMinRatingFilter(0);
    setMinDiscountFilter(0);
    setHukumAssuredOnly(false);
    setInStockOnly(false);
  }, [searchParams.category]);

  // Horizontal scroll rail refs
  const dealsRailRef = useRef<HTMLDivElement>(null);
  const electronicsRailRef = useRef<HTMLDivElement>(null);
  const audioRailRef = useRef<HTMLDivElement>(null);

  const scrollRail = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Deal timer countdown (14 hours)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch catalog & deals
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchParams.q) queryParams.set('q', searchParams.q);
        if (activeCategory !== 'all' && activeCategory !== 'deals') {
          queryParams.set('category', activeCategory);
        }
        if (selectedSort) queryParams.set('sort', selectedSort);
        queryParams.set('limit', '120');

        const [prodRes, dealsRes] = await Promise.all([
          fetch(`/api/v1/products?${queryParams.toString()}`),
          fetch('/api/v1/deals'),
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data.products || []);
        }

        if (dealsRes.ok) {
          const dealData = await dealsRes.json();
          setDeals(dealData.deals || []);
        }
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [searchParams.q, activeCategory, selectedSort]);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'Mobiles & Tablets', name: 'Mobiles & Tablets' },
    { id: 'Laptops & Computers', name: 'Laptops' },
    { id: 'Audio & Soundbars', name: 'Audio & Sound' },
    { id: 'Smart Watches', name: 'Watches' },
    { id: 'Bikes & Automotive', name: 'Bikes & Auto' },
    { id: 'Beauty & Makeup', name: 'Beauty & Care' },
    { id: 'Textiles & Ethnic Wear', name: 'Textiles' },
    { id: 'Cameras & Drones', name: 'Cameras' },
    { id: 'Gaming & Desk', name: 'Gaming' },
  ];

  // Distinct available brands aggregated dynamically from fetched products
  const availableBrands = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([brand, count]) => ({ brand, count }));
  }, [products]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return availableBrands;
    return availableBrands.filter((b) =>
      b.brand.toLowerCase().includes(brandSearch.toLowerCase().trim())
    );
  }, [availableBrands, brandSearch]);

  // Client-side faceted filtering for instantaneous user feedback
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Top Deals mode
      if (activeCategory === 'deals') {
        const isDealItem = p.isDeal || (p.discountPct && p.discountPct >= 20);
        if (!isDealItem) return false;
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        if (!p.brand || !selectedBrands.includes(p.brand)) return false;
      }

      // Price range
      const price = p.minPrice || p.price;
      if (selectedPriceRange === 'under1000' && price >= 1000) return false;
      if (selectedPriceRange === '1000-5000' && (price < 1000 || price > 5000)) return false;
      if (selectedPriceRange === '5000-20000' && (price < 5000 || price > 20000)) return false;
      if (selectedPriceRange === '20000-50000' && (price < 20000 || price > 50000)) return false;
      if (selectedPriceRange === 'above50000' && price < 50000) return false;
      if (selectedPriceRange === 'custom') {
        if (customMinPrice && price < parseFloat(customMinPrice)) return false;
        if (customMaxPrice && price > parseFloat(customMaxPrice)) return false;
      }

      // Rating filter
      if (minRatingFilter > 0 && (p.ratingAvg || 0) < minRatingFilter) {
        return false;
      }

      // Discount filter
      if (minDiscountFilter > 0 && (p.discountPct || 0) < minDiscountFilter) {
        return false;
      }

      // Hukum Assured filter
      if (hukumAssuredOnly && (p.soldCount || 0) < 10000 && (p.ratingAvg || 0) < 4.6) {
        return false;
      }

      // In-stock filter
      if (inStockOnly && !p.inStock) {
        return false;
      }

      return true;
    });
  }, [
    products,
    activeCategory,
    selectedBrands,
    selectedPriceRange,
    customMinPrice,
    customMaxPrice,
    minRatingFilter,
    minDiscountFilter,
    hukumAssuredOnly,
    inStockOnly,
  ]);

  const electronicsList = products.filter(
    (p) => p.category === 'Mobiles & Tablets' || p.category === 'Laptops & Computers'
  );

  const audioAndWearablesList = products.filter(
    (p) =>
      p.category === 'Audio & Soundbars' ||
      p.category === 'Smart Watches' ||
      p.category === 'Gaming & Desk'
  );

  // Condition to disappear hero and deal cards
  // When a category is clicked, or search is active, or deals filter is selected:
  const isFilteredView =
    (activeCategory !== 'all' && activeCategory !== '') || !!searchParams.q;

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedPriceRange !== 'all' ||
    customMinPrice !== '' ||
    customMaxPrice !== '' ||
    minRatingFilter > 0 ||
    minDiscountFilter > 0 ||
    hukumAssuredOnly ||
    inStockOnly;

  const resetAllFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRange('all');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setMinRatingFilter(0);
    setMinDiscountFilter(0);
    setHukumAssuredOnly(false);
    setInStockOnly(false);
    setBrandSearch('');
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Reusable Filter Sidebar Content
  const renderFilterPanel = () => (
    <div className="space-y-5 text-ink-900">
      {/* Filters Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-black uppercase tracking-wider text-ink-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors uppercase"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Hukum Assured Toggle */}
      <div className="p-3 rounded-xl bg-spark-50/70 border border-spark-200 flex items-center justify-between">
        <label
          htmlFor="hukum-assured-toggle"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-5 h-5 rounded-md bg-amber-600 text-white flex items-center justify-center font-black text-[10px] shadow-2xs">
            H
          </div>
          <div>
            <span className="text-xs font-bold text-ink-900 block leading-tight">
              Hukum Assured
            </span>
            <span className="text-[10px] text-ink-500 block">Fast delivery & verified sellers</span>
          </div>
        </label>
        <input
          id="hukum-assured-toggle"
          type="checkbox"
          checked={hukumAssuredOnly}
          onChange={(e) => setHukumAssuredOnly(e.target.checked)}
          className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
        />
      </div>

      {/* Price Presets */}
      <div className="space-y-2 pb-4 border-b border-line">
        <h4 className="text-xs font-black uppercase tracking-wider text-ink-700">Price Range</h4>
        <div className="space-y-1.5 text-xs">
          {[
            { id: 'all', label: 'All Prices' },
            { id: 'under1000', label: 'Under ₹1,000' },
            { id: '1000-5000', label: '₹1,000 - ₹5,000' },
            { id: '5000-20000', label: '₹5,000 - ₹20,000' },
            { id: '20000-50000', label: '₹20,000 - ₹50,000' },
            { id: 'above50000', label: 'Above ₹50,000' },
          ].map((range) => (
            <label
              key={range.id}
              className="flex items-center gap-2 text-ink-700 hover:text-ink-900 cursor-pointer py-0.5"
            >
              <input
                type="radio"
                name="price_range"
                checked={selectedPriceRange === range.id}
                onChange={() => setSelectedPriceRange(range.id)}
                className="accent-amber-600 cursor-pointer"
              />
              <span className={selectedPriceRange === range.id ? 'font-bold text-ink-900' : ''}>
                {range.label}
              </span>
            </label>
          ))}
        </div>

        {/* Custom Price Range Inputs */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-ink-500 block mb-1">Custom (₹):</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={customMinPrice}
              onChange={(e) => {
                setCustomMinPrice(e.target.value);
                setSelectedPriceRange('custom');
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-alt border border-line text-xs focus:outline-none focus:border-spark-500"
            />
            <span className="text-xs text-ink-400">to</span>
            <input
              type="number"
              placeholder="Max"
              value={customMaxPrice}
              onChange={(e) => {
                setCustomMaxPrice(e.target.value);
                setSelectedPriceRange('custom');
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-alt border border-line text-xs focus:outline-none focus:border-spark-500"
            />
          </div>
        </div>
      </div>

      {/* Brand Checkboxes with Dynamic Product Counts */}
      {availableBrands.length > 0 && (
        <div className="space-y-2 pb-4 border-b border-line">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-ink-700">Brand</h4>
            {selectedBrands.length > 0 && (
              <button
                onClick={() => setSelectedBrands([])}
                className="text-[10px] font-bold text-rose-600 hover:underline"
              >
                Clear ({selectedBrands.length})
              </button>
            )}
          </div>

          {availableBrands.length > 6 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search brand..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-surface-alt border border-line text-xs focus:outline-none focus:border-spark-500 text-ink-900 placeholder:text-ink-400"
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 text-xs scrollbar-thin">
            {filteredBrands.map(({ brand, count }) => {
              const isChecked = selectedBrands.includes(brand);
              return (
                <label
                  key={brand}
                  className="flex items-center justify-between py-1 cursor-pointer hover:text-amber-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleBrand(brand)}
                      className="w-3.5 h-3.5 rounded text-amber-600 accent-amber-600 cursor-pointer"
                    />
                    <span
                      className={`truncate max-w-[130px] ${
                        isChecked ? 'font-bold text-ink-900' : 'text-ink-700'
                      }`}
                    >
                      {brand}
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-400 tabular-nums">({count})</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Rating Filter */}
      <div className="space-y-2 pb-4 border-b border-line">
        <h4 className="text-xs font-black uppercase tracking-wider text-ink-700">
          Customer Rating
        </h4>
        <div className="space-y-1.5 text-xs">
          {[
            { stars: 4, label: '4★ & above' },
            { stars: 3, label: '3★ & above' },
            { stars: 0, label: 'All Ratings' },
          ].map((item) => (
            <label
              key={item.stars}
              className="flex items-center gap-2 cursor-pointer text-ink-700 hover:text-ink-900 py-0.5"
            >
              <input
                type="radio"
                name="rating_filter"
                checked={minRatingFilter === item.stars}
                onChange={() => setMinRatingFilter(item.stars)}
                className="accent-amber-600 cursor-pointer"
              />
              <span
                className={`flex items-center gap-1 ${
                  minRatingFilter === item.stars ? 'font-bold text-ink-900' : ''
                }`}
              >
                {item.stars > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold text-[10px]">
                    {item.stars} <Star className="w-2.5 h-2.5 fill-current" />
                  </span>
                )}
                <span>{item.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Discount Percentage Filter */}
      <div className="space-y-2 pb-4 border-b border-line">
        <h4 className="text-xs font-black uppercase tracking-wider text-ink-700">Discount</h4>
        <div className="space-y-1.5 text-xs">
          {[
            { min: 40, label: '40% or more' },
            { min: 30, label: '30% or more' },
            { min: 20, label: '20% or more' },
            { min: 10, label: '10% or more' },
            { min: 0, label: 'All Discounts' },
          ].map((item) => (
            <label
              key={item.min}
              className="flex items-center gap-2 cursor-pointer text-ink-700 hover:text-ink-900 py-0.5"
            >
              <input
                type="radio"
                name="discount_filter"
                checked={minDiscountFilter === item.min}
                onChange={() => setMinDiscountFilter(item.min)}
                className="accent-amber-600 cursor-pointer"
              />
              <span
                className={minDiscountFilter === item.min ? 'font-bold text-ink-900' : ''}
              >
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* In-Stock Only Toggle */}
      <div className="pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-ink-700 hover:text-ink-900">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-amber-600 accent-amber-600 cursor-pointer"
          />
          <span className={inStockOnly ? 'font-bold text-ink-900' : ''}>
            Exclude Out of Stock
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="pt-4 sm:pt-6 pb-12 space-y-6">
      {/* 
        CONDITIONAL RENDERING: 
        When category icons or search is clicked (isFilteredView is true), 
        the hero carousel, deal of the day rail, and horizontal category rails DISAPPEAR!
        Only when user is on the default home view (isFilteredView is false) do they appear.
      */}
      {!isFilteredView && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Flagship Hero Carousel */}
          <HeroCarousel />

          {/* Section 1: Deals of the Day (Live Countdown Rail) */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-line shadow-xs neuromorphic-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-600 fill-rose-600" />
                    Live Lightning Deals
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900 flex items-center gap-1.5">
                  Deals of the Day
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-spark-50 px-3 py-1.5 rounded-xl border border-spark-200">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span className="text-[11px] text-amber-900 font-bold mr-1">Ends in:</span>
                  <div className="font-mono text-xs font-black text-amber-700 tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}h :{' '}
                    {String(timeLeft.minutes).padStart(2, '0')}m :{' '}
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </div>
                </div>

                {/* Scroll Navigation Chevrons */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={() => scrollRail(dealsRailRef, 'left')}
                    className="w-8 h-8 rounded-full bg-surface-alt hover:bg-spark-100 border border-line flex items-center justify-center text-ink-700 hover:text-amber-700 transition-all active:scale-95 shadow-2xs"
                    aria-label="Scroll deals left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollRail(dealsRailRef, 'right')}
                    className="w-8 h-8 rounded-full bg-surface-alt hover:bg-spark-100 border border-line flex items-center justify-center text-ink-700 hover:text-amber-700 transition-all active:scale-95 shadow-2xs"
                    aria-label="Scroll deals right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Deals Rail */}
            <div
              ref={dealsRailRef}
              className="flex items-stretch gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-none"
            >
              {(deals.length > 0 ? deals : products.filter((p) => p.isDeal)).map((deal) => (
                <div key={deal._id} className="w-[230px] sm:w-[250px] flex-shrink-0">
                  <ProductCard product={deal} />
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Best of Electronics (Rail) */}
          {electronicsList.length > 0 && (
            <section className="bg-white rounded-2xl p-4 sm:p-5 border border-line shadow-xs neuromorphic-card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-spark-50 px-2 py-0.5 rounded border border-spark-200">
                    Flagship Devices
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900 mt-1">
                    Best of Electronics & Laptops
                  </h2>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollRail(electronicsRailRef, 'left')}
                    className="w-8 h-8 rounded-full bg-surface-alt hover:bg-spark-100 border border-line flex items-center justify-center text-ink-700 hover:text-amber-700 transition-all active:scale-95 shadow-2xs"
                    aria-label="Scroll electronics left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollRail(electronicsRailRef, 'right')}
                    className="w-8 h-8 rounded-full bg-surface-alt hover:bg-spark-100 border border-line flex items-center justify-center text-ink-700 hover:text-amber-700 transition-all active:scale-95 shadow-2xs"
                    aria-label="Scroll electronics right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={electronicsRailRef}
                className="flex items-stretch gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-none"
              >
                {electronicsList.map((p) => (
                  <div key={p._id} className="w-[230px] sm:w-[250px] flex-shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Trending Audio, Wearables & Gaming (Rail) */}
          {audioAndWearablesList.length > 0 && (
            <section className="bg-white rounded-2xl p-4 sm:p-5 border border-line shadow-xs neuromorphic-card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-spark-50 px-2 py-0.5 rounded border border-spark-200">
                    Immersive Sound & Gear
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-ink-900 mt-1">
                    Trending Audio, Wearables & Gaming
                  </h2>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollRail(audioRailRef, 'left')}
                    className="w-8 h-8 rounded-full bg-surface-alt hover:bg-spark-100 border border-line flex items-center justify-center text-ink-700 hover:text-amber-700 transition-all active:scale-95 shadow-2xs"
                    aria-label="Scroll audio left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollRail(audioRailRef, 'right')}
                    className="w-8 h-8 rounded-full bg-surface-alt hover:bg-spark-100 border border-line flex items-center justify-center text-ink-700 hover:text-amber-700 transition-all active:scale-95 shadow-2xs"
                    aria-label="Scroll audio right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={audioRailRef}
                className="flex items-stretch gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-none"
              >
                {audioAndWearablesList.map((p) => (
                  <div key={p._id} className="w-[230px] sm:w-[250px] flex-shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* 
        MAIN CATALOG & FILTER VIEW
        When isFilteredView is true, this section appears cleanly right at the top!
      */}
      <div className="space-y-4">
        {/* Breadcrumb Navigation when filtered */}
        {isFilteredView && (
          <div className="flex items-center gap-2 text-xs text-ink-500 font-semibold px-1">
            <Link href="/" className="hover:text-amber-700 transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-ink-900 font-bold">
              {searchParams.q
                ? `Search: "${searchParams.q}"`
                : activeCategory === 'deals'
                ? 'Top Deals'
                : activeCategory}
            </span>
            <span>&gt;</span>
            <span className="text-ink-500">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
        )}

        {/* Category Horizontal Quick Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => {
            const isActive = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCategory(c.id);
                  resetAllFilters();
                }}
                className={`chip chip-filter ${
                  isActive ? 'active' : ''
                } cursor-pointer whitespace-nowrap text-xs`}
              >
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Flipkart-Style Main Results Area: Left Filter Sidebar + Right Products Grid */}
        <div className="flex flex-col lg:flex-row items-start gap-5">
          {/* Desktop Filter Sidebar (Sticky, Flipkart-Style) */}
          <aside className="hidden lg:block w-64 flex-shrink-0 bg-white rounded-2xl p-5 border border-line shadow-xs neuromorphic-card sticky top-28 self-start">
            {renderFilterPanel()}
          </aside>

          {/* Right Product Grid Container */}
          <main className="flex-1 w-full bg-white rounded-2xl p-4 sm:p-6 border border-line shadow-xs neuromorphic-card space-y-4">
            {/* Top Toolbar: Heading, Mobile Filter Trigger, and Sort Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-ink-900">
                  {searchParams.q
                    ? `Results for "${searchParams.q}"`
                    : activeCategory === 'deals'
                    ? 'Top Lightning Deals'
                    : activeCategory === 'all'
                    ? 'Explore Complete Catalog'
                    : activeCategory}
                </h2>
                <p className="text-xs text-ink-500 font-medium mt-0.5">
                  Showing{' '}
                  <strong className="text-ink-900">{filteredProducts.length}</strong> authentic
                  products
                </p>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 border border-line rounded-xl px-3 py-1.5 bg-surface-alt hover:bg-white text-xs font-bold text-ink-900 transition-all shadow-2xs"
                >
                  <Filter className="w-3.5 h-3.5 text-amber-600" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-black flex items-center justify-center">
                      !
                    </span>
                  )}
                </button>

                {/* Sort Selector */}
                <div className="flex items-center gap-1.5 border border-line rounded-xl px-3 py-1.5 bg-surface-alt text-xs font-semibold">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-ink-500" />
                  <span className="text-ink-500">Sort:</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer text-ink-900 font-bold"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Chips / Pills (Click to Remove Individual Filter) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-2">
                <span className="text-[11px] font-bold text-ink-500 mr-1">Active Filters:</span>

                {hukumAssuredOnly && (
                  <button
                    onClick={() => setHukumAssuredOnly(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-spark-100 border border-spark-300 text-[11px] font-bold text-ink-900 hover:bg-spark-200 transition-colors"
                  >
                    <span>Hukum Assured</span>
                    <X className="w-3 h-3 text-ink-500 hover:text-ink-900" />
                  </button>
                )}

                {selectedPriceRange !== 'all' && (
                  <button
                    onClick={() => {
                      setSelectedPriceRange('all');
                      setCustomMinPrice('');
                      setCustomMaxPrice('');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-alt border border-line text-[11px] font-bold text-ink-900 hover:bg-white transition-colors"
                  >
                    <span>
                      Price:{' '}
                      {selectedPriceRange === 'under1000'
                        ? 'Under ₹1,000'
                        : selectedPriceRange === '1000-5000'
                        ? '₹1k - ₹5k'
                        : selectedPriceRange === '5000-20000'
                        ? '₹5k - ₹20k'
                        : selectedPriceRange === '20000-50000'
                        ? '₹20k - ₹50k'
                        : selectedPriceRange === 'above50000'
                        ? 'Above ₹50k'
                        : `₹${customMinPrice || 0} - ₹${customMaxPrice || 'Max'}`}
                    </span>
                    <X className="w-3 h-3 text-ink-500 hover:text-ink-900" />
                  </button>
                )}

                {selectedBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-alt border border-line text-[11px] font-bold text-ink-900 hover:bg-white transition-colors"
                  >
                    <span>Brand: {brand}</span>
                    <X className="w-3 h-3 text-ink-500 hover:text-ink-900" />
                  </button>
                ))}

                {minRatingFilter > 0 && (
                  <button
                    onClick={() => setMinRatingFilter(0)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-alt border border-line text-[11px] font-bold text-ink-900 hover:bg-white transition-colors"
                  >
                    <span>{minRatingFilter}★ & above</span>
                    <X className="w-3 h-3 text-ink-500 hover:text-ink-900" />
                  </button>
                )}

                {minDiscountFilter > 0 && (
                  <button
                    onClick={() => setMinDiscountFilter(0)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-alt border border-line text-[11px] font-bold text-ink-900 hover:bg-white transition-colors"
                  >
                    <span>{minDiscountFilter}%+ Off</span>
                    <X className="w-3 h-3 text-ink-500 hover:text-ink-900" />
                  </button>
                )}

                {inStockOnly && (
                  <button
                    onClick={() => setInStockOnly(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-alt border border-line text-[11px] font-bold text-ink-900 hover:bg-white transition-colors"
                  >
                    <span>In Stock Only</span>
                    <X className="w-3 h-3 text-ink-500 hover:text-ink-900" />
                  </button>
                )}

                <button
                  onClick={resetAllFilters}
                  className="text-[11px] font-bold text-rose-600 hover:underline ml-1"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Product Grid (Compact Density) */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-surface-alt rounded-2xl h-72 animate-pulse border border-line"
                  />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-2">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-surface-alt rounded-2xl p-10 text-center border border-line my-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-spark-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Filter className="w-6 h-6" />
                </div>
                <p className="text-base font-bold text-ink-900">No products match your filters</p>
                <p className="text-xs text-ink-500 max-w-sm mx-auto">
                  Try clearing some filters, widening your price range, or searching for other
                  brands.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="px-5 py-2 rounded-full btn-primary text-xs font-bold inline-block"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-over / Modal Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end lg:hidden animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xs h-full p-5 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
                <h3 className="text-base font-black text-ink-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-600" />
                  Filter Products
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-alt text-ink-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderFilterPanel()}
            </div>

            <div className="pt-4 border-t border-line mt-6 flex items-center gap-3">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-2 rounded-xl bg-surface-alt border border-line text-xs font-bold text-ink-700"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 rounded-xl btn-primary text-xs font-bold"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section: The Hukum Quality Promise (Consumer Trust Pillars) */}
      <section className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/80 neuromorphic-card shadow-sm">
        <div className="text-center max-w-lg mx-auto mb-6">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-spark-100 text-amber-800 text-[11px] font-black uppercase tracking-wider mb-2 border border-spark-200">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>The Hukum Trust Promise</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-ink-900 tracking-tight">
            Why India Shops On Hukum
          </h3>
          <p className="text-xs text-ink-500 mt-1">
            Genuine products, rapid logistics, and customer-first purchase protection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 flex flex-col items-center text-center shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-spark-500/20 text-amber-700 flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-ink-900 mb-1">100% Genuine Products</h4>
            <p className="text-[11px] text-ink-500 leading-relaxed">
              Directly sourced from authorized brand distributors with manufacturer warranty.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 flex flex-col items-center text-center shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-spark-500/20 text-amber-700 flex items-center justify-center mb-2.5">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-ink-900 mb-1">Express Fast Delivery</h4>
            <p className="text-[11px] text-ink-500 leading-relaxed">
              Free 2-day delivery across 19,000+ pin codes with live GPS shipment updates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 flex flex-col items-center text-center shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-spark-500/20 text-amber-700 flex items-center justify-center mb-2.5">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-ink-900 mb-1">7-Day Easy Returns</h4>
            <p className="text-[11px] text-ink-500 leading-relaxed">
              Doorstep pickup with no questions asked and instant wallet or bank refunds.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 flex flex-col items-center text-center shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-spark-500/20 text-amber-700 flex items-center justify-center mb-2.5">
              <Headphones className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-ink-900 mb-1">24x7 Priority Support</h4>
            <p className="text-[11px] text-ink-500 leading-relaxed">
              Round-the-clock live chat and dedicated support for orders and queries.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
