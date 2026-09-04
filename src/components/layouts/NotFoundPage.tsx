import { useNavigate } from "react-router-dom";
import { Button, Typography, Box, keyframes, styled } from "@mui/material";
import { ROUTES } from "@/app/routes/routesConfig";

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(5deg); }
  50% { transform: translateY(0px) rotate(0deg); }
  75% { transform: translateY(-10px) rotate(-5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const starPulse = keyframes`
  0% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.2; transform: scale(1); }
`;

const Styled404Container = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)"
      : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
  padding: theme.spacing(4),
  position: "relative",
  overflow: "hidden",
}));

const FloatingAstronaut = styled("div")({
  animation: `${float} 6s ease-in-out infinite`,
  cursor: "pointer",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.1)",
  },
});

const Star = styled("div")(({ theme }) => ({
  position: "absolute",
  background: theme.palette.mode === "dark" ? "#fff" : "#ffd700",
  borderRadius: "50%",
  animation: `${starPulse} 2s infinite`,
}));

export function NotFoundPage() {
  const navigate = useNavigate();

  // Generate random stars
  const stars = Array.from({ length: 50 }).map((_, index) => ({
    id: index,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 2,
  }));

  return (
    <Styled404Container>
      {/* Animated background stars */}
      {stars.map((star) => (
        <Star
          key={star.id}
          style={{
            width: star.size,
            height: star.size,
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <FloatingAstronaut onClick={() => navigate(ROUTES.HOME.url)}>
          <svg
            width="400"
            height="400"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* custom astronaut/sci-fi SVG */}
            <path
              d="M200 50C97.4 50 15 132.4 15 235c0 102.6 82.4 185 185 185s185-82.4 185-185S302.6 50 200 50z"
              fill="#FF6B6B"
            />
            <circle cx="200" cy="235" r="100" fill="#4ECDC4" />
            <path
              d="M150 300l50-50 50 50"
              stroke="#FFF"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>
        </FloatingAstronaut>

        <Typography
          variant="h1"
          sx={{
            fontSize: "6rem",
            fontWeight: 900,
            background: "linear-gradient(45deg, #ff6b6b 30%, #4ecdc4 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
          }}
        >
          404
        </Typography>

        <Typography
          variant="h4"
          sx={{ mb: 3, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
        >
          يبدو أن الصفحة التي تبحث عنها ليست على هذا الكوكب!
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(ROUTES.HOME.url)}
          sx={{
            px: 6,
            py: 2,
            fontSize: "1.2rem",
            borderRadius: 50,
            background: "linear-gradient(45deg, #4ecdc4 30%, #45b7af 90%)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: 6,
            },
            transition: "all 0.3s ease",
          }}
        >
          العودة للصفحة الرئيسية
        </Button>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            حاول أحد هذه الخيارات:
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ borderRadius: 50 }}
            >
              العودة للخلف
            </Button>
            <Button variant="outlined" sx={{ borderRadius: 50 }}>
              التواصل مع الدعم
            </Button>
          </Box>
        </Box>

        <Typography
          variant="caption"
          display="block"
          sx={{ mt: 4, opacity: 0.7 }}
        >
          معلومة ممتعة: رائد الفضاء هذا سافر مسافة {stars.length} سنة ضوئية
          ليوصلك هذه الرسالة!
        </Typography>
      </Box>
    </Styled404Container>
  );
}
