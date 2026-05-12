import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'accent': 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        'accent-hover': 'var(--accent-hover)',
        'border-default': 'var(--border)',
        'border-accent': 'var(--border-accent)',
        'danger': 'var(--danger)',
        'success': 'var(--success)',
      },
      fontFamily: {
        clash: ['Clash Display', 'sans-serif'],
        satoshi: ['Satoshi', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '2px',
        DEFAULT: '4px',
        'md': '6px',
        'lg': '8px',
      },
    },
  },
  plugins: [],
};

export default config;
