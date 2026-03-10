import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0a0e17",
        secondary: "#111827",
        card: "rgba(255, 255, 255, 0.03)",
        "card-hover": "rgba(255, 255, 255, 0.06)",
        gold: "#f0b90b",
        accent: {
          green: "#00d4aa",
          red: "#ff4757",
          blue: "#3b82f6",
          purple: "#a855f7",
          cyan: "#06b6d4",
        },
        "text-primary": "#e0e0f0",
        "text-secondary": "#8888aa",
        "text-muted": "#555577",
        "border-subtle": "rgba(255, 255, 255, 0.06)",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
