/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0f1117",
          raised: "#171a23",
          overlay: "#1f2330",
        },
        border: {
          DEFAULT: "#2a2f3d",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#818cf8",
        },
        success: "#22c55e",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};
