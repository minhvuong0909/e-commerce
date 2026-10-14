export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', '"Cormorant Garamond"', 'Georgia', 'serif']
      },
      colors: {
        luxury: {
          primary: '#1C1917',
          secondary: '#44403C',
          accent: '#A16207',
          'accent-hover': '#854D0E',
          bg: '#FAF7F2',
          card: '#FFFFFF',
          muted: '#F5EFE6',
          border: '#E7E0D8',
          'border-strong': '#D6C8B8',
          text: '#1C1917',
          'text-secondary': '#594D42',
          'text-muted': '#786C60'
        },
        ink: {
          50: '#faf9f8',
          100: '#f3f0ec',
          200: '#e6dfd7',
          500: '#8c7d70',
          700: '#594d42',
          900: '#2b2621',
          950: '#1C1917'
        },
        brand: {
          50: '#FAF7F2',
          100: '#EFE9E0',
          200: '#E7E0D8',
          500: '#A16207',
          600: '#854D0E',
          700: '#5C4B3C',
          900: '#1C1917'
        },
        terracotta: {
          50: '#FDF6F0',
          100: '#FBEBDD',
          500: '#C47A5A',
          600: '#AB6042',
          700: '#874830'
        },
        sand: {
          50: '#FAF7F2',
          100: '#F5EFE6',
          200: '#E7E0D8'
        },
        mint: {
          50: '#f0fdf6',
          100: '#dcfce9',
          500: '#22c55e',
          600: '#16a34a'
        }
      },
      boxShadow: {
        soft: '0 18px 55px rgba(43, 33, 24, 0.08)',
        lift: '0 24px 70px rgba(43, 33, 24, 0.14)',
        card: '0 2px 12px rgba(43, 33, 24, 0.04), 0 16px 42px rgba(43, 33, 24, 0.06)',
        'warm-glow': '0 0 25px rgba(154, 128, 105, 0.18)'
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
