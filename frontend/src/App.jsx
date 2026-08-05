import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { getTheme } from "./theme";
import { ThemeModeProvider, useThemeMode } from "./ThemeModeContext";

import CatalogPage from "./pages/CatalogPage";
import PartDetailsPage from "./pages/PartDetailsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPartsListPage from "./pages/AdminPartsListPage";
import AdminPartEditPage from "./pages/AdminPartEditPage";

function AppContent() {
  const { mode } = useThemeMode();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/parts/:id" element={<PartDetailsPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<Navigate to="/admin/parts" replace />} />
          <Route path="/admin/parts" element={<AdminPartsListPage />} />
          <Route path="/admin/parts/:id" element={<AdminPartEditPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeModeProvider>
      <AppContent />
    </ThemeModeProvider>
  );
}
