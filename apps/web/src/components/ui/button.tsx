import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'buyNow' | 'secondary' | 'outline' | 'ghost' | 'neuromorphic';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-bold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants: Record<string, string> = {
      primary: 'btn-primary rounded-xl',
      buyNow: 'btn-buy-now rounded-xl',
      secondary: 'bg-surface-alt hover:bg-line text-ink-900 border border-line rounded-xl',
      outline: 'bg-white hover:bg-surface-alt text-ink-900 border border-line rounded-xl shadow-sm',
      ghost: 'hover:bg-surface-alt text-ink-700 rounded-lg',
      neuromorphic: 'neuromorphic-button rounded-xl text-ink-900',
    };

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-xs',
      lg: 'px-6 py-3.5 text-sm',
      icon: 'w-9 h-9 p-0 rounded-full',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
