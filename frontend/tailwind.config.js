/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      backgroundColor: (theme) => ({
        background: {
          light: theme('colors.background.light'),
          dark: theme('colors.background.dark'),
        },
      }),
      colors: {
        // Primary colors
        primary: {
          DEFAULT: '#2563EB', // blue-600
          dark: '#1D4ED8',   // blue-700
          light: '#3B82F6',  // blue-500
        },
        // Secondary colors
        secondary: {
          DEFAULT: '#10B981', // emerald-500
          dark: '#059669',    // emerald-600
          light: '#34D399',   // emerald-400
        },
        // Accent colors
        accent: {
          DEFAULT: '#FACC15', // yellow-400 (light mode)
          dark: '#FCD34D',    // yellow-300 (dark mode)
        },
        // Background colors
        background: {
          light: '#F9FAFB',  // gray-50
          dark: '#0F172A',   // slate-900
        },
        // Text colors
        text: {
          light: '#111827',  // gray-900
          dark: '#F9FAFB',   // gray-50
        },
        // Status colors
        status: {
          true: '#10B981',   // emerald-500
          false: '#EF4444',  // red-500
          inconclusive: '#F59E0B', // amber-500
        },
        // UI colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
  ],
}
