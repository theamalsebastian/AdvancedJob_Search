/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FAF7F2",
        surface: "#FFFFFF",
        surfaceAlt: "#F3EEE6",
        border: "#E8E2D9",
        ink: "#1F2937",
        inkSoft: "#6B7280",
        accent: "#FF6B4A",
        accentSoft: "#FFE4DB",
        success: "#5B8C5A",
        successSoft: "#E6F0E6",
        warn: "#D97706",
        warnSoft: "#FEF3E2",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        data: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
