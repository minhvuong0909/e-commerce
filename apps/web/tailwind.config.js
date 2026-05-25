export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#faf9f8',
          100: '#f3f0ec',
          200: '#e6dfd7',
          500: '#8c7d70',
          700: '#594d42',
          900: '#2b2621',
          950: '#1a1713'
        },
        brand: {
          50: '#f2f8f4',
          100: '#e0f0e5',
          500: '#75b38a',
          600: '#5a966d',
          900: '#2f523a'
        },
        mint: {
          50: '#f0fdf6',
          100: '#dcfce9',
          500: '#22c55e',
          600: '#16a34a'
        }
      },
      boxShadow: {
        soft: '0 18px 55px rgba(15, 23, 42, 0.12)',
        lift: '0 24px 70px rgba(15, 23, 42, 0.18)',
        card: '0 1px 2px rgba(15, 23, 42, 0.07), 0 16px 42px rgba(15, 23, 42, 0.12)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'soft-pop': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 420ms ease-out both',
        'soft-pop': 'soft-pop 360ms ease-out both'
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem'
      }
    }
  },
  plugins: []
}
