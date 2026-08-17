import { AppBar, Toolbar, Box, Button, Stack, IconButton, Container } from "@mui/material";
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
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="lg" disableGutters>
        <Toolbar
          sx={{
            minHeight: { xs: 58, sm: 66 },
            px: { xs: 1.5, sm: 3 },
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
          }}
        >
          <Box />

          <Box
            sx={{
              cursor: isAdmin ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 0.5,
            }}
            onClick={() => !isAdmin && navigate("/")}
          >
            <Logo height={28} color="#FFFFFF" />
          </Box>

          <Stack
            direction="row"
            spacing={{ xs: 0, sm: 0.5 }}
            alignItems="center"
            justifyContent="flex-end"
            sx={{ minWidth: 0 }}
          >
            {!isAdmin &&
              NAV_LINKS.map((link) => (
                <Button
                  key={link.path}
                  color="inherit"
                  size="small"
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: "rgba(255,255,255,0.86)",
                    fontSize: { xs: "0.66rem", sm: "0.78rem" },
                    textTransform: "none",
                    minWidth: "auto",
                    px: { xs: 0.55, sm: 1.1 },
                    whiteSpace: "nowrap",
                    "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255,255,255,0.08)" },
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
              sx={{
                ml: { xs: 0.15, sm: 0.5 },
                border: "1px solid rgba(255,255,255,0.18)",
                width: 30,
                height: 30,
                "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
              }}
            >
              {mode === "dark" ? <LightModeIcon sx={{ fontSize: 16 }} /> : <DarkModeIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
