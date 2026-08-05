import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, Grid, Typography, Chip, Stack, Divider, Button,
  CircularProgress, Alert, Table, TableBody, TableRow, TableCell, Paper,
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
          <Alert severity="error">{error || "Товар не найден."}</Alert>
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/")} sx={{ mb: 2 }}>
          Назад в каталог
        </Button>

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Paper
              variant="outlined"
              sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}
            >
              <img
                src={activeImage || PLACEHOLDER_IMAGE}
                alt={part.name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </Paper>

            {part.images.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1, overflowX: "auto" }}>
                {part.images.map((img) => (
                  <Paper
                    key={img.url}
                    variant="outlined"
                    onClick={() => setActiveImage(img.url)}
                    sx={{
                      p: 0.5, cursor: "pointer", flexShrink: 0,
                      borderColor: img.url === activeImage ? "primary.main" : undefined,
                    }}
                  >
                    <img src={img.url} alt="" width={64} height={64} style={{ objectFit: "contain" }} />
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="h4" gutterBottom>{part.name}</Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {part.brand && <Chip label={part.brand} />}
              <Chip
                label={totalStock > 0 ? `В наличии: ${totalStock} шт.` : "Нет в наличии"}
                color={totalStock > 0 ? "success" : "default"}
              />
              {part.moderate_status && <Chip label={`Статус: ${part.moderate_status}`} variant="outlined" />}
            </Stack>

            <Typography variant="h4" color="primary" gutterBottom>
              {part.price != null ? `${part.price.toLocaleString("ru-RU")} ₽` : "Цена не указана"}
              {part.old_price != null && part.old_price > (part.price ?? 0) && (
                <Typography
                  component="span"
                  variant="h6"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through", ml: 2 }}
                >
                  {part.old_price.toLocaleString("ru-RU")} ₽
                </Typography>
              )}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Артикул (offer_id): {part.offer_id}
              {part.barcode && ` · Штрихкод: ${part.barcode}`}
            </Typography>

            {part.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {part.description}
                </Typography>
              </>
            )}

            {part.attributes.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Характеристики</Typography>
                <Table size="small">
                  <TableBody>
                    {part.attributes.map((attr) => (
                      <TableRow key={attr.id}>
                        <TableCell sx={{ color: "text.secondary", width: "40%" }}>
                          Атрибут #{attr.id}
                        </TableCell>
                        <TableCell>{attr.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}

            {(part.dimensions.width || part.weight) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Габариты и вес</Typography>
                <Table size="small">
                  <TableBody>
                    {part.dimensions.width && (
                      <TableRow>
                        <TableCell sx={{ color: "text.secondary", width: "40%" }}>Размеры</TableCell>
                        <TableCell>
                          {part.dimensions.depth}×{part.dimensions.width}×{part.dimensions.height}{" "}
                          {part.dimensions.unit}
                        </TableCell>
                      </TableRow>
                    )}
                    {part.weight && (
                      <TableRow>
                        <TableCell sx={{ color: "text.secondary" }}>Вес</TableCell>
                        <TableCell>{part.weight} {part.weight_unit}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            )}

            {part.last_synced_at && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                Обновлено из Ozon: {new Date(part.last_synced_at).toLocaleString("ru-RU")}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
