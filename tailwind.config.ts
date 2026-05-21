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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Couleurs DRG
        "drg-dark": "#0f1923",
        "drg-orange": "#e8a320",
        "drg-orange-light": "#f5b942",
        "drg-panel": "#1a2535",
        "drg-border": "#2a3a50",
      },
      fontFamily: {
        sans: ["var(--font-barlow)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
