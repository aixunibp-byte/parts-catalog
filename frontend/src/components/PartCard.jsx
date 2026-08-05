import { Card, CardActionArea, CardMedia, CardContent, Typography, Chip, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300?text=Нет+фото";

export default function PartCard({ part }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3 }}>
      <CardActionArea onClick={() => navigate(`/parts/${part.id}`)} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          height="200"
          image={part.primary_image || PLACEHOLDER_IMAGE}
          alt={part.name}
          sx={{ objectFit: "contain", backgroundColor: "#f5f5f5", p: 1 }}
        />
        <CardContent>
          <Typography variant="subtitle1" noWrap title={part.name}>
            {part.name}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ my: 1 }}>
            {part.brand && <Chip label={part.brand} size="small" />}
            <Chip
              label={part.has_stock ? "В наличии" : "Нет в наличии"}
              size="small"
              color={part.has_stock ? "success" : "default"}
            />
          </Stack>

          <Typography variant="caption" color="text.secondary" display="block">
            Артикул: {part.article}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 1 }}>
            <Typography variant="h6" color="primary">
              {part.price != null ? `${part.price.toLocaleString("ru-RU")} ₽` : "Цена не указана"}
            </Typography>
            {part.old_price != null && part.old_price > (part.price ?? 0) && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {part.old_price.toLocaleString("ru-RU")} ₽
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
