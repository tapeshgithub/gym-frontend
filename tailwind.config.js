/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        obsidian: {
          50: "#f4f4f6",
          100: "#e8e8ed",
          200: "#c8c8d4",
          300: "#a0a0b8",
          400: "#6e6e8a",
          500: "#4a4a6a",
          600: "#363655",
          700: "#252540",
          800: "#16162e",
          900: "#0d0d1f",
          950: "#07070f",
        },
        volt: {
          300: "#d4ff70",
          400: "#c2ff3d",
          500: "#aaff00",
          600: "#88cc00",
        },
        aurora: {
          pink: "#ff6b9d",
          violet: "#7c3aed",
          cyan: "#06b6d4",
          amber: "#f59e0b",
        },
      },
      backgroundImage: {
        "mesh-gradient":
          "radial-gradient(at 40% 20%, hsla(258,80%,20%,0.5) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,80%,20%,0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,80%,15%,0.3) 0px, transparent 50%)",
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)",
      },
      boxShadow: {
        "glow-volt": "0 0 20px rgba(170,255,0,0.3)",
        "glow-violet": "0 0 20px rgba(124,58,237,0.4)",
        card: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "pulse-slow": "pulse 3s infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
