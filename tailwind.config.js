/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'amazon-navy': '#131921',
        'amazon-light-navy': '#232F3E',
        'amazon-orange': '#FF9900',
        'amazon-orange-hover': '#E68A00',
        'amazon-yellow': '#FFA41C',
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
