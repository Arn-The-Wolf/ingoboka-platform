import type { Config } from 'tailwindcss';

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
          primary: '#0A7B4E',
          'primary-dark': '#065A38',
          'primary-light': '#E8F5EF',
          secondary: '#1A4B8C',
          'secondary-light': '#E8EEF7',
          accent: '#E8B923',
          'accent-dark': '#C99A0F',
          background: '#F4F7F6',
          surface: '#FFFFFF',
          muted: '#6B7280',
          border: '#E2E8E6',
          error: '#DC2626',
          success: '#16A34A',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        elevated: '0 4px 12px 0 rgb(10 123 78 / 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
