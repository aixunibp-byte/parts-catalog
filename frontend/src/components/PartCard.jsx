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
        borderRadius: 3.5,
        overflow: "hidden",
        transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
        "&:hover": {
          transform: "translateY(-5px)",
          borderColor: "rgba(91, 155, 213, 0.45)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 20px 42px rgba(0, 0, 0, 0.36)"
              : "0 20px 42px rgba(27, 58, 92, 0.14)",
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/parts/${part.id}`)}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Box
          sx={{
            position: "relative",
            height: 205,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(61,124,174,0.10))"
                : "linear-gradient(145deg, #F8FBFD, #EAF2F8)",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardMedia
            component="img"
            image={part.primary_image || PLACEHOLDER_IMAGE}
            alt={part.name}
            sx={{ width: "100%", height: "100%", objectFit: "contain", p: 2.25 }}
          />
          <Chip
            size="small"
            label={part.has_stock ? "В наличии" : "Нет в наличии"}
            icon={
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: part.has_stock ? "success.main" : "text.disabled",
                  ml: 1,
                }}
              />
            }
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              height: 25,
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(18,38,58,0.92)" : "rgba(255,255,255,0.94)"),
              boxShadow: "0 3px 10px rgba(15,39,64,0.12)",
              backdropFilter: "blur(8px)",
              fontWeight: 600,
              fontSize: "0.68rem",
              "& .MuiChip-icon": { order: 1, mr: 0.75, ml: -0.25 },
            }}
          />
        </Box>

        <CardContent sx={{ p: 2.25, flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 650,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.65em",
              lineHeight: 1.33,
              letterSpacing: "-0.01em",
            }}
            title={part.name}
          >
            {part.name}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.8, mb: 2 }}>
            Артикул · {part.article}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: "auto" }}>
            <Typography variant="h6" sx={{ fontWeight: 750, color: "primary.main", letterSpacing: "-0.02em" }}>
              {part.price != null ? `${part.price.toLocaleString("ru-RU")} ₽` : "Цена не указана"}
            </Typography>
            {part.old_price != null && part.old_price > (part.price ?? 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through" }}>
                {part.old_price.toLocaleString("ru-RU")} ₽
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
