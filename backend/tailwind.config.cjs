/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/frontend/**/*.{js,ts,jsx,tsx}",
    "./app/frontend/**/**/*.{js,ts,jsx,tsx}", // For nested folders
    "./app/frontend/**/**/**/*.{js,ts,jsx,tsx}", // For deep nesting
    "./app/frontend/styles/globals.css",
  ],
  theme: {
    extend: {
      colors: {
        krato: {
          // Your brand palette--tweak as needed for your branding!
          DEFAULT: "#408CF1",
          light: "#E5F0FF",
          accent: "#72B3F6",
          soft: "#f7fafc",
          shadow: "#dbeafe",
        },
        neu: {
          bg: "#f5f6fa",
          surface: "#edf0f7",
          edge: "#e3e6ed",
          shadow: "#babec5",
          text: "#2d3748",
        },
      },
      boxShadow: {
        neu: "8px 8px 16px #babec5, -8px -8px 16px #fff",
        neuInset: "inset 8px 8px 16px #babec5, inset -8px -8px 16px #fff",
      },
      borderRadius: {
        neu: "2rem", // large, soft corners for 3d cards/blocks
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Rubik"', "ui-sans-serif", "system-ui", "sans-serif"], // for headings/brand
      },
      transitionDuration: {
        'fast': '200ms',
        'slow': '700ms',
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};