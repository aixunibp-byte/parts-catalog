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
            p: { xs: 3, sm: 5, md: 7 },
            mb: 5,
            textAlign: "center",
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 45%), linear-gradient(135deg, #12294A 0%, #1B3A5C 45%, #3D7CAE 100%)",
            borderRadius: 5,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#FFFFFF",
              mb: 1,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.4rem" },
            }}
          >
            Поиск автозапчастей Omegation
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.75)",
              mb: 4,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            точные аналоги и оригинальные детали в одном месте
          </Typography>

          <TextField
            fullWidth
            size="medium"
            placeholder="Артикул, название или номер детали / аналога"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{
              maxWidth: 680,
              mx: "auto",
              backgroundColor: "#FFFFFF",
              borderRadius: 999,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                "& fieldset": { border: "none" },
              },
              "& input": { fontSize: { xs: "0.95rem", sm: "1.05rem" }, py: 1.7 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ pl: 1 }}>
                  <SearchIcon sx={{ fontSize: 24, color: "#3D7CAE" }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <FormControlLabel
              sx={{
                mt: 2.5,
                color: "rgba(255,255,255,0.9)",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 999,
                px: 2,
                py: 0.25,
              }}
              control={
                <Switch
                  size="small"
                  checked={inStockOnly}
                  onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                />
              }
              label={<Typography variant="body2">только в наличии</Typography>}
            />
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}

        {loading ? (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : items.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>Ничего не найдено по заданным условиям.</Alert>
        ) : (
          <>
            <Grid container spacing={2.5} justifyContent="center">
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
