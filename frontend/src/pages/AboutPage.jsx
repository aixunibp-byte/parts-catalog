import { Container, Typography, Stack, Paper, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppHeader from "../components/AppHeader";

const SECTIONS = [
  {
    title: "Широкий ассортимент",
    text:
      "Более тысячи наименований: детали двигателя и трансмиссии, элементы подвески и рулевого управления, компоненты тормозной системы, автоэлектрика, расходные материалы и аксессуары. Мы регулярно расширяем линейку, оперативно закрывая потребности владельцев как популярных, так и редких моделей автомобилей.",
  },
  {
    title: "Контроль качества и стандарты",
    text:
      "Производство оснащено современными станками с ЧПУ, автоматизированными линиями сборки и многоступенчатым контролем. Каждая партия проходит проверку на соответствие OEM-спецификациям и внутренним стандартам OMEGATION, что гарантирует точную геометрию, стабильные характеристики и длительный ресурс.",
  },
  {
    title: "Инженерный подход",
    text:
      "Собственная R&D-лаборатория и партнёрство с поставщиками сырья позволяют нам не просто копировать оригиналы, а улучшать их: использовать износостойкие сплавы, оптимизировать конструкции под реальные дорожные условия и снижать вес без потери прочности.",
  },
  {
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
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, sm: 3 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ mb: 3, textTransform: "none", fontWeight: 500 }}
        >
          Назад в каталог
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            mb: 4,
            borderRadius: 5,
            textAlign: "center",
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 45%), linear-gradient(135deg, #12294A 0%, #1B3A5C 45%, #3D7CAE 100%)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#FFFFFF",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.4rem", sm: "1.8rem", md: "2.1rem" },
            }}
          >
            OMEGATION — новые стандарты качества в автокомпонентах
          </Typography>
        </Paper>

        <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 4, fontSize: "1.05rem" }}>
          OMEGATION — молодая и динамично развивающаяся компания, специализирующаяся на разработке и
          производстве автозапчастей для легковых и коммерческих автомобилей. Несмотря на недавнее
          основание, мы уже выстроили современную производственную и логистическую цепочку, позволяющую
          предлагать рынку один из самых широких и технологичных ассортиментов в своём сегменте.
        </Typography>

        <Stack spacing={3}>
          {SECTIONS.map((section) => (
            <Paper
              key={section.title}
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 4,
                bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#F3F7FB"),
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: "primary.main" }}>
                {section.title}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
                {section.text}
              </Typography>
            </Paper>
          ))}
        </Stack>

        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
            Наша цель — сделать качественные автозапчасти доступными, надёжными и всегда в наличии. Мы
            верим, что каждая деталь OMEGATION — это не просто компонент, а уверенность в безопасности,
            долговечности автомобиля и спокойствии на каждом километре пути.
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main", letterSpacing: "0.02em" }}>
            OMEGATION: точность. Надёжность. Движение вперёд.
          </Typography>
        </Box>
      </Container>
    </>
  );
}
