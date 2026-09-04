import { IconButton, Tooltip } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useTheme } from "@mui/material/styles";
import { useColorMode } from "@/app/theme";

export function ThemeSwitcher() {
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  return (
    <Tooltip
      title={`Switch to ${theme.palette.mode === "dark" ? "light" : "dark"} mode`}
      enterDelay={300}
      leaveDelay={200}
    >
      <IconButton
        color="inherit"
        onClick={toggleColorMode}
        sx={{
          width: 40,
          height: 40,
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        {theme.palette.mode === "dark" ? (
          <LightModeIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
