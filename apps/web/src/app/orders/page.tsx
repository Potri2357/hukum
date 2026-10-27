'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/v1/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status);
    if (activeTab === 'completed') return o.status === 'DELIVERED';
    if (activeTab === 'cancelled') return o.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6">
      {/* Header & User Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-spark-100 px-2 py-0.5 rounded border border-spark-200">
              Verified Shopper
            </span>
            <span className="text-xs text-ink-500 font-medium">Customer: <strong>Muthuvel</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-900 tracking-tight">
            My Orders & Tracking
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Real-time fulfillment tracking, live SSE status updates, and order history.
          </p>
        </div>

        <Link
          href="/"
          className="px-4 py-2 rounded-xl btn-primary text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Explore Catalog</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `All Orders (${orders.length})` },
          { id: 'active', label: 'Active & In Transit' },
          { id: 'completed', label: 'Delivered' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`chip chip-filter cursor-pointer text-xs ${
              activeTab === tab.id ? 'active' : ''
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-spark-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-ink-700">Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 p-12 text-center shadow-sm">
          <Package className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-ink-900 mb-1">No Orders Found</h3>
          <p className="text-xs text-ink-500 mb-6">
            You don't have any orders matching the selected filter.
          </p>
          <Link href="/" className="px-6 py-2.5 rounded-full btn-primary text-xs font-bold inline-block">
            Start Shopping Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCompleted = order.status === 'DELIVERED';
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div
                key={order._id}
                className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/80 p-5 shadow-sm hover:shadow-md transition-all space-y-4 neuromorphic-card"
              >
                {/* Order Summary Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/60">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-ink-900">
                      Order #{order._id}
                    </span>
                    <span className="text-ink-300">·</span>
                    <span className="text-xs text-ink-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isCancelled
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-spark-50 text-amber-800 border-spark-300 animate-pulse'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-3">
                  {(order.items || []).map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
                        alt={item.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                        }}
                        className="w-14 h-14 object-contain rounded-xl border border-white/80 bg-white/70 p-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-ink-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-ink-500">
                          Qty: {item.quantity} · ₹{(item.price).toLocaleString('en-IN')} each
                        </p>
                      </div>
                      <span className="text-xs font-black text-ink-900 tabular-nums">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Controls: Total & Navigation */}
                <div className="pt-3 border-t border-line/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-ink-600">
                    Total Amount:{' '}
                    <strong className="text-sm font-black text-ink-900 tabular-nums">
                      ₹{(order.amount?.total || order.amount?.subtotal || 0).toLocaleString('en-IN')}
                    </strong>{' '}
                    <span className="text-ink-400">({order.paymentMethod === 'cod' ? 'COD' : 'Paid Online'})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order._id}`}
                      className="px-4 py-2 rounded-xl btn-primary text-xs font-black flex items-center gap-1.5 shadow-2xs hover:shadow-glow transition-all"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Shipment</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
