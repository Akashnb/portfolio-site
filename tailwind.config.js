/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.{html,js}"],
  theme: {
    extend: {
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(90deg, #4AB1F1 0%, #566CEC 35.5%, #D749AF 71.5%, #FF7C51 94.5%)",
        "custom-gradient-button":
          "linear-gradient(90deg, #4AB1F1 0%, #566CEC 25%, #D749AF 50%, #FF7C51 75%, #FF7C51 100%)",
      },
    },
    fontFamily: {
      audiowide: ["Audiowide", "cursive"],
      poppins: ["Poppins", "sans-serif"],
      monts: ["Montserrat", "sans-serif"],
    },
    colors: {
      white: "#ffffff",
      black: "#000000",
      primary: "#1da1f3",
      primaryLight: "#fafafa",
      secondary: "#121212",
      secondaryLight: "#9e9e9e",
      secondaryDark: "#2222221A",
      transparent: "#00000000",
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function ({ addUtilities }) {
      addUtilities({
        ".swiper": {
          width: "80vw",
          height: "h-fit",
        },
        ".hover-invert": {
          filter: "invert(100%)",
        },
        ".text-gradient": {
          background:
            "linear-gradient(90deg, #4AB1F1 0%, #566CEC 35.5%, #D749AF 71.5%, #FF7C51 94.5%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
        ".bg-gradient": {
          "background-image":
            "linear-gradient(90deg, #4AB1F1 0%, #566CEC 25%, #D749AF 50%, #FF7C51 75%, #FF7C51 100%)",
        },
        ".home-bg-gradient": {
          background:
            "linear-gradient(90deg, rgba(74, 177, 241, 0.1) 0%, rgba(86, 108, 236, 0.1) 35.5%, rgba(215, 73, 175, 0.1) 71.5%, rgba(255, 124, 81, 0.1) 94.5%);",
        },
        ".gradient-btn": {
          background:
            "linear-gradient(90deg, #4AB1F1 0%, #566CEC 25%, #D749AF 50%, #FF7C51 75%, #FF7C51 100%)",
        },
        /* Hide scrollbar for Chrome, Safari and Opera */
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        ".swiper-slide-active": {
          background:
            "linear-gradient(90deg, rgba(74, 177, 241, 0.1) 0%, rgba(86, 108, 236, 0.1) 35.5%, rgba(215, 73, 175, 0.1) 71.5%, rgba(255, 124, 81, 0.1) 94.5%);",
        },
        ".swiper-button-custom": {
          background:
            "linear-gradient(90deg, #4AB1F1 0%, #566CEC 25%, #D749AF 50%, #FF7C51 75%, #FF7C51 100%)",
          color: "white",
          padding: "2px",
          "border-radius": "50%",
          cursor: "pointer",
          "z-index": "10",
        },
        "ol li::marker": {
          "font-weight": "bold" /* Makes the marker (number) bold */,
        },
      });
    },
  ],
};
