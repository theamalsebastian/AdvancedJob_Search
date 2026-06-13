/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0D1117",
        surface: "#161B22",
        surfaceHover: "#1C2128",
        border: "#30363D",
        text: "#E6EDF3",
        textDim: "#8B949E",
        accent: "#3FB950",
        accentDim: "#2EA043",
        warn: "#F78166",
        info: "#58A6FF",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};