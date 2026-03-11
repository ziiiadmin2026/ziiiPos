import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f3efe7",
        ink: "#1c1917",
        ember: "#c2410c",
        forest: "#1f4d3a",
        cloud: "#fffaf2",
        sand: "#ddd1bc"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(28, 25, 23, 0.12)"
      },
      backgroundImage: {
        grain: "radial-gradient(circle at top, rgba(255,255,255,0.65), transparent 40%), linear-gradient(135deg, rgba(194,65,12,0.14), rgba(31,77,58,0.12))"
      }
    }
  },
  plugins: []
};

export default config;