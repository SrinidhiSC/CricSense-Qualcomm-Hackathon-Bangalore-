/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Cream / warm white palette
        cream: {
          50:  '#FDFCF8',
          100: '#F9F6EF',
          200: '#F3EDE0',
          300: '#EAE0CC',
          400: '#D9CCAF',
          500: '#C4B08A',
        },
        // Ink — warm dark
        ink: {
          50:  '#F5F4F2',
          100: '#E8E4DC',
          200: '#C8C0B0',
          300: '#9E9282',
          400: '#6B5F50',
          500: '#3D3228',
          600: '#241E16',
          900: '#110E09',
        },
        // Cricket green accent
        pitch: {
          50:  '#EDFAF2',
          100: '#D0F3E0',
          200: '#A3E8C4',
          300: '#5FD19B',
          400: '#2BB876',
          500: '#1A9459',
          600: '#136E42',
          700: '#0E5232',
        },
        // Warning amber
        amber: {
          50:  '#FFF8ED',
          100: '#FEECD0',
          200: '#FDD49A',
          300: '#FBBA5E',
          400: '#F9A020',
          500: '#E07E08',
        },
        // Alert red
        alert: {
          100: '#FDECEA',
          400: '#E05252',
          500: '#C43333',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(61,50,40,0.06), 0 1px 2px -1px rgba(61,50,40,0.06)',
        float: '0 4px 16px 0 rgba(61,50,40,0.10), 0 1px 4px 0 rgba(61,50,40,0.06)',
        glow:  '0 0 0 3px rgba(27,148,89,0.18)',
      },
    },
  },
  plugins: [],
}
