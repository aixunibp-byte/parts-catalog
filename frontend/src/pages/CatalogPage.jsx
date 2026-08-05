import { useEffect, useMemo, useState } from "react";
import {
  Container, Grid, TextField, MenuItem, FormControlLabel, Switch,
  Pagination, Stack, Typography, CircularProgress, Alert, InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AppHeader from "../components/AppHeader";
import PartCard from "../components/PartCard";
import { fetchParts, fetchBrands } from "../api";

const PAGE_SIZE = 24;

export default function CatalogPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => {});
  }, []);

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

    fetchParts({ search, brand, inStockOnly, page, pageSize: PAGE_SIZE })
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
  }, [search, brand, inStockOnly, page]);

  return (
    <>
      <AppHeader />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Каталог автозапчастей
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Поиск по названию или артикулу"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Бренд"
            value={brand}
            onChange={(e) => { setBrand(e.target.value); setPage(1); }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Все бренды</MenuItem>
            {brands.map((b) => (
              <MenuItem key={b} value={b}>{b}</MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={inStockOnly}
                onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
              />
            }
            label="Только в наличии"
          />
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : items.length === 0 ? (
          <Alert severity="info">Ничего не найдено по заданным условиям.</Alert>
        ) : (
          <>
            <Grid container spacing={2}>
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
