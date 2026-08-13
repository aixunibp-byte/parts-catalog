import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, Grid, Typography, Chip, Stack, Divider, Button,
  CircularProgress, Alert, Paper, Box,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppHeader from "../components/AppHeader";
import { fetchPart } from "../api";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/500x500?text=Нет+фото";

export default function PartDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchPart(id)
      .then((data) => {
        setPart(data);
        setActiveImage(data.primary_image || data.images?.[0]?.url || null);
      })
      .catch(() => setError("Не удалось загрузить карточку товара."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <AppHeader />
        <Container sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (error || !part) {
    return (
      <>
        <AppHeader />
        <Container sx={{ py: 6 }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error || "Товар не найден."}</Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/")} sx={{ mt: 2 }}>
            Назад в каталог
          </Button>
        </Container>
      </>
    );
  }

  const totalStock = part.stocks.reduce((sum, s) => sum + (s.present - s.reserved), 0);

  return (
    <>
      <AppHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 5 }, px: { xs: 1.5, sm: 3 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ mb: 3, textTransform: "none", fontWeight: 500 }}
        >
          Назад в каталог
        </Button>

        <Grid container spacing={5}>
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 420,
                borderRadius: 4,
                bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#F3F7FB"),
              }}
            >
              <img
                src={activeImage || PLACEHOLDER_IMAGE}
                alt={part.name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </Paper>

            {part.images.length > 1 && (
              <Stack direction="row" spacing={1.5} sx={{ mt: 2, overflowX: "auto", pb: 1 }}>
                {part.images.map((img) => (
                  <Box
                    key={img.url}
                    onClick={() => setActiveImage(img.url)}
                    sx={{
                      p: 0.5,
                      cursor: "pointer",
                      flexShrink: 0,
                      borderRadius: 2,
                      border: "2px solid",
                      borderColor: img.url === activeImage ? "primary.main" : "transparent",
                      bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#F3F7FB"),
                    }}
                  >
                    <img src={img.url} alt="" width={64} height={64} style={{ objectFit: "contain", borderRadius: 6 }} />
                  </Box>
                ))}
              </Stack>
            )}
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.01em", mb: 2 }}>
              {part.name}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap">
              {part.brand && <Chip label={part.brand} sx={{ fontWeight: 500 }} />}
              <Chip
                label={totalStock > 0 ? `В наличии: ${totalStock} шт.` : "Нет в наличии"}
                color={totalStock > 0 ? "success" : "default"}
                sx={{ fontWeight: 500 }}
              />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "primary.main", fontSize: { xs: "1.8rem", sm: "2.4rem" } }}>
                {part.price != null ? `${part.price.toLocaleString("ru-RU")} ₽` : "Цена не указана"}
              </Typography>
              {part.old_price != null && part.old_price > (part.price ?? 0) && (
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through", fontWeight: 400 }}
                >
                  {part.old_price.toLocaleString("ru-RU")} ₽
                </Typography>
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Артикул: {part.article}
              {part.barcode && ` · штрихкод: ${part.barcode}`}
            </Typography>

            {part.description && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
                  {part.description}
                </Typography>
              </>
            )}

            {part.attributes.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Характеристики</Typography>
                <Grid container spacing={1.5}>
                  {part.attributes.map((attr) => (
                    <Grid item xs={12} sm={6} key={attr.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#F3F7FB"),
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" display="block">
                          Атрибут #{attr.id}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{attr.value}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {(part.dimensions.width || part.weight) && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Габариты и вес</Typography>
                <Grid container spacing={1.5}>
                  {part.dimensions.width && (
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#F3F7FB"),
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" display="block">Размеры</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {part.dimensions.depth}×{part.dimensions.width}×{part.dimensions.height} {part.dimensions.unit}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  {part.weight && (
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#F3F7FB"),
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" display="block">Вес</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{part.weight} {part.weight_unit}</Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {part.last_synced_at && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 3 }}>
                Обновлено из Ozon: {new Date(part.last_synced_at).toLocaleString("ru-RU")}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
