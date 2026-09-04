import { useNavigate } from "react-router-dom";
import { Button, Typography, Box, keyframes, styled } from "@mui/material";
import { ROUTES } from "@/app/routes/routesConfig";

const truckBounce = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(2deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-5px) rotate(-2deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const roadAnimation = keyframes`
  from { background-position: 0 0; }
  to { background-position: 100% 0; }
`;

const Styled404Container = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.palette.mode === "dark" 
    ? "linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)" 
    : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
  padding: theme.spacing(4),
  position: "relative",
  overflow: "hidden",
  direction: "rtl",
  fontFamily: "'Tajawal', sans-serif",
}));

const AnimatedTruck = styled("div")({
  animation: `${truckBounce} 3s ease-in-out infinite`,
  cursor: "pointer",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.1)",
  },
});

const Road = styled("div")({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "100px",
  background: `
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 50px,
      #666 50px,
      #666 100px
    )
  `,
  animation: `${roadAnimation} 2s linear infinite`,
});

export function NotFoundPage2() {
  const navigate = useNavigate();

  return (
    <Styled404Container>
      <Road />
      
      <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <AnimatedTruck onClick={() => navigate(ROUTES.HOME.url)}>
          <svg
            width="300"
            height="200"
            viewBox="0 0 300 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M50 150H250V120H50V150Z" fill="#4ECDC4" />
            <path d="M70 120H230V80H70V120Z" fill="#45B7AF" />
            <circle cx="100" cy="150" r="30" fill="#666" />
            <circle cx="200" cy="150" r="30" fill="#666" />
            <path d="M150 80L170 60H130L150 80Z" fill="#FF6B6B" />
          </svg>
        </AnimatedTruck>

        <Typography
          variant="h1"
          sx={{
            fontSize: "6rem",
            fontWeight: 900,
            background: "linear-gradient(45deg, #4ECDC4 30%, #45B7AF 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
          }}
        >
          ٤٠٤
        </Typography>

        <Typography
          variant="h4"
          sx={{ 
            mb: 3, 
            color: "text.secondary", 
            maxWidth: "600px", 
            mx: "auto",
            lineHeight: 1.8
          }}
        >
          يبدو أن الطرد الخاص بك أخذ طريقًا خاطئًا!
        </Typography>

        <Box sx={{ display: "flex", gap: 3, justifyContent: "center", mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(ROUTES.ORDERS.BASE.url)}
            sx={{
              px: 4,
              py: 2,
              borderRadius: 2,
              background: "linear-gradient(45deg, #FF6B6B 30%, #FF5252 90%)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 6,
              },
              transition: "all 0.3s ease",
            }}
          >
            تتبع الشحنات
          </Button>
          
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(ROUTES.HOME.url)}
            sx={{
              px: 4,
              py: 2,
              borderRadius: 2,
              background: "linear-gradient(45deg, #4ECDC4 30%, #45B7AF 90%)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 6,
              },
              transition: "all 0.3s ease",
            }}
          >
            العودة للرئيسية
          </Button>
        </Box>

        <Box sx={{ 
          display: "flex", 
          gap: 3, 
          justifyContent: "center",
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 2,
          boxShadow: 2
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 2 }}
          >
            العودة للصفحة السابقة
          </Button>
          <Button
            variant="outlined"
            disabled
            aria-disabled
            sx={{ borderRadius: 2 }}
          >
            تواصل مع الدعم
          </Button>
        </Box>

        <Typography
          variant="body2"
          sx={{ 
            mt: 4, 
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1
          }}
        >
          <span>رقم الدعم الفوري:</span>
          <Button 
            variant="text"
            aria-disabled
            disabled
            sx={{ 
              color: "primary.main",
              textDecoration: "underline",
              p: 0,
              minWidth: "auto"
            }}
          >
            غير متاح
          </Button>
        </Typography>
      </Box>

      {/* Floating Packages */}
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            animation: `${truckBounce} ${3 + i}s ease-in-out infinite`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 80}%`,
            fontSize: 40,
            opacity: 0.3,
          }}
        >
          📦
        </Box>
      ))}
    </Styled404Container>
  );
}