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
        // Couleurs DRG
        "drg-dark": "#110b06",
        "drg-orange": "#e8a320",
        "drg-orange-light": "#f5b942",
        "drg-panel": "#1e1208",
        "drg-border": "#3d2a0f",
        // Material Design 3 — thème DRG sombre
        background: "#0d0805",
        surface: "#1a1008",
        "surface-dim": "#110b06",
        "surface-bright": "#2a1a0a",
        "surface-container-lowest": "#0d0805",
        "surface-container-low": "#161008",
        "surface-container": "#1e1208",
        "surface-container-high": "#261608",
        "surface-container-highest": "#2e1c0a",
        primary: "#e8a320",
        "primary-container": "#3d2a0f",
        "primary-fixed": "#f5b942",
        "primary-fixed-dim": "#c47d10",
        secondary: "#c9a87c",
        "secondary-container": "#3d2a0f",
        "on-primary": "#110b06",
        "on-secondary": "#110b06",
        "on-surface": "#f0e8d0",
        "on-surface-variant": "#a89070",
        outline: "#3d2a0f",
        "outline-variant": "#5a3d1a",
        error: "#d44a4a",
        "error-container": "#4a1515",
        "on-error": "#f0d0d0",
        "inverse-surface": "#e8d5b0",
        tertiary: "#5cba5c",
      },
      fontFamily: {
        sans: ["var(--font-barlow)", "sans-serif"],
        display: ["var(--font-bebas)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
