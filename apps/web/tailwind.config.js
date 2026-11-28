/**
 * Design tokens. Warm neutral base with a single muted rose accent.
 * ink   : warm stone neutrals (text, dark surfaces)
 * berry : primary brand / CTA (muted rose)
 * lilac, peach, lime : low-saturation tints (stone-blue, sand, sage) for subtle surfaces
 */
const ink = {
  0: '#FFFFFF',
  50: '#FAF8F6',
  100: '#F2EFEB',
  200: '#E4DFD9',
  300: '#C8C1B9',
  400: '#9A9289',
  500: '#756E66',
  600: '#5A544D',
  700: '#433E39',
  800: '#2E2A27',
  900: '#211E1C',
  950: '#171514'
}
const berry = {
  50: '#FBF1F2',
  100: '#F6E1E4',
  200: '#EDC3CA',
  300: '#DE98A5',
  400: '#CC6A7E',
  500: '#B84A62',
  600: '#9F3850',
  700: '#812C41',
  800: '#652335',
  900: '#4B1A28'
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
        canvas: '#FBF9F6',
        ink,
        berry,
        // legacy alias so any untouched class still lands on-brand
        brand: berry,
        lilac: { 50: '#F4F6F7', 100: '#E8ECEE', 200: '#D5DCDF', 300: '#B7C3C8', 500: '#6E858E', 700: '#475A62' },
        peach: { 50: '#FAF6F1', 100: '#F4EBE0', 200: '#EBDCCB', 300: '#DCC3A8', 500: '#B8814F', 700: '#7F5430' },
        lime: { 100: '#EEF2E6', 200: '#DDE6CC', 300: '#C5D4A8', 500: '#7E9A52', 700: '#51662F' }
      },
      boxShadow: {
        xs: '0 1px 2px rgba(23, 21, 20, 0.05)',
        soft: '0 6px 20px -10px rgba(23, 21, 20, 0.18)',
        lift: '0 16px 36px -18px rgba(23, 21, 20, 0.25)',
        card: '0 1px 2px rgba(23, 21, 20, 0.04)',
        glow: '0 1px 2px rgba(23, 21, 20, 0.08)'
      },
      borderRadius: {
        xl: '0.625rem',
        '2xl': '0.875rem',
        '3xl': '1rem',
        '4xl': '1.25rem'
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
