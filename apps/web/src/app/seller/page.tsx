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
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Terminal,
  Check,
  RefreshCw,
  SlidersHorizontal,
  X,
  Eye,
  Tag,
  AlertCircle,
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
  const [crawlJob, setCrawlJob] = useState<{
    status: string;
    pagesCrawled: number;
    itemsFound: number;
    maxPages: number;
  } | null>(null);
  const [showRawLogs, setShowRawLogs] = useState(false);
  const [queueFilter, setQueueFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [isBatchApproving, setIsBatchApproving] = useState(false);

  const fetchReviewQueue = async () => {
    try {
      const res = await fetch('/api/v1/crawler/review-queue');
      if (res.ok) {
        const data = await res.json();
        setCrawledItems(data.items || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetch('/api/v1/seller/dashboard')
      .then((r) => r.json())
      .then((d) => setMetrics(d.metrics))
      .catch(() => {});

    fetchReviewQueue();
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
    setCrawlJob({ status: 'RUNNING', pagesCrawled: 0, itemsFound: 0, maxPages: 5 });

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
            const job = jobData.job;
            if (job) {
              setCrawlLogs(job.logs || []);
              setCrawlJob({
                status: job.status,
                pagesCrawled: job.pagesCrawled || 0,
                itemsFound: job.itemsFound || 0,
                maxPages: job.maxPages || 5,
              });

              if (job.status === 'DONE' || job.status === 'FAILED') {
                clearInterval(poll);
                setIsCrawling(false);
                await fetchReviewQueue();
              }
            }
          }
        }, 800);
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

  const handleBatchApprove = async () => {
    setIsBatchApproving(true);
    const pending = crawledItems.filter((it) => it.status !== 'APPROVED');
    for (const it of pending) {
      try {
        await fetch(`/api/v1/crawler/review-queue/${it._id}/approve`, { method: 'POST' });
      } catch {}
    }
    await fetchReviewQueue();
    setIsBatchApproving(false);
  };

  const handleRejectCrawledItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/crawler/review-queue/${itemId}/reject`, { method: 'POST' });
      if (res.ok) {
        setCrawledItems((prev) => prev.filter((it) => it._id !== itemId));
      }
    } catch {}
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
          {/* Top Control Panel */}
          <div className="bg-white rounded-3xl border border-line p-6 sm:p-8 max-w-4xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-spark-200/90 border border-spark-300/80 px-2.5 py-0.5 rounded-full">
                  PRD Module 7
                </span>
                <span className="text-xs font-bold text-ink-500">Autonomous Ingestion Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Robots & SSRF Compliant
                </span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-ink-900 tracking-tight mb-2">
              Automated Catalog Web Crawler
            </h2>
            <p className="text-xs text-ink-500 mb-6 leading-relaxed max-w-2xl">
              HukumBot safely explores your storefront, respects <code className="font-mono text-amber-700 bg-spark-50 px-1 py-0.5 rounded">robots.txt</code> crawl-delays, extracts structured JSON-LD <code className="font-mono text-amber-700 bg-spark-50 px-1 py-0.5 rounded">Product</code> schemas, and populates your review queue.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-ink-400 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="http://localhost:5050"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-line text-xs font-mono font-bold text-ink-900 focus:outline-none focus:border-spark-500 shadow-2xs"
                />
              </div>
              <button
                type="button"
                onClick={handleStartCrawl}
                disabled={isCrawling}
                className="px-6 py-3 rounded-2xl btn-primary text-xs font-black flex items-center justify-center gap-2 shadow-2xs hover:shadow-glow transition-all disabled:opacity-50"
              >
                {isCrawling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-ink-900" />
                    <span>Crawling & Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-ink-900" />
                    <span>Start Automated Crawl</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Segmented Loading & Ingestion Pipeline Progress */}
          {(isCrawling || crawlJob || crawlLogs.length > 0) && (
            <div className="bg-white rounded-3xl border border-line p-6 sm:p-8 max-w-4xl shadow-xs space-y-6 animate-in fade-in duration-200">
              {/* Segmented Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-spark-200/90 border border-spark-300/80 px-2 py-0.5 rounded">
                      Live Ingestion Pipeline
                    </span>
                    <span className="text-xs font-mono text-ink-500">
                      Target: {targetUrl}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-ink-900">
                    Autonomous Crawl Execution Stages
                  </h3>
                </div>

                <div>
                  {isCrawling ? (
                    <span className="text-xs font-bold text-amber-900 bg-spark-100/90 border border-spark-300 px-3 py-1 rounded-full flex items-center gap-2 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Stage Active: Processing Routes
                    </span>
                  ) : crawlJob?.status === 'DONE' ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Crawl Completed Successfully
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-ink-600 bg-surface-alt px-3 py-1 rounded-full border border-line">
                      Pipeline Idle
                    </span>
                  )}
                </div>
              </div>

              {/* 4-Part Segmented Progress Bar */}
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {/* Segment 1: Handshake */}
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      crawlLogs.length > 0 ? 'bg-gradient-to-r from-spark-400 to-amber-500' : 'bg-line'
                    }`}
                  />
                  {/* Segment 2: Frontier Crawl */}
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (crawlJob?.pagesCrawled || 0) > 0 || !isCrawling
                        ? 'bg-gradient-to-r from-spark-400 to-amber-500'
                        : isCrawling
                        ? 'bg-spark-300 animate-pulse'
                        : 'bg-line'
                    }`}
                  />
                  {/* Segment 3: Schema Extraction */}
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (crawlJob?.itemsFound || crawledItems.length || 0) > 0 || !isCrawling
                        ? 'bg-gradient-to-r from-spark-400 to-amber-500'
                        : isCrawling && (crawlJob?.pagesCrawled || 0) > 0
                        ? 'bg-spark-300 animate-pulse'
                        : 'bg-line'
                    }`}
                  />
                  {/* Segment 4: Review Ready */}
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      !isCrawling && crawlJob?.status === 'DONE'
                        ? 'bg-gradient-to-r from-spark-400 to-amber-500'
                        : isCrawling
                        ? 'bg-line'
                        : 'bg-line'
                    }`}
                  />
                </div>

                {/* 4 Segment Labels */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  {/* Segment 1 Card */}
                  <div className="p-3 rounded-2xl bg-surface-alt border border-line flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase text-ink-500">Stage 1</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="font-bold text-ink-900 text-xs">Compliance</p>
                    <p className="text-[10px] text-ink-500 mt-0.5">Robots.txt & SSRF</p>
                  </div>

                  {/* Segment 2 Card */}
                  <div className="p-3 rounded-2xl bg-surface-alt border border-line flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase text-ink-500">Stage 2</span>
                      <Globe className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <p className="font-bold text-ink-900 text-xs">Frontier Crawl</p>
                    <p className="text-[10px] text-ink-500 mt-0.5">
                      {crawlJob?.pagesCrawled || (isCrawling ? 1 : 0)} / {crawlJob?.maxPages || 5} Pages
                    </p>
                  </div>

                  {/* Segment 3 Card */}
                  <div className="p-3 rounded-2xl bg-surface-alt border border-line flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase text-ink-500">Stage 3</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <p className="font-bold text-ink-900 text-xs">JSON-LD Extract</p>
                    <p className="text-[10px] text-ink-500 mt-0.5">
                      {crawlJob?.itemsFound || crawledItems.length || 0} Products Parsed
                    </p>
                  </div>

                  {/* Segment 4 Card */}
                  <div className="p-3 rounded-2xl bg-surface-alt border border-line flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase text-ink-500">Stage 4</span>
                      <Package className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="font-bold text-ink-900 text-xs">Review Queue</p>
                    <p className="text-[10px] text-ink-500 mt-0.5">SimHash Verified</p>
                  </div>
                </div>
              </div>

              {/* Active Pipeline Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gradient-to-r from-spark-50 via-amber-50/50 to-spark-100/40 border border-spark-200/90 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800">Pages Scanned</span>
                  <p className="text-base font-black text-ink-900 mt-0.5 tabular-nums">
                    {crawlJob?.pagesCrawled || (isCrawling ? 1 : 0)} <span className="text-ink-400 text-xs font-normal">/ {crawlJob?.maxPages || 5}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800">Products Found</span>
                  <p className="text-base font-black text-ink-900 mt-0.5 tabular-nums">
                    {crawlJob?.itemsFound || crawledItems.length || 0} SKUs
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800">SSRF Guard</span>
                  <p className="text-xs font-bold text-emerald-800 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Safe Origin
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800">Extractor Engine</span>
                  <p className="text-xs font-bold text-amber-900 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" /> JSON-LD & DOM
                  </p>
                </div>
              </div>

              {/* Loading Shimmer Skeletons while crawling */}
              {isCrawling && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span className="flex items-center gap-2 font-bold text-ink-800">
                      <div className="w-2.5 h-2.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      Parsing HTML DOM & JSON-LD Schemas in Real-Time...
                    </span>
                    <span className="text-[11px] font-mono text-ink-400">Politeness: 200ms delay</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((sk) => (
                      <div
                        key={sk}
                        className="p-4 rounded-2xl border border-line bg-surface-alt/60 animate-pulse flex items-center gap-4"
                      >
                        <div className="w-16 h-16 rounded-xl bg-ink-200/60" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-ink-200/60 rounded-full w-3/4" />
                          <div className="h-2.5 bg-ink-200/40 rounded-full w-1/2" />
                          <div className="h-2.5 bg-ink-200/40 rounded-full w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Technical Console Logs */}
              <div className="pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowRawLogs(!showRawLogs)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-xl hover:bg-surface-alt text-xs font-bold text-ink-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-amber-600" />
                    <span>Engine Crawl Logs Stream ({crawlLogs.length} events)</span>
                  </div>
                  {showRawLogs ? (
                    <ChevronUp className="w-4 h-4 text-ink-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink-400" />
                  )}
                </button>

                {showRawLogs && (
                  <div className="mt-2 bg-ink-950 text-spark-400 font-mono text-[11px] p-4 rounded-2xl h-44 overflow-y-auto space-y-1 border border-ink-800 animate-in fade-in duration-150">
                    <div className="text-ink-400 pb-1 border-b border-ink-800 text-[10px] uppercase font-bold flex justify-between">
                      <span>HukumBot Engine Event Stream</span>
                      <span>Robots: COMPLIANT</span>
                    </div>
                    {crawlLogs.map((log, i) => (
                      <p key={i} className="leading-snug text-spark-300">
                        {log}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Extracted Items Review Queue Showcase (Proper Results Display) */}
          {crawledItems.length > 0 && (
            <div className="bg-white rounded-3xl border border-line p-6 sm:p-8 max-w-5xl shadow-xs space-y-6">
              {/* Header with Stats & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-spark-200/90 border border-spark-300/80 px-2 py-0.5 rounded">
                      Extracted Products
                    </span>
                    <span className="text-xs text-ink-500 font-bold">
                      {crawledItems.filter((it) => it.status === 'APPROVED').length} Published ·{' '}
                      {crawledItems.filter((it) => it.status !== 'APPROVED').length} Pending Review
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-ink-900 tracking-tight">
                    Review & Publish Catalog ({crawledItems.length} Items)
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {/* Filter Pills */}
                  <div className="flex p-1 bg-surface-alt rounded-xl border border-line text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setQueueFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        queueFilter === 'ALL' ? 'bg-white text-ink-900 shadow-2xs' : 'text-ink-500'
                      }`}
                    >
                      All ({crawledItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQueueFilter('PENDING')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        queueFilter === 'PENDING' ? 'bg-white text-ink-900 shadow-2xs' : 'text-ink-500'
                      }`}
                    >
                      Pending ({crawledItems.filter((it) => it.status !== 'APPROVED').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQueueFilter('APPROVED')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        queueFilter === 'APPROVED' ? 'bg-white text-ink-900 shadow-2xs' : 'text-ink-500'
                      }`}
                    >
                      Published ({crawledItems.filter((it) => it.status === 'APPROVED').length})
                    </button>
                  </div>

                  {/* Batch Approve Button */}
                  {crawledItems.some((it) => it.status !== 'APPROVED') && (
                    <button
                      type="button"
                      onClick={handleBatchApprove}
                      disabled={isBatchApproving}
                      className="px-4 py-2 rounded-xl btn-primary text-xs font-black flex items-center gap-1.5 shadow-2xs hover:shadow-glow transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-ink-900" />
                      <span>{isBatchApproving ? 'Publishing...' : 'Approve & Publish All'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {crawledItems
                  .filter((item) => {
                    if (queueFilter === 'PENDING') return item.status !== 'APPROVED';
                    if (queueFilter === 'APPROVED') return item.status === 'APPROVED';
                    return true;
                  })
                  .map((item) => {
                    const p = item.product;
                    const isApproved = item.status === 'APPROVED';

                    return (
                      <div
                        key={item._id}
                        className={`rounded-2xl border p-4 flex flex-col justify-between transition-all shadow-2xs hover:shadow-md ${
                          isApproved
                            ? 'bg-emerald-50/20 border-emerald-200/80'
                            : 'bg-white border-line'
                        }`}
                      >
                        <div>
                          {/* Image Thumbnail */}
                          <div className="relative aspect-4/3 rounded-xl bg-surface-alt/70 mb-3 overflow-hidden border border-line flex items-center justify-center p-2 group">
                            <img
                              src={
                                p?.images?.[0] ||
                                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
                              }
                              alt={p?.title || 'Product'}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                              }}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-2xs text-ink-800">
                              {p?.brand || 'Generic'}
                            </span>

                            {/* Method Badge */}
                            <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-spark-100 text-amber-900 border border-spark-200 flex items-center gap-1 shadow-2xs">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              {p?.extractionMethod === 'json-ld' ? 'JSON-LD' : 'HTML Fallback'}
                            </span>
                          </div>

                          {/* Product Details */}
                          <div>
                            <span className="text-[10px] font-bold uppercase text-ink-400">
                              {p?.category || 'General'}
                            </span>
                            <h4 className="text-xs font-bold text-ink-900 line-clamp-2 mt-0.5 mb-2 leading-tight">
                              {p?.title}
                            </h4>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-base font-black text-ink-900 tabular-nums">
                                ₹{(p?.price || 0).toLocaleString('en-IN')}
                              </span>
                              {p?.originalPrice && p.originalPrice > p.price && (
                                <span className="text-xs text-ink-400 line-through tabular-nums">
                                  ₹{p.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                              {p?.sku && (
                                <span className="text-[10px] font-mono text-ink-400 ml-auto truncate max-w-[100px]">
                                  {p.sku}
                                </span>
                              )}
                            </div>

                            {/* Source URL Pill */}
                            {p?.sourceUrl && (
                              <a
                                href={p.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-700 hover:underline mb-4 truncate max-w-full"
                              >
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{p.sourceUrl}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Card Action Controls */}
                        <div className="pt-3 border-t border-line/60 flex items-center justify-between gap-2">
                          {isApproved ? (
                            <div className="w-full flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-200">
                                <CheckCircle className="w-3.5 h-3.5" /> Published to Catalog
                              </span>
                              <Link
                                href="/"
                                className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                              >
                                <span>View</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveCrawledItem(item._id)}
                                className="flex-1 py-2 rounded-xl btn-primary text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-glow transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Publish to Store</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectCrawledItem(item._id)}
                                className="px-3 py-2 rounded-xl border border-line hover:bg-rose-50 hover:border-rose-200 text-ink-500 hover:text-rose-600 text-xs font-bold transition-all"
                                title="Reject and remove from queue"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
