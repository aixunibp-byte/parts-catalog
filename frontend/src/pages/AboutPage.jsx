import { Container, Typography, Stack, Paper, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppHeader from "../components/AppHeader";

const SECTIONS = [
  {
    number: "01",
    title: "Широкий ассортимент",
    text:
      "Более тысячи наименований: детали двигателя и трансмиссии, элементы подвески и рулевого управления, компоненты тормозной системы, автоэлектрика, расходные материалы и аксессуары. Мы регулярно расширяем линейку, оперативно закрывая потребности владельцев как популярных, так и редких моделей автомобилей.",
  },
  {
    number: "02",
    title: "Контроль качества и стандарты",
    text:
      "Производство оснащено современными станками с ЧПУ, автоматизированными линиями сборки и многоступенчатым контролем. Каждая партия проходит проверку на соответствие OEM-спецификациям и внутренним стандартам OMEGATION, что гарантирует точную геометрию, стабильные характеристики и длительный ресурс.",
  },
  {
    number: "03",
    title: "Инженерный подход",
    text:
      "Собственная R&D-лаборатория и партнёрство с поставщиками сырья позволяют нам не просто копировать оригиналы, а улучшать их: использовать износостойкие сплавы, оптимизировать конструкции под реальные дорожные условия и снижать вес без потери прочности.",
  },
  {
    number: "04",
    title: "Для бизнеса и частных клиентов",
    text:
      "Мы работаем с СТО, дилерскими центрами, автомагазинами и напрямую с автовладельцами. Гарантируем стабильное наличие на складе, быструю отгрузку, полную техническую документацию и прозрачную гарантийную политику.",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <>
      <AppHeader />
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 }, px: { xs: 1.5, sm: 3 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ mb: 3, textTransform: "none", fontWeight: 600 }}
        >
          Назад в каталог
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5, md: 6 },
            mb: 4.5,
            borderRadius: 4.5,
            textAlign: "center",
            color: "#FFFFFF",
            background:
              "radial-gradient(circle at 12% 15%, rgba(175,211,234,0.16) 0%, transparent 32%), linear-gradient(118deg, #0F2740 0%, #1B3A5C 50%, #3D7CAE 100%)",
            boxShadow: "0 18px 42px rgba(15,39,64,0.18)",
          }}
        >
          <Typography
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.68)",
              mb: 1.5,
            }}
          >
            О компании
          </Typography>
          <Typography
            variant="h3"
            sx={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: { xs: "1.7rem", sm: "2.25rem", md: "2.65rem" },
              lineHeight: 1.12,
            }}
          >
            Новые стандарты качества в автокомпонентах
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3.5, mb: 3 }}>
          <Typography variant="body1" sx={{ lineHeight: 1.85, fontSize: { xs: "0.98rem", sm: "1.05rem" } }}>
            OMEGATION — молодая и динамично развивающаяся компания, специализирующаяся на разработке и
            производстве автозапчастей для легковых и коммерческих автомобилей. Несмотря на недавнее
            основание, мы уже выстроили современную производственную и логистическую цепочку, позволяющую
            предлагать рынку один из самых широких и технологичных ассортиментов в своём сегменте.
          </Typography>
        </Paper>

        <Stack spacing={2}>
          {SECTIONS.map((section) => (
            <Paper
              key={section.title}
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 3.5,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "56px 1fr" },
                gap: { xs: 1, sm: 2.5 },
                transition: "transform 180ms ease, border-color 180ms ease",
                "&:hover": {
                  transform: { sm: "translateX(4px)" },
                  borderColor: "rgba(91, 155, 213, 0.42)",
                },
              }}
            >
              <Typography
                sx={{
                  color: "secondary.main",
                  fontWeight: 750,
                  letterSpacing: "0.08em",
                  fontSize: "0.78rem",
                  pt: 0.3,
                }}
              >
                {section.number}
              </Typography>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.2, color: "primary.main" }}>
                  {section.title}
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
                  {section.text}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>

        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3.5, textAlign: "center", mt: 3 }}>
          <Typography variant="body1" sx={{ lineHeight: 1.85, mb: 2.5 }}>
            Наша цель — сделать качественные автозапчасти доступными, надёжными и всегда в наличии. Мы
            верим, что каждая деталь OMEGATION — это не просто компонент, а уверенность в безопасности,
            долговечности автомобиля и спокойствии на каждом километре пути.
          </Typography>
          <Typography sx={{ fontWeight: 750, color: "primary.main", letterSpacing: "0.035em" }}>
            OMEGATION: ТОЧНОСТЬ. НАДЁЖНОСТЬ. ДВИЖЕНИЕ ВПЕРЁД.
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
