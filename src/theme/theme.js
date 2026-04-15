import { createTheme } from "@mui/material/styles";

const fontFamily = '"DM Sans", Arial, Helvetica, sans-serif';

/** Default MUI modal (1300) sits under admin full-screen loader (z-index 999999). */
const Z_ABOVE_ADMIN_OVERLAY = 1_999_000;

const theme = createTheme({
  zIndex: {
    mobileStepper: Z_ABOVE_ADMIN_OVERLAY + 100,
    fab: Z_ABOVE_ADMIN_OVERLAY + 200,
    speedDial: Z_ABOVE_ADMIN_OVERLAY + 200,
    appBar: Z_ABOVE_ADMIN_OVERLAY + 300,
    drawer: Z_ABOVE_ADMIN_OVERLAY + 400,
    modal: Z_ABOVE_ADMIN_OVERLAY + 500,
    snackbar: Z_ABOVE_ADMIN_OVERLAY + 600,
    tooltip: Z_ABOVE_ADMIN_OVERLAY + 700,
  },
  typography: {
    fontFamily,
    h1: { fontFamily },
    h2: { fontFamily },
    h3: { fontFamily },
    h4: { fontFamily },
    h5: { fontFamily },
    h6: { fontFamily },
    subtitle1: { fontFamily },
    subtitle2: { fontFamily },
    body1: { fontFamily },
    body2: { fontFamily },
    button: { fontFamily },
    caption: { fontFamily },
    overline: { fontFamily },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          fontFamily,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontFamily,
        },
      },
    },
  },
});

export default theme;

