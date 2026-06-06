/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: { 
          primary: "var(--bg-primary)", 
          secondary: "var(--bg-secondary)", 
          tertiary: "var(--bg-tertiary)" 
        },
        border: "var(--border)",
        text: { 
          primary: "var(--text-primary)", 
          muted: "var(--text-muted)" 
        },
        accent: "var(--color-accent)",
        success: "var(--success)",
        danger: "var(--danger)",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
