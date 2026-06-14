/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332',
          dark: '#0F2D1F',
        },
        accent: '#F5C518',
        success: {
          bg: '#dcfce7',
          text: '#166534',
          border: '#86efac',
        },
        winner: {
          bg: '#dbeafe',
          text: '#1e40af',
          border: '#93c5fd',
        },
        miss: {
          bg: '#fee2e2',
          text: '#991b1b',
          border: '#fecaca',
        },
        pending: {
          bg: '#f3f4f6',
          text: '#6b7280',
          border: '#e5e7eb',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
