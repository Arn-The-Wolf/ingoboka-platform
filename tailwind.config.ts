import type { Config } from 'tailwindcss';

/** Ingoboka design tokens — see design/.../ingoboka_design_system/DESIGN.md */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1B6B3A',
          'primary-dark': '#005127',
          'primary-light': '#E8F5EF',
          'primary-container': '#1B6B3A',
          secondary: '#855300',
          'secondary-container': '#F4A228',
          accent: '#F4A228',
          'accent-dark': '#C99A0F',
          background: '#F7FAF3',
          surface: '#FFFFFF',
          'surface-container': '#EBEFE8',
          'surface-container-low': '#F1F5ED',
          muted: '#404940',
          border: '#BFC9BD',
          outline: '#707A6F',
          error: '#BA1A1A',
          success: '#16A34A',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
        xl: '1rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        elevated: '0 4px 16px 0 rgb(27 107 58 / 0.12)',
        modal: '0 12px 32px 0 rgb(0 0 0 / 0.1)',
        glow: '0 0 24px 0 rgb(244 162 40 / 0.35)',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        float: 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 0.5s infinite',
        marquee: 'marquee 28s linear infinite',
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
    },
  },
  plugins: [],
};

export default config;
