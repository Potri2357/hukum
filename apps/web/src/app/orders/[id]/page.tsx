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

  useEffect(() => {
    // 1. Initial fetch
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/v1/orders/${params.id}`);
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
          <Link href="/" className="p-2 rounded-full hover:bg-surface-alt border border-line">
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
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live SSE Stream
          </span>
        </div>
      </div>

      {/* Real-Time Stepper Progress Bar */}
      <div className="bg-white rounded-3xl border border-line p-6 md:p-8 shadow-sm">
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
        <div className="bg-white rounded-2xl border border-line p-6">
          <h3 className="font-bold text-sm text-ink-900 mb-4 pb-3 border-b border-line">
            Items in this Shipment
          </h3>
          <div className="space-y-4">
            {(order.items || []).map((it: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-center">
                <img
                  src={it.image}
                  alt={it.title}
                  className="w-14 h-14 object-cover rounded-xl border border-line flex-shrink-0"
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

        {/* Delivery Address & Actions */}
        <div className="bg-white rounded-2xl border border-line p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-ink-900 mb-4 pb-3 border-b border-line">
              Delivery Address
            </h3>
            <div className="text-xs space-y-1 text-ink-700">
              <p className="font-bold text-ink-900">{order.address?.name}</p>
              <p>{order.address?.street}</p>
              <p>
                {order.address?.city}, {order.address?.state} - {order.address?.pincode}
              </p>
              <p className="text-ink-500 pt-1">Phone: {order.address?.phone}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-line flex gap-3">
            {!isCancelled && ['PLACED', 'CONFIRMED'].includes(order.status) && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}

            <Link
              href="/"
              className="flex-1 py-2 rounded-xl btn-primary text-xs font-bold text-center block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
