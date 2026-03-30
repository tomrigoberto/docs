import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8f1",
          100: "#feecdc",
          200: "#fcd9b8",
          300: "#f9bf89",
          400: "#f6a054",
          500: "#f38020",
          600: "#e4680f",
          700: "#bd500e",
          800: "#974013",
          900: "#7a3613",
        },
        paw: {
          50: "#fdf4f0",
          100: "#fbe8de",
          200: "#f6cdbc",
          300: "#f0ab8f",
          400: "#e87f5a",
          500: "#e25d35",
          600: "#d3432a",
          700: "#af3424",
          800: "#8c2d23",
          900: "#722920",
        },
        bark: {
          50: "#f6f5f0",
          100: "#e8e5d8",
          200: "#d3cdb4",
          300: "#b9af89",
          400: "#a49768",
          500: "#95855a",
          600: "#806d4c",
          700: "#68553f",
          800: "#584838",
          900: "#4d3f33",
        },
      },
    },
  },
  plugins: [],
};
export default config;
