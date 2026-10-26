'use client';

import React from 'react';
import Link from 'next/link';

const categories = [
  {
    name: 'Mobiles',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&auto=format&fit=crop&q=80',
    slug: 'Mobiles%20%26%20Tablets',
  },
  {
    name: 'Laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=80',
    slug: 'Laptops%20%26%20Computers',
  },
  {
    name: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    slug: 'Audio%20%26%20Soundbars',
  },
  {
    name: 'Watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
    slug: 'Smart%20Watches',
  },
  {
    name: 'Cameras',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80',
    slug: 'Cameras%20%26%20Drones',
  },
  {
    name: 'Gaming',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=80',
    slug: 'Gaming%20%26%20Desk',
  },
  {
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=200&auto=format&fit=crop&q=80',
    slug: 'Sneakers%20%26%20Fashion',
  },
];

export function CategoryOrbit({
  activeCategory,
  onSelectCategory,
}: {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-line p-4 mb-6 shadow-sm overflow-x-auto scrollbar-none">
      <div className="flex items-center justify-between min-w-[680px] px-2 gap-4">
        {categories.map((cat, idx) => {
          const isSelected =
            activeCategory && decodeURIComponent(activeCategory).toLowerCase().includes(cat.name.toLowerCase());

          return (
            <Link
              key={idx}
              href={`/?category=${cat.slug}`}
              onClick={(e) => {
                if (onSelectCategory) {
                  e.preventDefault();
                  onSelectCategory(decodeURIComponent(cat.slug));
                }
              }}
              className="flex flex-col items-center gap-2 group flex-1 cursor-pointer"
            >
              <div
                className={`w-16 h-16 rounded-full p-1 bg-surface-alt border-2 transition-all duration-300 group-hover:scale-110 flex items-center justify-center overflow-hidden shadow-sm ${
                  isSelected ? 'border-spark-500 ring-4 ring-spark-200' : 'border-line hover:border-spark-400'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span
                className={`text-xs font-bold transition-colors ${
                  isSelected ? 'text-amber-700 font-extrabold' : 'text-ink-700 group-hover:text-amber-600'
                }`}
              >
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
