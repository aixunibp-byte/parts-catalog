import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1B3A5C",
      light: "#3D5A7A",
      dark: "#0F2740",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#5B9BD5",
      light: "#AFD3EA",
      dark: "#3D7CAE",
      contrastText: "#0F2740",
    },
    background: {
      default: "#F7FAFC",
      paper: "#FFFFFF",
    },
    success: {
      main: "#2E7D32",
    },
    text: {
      primary: "#0F2740",
      secondary: "#4A5C6E",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600, color: "#1B3A5C" },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #1B3A5C 0%, #3D7CAE 100%)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#AFD3EA",
          color: "#0F2740",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(27, 58, 92, 0.08)",
        },
      },
    },
  },
});

export default theme;
