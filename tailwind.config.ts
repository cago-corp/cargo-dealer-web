import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accentSoft: "rgb(var(--accent-soft) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.08)",
      },
      fontFamily: {
        sans: [
          "\"Segoe UI\"",
          "\"Helvetica Neue\"",
          "\"Apple SD Gothic Neo\"",
          "\"Noto Sans KR\"",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
