import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import ToastNotification from "@/components/ui/ToastNotification";
import { useMode } from "@/app/theme";

export default function PrintLayout() {
  const [theme] = useMode();

  return (
    <Box className="app">
      <Box className="main-content">
        <Box className="content">
          <Outlet />
        </Box>

        <ToastNotification theme={theme.palette.mode} />
      </Box>
    </Box>
  );
}
