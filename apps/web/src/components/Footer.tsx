import React from 'react';
import Link from 'next/link';
import { ShieldCheck, RotateCcw, Truck, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink-900 text-white pt-8 pb-6 border-t border-ink-800 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Compact Value Props Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-ink-800 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-spark-500/10 flex items-center justify-center text-spark-400 flex-shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Free Express Shipping</p>
              <p className="text-ink-400 text-[11px]">Orders above ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-spark-500/10 flex items-center justify-center text-spark-400 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">100% Secure Payments</p>
              <p className="text-ink-400 text-[11px]">256-Bit SSL protection</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-spark-500/10 flex items-center justify-center text-spark-400 flex-shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">7-Day Easy Returns</p>
              <p className="text-ink-400 text-[11px]">Instant refunds</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-spark-500/10 flex items-center justify-center text-spark-400 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Hukum Assured</p>
              <p className="text-ink-400 text-[11px]">Quality verified authentic</p>
            </div>
          </div>
        </div>

        {/* Clean 4-Column Consumer Marketplace Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-b border-ink-800 text-xs text-ink-400">
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Shop Categories</h4>
            <ul className="space-y-2">
              <li><Link href="/?category=Mobiles%20%26%20Tablets" className="hover:text-spark-400 transition-colors">Flagship Mobiles</Link></li>
              <li><Link href="/?category=Laptops%20%26%20Computers" className="hover:text-spark-400 transition-colors">Laptops & Workstations</Link></li>
              <li><Link href="/?category=Audio%20%26%20Soundbars" className="hover:text-spark-400 transition-colors">Noise Cancelling Audio</Link></li>
              <li><Link href="/?category=Smart%20Watches" className="hover:text-spark-400 transition-colors">Smart Wearables</Link></li>
              <li><Link href="/compare" className="hover:text-spark-400 transition-colors">Compare Products</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Customer Care</h4>
            <ul className="space-y-2">
              <li><Link href="/orders" className="hover:text-spark-400 transition-colors">Track Orders</Link></li>
              <li><Link href="/cart" className="hover:text-spark-400 transition-colors">Shopping Cart</Link></li>
              <li><Link href="/seller" className="hover:text-spark-400 transition-colors">Seller Dashboard</Link></li>
              <li><Link href="/" className="hover:text-spark-400 transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/" className="hover:text-spark-400 transition-colors">Help Center & FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Consumer Policy</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-spark-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/" className="hover:text-spark-400 transition-colors">Privacy Notice</Link></li>
              <li><Link href="/" className="hover:text-spark-400 transition-colors">Return & Replacement Policy</Link></li>
              <li><Link href="/" className="hover:text-spark-400 transition-colors">Simulated Payment Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">About Hukum</h4>
            <p className="leading-relaxed text-ink-400 text-xs mb-3">
              Hukum is India&apos;s next-generation e-commerce marketplace delivering authentic electronics, high-speed discovery, and seamless checkout experience.
            </p>
            <div className="flex items-center gap-2 text-ink-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Free & Open Marketplace</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-ink-400">
          <p>© 2026 Hukum Inc. All rights reserved. Built with Next.js, TypeScript, Tailwind CSS, Redis & MongoDB.</p>
          <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-800/40 text-amber-300 px-3 py-1 rounded-full font-mono text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>NOTICE: All payments are 100% simulated. No real money is charged.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
