import { AppBar, Toolbar, Box, Button, Stack, IconButton } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Logo from "./Logo";
import { useThemeMode } from "../ThemeModeContext";

const NAV_LINKS = [
  { label: "О нас", path: "/about" },
  { label: "Контакты", path: "/contacts" },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode } = useThemeMode();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar
        sx={{
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1 }} />

        <Box
          sx={{
            cursor: isAdmin ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
          onClick={() => !isAdmin && navigate("/")}
        >
          <Logo height={26} color="#FFFFFF" />
        </Box>

        <Stack
          direction="row"
          spacing={{ xs: 0.25, sm: 1 }}
          alignItems="center"
          sx={{ flex: 1, justifyContent: "flex-end" }}
        >
          {!isAdmin &&
            NAV_LINKS.map((link) => (
              <Button
                key={link.path}
                color="inherit"
                size="small"
                onClick={() => navigate(link.path)}
                sx={{
                  fontSize: { xs: "0.68rem", sm: "0.8rem" },
                  textTransform: "none",
                  opacity: 0.9,
                  minWidth: "auto",
                  px: { xs: 0.6, sm: 1.5 },
                }}
              >
                {link.label}
              </Button>
            ))}
          <IconButton
            onClick={toggleMode}
            color="inherit"
            size="small"
            aria-label="Переключить тему"
            sx={{ ml: { xs: 0, sm: 0.5 } }}
          >
            {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
