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
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, sm: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4, md: 5 },
            mb: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #1B3A5C 0%, #3D7CAE 100%)",
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#FFFFFF",
              mb: 3,
              fontWeight: 600,
              fontSize: { xs: "1.4rem", sm: "1.8rem", md: "2.125rem" },
            }}
          >
            Поиск автозапчастей Omegation
          </Typography>
          <TextField
            fullWidth
            size="medium"
            placeholder="Артикул, название или номер детали / аналога"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{
              maxWidth: 720,
              mx: "auto",
              backgroundColor: "#FFFFFF",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
              "& input": { fontSize: { xs: "1rem", sm: "1.15rem" }, py: 1.5 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 28, color: "#1B3A5C" }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <FormControlLabel
              sx={{ mt: 2, ml: { xs: 3, sm: 6 }, color: "#FFFFFF" }}
              control={
                <Switch
                  checked={inStockOnly}
                  onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                />
              }
              label="Только в наличии"
            />
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : items.length === 0 ? (
          <Alert severity="info">Ничего не найдено по заданным условиям.</Alert>
        ) : (
          <>
            <Grid container spacing={2} justifyContent="center">
              {items.map((part) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={part.id}>
                  <PartCard part={part} />
                </Grid>
              ))}
            </Grid>

            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          </>
        )}
      </Container>
    </>
  );
}
