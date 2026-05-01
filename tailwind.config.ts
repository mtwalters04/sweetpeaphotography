import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        bone: 'var(--bone)',
        vellum: 'var(--vellum)',
        mist: 'var(--mist)',
        ash: 'var(--ash)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        't-12': ['0.75rem', { lineHeight: '1.6' }],
        't-14': ['0.875rem', { lineHeight: '1.6' }],
        't-16': ['1rem', { lineHeight: '1.6' }],
        't-18': ['1.125rem', { lineHeight: '1.6' }],
        't-22': ['1.375rem', { lineHeight: '1.4' }],
        't-28': ['1.75rem', { lineHeight: '1.3' }],
        't-36': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        't-48': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        't-64': ['4rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      maxWidth: {
        content: '1280px',
        prose: '640px',
      },
    },
  },
  plugins: [],
};

export default config;
