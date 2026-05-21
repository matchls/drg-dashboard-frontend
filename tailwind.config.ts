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
        "drg-dark": "#110b06",
        "drg-orange": "#e8a320",
        "drg-orange-light": "#f5b942",
        "drg-panel": "#1e1208",
        "drg-border": "#3d2a0f",
      },
      fontFamily: {
        sans: ["var(--font-barlow)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
