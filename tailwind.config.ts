import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/store/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // THY Brand Colors
        thy: {
          red: "#E30A17",
          darkRed: "#B80813",
          gray: "#4A4A4A",
          lightGray: "#F5F5F5",
        },
        "thy-red": {
          DEFAULT: "#E30A17",
          50: "#FEF2F2",
          100: "#FEE2E2",
          600: "#E30A17",
          700: "#B91C1C",
        },
        // Chat interface
        "chat-ai": {
          DEFAULT: "#FEF2F2",
          border: "#FECACA",
          text: "#1F2937",
        },
        "chat-user": {
          DEFAULT: "#2563EB",
          text: "#FFFFFF",
        },
        "score-excellent": {
          DEFAULT: "#F0FDF4",
          border: "#BBF7D0",
          text: "#166534",
        },
        "score-good": {
          DEFAULT: "#EFF6FF",
          border: "#BFDBFE",
          text: "#1E40AF",
        },
        "score-fair": {
          DEFAULT: "#FFFBEB",
          border: "#FDE68A",
          text: "#92400E",
        },
        "score-poor": {
          DEFAULT: "#FEF2F2",
          border: "#FECACA",
          text: "#991B1B",
        },
        // Functional colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      spacing: {
        chat: "0.75rem",
      },
      borderRadius: {
        bubble: "1rem",
        "bubble-sm": "0.75rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
