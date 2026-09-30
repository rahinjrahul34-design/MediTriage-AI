/**
 * MediTriage AI — Tailwind preset
 * Drop-in theme matching handoff/tokens.json + assets/css/tokens.css.
 * Usage:  presets: [require('./tailwind.meditriage.js')]
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        blue: {
          50: "#EBF5FC", 100: "#D3EAF8", 200: "#A8D5F0", 300: "#71BDDF",
          400: "#46A6D8", 500: "#268DD1", 600: "#1F7CB8", 700: "#1A6FA8",
          800: "#14527D", 900: "#0E3A5A"
        },
        teal: { 50: "#EFFAFC", 100: "#DDF3F9", 300: "#71BDDF", 600: "#2F95B9" },
        amber: { 100: "#FFF4D6", 300: "#FFD54F", 500: "#FFC107" },
        accent: { DEFAULT: "#FFA726", strong: "#E98A0C" },
        canvas: "#F4F9FA",
        surface: { DEFAULT: "#FFFFFF", 2: "#F0F6F8" },
        line: { DEFAULT: "#DCE7EC", strong: "#B8C3CB" },
        ink: { DEFAULT: "#1B1717", body: "#413B4B", muted: "#5F7180", 900: "#0F1B27", 800: "#182635", 700: "#223344" },
        success: { DEFAULT: "#4CAF50", strong: "#2E7D32", bg: "#E2F3E4" },
        danger: { DEFAULT: "#F44336", strong: "#D32F2F", bg: "#FDE3E1" },
        chart: { 1: "#268DD1", 2: "#71BDDF", 3: "#FFC107", 4: "#4CAF50", 5: "#8E6CC8", 6: "#F0736A" }
      },
      fontFamily: {
        display: ["Poppins", "Noto Sans Devanagari", "system-ui", "sans-serif"],
        body: ["Inter", "Noto Sans Devanagari", "system-ui", "sans-serif"]
      },
      fontSize: {
        "11": "0.6875rem", "xs": "0.75rem", "sm": "0.875rem", "base": "1rem",
        "lg": "1.125rem", "xl": "1.25rem", "2xl": "1.5rem", "3xl": "1.75rem",
        "4xl": "2rem", "5xl": "2.5rem",
        hero: ["clamp(2.5rem, 1.35rem + 4.5vw, 4rem)", { lineHeight: "1.08" }],
        h1: ["clamp(1.9rem, 1.35rem + 2vw, 2.5rem)", { lineHeight: "1.15" }]
      },
      spacing: {
        "18": "4.5rem", "76": "19rem", sidebar: "244px", header: "68px", tabbar: "64px"
      },
      maxWidth: { content: "1200px" },
      borderRadius: { xs: "6px", sm: "10px", md: "14px", lg: "20px", xl: "28px" },
      boxShadow: {
        1: "0 1px 2px rgba(14,58,90,.05), 0 1px 3px rgba(14,58,90,.07)",
        2: "0 2px 6px rgba(14,58,90,.05), 0 10px 24px -12px rgba(14,58,90,.16)",
        3: "0 16px 40px -14px rgba(14,58,90,.22), 0 4px 10px rgba(14,58,90,.06)",
        pop: "0 28px 72px -18px rgba(11,42,64,.38)",
        ring: "0 0 0 3px rgba(38,141,209,.28)"
      },
      transitionDuration: { 120: "120ms", 200: "200ms", 320: "320ms", 480: "480ms" },
      transitionTimingFunction: {
        "mt-out": "cubic-bezier(.2,.8,.2,1)",
        "mt-inout": "cubic-bezier(.65,.05,.36,1)",
        "mt-spring": "cubic-bezier(.34,1.4,.5,1)"
      },
      screens: { xs: "375px", sm: "640px", md: "768px", lg: "1024px", xl: "1440px" }
    }
  },
  plugins: []
};
