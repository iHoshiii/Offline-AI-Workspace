import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        surface3: "var(--surface3)",
        accent: "var(--accent)",
        border: "var(--border)",
        "text-primary": "var(--text)",
        "text-muted": "var(--text-muted)",
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
