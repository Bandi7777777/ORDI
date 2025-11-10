// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // برای dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4F46E5', // indigo for light
          dark: '#6366F1', // indigo for dark
        },
        accent: '#C0A062', // gold
        bg: {
          light: '#F9FAFB',
          dark: '#1F2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // font شیک
      },
      boxShadow: {
        glow: '0 0 15px rgba(192, 160, 98, 0.3)', // glow gold
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};