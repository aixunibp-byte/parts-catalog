// frontend/src/components/AppHeader.jsx
import { AppBar, Toolbar, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";

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
          <Logo height={26} color="#FFFFFF" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
