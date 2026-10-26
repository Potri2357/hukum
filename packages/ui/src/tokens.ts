export const tokens = {
  colors: {
    spark: {
      50: '#FFFBEB',
      100: '#FFF6CC',
      300: '#FFE066',
      400: '#FFD43B',
      500: '#FFC700', // Primary CTA, highlights, badges
    },
    amber: {
      600: '#F59E0B', // Hover/pressed CTA, ratings
      700: '#B45309', // High contrast text on yellow
    },
    ink: {
      900: '#0F0F10', // Primary text, premium dark sections
      700: '#2A2A2E', // Secondary headings
      500: '#5B5B63', // Body secondary text
      300: '#A1A1AA', // Placeholders, disabled
    },
    line: '#ECECEF',
    surface: '#FFFFFF',
    surfaceAlt: '#FAFAF7',
    success: '#16A34A',
    danger: '#E11D48',
    info: '#2563EB',
  },
  radius: {
    sm: '10px',
    md: '16px',
    lg: '24px',
    full: '999px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.06)',
    md: '0 4px 20px -2px rgba(15,15,16,0.08)',
    glow: '0 8px 30px rgba(255,199,0,0.35)',
    card: '0 2px 12px rgba(0,0,0,0.04)',
    elevated: '0 20px 40px -8px rgba(0,0,0,0.12)',
  },
  fonts: {
    sans: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    mono: "'DM Mono', ui-monospace, SFMono-Regular, monospace",
  },
  gradients: {
    cta: 'linear-gradient(135deg, #FFD43B 0%, #FFC700 55%, #F59E0B 100%)',
    ctaHover: 'linear-gradient(135deg, #FFE066 0%, #FFD43B 55%, #F59E0B 100%)',
    darkElite: 'linear-gradient(180deg, #18181B 0%, #0F0F10 100%)',
    yellowGaze: 'linear-gradient(135deg, rgba(255,199,0,0.15) 0%, rgba(245,158,11,0.03) 100%)',
  },
} as const;
