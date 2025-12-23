/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./node_modules/nativewind/**/*.{js,jsx,ts,tsx}",
    "./global.css",
    "./_layout.tsx",
    "./index.tsx",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Neutral to Emotion Palette - True Zinc/Neutral Grays
        background: "#09090b",
        foreground: "#f4f4f5",
        card: "#18181b",
        "card-foreground": "#f4f4f5",
        popover: "#09090b",
        "popover-foreground": "#f4f4f5",
        primary: "#f4f4f5",
        "primary-foreground": "#09090b",
        secondary: "#27272a",
        "secondary-foreground": "#f4f4f5",
        muted: "#27272a",
        "muted-foreground": "#a1a1aa",
        accent: "#27272a",
        "accent-foreground": "#f4f4f5",
        destructive: "#7f1d1d",
        "destructive-foreground": "#fef2f2",
        border: "#27272a",
        input: "#27272a",
        ring: "#a1a1aa",
      },
      fontFamily: {
        sans: ["Nunito"],
        heading: ["Outfit"],
      },
    },
  },
  plugins: [],
};
