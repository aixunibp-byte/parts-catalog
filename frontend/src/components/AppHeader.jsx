import { AppBar, Toolbar, Box, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
        <Box sx={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => navigate("/")}>
          <Logo height={26} color="#FFFFFF" />
        </Box>
        <Button
          variant="outlined"
          size="small"
          sx={{ color: "#FFFFFF", borderColor: "rgba(255,255,255,0.5)" }}
          onClick={() => navigate(isAdmin ? "/" : "/admin")}
        >
          {isAdmin ? "К каталогу" : "Админ-панель"}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
