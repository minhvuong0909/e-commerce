/**
 * Vibrant Glow design tokens — see design-system/web/MASTER.md
 * ink   : aubergine neutrals (text, dark surfaces)
 * berry : primary brand / CTA
 * lilac, peach, lime : supporting accents for bento tiles & highlights
 */
const ink = {
  0: '#FFFFFF',
  50: '#FAF7FA',
  100: '#F3EEF4',
  200: '#E6DDE8',
  300: '#C9BCCD',
  400: '#9C8DA2',
  500: '#76667C',
  600: '#5C4D62',
  700: '#46384B',
  800: '#2F2234',
  900: '#24182A',
  950: '#1B0F1F'
}

const berry = {
  50: '#FFF0F6',
  100: '#FFE0EC',
  200: '#FFC2DA',
  300: '#FF94BD',
  400: '#F45D99',
  500: '#E0307A',
  600: '#C21C63',
  700: '#9E1550',
  800: '#7D1442',
  900: '#5E1033'
}

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      colors: {
        canvas: '#FFFAF7',
        ink,
        berry,
        // legacy alias so any untouched class still lands on-brand
        brand: berry,
        lilac: { 50: '#F7F4FF', 100: '#EDE7FF', 200: '#DCD0FF', 300: '#C4B1FF', 500: '#8B5CF6', 700: '#5B34C4' },
        peach: { 50: '#FFF7F1', 100: '#FFEBDD', 200: '#FFD5BC', 300: '#FFB78F', 500: '#F27A3D', 700: '#B4501E' },
        lime: { 100: '#F4FCD0', 200: '#E9F99B', 300: '#D4F25A', 500: '#8DB51A', 700: '#4F6A07' }
      },
      boxShadow: {
        xs: '0 1px 2px rgba(27, 15, 31, 0.06)',
        soft: '0 10px 30px -12px rgba(27, 15, 31, 0.18)',
        lift: '0 24px 48px -20px rgba(27, 15, 31, 0.28)',
        card: '0 1px 2px rgba(27, 15, 31, 0.04), 0 12px 32px -16px rgba(27, 15, 31, 0.16)',
        glow: '0 12px 36px -10px rgba(224, 48, 122, 0.45)'
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'soft-pop': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 420ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'soft-pop': 'soft-pop 320ms cubic-bezier(0.22, 1, 0.36, 1) both',
        marquee: 'marquee 38s linear infinite',
        float: 'float 6s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
