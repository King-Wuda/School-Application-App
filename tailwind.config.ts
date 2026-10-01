import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1628",
          50: "#E6E9EE",
          100: "#C2CAD5",
          200: "#8E9CAE",
          300: "#5C6E86",
          400: "#2E425D",
          500: "#0A1628",
          600: "#081222",
          700: "#060E1B",
          800: "#040914",
          900: "#02050B",
        },
        cream: {
          DEFAULT: "#F9F7F4",
          dark: "#F0EBE3",
        },
        amber: {
          DEFAULT: "#F5A623",
          50: "#FEF6E7",
          100: "#FCE8BF",
          200: "#F9D58C",
          300: "#F7C15A",
          400: "#F5A623",
          500: "#D4881A",
          600: "#A46913",
          700: "#744B0D",
          800: "#432C08",
          900: "#221604",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display": ["clamp(2.25rem, 5vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "hero": ["clamp(1.75rem, 3.5vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 22, 40, 0.04), 0 2px 8px rgba(10, 22, 40, 0.04)",
        "card-hover": "0 2px 4px rgba(10, 22, 40, 0.06), 0 12px 32px rgba(10, 22, 40, 0.10)",
        search: "0 1px 2px rgba(10, 22, 40, 0.05), 0 12px 40px -8px rgba(10, 22, 40, 0.18)",
      },
      keyframes: {
        "toast-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "sheet-in": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "toast-in": "toast-in 180ms ease-out",
        "sheet-in": "sheet-in 240ms cubic-bezier(0.32, 0.72, 0, 1)",
        "fade-in": "fade-in 160ms ease-out",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
