import { useNavigate } from "react-router-dom";

import { Box, Typography, Button, useTheme } from "@mui/material";
import { tokens } from "@/app/theme";

import SecurityIcon from "@mui/icons-material/Security";

import { HEADER_HEIGHT } from "@/types";

const Unauthorized = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        textAlign: "center",
      }}
    >
      <SecurityIcon sx={{ fontSize: 80, color: colors.redAccent[500], mb: 2 }} />
      <Typography variant="h3" sx={{ color: colors.grey[100], mb: 1 }}>
        غير مصرح لك بالدخول
      </Typography>
      <Typography variant="h6" sx={{ color: colors.grey[300], mb: 3 }}>
        للأسف، ليس لديك الصلاحية لعرض هذه الصفحة.
      </Typography>
      <Button
        variant="contained"
        sx={{
          color: colors.primary[400],
          px: 3,
          py: 1.5,
          fontSize: "1rem",
        }}
        onClick={() => navigate("/login")}
      >
        تسجيل الدخول
      </Button>
      {/* <Box
        component="img"
        src="/assets/unauthorized.svg"
        alt="Access Denied"
        sx={{ width: "50%", maxWidth: 400, mt: 4 }}
      /> */}
    </Box>
  );
};

export default Unauthorized;
