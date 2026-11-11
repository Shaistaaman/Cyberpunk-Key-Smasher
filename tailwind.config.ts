import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0a0a12",
        neon: {
          pink: "#ff2bd6",
          cyan: "#00f0ff",
          green: "#39ff14",
          yellow: "#fcee0a",
          purple: "#9d4dff",
        },
      },
      boxShadow: {
        "neon-pink": "0 0 8px #ff2bd6, 0 0 24px #ff2bd6",
        "neon-cyan": "0 0 8px #00f0ff, 0 0 24px #00f0ff",
        "neon-green": "0 0 8px #39ff14, 0 0 24px #39ff14",
        "neon-yellow": "0 0 8px #fcee0a, 0 0 24px #fcee0a",
        "neon-purple": "0 0 8px #9d4dff, 0 0 24px #9d4dff",
      },
      dropShadow: {
        "neon-pink": "0 0 6px #ff2bd6",
        "neon-cyan": "0 0 6px #00f0ff",
        "neon-green": "0 0 6px #39ff14",
      },
    },
  },
  plugins: [],
} satisfies Config;
