module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: "#070708", 2: "#0E0E10", 3: "#161619" },
        bone:  { DEFAULT: "#F5F5F1", soft: "#A6A6A1", dim: "#6C6C68" },
        volt:  { DEFAULT: "#D4F542", deep: "#A9CC1F" },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        drift: { "0%": { transform: "translate3d(0,0,0)" }, "100%": { transform: "translate3d(-4%,-7%,0)" } },
        rise:  { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        drift: "drift 46s ease-in-out infinite alternate",
        rise:  "rise .9s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
};
