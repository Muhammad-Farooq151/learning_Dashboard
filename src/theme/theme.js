import { createTheme } from "@mui/material/styles";

const fontFamily = '"DM Sans", Arial, Helvetica, sans-serif';

const theme = createTheme({
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

