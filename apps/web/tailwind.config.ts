import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        spark: {
          50: '#FFFBEB',
          100: '#FFF6CC',
          300: '#FFE066',
          400: '#FFD43B',
          500: '#FFC700', // Primary CTA
        },
        amber: {
          600: '#F59E0B',
          700: '#B45309',
        },
        ink: {
          900: '#0F0F10', // Text primary
          700: '#2A2A2E',
          500: '#5B5B63',
          300: '#A1A1AA',
        },
        line: '#ECECEF',
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#FAFAF7',
        },
        success: '#16A34A',
        danger: '#E11D48',
        info: '#2563EB',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 8px 30px rgba(255, 199, 0, 0.35)',
        card: '0 2px 12px rgba(0, 0, 0, 0.04)',
        elevated: '0 20px 40px -8px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '24px',
      },
    },
  },
  plugins: [],
};

export default config;
