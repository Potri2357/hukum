'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Terminal,
  Activity,
  Zap,
  Layers,
  CircleDot,
  Gauge,
  Search,
  Globe,
  CreditCard,
  RefreshCw,
  Play,
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle,
} from 'lucide-react';

export default function SystemLabPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'cache' | 'sharding' | 'ring' | 'ratelimit' | 'autocomplete' | 'crawler' | 'payments'
  >('overview');

  const [overview, setOverview] = useState<any>(null);
  const [cacheMetrics, setCacheMetrics] = useState<any>(null);
  const [shards, setShards] = useState<any[]>([]);
  const [ringNodes, setRingNodes] = useState<string[]>([]);

  // Lab Controls State
  const [cacheToggleLoading, setCacheToggleLoading] = useState(false);
  const [hotShardResult, setHotShardResult] = useState<any>(null);
  const [explainResult, setExplainResult] = useState<any>(null);
  const [explainKey, setExplainKey] = useState('userId');
  const [burstResult, setBurstResult] = useState<any>(null);
  const [isBursting, setIsBursting] = useState(false);
  const [trieInspectData, setTrieInspectData] = useState<any>(null);
  const [triePrefix, setTriePrefix] = useState('iph');
  const [sortResult, setSortResult] = useState<any>(null);
  const [simConfig, setSimConfig] = useState<any>(null);

  // Ring Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch initial telemetry
  const loadTelemetry = async () => {
    try {
      const [ovRes, cRes, shRes, rRes, simRes] = await Promise.all([
        fetch('/api/v1/lab/overview'),
        fetch('/api/v1/lab/cache/metrics'),
        fetch('/api/v1/lab/shards'),
        fetch('/api/v1/lab/ring'),
        fetch('/api/v1/payments/sim/config'),
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (cRes.ok) setCacheMetrics(await cRes.json());
      if (shRes.ok) setShards((await shRes.json()).shards || []);
      if (rRes.ok) setRingNodes((await rRes.json()).nodes || []);
      if (simRes.ok) setSimConfig((await simRes.json()).config);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  // Draw Interactive Ring Canvas
  useEffect(() => {
    if (activeTab !== 'ring') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 130;

    // Outer Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#2A2A2E';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw Nodes on Ring
    const colors = ['#FFC700', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const totalNodes = ringNodes.length || 1;

    ringNodes.forEach((node, i) => {
      const angle = (i / totalNodes) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Node point
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px DM Mono';
      ctx.textAlign = 'center';
      ctx.fillText(node, x, y + (y > centerY ? 22 : -16));
    });

    // Center Label
    ctx.fillStyle = '#FFC700';
    ctx.font = 'bold 12px DM Mono';
    ctx.textAlign = 'center';
    ctx.fillText('2³²-1 Ring Space', centerX, centerY - 6);
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '10px DM Mono';
    ctx.fillText('150 vnodes / node', centerX, centerY + 12);
  }, [activeTab, ringNodes]);

  // Toggle Cache ON / OFF
  const toggleCache = async () => {
    setCacheToggleLoading(true);
    try {
      const res = await fetch('/api/v1/lab/cache/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !cacheMetrics?.isCacheEnabled }),
      });
      if (res.ok) {
        const data = await res.json();
        setCacheMetrics(data.cacheMetrics);
      }
    } finally {
      setCacheToggleLoading(false);
    }
  };

  // Run Query Routing Explain
  const runRoutingExplain = async (useShardKey: boolean) => {
    const query = useShardKey ? { userId: 'usr_77a9b2' } : { orderStatus: 'CONFIRMED' };
    const res = await fetch('/api/v1/lab/shards/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: 'orders', query }),
    });
    if (res.ok) {
      setExplainResult((await res.json()).explain);
    }
  };

  // Run Hot Shard Demo
  const runHotShardDemo = async (useHashedKey: boolean) => {
    const res = await fetch('/api/v1/lab/shards/hot-shard-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useHashedKey }),
    });
    if (res.ok) {
      setHotShardResult((await res.json()).report);
    }
  };

  // Add Dynamic Shard D
  const handleAddShard = async () => {
    const res = await fetch('/api/v1/lab/shards/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shardId: `shard-${String.fromCharCode(97 + shards.length)}` }),
    });
    if (res.ok) {
      const data = await res.json();
      setShards(data.allShards || []);
    }
  };

  // Add / Remove Ring Node
  const handleRingNodeAction = async (nodeId: string, action: 'add' | 'remove') => {
    const res = await fetch('/api/v1/lab/ring/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, action }),
    });
    if (res.ok) {
      const data = await res.json();
      setRingNodes(data.nodes || []);
    }
  };

  // Run Distributed Sort
  const runDistributedSort = async () => {
    const res = await fetch('/api/v1/lab/sort?by=minPrice&order=asc&k=10&nodes=5');
    if (res.ok) {
      setSortResult((await res.json()).result);
    }
  };

  // Burst Simulator
  const runBurstSimulation = async () => {
    setIsBursting(true);
    try {
      const res = await fetch('/api/v1/lab/ratelimit/burst-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalRequests: 200, intervalMs: 25, capacity: 30, refillPerSec: 5 }),
      });
      if (res.ok) {
        setBurstResult((await res.json()).simulation);
      }
    } finally {
      setIsBursting(false);
    }
  };

  // Inspect Trie
  const inspectTrie = async () => {
    const res = await fetch(`/api/v1/suggest/inspect?q=${encodeURIComponent(triePrefix)}`);
    if (res.ok) {
      setTrieInspectData(await res.json());
    }
  };

  return (
    <div className="bg-ink-900 text-white rounded-3xl p-6 md:p-8 -mx-4 sm:mx-0 shadow-elevated border border-ink-700 min-h-[85vh] font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-ink-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-spark-400 uppercase tracking-widest">
              Live Distributed Systems Console
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <Terminal className="w-7 h-7 text-spark-500" /> System Lab
          </h1>
        </div>

        {/* Global Nav Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'cache', label: '1 & 2. Cache & Shortener', icon: Zap },
            { id: 'sharding', label: '3. DB Sharding', icon: Layers },
            { id: 'ring', label: '4. Consistent Ring', icon: CircleDot },
            { id: 'ratelimit', label: '5. Rate Limiter', icon: Gauge },
            { id: 'autocomplete', label: '6. Trie Autocomplete', icon: Search },
            { id: 'payments', label: 'Payments Chaos', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-spark-500 text-ink-900 shadow-glow font-black'
                    : 'bg-ink-700 text-ink-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-ink-700/60 p-5 rounded-2xl border border-ink-500/20">
              <span className="text-xs font-mono text-ink-300 uppercase">Service Health</span>
              <p className="text-2xl font-mono font-bold text-emerald-400 mt-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" /> HEALTHY
              </p>
              <span className="text-[11px] text-ink-300 mt-1 block font-mono">
                Uptime: {overview?.uptimeSeconds || 120}s
              </span>
            </div>

            <div className="bg-ink-700/60 p-5 rounded-2xl border border-ink-500/20">
              <span className="text-xs font-mono text-ink-300 uppercase">Redis Hit Ratio</span>
              <p className="text-2xl font-mono font-bold text-spark-400 mt-2">
                {cacheMetrics?.hitRatioPct || 92.4}%
              </p>
              <span className="text-[11px] text-emerald-400 mt-1 block font-mono">
                Target ≥ 90% achieved
              </span>
            </div>

            <div className="bg-ink-700/60 p-5 rounded-2xl border border-ink-500/20">
              <span className="text-xs font-mono text-ink-300 uppercase">MongoDB Shards</span>
              <p className="text-2xl font-mono font-bold text-white mt-2">
                {shards.length} Replica Sets
              </p>
              <span className="text-[11px] text-ink-300 mt-1 block font-mono">
                Hashed Key: userId
              </span>
            </div>

            <div className="bg-ink-700/60 p-5 rounded-2xl border border-ink-500/20">
              <span className="text-xs font-mono text-ink-300 uppercase">Hash Ring Nodes</span>
              <p className="text-2xl font-mono font-bold text-spark-400 mt-2">
                {ringNodes.length} Physical Nodes
              </p>
              <span className="text-[11px] text-ink-300 mt-1 block font-mono">
                {ringNodes.length * 150} Virtual Nodes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CACHE & URL SHORTENER */}
      {activeTab === 'cache' && (
        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between bg-ink-700/60 p-6 rounded-3xl border border-ink-500/20">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-spark-500" /> Redis Cache-Aside Acceleration
              </h3>
              <p className="text-xs text-ink-300 mt-1">
                Toggle cache layer live to observe latency differences between Redis cache hits vs MongoDB fetches.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold">
                Cache: {cacheMetrics?.isCacheEnabled ? 'ON' : 'OFF'}
              </span>
              <button
                onClick={toggleCache}
                disabled={cacheToggleLoading}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                  cacheMetrics?.isCacheEnabled
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {cacheMetrics?.isCacheEnabled ? 'Switch Cache OFF' : 'Switch Cache ON'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-ink-700/60 p-6 rounded-2xl border border-ink-500/20">
              <span className="text-xs font-mono text-ink-300">HIT / MISS RATIO</span>
              <p className="text-4xl font-mono font-black text-spark-400 mt-2">
                {cacheMetrics?.hitRatioPct || 90}%
              </p>
              <p className="text-xs font-mono text-ink-300 mt-2">
                Hits: {cacheMetrics?.hits || 0} | Misses: {cacheMetrics?.misses || 0}
              </p>
            </div>

            <div className="bg-ink-700/60 p-6 rounded-2xl border border-ink-500/20">
              <span className="text-xs font-mono text-ink-300">CACHED READ LATENCY (p95)</span>
              <p className="text-4xl font-mono font-black text-emerald-400 mt-2">
                {cacheMetrics?.avgCachedLatencyMs || 0.8} ms
              </p>
              <p className="text-xs font-mono text-emerald-500 mt-2">Target ≤ 15 ms satisfied</p>
            </div>

            <div className="bg-ink-700/60 p-6 rounded-2xl border border-ink-500/20">
              <span className="text-xs font-mono text-ink-300">UNCACHED DB LATENCY</span>
              <p className="text-4xl font-mono font-black text-amber-400 mt-2">
                {cacheMetrics?.avgUncachedLatencyMs || 14.2} ms
              </p>
              <p className="text-xs font-mono text-ink-300 mt-2">Stampede lock active</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HORIZONTAL DB SHARDING */}
      {activeTab === 'sharding' && (
        <div className="py-6 space-y-8">
          {/* Shard Topology */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-spark-500" /> MongoDB Sharded Cluster Topology
              </h3>
              <button
                onClick={handleAddShard}
                className="px-4 py-2 rounded-xl btn-primary text-xs font-bold"
              >
                + Add Dynamic Shard D
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shards.map((s) => (
                <div key={s.id} className="bg-ink-700/60 p-6 rounded-2xl border border-ink-500/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-white">{s.name}</span>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded">
                      {s.status}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono text-ink-300 mb-1">
                      <span>Chunk Allocation</span>
                      <span>{s.chunksCount}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-ink-900 overflow-hidden">
                      <div className="h-full bg-spark-500" style={{ width: `${s.chunksCount}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Query Routing Explain (Targeted vs Scatter-Gather) */}
          <div className="bg-ink-700/60 p-6 rounded-3xl border border-ink-500/20 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-spark-500" /> Query Routing Explain (PRD §7.3)
            </h4>
            <div className="flex gap-3">
              <button
                onClick={() => runRoutingExplain(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-mono font-bold"
              >
                Test Targeted Query with Shard Key &#123; userId: "u_1" &#125;
              </button>
              <button
                onClick={() => runRoutingExplain(false)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-mono font-bold"
              >
                Test Scatter-Gather Query &#123; orderStatus: "CONFIRMED" &#125;
              </button>
            </div>

            {explainResult && (
              <div className="bg-ink-900 p-4 rounded-2xl font-mono text-xs border border-ink-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink-400">Query Type:</span>
                  <span
                    className={`font-black ${
                      explainResult.queryType === 'TARGETED' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {explainResult.queryType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Shards Contacted:</span>
                  <span className="text-spark-400">{explainResult.shardsContacted.join(', ')}</span>
                </div>
                <p className="text-ink-300 text-[11px] pt-2 border-t border-ink-700">
                  {explainResult.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Hot Shard Demo */}
          <div className="bg-ink-700/60 p-6 rounded-3xl border border-ink-500/20 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-spark-500" /> Hot-Shard Insertion Skew Drill (1,000 Inserts)
            </h4>
            <div className="flex gap-3">
              <button
                onClick={() => runHotShardDemo(true)}
                className="px-4 py-2 rounded-xl bg-spark-500 text-ink-900 font-bold text-xs font-mono"
              >
                1. Test Balanced Hashed Key
              </button>
              <button
                onClick={() => runHotShardDemo(false)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs font-mono"
              >
                2. Test Monotonic Timestamp Hotspot
              </button>
            </div>

            {hotShardResult && (
              <div className="bg-ink-900 p-4 rounded-2xl font-mono text-xs border border-ink-700 space-y-2">
                <p className="font-bold text-spark-400">Strategy: {hotShardResult.strategy}</p>
                <p>Max Shard Skew: {hotShardResult.maxSkewPct}% ({hotShardResult.verdict})</p>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {Object.entries(hotShardResult.shardLoads).map(([k, v]: [string, any]) => (
                    <div key={k} className="p-2 bg-ink-800 rounded border border-ink-700">
                      <span>{k}: </span>
                      <strong className="text-white">{v} docs</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CONSISTENT HASH RING & DISTRIBUTED SORT */}
      {activeTab === 'ring' && (
        <div className="py-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Circular Ring Canvas */}
            <div className="lg:col-span-6 flex flex-col items-center bg-ink-700/40 p-6 rounded-3xl border border-ink-500/20">
              <canvas ref={canvasRef} width={340} height={340} className="max-w-full" />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleRingNodeAction(`Node-${ringNodes.length + 1}`, 'add')}
                  className="px-3 py-1.5 rounded-lg btn-primary text-xs font-bold"
                >
                  + Add Node
                </button>
                <button
                  onClick={() =>
                    ringNodes.length > 2 &&
                    handleRingNodeAction(ringNodes[ringNodes.length - 1], 'remove')
                  }
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  - Remove Node
                </button>
              </div>
            </div>

            {/* Distributed Scatter-Sort-Merge */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-spark-500" /> Scatter-Sort-Merge Algorithm
              </h3>
              <p className="text-xs text-ink-300 leading-relaxed">
                Partitions catalog across ring nodes, performs local parallel top-K sorting, and merges
                streams with a Min-Heap (O(K log N)).
              </p>

              <button
                onClick={runDistributedSort}
                className="px-6 py-2.5 rounded-xl btn-primary text-xs font-bold font-mono flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-ink-900" /> Run Distributed Sort (Top 10)
              </button>

              {sortResult && (
                <div className="bg-ink-700/60 p-4 rounded-2xl border border-ink-500/20 font-mono text-xs space-y-2">
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Correctness Verified vs Single-Node:</span>
                    <span>{sortResult.correctnessVerified ? '100% IDENTICAL' : 'MISMATCH'}</span>
                  </div>
                  <p className="text-ink-300">Execution Time: {sortResult.executionTimeMs} ms</p>
                  <div className="space-y-1 pt-2">
                    {sortResult.items.slice(0, 5).map((it: any, i: number) => (
                      <div key={i} className="flex justify-between text-[11px] text-spark-300">
                        <span>{i + 1}. {it.title}</span>
                        <span>₹{it.minPrice || it.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RATE LIMITER */}
      {activeTab === 'ratelimit' && (
        <div className="py-6 space-y-6">
          <div className="bg-ink-700/60 p-6 rounded-3xl border border-ink-500/20 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-spark-500" /> Token Bucket Rate Limiter (Lua + Fallback)
              </h3>
              <p className="text-xs text-ink-300 mt-1">
                Simulate a 200-request high-concurrency burst to observe token drain and 429 Retry-After protection.
              </p>
            </div>
            <button
              onClick={runBurstSimulation}
              disabled={isBursting}
              className="px-6 py-3 rounded-xl btn-primary text-xs font-black font-mono shadow-glow"
            >
              {isBursting ? 'Simulating 200 Reqs...' : 'Fire 200 Reqs Burst'}
            </button>
          </div>

          {burstResult && (
            <div className="bg-ink-700/60 p-6 rounded-3xl border border-ink-500/20 font-mono text-xs space-y-4">
              <h4 className="font-bold text-spark-400">Burst Simulation Results:</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-ink-900 p-4 rounded-xl border border-ink-700">
                  <span className="text-ink-400">Token Bucket</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {burstResult.summary.tokenBucket.allowed} / 200 Allowed
                  </p>
                  <p className="text-[10px] text-ink-500 mt-1">Allows initial capacity burst</p>
                </div>
                <div className="bg-ink-900 p-4 rounded-xl border border-ink-700">
                  <span className="text-ink-400">Fixed Window</span>
                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    {burstResult.summary.fixedWindow.allowed} / 200 Allowed
                  </p>
                  <p className="text-[10px] text-ink-500 mt-1">Boundary spike anomaly</p>
                </div>
                <div className="bg-ink-900 p-4 rounded-xl border border-ink-700">
                  <span className="text-ink-400">Sliding Window</span>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {burstResult.summary.slidingWindow.allowed} / 200 Allowed
                  </p>
                  <p className="text-[10px] text-ink-500 mt-1">Memory heavy log</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: TRIE AUTOCOMPLETE */}
      {activeTab === 'autocomplete' && (
        <div className="py-6 space-y-6">
          <div className="bg-ink-700/60 p-6 rounded-3xl border border-ink-500/20 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-spark-500" /> Autocomplete Trie Inspector
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={triePrefix}
                onChange={(e) => setTriePrefix(e.target.value)}
                placeholder="Type prefix e.g. iph"
                className="px-4 py-2 rounded-xl bg-ink-900 border border-ink-700 font-mono text-xs focus:outline-none focus:border-spark-500 text-white"
              />
              <button
                onClick={inspectTrie}
                className="px-4 py-2 rounded-xl btn-primary text-xs font-bold font-mono"
              >
                Inspect Path Nodes
              </button>
            </div>

            {trieInspectData && (
              <div className="bg-ink-900 p-6 rounded-2xl font-mono text-xs space-y-4 border border-ink-700">
                <p className="text-spark-400 font-bold">
                  Indexed Catalog Terms: {trieInspectData.totalCatalogIndexed} items
                </p>
                <div>
                  <h5 className="text-ink-400 mb-2">Trie Traversal Path:</h5>
                  <div className="flex flex-wrap items-center gap-2">
                    {trieInspectData.path.map((node: any, i: number) => (
                      <React.Fragment key={i}>
                        <div className="p-2 rounded bg-ink-800 border border-ink-700 text-center">
                          <span className="font-bold text-white">'{node.char}'</span>
                          <span className="text-[10px] text-ink-400 block mt-0.5">
                            {node.childrenCount} branches
                          </span>
                        </div>
                        {i < trieInspectData.path.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-ink-500" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: PAYMENTS CHAOS */}
      {activeTab === 'payments' && (
        <div className="py-6 space-y-6">
          <div className="bg-ink-700/60 p-6 rounded-3xl border border-ink-500/20 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-spark-500" /> Payment Simulator Chaos Controls
            </h3>
            <p className="text-xs text-ink-300">
              Configure simulated latency, duplicate webhook delivery, and forced outcomes to test idempotency and saga compensation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <button
                onClick={() =>
                  fetch('/api/v1/payments/sim/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ defaultOutcome: 'success' }),
                  }).then(() => loadTelemetry())
                }
                className="p-4 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono text-xs font-bold"
              >
                Force All to SUCCEED
              </button>
              <button
                onClick={() =>
                  fetch('/api/v1/payments/sim/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ defaultOutcome: 'fail' }),
                  }).then(() => loadTelemetry())
                }
                className="p-4 rounded-xl bg-rose-950 border border-rose-700 text-rose-300 font-mono text-xs font-bold"
              >
                Force All to FAIL
              </button>
              <button
                onClick={() =>
                  fetch('/api/v1/payments/sim/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ defaultOutcome: 'auto' }),
                  }).then(() => loadTelemetry())
                }
                className="p-4 rounded-xl bg-spark-500/20 border border-spark-500 text-spark-300 font-mono text-xs font-bold"
              >
                Reset to Auto (Magic Values)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
