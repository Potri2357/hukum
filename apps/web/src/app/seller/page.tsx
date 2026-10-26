'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  PlusCircle,
  FileSpreadsheet,
  Globe,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function SellerHubPage() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'add' | 'csv' | 'crawler'>('metrics');
  const [metrics, setMetrics] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Smartphones');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // CSV State
  const [csvText, setCsvText] = useState(
    `title,brand,category,price,image
Titanium 100W GaN Charger,PowerMax,Accessories,2499,https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80
Aero Gaming Mouse Ultra,HyperDrive,Accessories,1999,https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80`
  );

  // Crawler Import Wizard State (Module 7)
  const [targetUrl, setTargetUrl] = useState('http://localhost:5050');
  const [crawlJobId, setCrawlJobId] = useState('');
  const [crawlLogs, setCrawlLogs] = useState<string[]>([]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawledItems, setCrawledItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/seller/dashboard')
      .then((r) => r.json())
      .then((d) => setMetrics(d.metrics))
      .catch(() => {});
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price, brand, category, image, description }),
      });
      if (res.ok) {
        setStatusMsg('Product created successfully and indexed into Autocomplete!');
        setTitle('');
        setPrice('');
        setBrand('');
        setImage('');
        setDescription('');
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch {
      setStatusMsg('Failed to create product');
    }
  };

  const handleBulkCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/seller/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: csvText }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message);
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch {
      setStatusMsg('CSV import failed');
    }
  };

  const handleStartCrawl = async () => {
    setIsCrawling(true);
    setCrawlLogs(['Initializing crawler job with SSRF guard and robots.txt check...']);

    try {
      const res = await fetch('/api/v1/crawler/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedUrl: targetUrl, maxPages: 5 }),
      });

      const data = await res.json();
      if (res.ok) {
        setCrawlJobId(data.jobId);
        // Poll status
        const poll = setInterval(async () => {
          const statusRes = await fetch(`/api/v1/crawler/jobs/${data.jobId}`);
          if (statusRes.ok) {
            const jobData = await statusRes.json();
            setCrawlLogs(jobData.job?.logs || []);

            if (jobData.job?.status === 'DONE' || jobData.job?.status === 'FAILED') {
              clearInterval(poll);
              setIsCrawling(false);
              // Fetch review queue
              const queueRes = await fetch('/api/v1/crawler/review-queue');
              if (queueRes.ok) {
                const qData = await queueRes.json();
                setCrawledItems(qData.items || []);
              }
            }
          }
        }, 1000);
      }
    } catch (err: any) {
      setCrawlLogs((prev) => [...prev, `Error: ${err.message}`]);
      setIsCrawling(false);
    }
  };

  const handleApproveCrawledItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/crawler/review-queue/${itemId}/approve`, {
        method: 'POST',
      });
      if (res.ok) {
        setCrawledItems((prev) =>
          prev.map((it) => (it._id === itemId ? { ...it, status: 'APPROVED' } : it))
        );
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="py-6 max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-spark-100 text-amber-700 text-xs font-black uppercase mb-2">
            <Store className="w-3.5 h-3.5" /> Seller Hub & Catalog Operations
          </div>
          <h1 className="text-3xl font-black text-ink-900 tracking-tight">
            Seller Dashboard
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-surface-alt p-1 rounded-xl border border-line text-xs font-bold">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'metrics' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'add' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            Add Single
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'csv' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            Bulk CSV
          </button>
          <button
            onClick={() => setActiveTab('crawler')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'crawler' ? 'bg-spark-500 text-ink-900 shadow-sm' : 'text-amber-700 hover:text-amber-800'
            }`}
          >
            <Sparkles className="w-3 h-3" /> Crawler Import
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-line shadow-sm">
              <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">Gross Sales GMV</span>
              <p className="text-3xl font-black text-ink-900 mt-2 tabular-nums">
                ₹{(metrics?.grossSales || 184500).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-600 font-bold mt-2 block">
                +18.4% from last week
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-line shadow-sm">
              <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">Units Dispatched</span>
              <p className="text-3xl font-black text-ink-900 mt-2 tabular-nums">
                {(metrics?.unitsSold || 42).toLocaleString()} units
              </p>
              <span className="text-[11px] text-ink-500 font-semibold mt-2 block">
                Across 5 fulfillment hubs
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-line shadow-sm">
              <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">Active Products</span>
              <p className="text-3xl font-black text-ink-900 mt-2 tabular-nums">
                {metrics?.totalProducts || 6} SKUs
              </p>
              <span className="text-[11px] text-amber-700 font-bold mt-2 block">
                100% in stock
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-surface-alt border border-line shadow-sm">
              <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">Simulated Payout Ledger</span>
              <p className="text-3xl font-black text-emerald-700 mt-2 tabular-nums">
                ₹{(metrics?.simulatedPayoutsPending || 169740).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-ink-500 font-semibold mt-2 block">
                Settles every Tuesday
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADD SINGLE PRODUCT */}
      {activeTab === 'add' && (
        <form onSubmit={handleCreateProduct} className="bg-white rounded-3xl border border-line p-8 max-w-2xl space-y-4">
          <h2 className="text-lg font-black text-ink-900 mb-2">Create New Product Listing</h2>
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nova Pro ANC Earbuds"
              className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:outline-none focus:border-spark-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-700 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2999"
                className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:outline-none focus:border-spark-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-700 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. NovaAudio"
                className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:outline-none focus:border-spark-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:outline-none focus:border-spark-500"
              >
                <option value="Smartphones">Smartphones</option>
                <option value="Audio">Audio & Sound</option>
                <option value="Wearables">Wearables</option>
                <option value="Laptops">Laptops</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-700 mb-1">Image URL</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:outline-none focus:border-spark-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key product highlights, features..."
              className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:outline-none focus:border-spark-500"
            />
          </div>
          <button type="submit" className="px-8 py-3 rounded-xl btn-primary text-sm font-bold shadow-glow">
            Publish Product
          </button>
        </form>
      )}

      {/* TAB 3: BULK CSV IMPORT */}
      {activeTab === 'csv' && (
        <form onSubmit={handleBulkCsv} className="bg-white rounded-3xl border border-line p-8 max-w-2xl space-y-4">
          <h2 className="text-lg font-black text-ink-900 mb-1">Bulk CSV Catalog Upload</h2>
          <p className="text-xs text-ink-500 mb-4">
            Paste CSV formatted text with columns <code>title,brand,category,price,image</code>.
          </p>
          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full p-4 rounded-xl border border-line font-mono text-xs focus:outline-none focus:border-spark-500"
          />
          <button type="submit" className="px-8 py-3 rounded-xl btn-primary text-sm font-bold shadow-glow">
            Process CSV Batch
          </button>
        </form>
      )}

      {/* TAB 4: WEB CRAWLER IMPORT WIZARD (PRD Module 7) */}
      {activeTab === 'crawler' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-line p-8 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-spark-100 px-2 py-0.5 rounded">
                PRD Module 7
              </span>
              <h2 className="text-xl font-black text-ink-900">
                Import from Website via Automated Web Crawler
              </h2>
            </div>
            <p className="text-xs text-ink-500 mb-6 leading-relaxed">
              Enter your store URL. HukumBot will safely crawl your catalog, adhere to robots.txt, extract
              JSON-LD Product schemas, and add items into your review queue for one-click publishing.
            </p>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="http://localhost:5050"
                className="flex-1 px-4 py-3 rounded-xl border border-line text-sm font-mono focus:outline-none focus:border-spark-500"
              />
              <button
                type="button"
                onClick={handleStartCrawl}
                disabled={isCrawling}
                className="px-6 py-3 rounded-xl btn-primary text-sm font-bold flex items-center gap-2 shadow-glow"
              >
                {isCrawling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
                    Crawling...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" /> Start Crawl
                  </>
                )}
              </button>
            </div>

            {/* Live Crawler Console Logs */}
            {crawlLogs.length > 0 && (
              <div className="bg-ink-900 text-spark-400 font-mono text-xs p-4 rounded-2xl h-48 overflow-y-auto space-y-1 border border-ink-700">
                <div className="text-ink-300 pb-1 border-b border-ink-700 text-[10px] uppercase font-bold flex justify-between">
                  <span>HukumBot Live Crawl Stream</span>
                  <span>Robots: COMPLIANT</span>
                </div>
                {crawlLogs.map((log, i) => (
                  <p key={i} className="leading-snug">{log}</p>
                ))}
              </div>
            )}
          </div>

          {/* Review Queue */}
          {crawledItems.length > 0 && (
            <div className="bg-white rounded-3xl border border-line p-8 max-w-4xl">
              <h3 className="text-base font-black text-ink-900 mb-4">
                Extracted Items Review Queue ({crawledItems.length} items found)
              </h3>
              <div className="divide-y divide-line">
                {crawledItems.map((item) => (
                  <div key={item._id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover border border-line"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-ink-900">{item.product?.title}</h4>
                        <p className="text-xs text-ink-500">
                          ₹{item.product?.price?.toLocaleString('en-IN')} · Extracted via{' '}
                          <span className="font-mono text-amber-700 font-bold">{item.product?.extractionMethod}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      {item.status === 'APPROVED' ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Published
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveCrawledItem(item._id)}
                          className="px-4 py-2 rounded-xl btn-primary text-xs font-bold shadow-sm"
                        >
                          Approve & Publish
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
