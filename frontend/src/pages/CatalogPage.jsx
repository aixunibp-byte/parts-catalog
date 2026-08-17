import { useEffect, useMemo, useState } from "react";
import {
  Container, Grid, TextField, FormControlLabel, Switch, Box,
  Pagination, Stack, Typography, CircularProgress, Alert, InputAdornment, Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AppHeader from "../components/AppHeader";
import PartCard from "../components/PartCard";
import { fetchParts } from "../api";

const PAGE_SIZE = 24;

export default function CatalogPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchParts({ search, inStockOnly, page, pageSize: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить каталог. Проверьте подключение к серверу.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, inStockOnly, page]);

  return (
    <>
      <AppHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 5 }, px: { xs: 1.5, sm: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5, md: 6 },
            mb: 5,
            textAlign: "center",
            color: "#FFFFFF",
            background:
              "radial-gradient(circle at 12% 15%, rgba(175,211,234,0.16) 0%, transparent 32%), radial-gradient(circle at 88% 88%, rgba(91,155,213,0.18) 0%, transparent 30%), linear-gradient(118deg, #0F2740 0%, #1B3A5C 48%, #3D7CAE 100%)",
            borderRadius: { xs: 3.5, sm: 4.5 },
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 18px 42px rgba(15,39,64,0.20)",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              opacity: 0.18,
              pointerEvents: "none",
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "linear-gradient(to bottom, black, transparent)",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: { xs: "0.62rem", sm: "0.72rem" },
                fontWeight: 700,
                color: "rgba(255,255,255,0.66)",
                mb: 1.5,
              }}
            >
              Каталог Omegation
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: "#FFFFFF",
                mb: 1.5,
                fontWeight: 700,
                fontSize: { xs: "1.8rem", sm: "2.35rem", md: "2.85rem" },
              }}
            >
              Точная деталь. Уверенное движение.
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.76)",
                mb: 4,
                mx: "auto",
                maxWidth: 530,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                lineHeight: 1.65,
              }}
            >
              Найдите запчасть по артикулу, названию или номеру детали / аналога.
            </Typography>

            <TextField
              fullWidth
              size="medium"
              placeholder="Введите артикул или название детали"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{
                maxWidth: 700,
                mx: "auto",
                backgroundColor: "rgba(255,255,255,0.98)",
                borderRadius: 2.5,
                boxShadow: "0 12px 28px rgba(2,12,25,0.26)",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  "& fieldset": { border: "1px solid rgba(15,39,64,0.10)" },
                  "&:hover fieldset": { borderColor: "rgba(61,124,174,0.62)" },
                  "&.Mui-focused fieldset": { borderColor: "#3D7CAE", borderWidth: 2 },
                },
                "& input": { fontSize: { xs: "0.95rem", sm: "1.05rem" }, py: 1.55 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ pl: 0.5 }}>
                    <SearchIcon sx={{ fontSize: 23, color: "#3D7CAE" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <FormControlLabel
                sx={{
                  mt: 2.5,
                  mx: 0,
                  color: "rgba(255,255,255,0.92)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  bgcolor: "rgba(8,27,48,0.18)",
                  borderRadius: 2,
                  px: 1.25,
                  py: 0.15,
                  backdropFilter: "blur(6px)",
                }}
                control={
                  <Switch
                    size="small"
                    checked={inStockOnly}
                    onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                  />
                }
                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Только в наличии</Typography>}
              />
            </Box>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>{error}</Alert>}

        {loading ? (
          <Stack alignItems="center" sx={{ py: 9 }}>
            <CircularProgress />
          </Stack>
        ) : items.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2.5 }}>Ничего не найдено по заданным условиям.</Alert>
        ) : (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2.5, px: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Запчасти</Typography>
              <Typography variant="body2" color="text.secondary">Найдено: {total}</Typography>
            </Stack>
            <Grid container spacing={{ xs: 2, sm: 2.5 }} justifyContent="center">
              {items.map((part) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={part.id}>
                  <PartCard part={part} />
                </Grid>
              ))}
            </Grid>

            <Stack alignItems="center" sx={{ mt: 5 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Stack>
          </>
        )}
      </Container>
    </>
  );
}
