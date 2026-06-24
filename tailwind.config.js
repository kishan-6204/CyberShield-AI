/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: '#07111f',
        panel: '#0d1b2e',
        cyanSoft: '#22d3ee',
      },
      boxShadow: {
        glow: '0 0 40px rgba(34, 211, 238, 0.12)',
      },
    },
  },
  plugins: [],
};
