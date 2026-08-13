import { Card, CardActionArea, CardMedia, CardContent, Typography, Chip, Stack, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300?text=Нет+фото";

export default function PartCard({ part }) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 12px 24px rgba(0, 0, 0, 0.6)"
              : "0 12px 24px rgba(27, 58, 92, 0.16)",
        },
      }}
    >
      <CardActionArea onClick={() => navigate(`/parts/${part.id}`)} sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <Box
          sx={{
            position: "relative",
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#F3F7FB"),
            borderRadius: "16px 16px 0 0",
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            height="190"
            image={part.primary_image || PLACEHOLDER_IMAGE}
            alt={part.name}
            sx={{ objectFit: "contain", p: 2 }}
          />
          <Chip
            size="small"
            label={part.has_stock ? "В наличии" : "Нет в наличии"}
            icon={
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: part.has_stock ? "success.main" : "text.disabled",
                  ml: 1,
                }}
              />
            }
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(19,36,55,0.9)" : "rgba(255,255,255,0.92)"),
              backdropFilter: "blur(4px)",
              fontWeight: 500,
              fontSize: "0.7rem",
              "& .MuiChip-icon": { order: 1, mr: 1, ml: -0.5 },
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.6em",
              lineHeight: 1.3,
            }}
            title={part.name}
          >
            {part.name}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
            Артикул: {part.article}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: "auto" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
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
