import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Paper, TextField, Button, Typography, Alert, Box } from "@mui/material";
import Logo from "../components/Logo";
import { setAdminToken, fetchAdminParts } from "../adminApi";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setAdminToken(token.trim());
    try {
      await fetchAdminParts({ page: 1, pageSize: 1 });
      navigate("/admin/parts");
    } catch {
      setAdminToken(null);
      setError("Неверный токен доступа.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ display: "flex", alignItems: "center", minHeight: "100vh" }}>
      <Paper elevation={2} sx={{ p: 4, width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Logo height={32} color="#5B9BD5" />
        </Box>
        <Typography variant="h6" align="center" gutterBottom>
          Вход в админ-панель
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="password"
            label="Токен доступа"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            sx={{ mb: 2 }}
            autoFocus
          />
          <Button type="submit" variant="contained" fullWidth disabled={loading || !token}>
            {loading ? "Проверка..." : "Войти"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
