/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {

      colors: {
        primary: "#4164df",
        primaryDark: "#004c6d",
        accent: "#5886a5",
        link: "#6466f2",
        danger: "#de425b",
        success: "#00c008",
        warning: "#ff9800",
        info: "#00cccc",
        overlay: "rgba(234, 234, 234, 0.4)",
        text: "#393939",
        textMuted: "#989898",
        textLight: "#656565",
        border: "#5886a5",
        borderLight: "#d9d9d9",
        divider: "#989898",
        background: "#ffffff",
        backgroundAlt: "#f5f5f5",
        surface: "#fafafa",
        surfaceAlt: "#efefef",
        error: "#ff5252",
        disabled: "#cccccc",
        placeholder: "#999999",
        black: "#000000",
      },
      fonts: {
        primary: "Sora",
        weights: {
          regular: 400,
          semiBold: 600,
          bold: 700,
        },
      },
      typography: {
        h1: {
          fontFamily: "Sora",
          fontWeight: 700,
          fontSize: "24px",
          lineHeight: "32px",
        },
        h2: {
          fontFamily: "Sora",
          fontWeight: 700,
          fontSize: "21px",
          lineHeight: "28px",
        },
        h3: {
          fontFamily: "Sora",
          fontWeight: 700,
          fontSize: "18px",
          lineHeight: "24px",
        },
        bodyLarge: {
          fontFamily: "Sora",
          fontWeight: 600,
          fontSize: "16px",
          lineHeight: "20px",
        },
        body: {
          fontFamily: "Sora",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "18px",
        },
        button: {
          fontFamily: "Sora",
          fontWeight: 600,
          fontSize: "16px",
          lineHeight: "20px",
        },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        xxl: "24px",
        s10: "10px",
        s15: "15px",
        s30: "30px",
        s42: "42px",
        s48: "48px",
        s50: "50px",
      },
      radii: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        pill: "20px",
        round: "50%",
      },
      shadows: {
        shadow1: {
          offsetX: "2px",
          offsetY: "2px",
          blur: "4px",
          spread: "0px",
          color: "rgba(0,0,0,0.1)",
          type: "outset",
          css: "2px 2px 4px 0px rgba(0, 0, 0, 0.1)",
        },
        shadow2: {
          offsetX: "-2px",
          offsetY: "-2px",
          blur: "4px",
          spread: "0px",
          color: "rgba(0,0,0,0.05)",
          type: "inset",
          css: "inset -2px -2px 4px 0px rgba(0, 0, 0, 0.05)",
        },
      },
//         --border - none: none;
// --border - sm: 1px solid var(--color - border);
// --border - base: 1px solid var(--color - border);
// --border - md: 2px solid var(--color - border);
// --border - lg: 4px solid var(--color - border);
// --border - xl: 8px solid var(--color - border);
// --border - input: 1px solid var(--color - border - input);
// --border - focus: 2px solid var(--color - border - focus);
// --border - divider: 1px solid var(--color - divider);
        borders: {
          none: "none",
          sm: "1px solid var(--color-border)",
          base: "1px solid var(--color-border)",
          md: "2px solid var(--color-border)",
          lg: "4px solid var(--color-border)",
          xl: "8px solid var(--color-border)",
          input: "1px solid var(--color-border-input)",
          focus: "2px solid var(--color-border-focus)",
          divider: "1px solid var(--color-divider)",
        },
    },
  },
  plugins: [],
};

