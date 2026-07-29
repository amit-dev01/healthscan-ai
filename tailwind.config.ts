import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        mutedForeground: "var(--muted-foreground)",
        accent: "var(--accent)",
        accentForeground: "var(--accent-foreground)",
        border: "var(--border)",
        borderLight: "var(--border-light)",
        card: "var(--card)",
        cardForeground: "var(--card-foreground)",
        ring: "var(--ring)",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-source-serif)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
export default config;
