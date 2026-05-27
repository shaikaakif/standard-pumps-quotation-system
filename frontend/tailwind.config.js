/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            50: "#f0f4f8",
            100: "#d9e2ec",
            200: "#bcccdc",
            300: "#9fb3c8",
            400: "#829ab1",
            500: "#627d98",
            600: "#486581",
            700: "#334e68",
            800: "#1e3a8a", // Primary Navy Blue
            900: "#102a43",
          },
          yellow: {
            DEFAULT: "#fbbf24", // Premium Accent Yellow
            hover: "#f59e0b",
          },
          green: {
            DEFAULT: "#25d366", // WhatsApp Green
            hover: "#128c7e",
          },
          gray: {
            50: "#f8fafc",
            100: "#f1f5f9",
            200: "#e2e8f0",
            300: "#cbd5e1",
            400: "#94a3b8",
            550: "#64748b",
          }
        }
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
      }
    },
  },
  plugins: [],
}
