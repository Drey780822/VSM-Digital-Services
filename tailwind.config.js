/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: { DEFAULT: 'var(--background)', secondary: 'var(--background-secondary)', elevated: 'var(--background-elevated)' },
        foreground: { DEFAULT: 'var(--foreground)', muted: 'var(--foreground-muted)' },
        primary: { DEFAULT: 'var(--primary)', dark: 'var(--primary-dark)', light: 'var(--primary-light)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        border: { DEFAULT: 'var(--border)', gold: 'var(--border-gold)' },
        input: 'var(--input)',
        ring: 'var(--ring)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-md': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C8A96B 0%, #A67C52 100%)',
        'gold-gradient-light': 'linear-gradient(135deg, #E8C87A 0%, #C8A96B 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0B0B0D 0%, #1A1A1F 100%)',
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(200, 169, 107, 0.3)',
        'gold-lg': '0 8px 40px rgba(200, 169, 107, 0.2), 0 0 80px rgba(200, 169, 107, 0.05)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(200, 169, 107, 0.08)',
        'inner-gold': 'inset 0 1px 0 rgba(200, 169, 107, 0.2)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};