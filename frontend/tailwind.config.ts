import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0f172a',
        surface2: '#111827',
        surface3: '#1f2937',
        border: '#334155',
        accent: '#38bdf8',
        muted: '#94a3b8',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
