'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Package,
  Truck,
  Home,
  Clock,
  ArrowLeft,
  XCircle,
  RotateCcw,
  ShieldCheck,
  Printer,
  ShoppingBag,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';

const STAGES = [
  { key: 'PLACED', label: 'Order Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PACKED', label: 'Packed & Ready', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    // 1. Initial fetch
    async function fetchOrder() {
      try {
        let res = await fetch(`/api/v1/orders/${params.id}`);
        if (!res.ok) {
          // Fallback to latest placed order
          res = await fetch('/api/v1/orders/latest');
        }
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();

    // 2. Connect to Server-Sent Events (SSE) for Real-Time State Progression
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/v1/orders/${params.id}/stream`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.order) {
            setOrder(data.order);
          }
        } catch {
          // Ignore parse error
        }
      };
    } catch {
      // SSE fallback
    }

    // 3. Fetch recommended products so user can explore seamlessly
    fetch('/api/v1/products?limit=4')
      .then((r) => r.json())
      .then((d) => setRecommended(d.products || []))
      .catch(() => {});

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [params.id]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/v1/orders/${params.id}/cancel`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch {
      // Ignore
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-spark-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-ink-700">Connecting to live tracking stream...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-black text-ink-900 mb-2">Order Not Found</h2>
        <Link href="/" className="px-6 py-2.5 rounded-full btn-primary text-xs font-bold inline-block">
          Return to Store
        </Link>
      </div>
    );
  }

  const currentStageIdx = STAGES.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/orders" className="p-2 rounded-full hover:bg-surface-alt border border-line" title="Back to All Orders">
            <ArrowLeft className="w-4 h-4 text-ink-700" />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-spark-100 px-2 py-0.5 rounded">
              Order Confirmed
            </span>
            <h1 className="text-2xl font-black text-ink-900 mt-1">
              Tracking #{order._id}
            </h1>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-amber-900 bg-spark-100/90 px-3 py-1 rounded-full border border-spark-300 font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Live SSE Stream
          </span>
        </div>
      </div>

      {/* Order Confirmed Milestone Banner (Harmonized with website color palette) */}
      <div className="bg-gradient-to-r from-spark-50 via-amber-50/70 to-orange-50/30 border border-spark-300/80 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 shadow-xs neuromorphic-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-spark-400 via-spark-500 to-amber-500 text-ink-900 flex items-center justify-center flex-shrink-0 shadow-xs border border-spark-300">
            <CheckCircle2 className="w-5 h-5 text-ink-900 stroke-[2.4]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-ink-900">
              Order Confirmed & Placed Successfully!
            </h2>
            <p className="text-xs text-ink-600 mt-0.5">
              Delivering to <strong className="text-ink-900">{order.address?.name || 'Muthuvel'}</strong> at <strong className="text-ink-900">{order.address?.street || '24, Gandhi Road, T. Nagar'}, {order.address?.city || 'Chennai'}, {order.address?.state || 'Tamil Nadu'} - {order.address?.pincode || '600017'}</strong>.
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-xs font-bold text-amber-900 bg-spark-100 px-3 py-1 rounded-full border border-spark-300">
            Est. Delivery Tomorrow
          </span>
        </div>
      </div>

      {/* Real-Time Stepper Progress Bar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 p-6 md:p-8 shadow-md">
        <h3 className="font-bold text-sm text-ink-900 mb-8 flex items-center justify-between">
          <span>Delivery Timeline</span>
          <span className="text-xs text-ink-500 font-normal">
            Updates automatically via Server-Sent Events
          </span>
        </h3>

        {isCancelled ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
            <XCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Order Cancelled</p>
              <p className="text-xs">
                Simulated refund will be credited to your virtual account within 24 hours.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-line -z-0">
              <div
                className="h-full bg-spark-500 transition-all duration-700"
                style={{
                  width: `${Math.max(0, (currentStageIdx / (STAGES.length - 1)) * 100)}%`,
                }}
              />
            </div>

            {/* Stepper Nodes */}
            <div className="flex justify-between relative z-10">
              {STAGES.map((stage, idx) => {
                const isPassed = currentStageIdx >= idx;
                const isCurrent = currentStageIdx === idx;
                const Icon = stage.icon;

                return (
                  <div key={stage.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-spark-500 text-ink-900 ring-4 ring-spark-200 shadow-glow scale-110'
                          : isPassed
                          ? 'bg-spark-400 text-ink-900'
                          : 'bg-white border-2 border-line text-ink-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 text-center max-w-[80px] ${
                        isPassed ? 'text-ink-900' : 'text-ink-300'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Items & Shipping Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ordered Items */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 p-6 shadow-sm">
          <h3 className="font-bold text-sm text-ink-900 mb-4 pb-3 border-b border-line/60">
            Items in this Shipment
          </h3>
          <div className="space-y-4">
            {(order.items || []).map((it: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-center">
                <img
                  src={it.image}
                  alt={it.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                  }}
                  className="w-14 h-14 object-contain rounded-xl border border-white/80 bg-white/70 p-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-ink-900 truncate">{it.title}</p>
                  <p className="text-ink-500">Qty: {it.quantity}</p>
                  <p className="font-black text-ink-900 tabular-nums">
                    ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address & Order Actions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 p-6 flex flex-col justify-between shadow-sm space-y-5">
          <div>
            <h3 className="font-bold text-sm text-ink-900 mb-4 pb-3 border-b border-line/60">
              Delivery Address & Updates
            </h3>
            <div className="text-xs space-y-1 text-ink-700">
              <p className="font-bold text-ink-900 text-sm">{order.address?.name || 'Muthuvel'}</p>
              <p>{order.address?.street || '24, Gandhi Road, T. Nagar'}</p>
              <p>
                {order.address?.city || 'Chennai'}, {order.address?.state || 'Tamil Nadu'} - {order.address?.pincode || '600017'}
              </p>
              <p className="text-ink-500 pt-1 font-mono">Phone: {order.address?.phone || '+91 98401 23456'}</p>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>SMS dispatch alerts activated for this phone number.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-line/60 space-y-2.5">
            <div className="flex gap-2.5">
              {!isCancelled && ['PLACED', 'CONFIRMED'].includes(order.status) && (
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="px-3.5 py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}

              <Link
                href="/orders"
                className="flex-1 py-2.5 rounded-xl btn-primary text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-glow transition-all"
              >
                <span>View All My Orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2.5 rounded-xl border border-line bg-white hover:bg-surface-alt text-ink-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Print Receipt / Invoice"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Invoice</span>
              </button>
            </div>

            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-surface-alt/70 hover:bg-surface-alt border border-line text-xs font-bold text-ink-700 flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span>Continue Shopping on Marketplace</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended Products: Seamless Discovery after placing order */}
      {recommended.length > 0 && (
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-spark-100 px-2 py-0.5 rounded border border-spark-200 mb-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>You May Also Like</span>
              </div>
              <h3 className="text-base font-black text-ink-900 tracking-tight">
                Recommended For You
              </h3>
            </div>
            <Link href="/" className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
              <span>View Full Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommended.map((prod) => (
              <Link
                key={prod._id}
                href={`/products/${prod.slug || prod._id}`}
                className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 p-3 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group neuromorphic-card"
              >
                <div className="aspect-square rounded-xl bg-white/70 p-2 flex items-center justify-center mb-2 overflow-hidden border border-white/80">
                  <img
                    src={prod.media?.[0] || prod.image}
                    alt={prod.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                    }}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-amber-700 truncate">{prod.brand}</p>
                  <h4 className="text-xs font-bold text-ink-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                    {prod.title}
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xs font-black text-ink-900 tabular-nums">
                      ₹{(prod.minPrice || prod.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
