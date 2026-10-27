'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sliders, Check, Trash2, ShoppingCart, ArrowLeft, Star } from 'lucide-react';

export default function ComparePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompareItems() {
      try {
        const res = await fetch('/api/v1/compare?ids=p_101,p_102,p_103');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load compare items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCompareItems();
  }, []);

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-full hover:bg-surface-alt border border-line">
          <ArrowLeft className="w-4 h-4 text-ink-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-ink-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-spark-500" /> Product Comparison Matrix
          </h1>
          <p className="text-xs text-ink-500">
            Compare technical specifications, prices, and seller promises side-by-side.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-ink-500">Loading comparison matrix...</div>
      ) : products.length === 0 ? (
        <div className="bg-surface-alt rounded-2xl p-12 text-center border border-line">
          <p className="text-base font-bold text-ink-900 mb-2">No products to compare</p>
          <p className="text-xs text-ink-500 mb-4">Add products to your comparison list from any product page.</p>
          <Link href="/" className="px-6 py-2 rounded-full btn-primary text-xs font-bold inline-block">
            Browse Store
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl shadow-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-line bg-surface-alt/70">
                <th className="p-4 w-48 font-bold text-ink-500 uppercase tracking-wider">Features</th>
                {products.map((p) => (
                  <th key={p._id} className="p-4 min-w-[220px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-spark-100 px-2 py-0.5 rounded">
                        {p.brand}
                      </span>
                      <button
                        onClick={() => removeProduct(p._id)}
                        className="text-ink-300 hover:text-rose-600"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <img
                      src={p.media?.[0] || p.image}
                      alt={p.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                      }}
                      className="w-28 h-28 object-contain rounded-xl mx-auto mb-2 bg-white/70 p-1 border border-white/80"
                    />
                    <h3 className="font-bold text-sm text-ink-900 line-clamp-2 mb-2">{p.title}</h3>
                    <p className="text-base font-black text-ink-900 tabular-nums">
                      ₹{(p.minPrice || p.price).toLocaleString('en-IN')}
                    </p>
                    <Link
                      href={`/products/${p.slug || p._id}`}
                      className="w-full mt-3 py-1.5 rounded-lg btn-primary text-xs font-bold text-center block"
                    >
                      View PDP
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr>
                <td className="p-4 font-bold text-ink-500 bg-surface-alt">Rating</td>
                {products.map((p) => (
                  <td key={p._id} className="p-4 font-bold text-amber-700">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{p.ratingAvg || 4.5}</span>
                    </span>{' '}
                    <span className="text-xs text-ink-500 font-normal">
                      ({(p.ratingCount || 100).toLocaleString()} reviews)
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-ink-500 bg-surface-alt">Category</td>
                {products.map((p) => (
                  <td key={p._id} className="p-4 text-ink-900 font-semibold">{p.category}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-ink-500 bg-surface-alt">SKU</td>
                {products.map((p) => (
                  <td key={p._id} className="p-4 font-mono text-ink-700">{p.sku || 'N/A'}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-ink-500 bg-surface-alt">Key Specs</td>
                {products.map((p) => (
                  <td key={p._id} className="p-4 text-ink-700">
                    {p.specs ? (
                      <ul className="space-y-1">
                        {Object.entries(p.specs).slice(0, 4).map(([k, v]: [string, any]) => (
                          <li key={k}>
                            <strong>{k}:</strong> {String(v)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'Standard specifications'
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-ink-500 bg-surface-alt">Delivery Promise</td>
                {products.map((p) => (
                  <td key={p._id} className="p-4 font-semibold text-emerald-700">
                    <span className="inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>2-Day Guaranteed (Hukum Assured)</span>
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
