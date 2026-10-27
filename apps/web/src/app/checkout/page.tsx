'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Smartphone,
  Wallet,
  Truck,
  ArrowRight,
  Lock,
  Zap,
  Check,
  Sparkles,
  X,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedAddress, setSelectedAddress] = useState('addr_1');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'wallet' | 'cod'>('upi');

  // Magic test values
  const [upiId, setUpiId] = useState('success@hukum');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  // 3-D Secure Dialog State
  const [requires3DS, setRequires3DS] = useState(false);
  const [otp3DS, setOtp3DS] = useState('123456');
  const [currentIntentId, setCurrentIntentId] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadCart() {
      try {
        const res = await fetch('/api/v1/cart');
        if (res.ok) {
          const data = await res.json();
          setCart(data.cart);
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, []);

  const handleProcessPayment = async () => {
    if (!cart?.items || cart.items.length === 0) {
      setErrorMessage('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 1. Create Order with Idempotency Key & Explicit Muthuvel Address
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const orderRes = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr_demo_shopper',
          items: cart.items,
          address: {
            name: 'Muthuvel',
            street: '24, Gandhi Road, T. Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600017',
            phone: '+91 98401 23456',
          },
          amount: {
            subtotal: cart.subtotal,
            discount: cart.couponDiscount || 0,
            shipping: cart.shipping || 0,
            total: cart.total,
          },
          paymentMethod: paymentMethod === 'cod' ? 'cod' : 'simulated_gateway',
          idempotencyKey,
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const { order } = await orderRes.json();
      setCurrentOrderId(order._id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hukum_last_order_id', order._id);
      }

      // If COD, confirmed immediately!
      if (paymentMethod === 'cod') {
        router.push(`/orders/${order._id}`);
        return;
      }

      // 2. Create Payment Intent
      const intentRes = await fetch('/api/v1/payments/sim/intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cart.total,
          orderId: order._id,
          userId: 'usr_demo_shopper',
        }),
      });

      if (!intentRes.ok) throw new Error('Failed to create payment intent');
      const { intentId } = await intentRes.json();
      setCurrentIntentId(intentId);

      // 3. Confirm Intent with chosen method & magic value
      const confirmRes = await fetch(`/api/v1/payments/sim/intents/${intentId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          upiId,
          cardNumber,
        }),
      });

      const confirmData = await confirmRes.json();

      if (confirmData.status === 'REQUIRES_ACTION') {
        // Trigger simulated 3-D Secure OTP dialog
        setRequires3DS(true);
        setIsProcessing(false);
        return;
      }

      if (confirmData.status === 'SUCCEEDED') {
        router.push(`/orders/${order._id}`);
      } else {
        setErrorMessage(confirmData.failureReason || 'Simulated payment was declined');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed');
      setIsProcessing(false);
    }
  };

  const handleVerify3DS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/v1/payments/sim/intents/${currentIntentId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'card',
          cardNumber,
          otp3ds: otp3DS,
        }),
      });

      const data = await res.json();
      if (data.status === 'SUCCEEDED') {
        const orderIdToRoute =
          data.orderId ||
          data.intent?.orderId ||
          currentOrderId ||
          (typeof window !== 'undefined' ? localStorage.getItem('hukum_last_order_id') : '') ||
          'latest';
        router.push(`/orders/${orderIdToRoute}`);
      } else {
        setErrorMessage(data.failureReason || '3-D Secure verification failed');
      }
    } catch {
      setErrorMessage('3-D Secure error');
    } finally {
      setIsProcessing(false);
      setRequires3DS(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-spark-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-ink-700">Initializing secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-5xl mx-auto">
      {/* Simulation Notice Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-8 flex items-start gap-3 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <p className="font-extrabold text-sm mb-0.5">
            100% In-House Simulated Payment Gateway
          </p>
          <p>
            No real credit card data, bank account, or money is involved. Test deterministic outcomes
            using the pre-filled magic values below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Address & Payment Methods (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="bg-white rounded-2xl border border-line p-5">
            <h2 className="text-sm font-black text-ink-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-spark-500 text-ink-900 flex items-center justify-center text-xs">
                1
              </span>
              Delivery Address
            </h2>

            <div className="p-4 rounded-xl border-2 border-spark-500 bg-spark-50/50 flex justify-between items-start">
              <div>
                <p className="font-bold text-sm text-ink-900">Muthuvel</p>
                <p className="text-xs text-ink-700 mt-1">24, Gandhi Road, T. Nagar</p>
                <p className="text-xs text-ink-700">Chennai, Tamil Nadu - 600017</p>
                <p className="text-xs text-ink-500 mt-2">Phone: +91 98401 23456</p>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-spark-400 text-ink-900 px-2 py-0.5 rounded">
                Default
              </span>
            </div>
          </div>

          {/* Step 2: Simulated Payment Method Selector */}
          <div className="bg-white rounded-2xl border border-line p-5">
            <h2 className="text-sm font-black text-ink-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-spark-500 text-ink-900 flex items-center justify-center text-xs">
                2
              </span>
              Choose Payment Method
            </h2>

            <div className="space-y-3 mb-6">
              {/* UPI */}
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-spark-500 bg-spark-50/50 shadow-sm'
                    : 'border-line hover:border-ink-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="method"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="accent-spark-500 w-4 h-4"
                  />
                  <div>
                    <p className="font-bold text-xs text-ink-900 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-spark-500" /> Instant UPI (Simulated Collect)
                    </p>
                    <p className="text-[11px] text-ink-500">Google Pay, PhonePe, Paytm, BHIM</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Fastest
                </span>
              </label>

              {/* Cards */}
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-spark-500 bg-spark-50/50 shadow-sm'
                    : 'border-line hover:border-ink-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="method"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-spark-500 w-4 h-4"
                  />
                  <div>
                    <p className="font-bold text-xs text-ink-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-spark-500" /> Test Credit / Debit Card
                    </p>
                    <p className="text-[11px] text-ink-500">Luhn-validated test numbers only</p>
                  </div>
                </div>
              </label>

              {/* COD */}
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-spark-500 bg-spark-50/50 shadow-sm'
                    : 'border-line hover:border-ink-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="method"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-spark-500 w-4 h-4"
                  />
                  <div>
                    <p className="font-bold text-xs text-ink-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-spark-500" /> Cash on Delivery (COD)
                    </p>
                    <p className="text-[11px] text-ink-500">Pay cash or UPI upon delivery</p>
                  </div>
                </div>
              </label>
            </div>

            {/* Method Configuration / Magic Value Inputs */}
            {paymentMethod === 'upi' && (
              <div className="p-4 rounded-xl bg-surface-alt border border-line space-y-3">
                <label className="block text-xs font-bold text-ink-700">Enter UPI ID:</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-line text-xs font-mono focus:outline-none focus:border-spark-500"
                />
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  <span className="text-ink-500">Magic values:</span>
                  <button
                    type="button"
                    onClick={() => setUpiId('success@hukum')}
                    className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:underline"
                  >
                    success@hukum
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiId('fail@hukum')}
                    className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 hover:underline"
                  >
                    fail@hukum
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiId('timeout@hukum')}
                    className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 hover:underline"
                  >
                    timeout@hukum
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="p-4 rounded-xl bg-surface-alt border border-line space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-ink-700 mb-1">Card Number:</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-line font-mono focus:outline-none focus:border-spark-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-ink-700 mb-1">Expiry:</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-line font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink-700 mb-1">CVV:</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-line font-mono"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1 border-t border-line">
                  <span className="text-ink-500 font-semibold">Test Card Presets:</span>
                  <button
                    type="button"
                    onClick={() => setCardNumber('4242 4242 4242 4242')}
                    className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium hover:bg-emerald-100 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Success Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardNumber('4242 4242 4242 3220')}
                    className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium hover:bg-amber-100 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>3DS Secure Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardNumber('4242 4242 4242 0002')}
                    className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-medium hover:bg-rose-100 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3 text-rose-600" />
                    <span>Decline Card</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-line p-6 shadow-sm neuromorphic-card">
            <h3 className="font-black text-base text-ink-900 mb-4 pb-4 border-b border-line">
              Price Details
            </h3>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
              {(cart?.items || []).map((it: any) => (
                <div key={it.productId} className="flex justify-between items-center text-xs">
                  <span className="truncate max-w-[180px] font-medium text-ink-900">
                    {it.title} × {it.quantity}
                  </span>
                  <span className="font-bold tabular-nums">
                    ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs pt-4 border-t border-line">
              <div className="flex justify-between text-ink-500">
                <span>Price ({cart?.items?.length || 0} items)</span>
                <span className="font-bold text-ink-900 tabular-nums">
                  ₹{(cart?.subtotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
              {cart?.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span className="tabular-nums">-₹{cart.couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-500">
                <span>Delivery Charges</span>
                <span className="font-bold text-emerald-700">FREE</span>
              </div>

              <div className="pt-4 border-t border-line flex justify-between items-baseline">
                <span className="text-sm font-black text-ink-900">Total Payable</span>
                <span className="text-2xl font-black text-ink-900 tabular-nums">
                  ₹{(cart?.total || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full mt-6 py-4 rounded-xl btn-primary text-sm font-black flex items-center justify-center gap-2 shadow-sm hover:shadow-glow transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
                  Processing Payment securely...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> PAY ₹{(cart?.total || 0).toLocaleString('en-IN')}
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-ink-500 mt-3 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Safe and Secure Payments · 100% Authentic Products
            </p>
          </div>
        </div>
      </div>

      {/* 3-D Secure OTP Dialog */}
      {requires3DS && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-line animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-ink-900">Bank 3-D Secure Verification</h3>
            </div>
            <p className="text-xs text-ink-500 mb-4">
              Enter the 6-digit OTP sent to your registered mobile number. For sandbox test, use OTP: <strong>123456</strong>.
            </p>

            <form onSubmit={handleVerify3DS}>
              <input
                type="text"
                maxLength={6}
                value={otp3DS}
                onChange={(e) => setOtp3DS(e.target.value)}
                placeholder="123456"
                className="w-full text-center text-xl font-mono tracking-widest px-4 py-3 rounded-xl border border-line focus:border-spark-500 focus:outline-none mb-4"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-xl btn-primary text-xs font-bold"
              >
                {isProcessing ? 'Verifying with Bank...' : 'Authorize Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
