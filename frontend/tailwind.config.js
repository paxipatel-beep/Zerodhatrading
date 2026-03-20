/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        kite: {
          green: "#00b386",
          red: "#ff5722",
          blue: "#387ed1",
          bg: "#f8f9fa",
          card: "#ffffff",
          dark: "#1a1a2e",
          "dark-card": "#16213e",
        },
      },
    },
  },
  plugins: [],
};
