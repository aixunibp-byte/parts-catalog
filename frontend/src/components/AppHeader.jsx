import { AppBar, Toolbar, Box, Button, Stack } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "О нас", path: "/about" },
  { label: "Контакты", path: "/contacts" },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ justifyContent: "center", py: 1, position: "relative" }}>
        <Box
          sx={{ cursor: isAdmin ? "default" : "pointer", display: "flex", alignItems: "center" }}
          onClick={() => !isAdmin && navigate("/")}
        >
          <Logo height={30} color="#FFFFFF" />
        </Box>

        {!isAdmin && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              position: "absolute",
              right: { xs: 8, sm: 24 },
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {NAV_LINKS.map((link) => (
              <Button
                key={link.path}
                color="inherit"
                size="small"
                onClick={() => navigate(link.path)}
                sx={{ fontSize: "0.8rem", textTransform: "none", opacity: 0.9 }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}
