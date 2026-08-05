import { createTheme } from "@mui/material/styles";

const basePalette = {
  primary: {
    main: "#1B3A5C",
    light: "#3D5A7A",
    dark: "#0F2740",
    contrastText: "#FFFFFF",
  },
  success: {
    main: "#2E7D32",
  },
};

const lightPalette = {
  mode: "light",
  ...basePalette,
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
  text: {
    primary: "#0F2740",
    secondary: "#4A5C6E",
  },
};

const darkPalette = {
  mode: "dark",
  ...basePalette,
  secondary: {
    main: "#7FB2E0",
    light: "#AFD3EA",
    dark: "#3D7CAE",
    contrastText: "#0F2740",
  },
  background: {
    default: "#0B1420",
    paper: "#132437",
  },
  text: {
    primary: "#EAF2FA",
    secondary: "#A9BFD3",
  },
};

export function getTheme(mode = "light") {
  const palette = mode === "dark" ? darkPalette : lightPalette;
  const isDark = mode === "dark";

  return createTheme({
    palette,
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 600, color: isDark ? "#EAF2FA" : "#1B3A5C" },
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
            backgroundColor: isDark ? "#2C4A64" : "#AFD3EA",
            color: isDark ? "#EAF2FA" : "#0F2740",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? "0 2px 8px rgba(0, 0, 0, 0.5)"
              : "0 2px 8px rgba(27, 58, 92, 0.08)",
          },
        },
      },
    },
  });
}

export default getTheme("light");
