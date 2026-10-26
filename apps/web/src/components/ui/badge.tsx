import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'spark' | 'assured' | 'success' | 'destructive' | 'chip';
}

export function Badge({
  className = '',
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const baseClasses =
    'inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  const variantMap: Record<string, string> = {
    default: 'bg-ink-900 text-white',
    secondary: 'bg-surface-alt text-ink-700 border border-line',
    outline: 'border border-line text-ink-700 bg-white',
    spark: 'bg-spark-100 text-amber-800 border border-spark-300 font-extrabold',
    assured:
      'bg-gradient-to-r from-amber-400 to-spark-500 text-ink-900 font-black italic tracking-tight shadow-sm',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    destructive: 'bg-rose-50 text-rose-700 border border-rose-200',
    chip: 'bg-white neuromorphic-button text-ink-900 px-3 py-1 cursor-pointer hover:border-spark-400',
  };

  const variantClass = variantMap[variant] || variantMap.default;

  return (
    <div className={`${baseClasses} ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
