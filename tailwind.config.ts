import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#202124",
        paper: "#fbfaf7",
        line: "#d8d3c8",
        brass: "#a67732",
        forest: "#25483c",
        clay: "#a8523b"
      },
      boxShadow: {
        tool: "0 18px 50px rgba(32, 33, 36, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
