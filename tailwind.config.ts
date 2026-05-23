import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#111111",
          muted: "#555555",
          soft: "#8a8a8a",
        },
        surface: {
          DEFAULT: "#ffffff",
          alt: "#f5f5f3",
          tint: "#eef3fb",
        },
        accent: {
          DEFAULT: "#185FA5",
          soft: "#E6F1FB",
        },
        line: "#e6e6e3",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: { md: "8px", lg: "12px", xl: "16px" },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
