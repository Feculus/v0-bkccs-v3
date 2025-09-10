import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#8C1F28", // Big-Kids-Custom-Rides-2-hex
          foreground: "#F2F2F2", // Big-Kids-Custom-Rides-4-hex
        },
        secondary: {
          DEFAULT: "#F21D2F", // Big-Kids-Custom-Rides-1-hex (bright red)
          foreground: "#F2F2F2", // Big-Kids-Custom-Rides-4-hex
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#F2F2F2", // Big-Kids-Custom-Rides-4-hex (light gray)
          foreground: "#0D0D0D", // Big-Kids-Custom-Rides-5-hex (dark gray)
        },
        accent: {
          DEFAULT: "#A60303", // Big-Kids-Custom-Rides-3-hex (dark red)
          foreground: "#F2F2F2", // Big-Kids-Custom-Rides-4-hex
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "bk-bright-red": "#F21D2F",
        "bk-deep-red": "#8C1F28",
        "bk-dark-red": "#A60303",
        "bk-light-gray": "#F2F2F2",
        "bk-dark-gray": "#0D0D0D",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
