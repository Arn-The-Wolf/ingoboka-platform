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
          // Primary - Deep insurance blue
          primary: '#0B3A6E',
          'primary-dark': '#1F2937', // Navy gray (main text color)
          'primary-darker': '#072A52', // Darker blue for hovers & gradients
          'primary-light': '#E8F0F8',
          'primary-container': '#0B3A6E',

          // Secondary - Mid blue (supporting actions)
          secondary: '#1E5AA8',
          'secondary-container': '#1E5AA8',

          // Accent - Gold
          accent: '#FDAA30',
          'accent-dark': '#E09820',
          
          // Background & Surfaces
          background: '#F8FAFC',
          surface: '#FFFFFF',
          'surface-container': '#F1F5F9',
          'surface-container-low': '#F8FAFC',
          
          // Text Colors
          muted: '#6B7280',
          border: '#E5E7EB',
          outline: '#9CA3AF',
          
          // Semantic Colors
          error: '#DC2626',
          success: '#16A34A',
          warning: '#F59E0B',
          info: '#2563EB',
          
          // Special
          'asset-protection': '#0F766E',  // Teal
          sidebar: '#0F172A',  // Dark Navy
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
        elevated: '0 4px 16px 0 rgb(11 58 110 / 0.12)',
        modal: '0 12px 32px 0 rgb(0 0 0 / 0.1)',
        glow: '0 0 24px 0 rgb(253 170 48 / 0.35)',
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
