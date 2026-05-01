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
        "card-hover": "0 2px 4px rgba(10, 22, 40, 0.06), 0 8px 24px rgba(10, 22, 40, 0.08)",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
