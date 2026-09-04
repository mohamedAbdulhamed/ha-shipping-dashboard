import { alpha, styled } from "@mui/material";
import { DataGridPremium } from "@mui/x-data-grid-premium";

export const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
  "& .MuiDataGrid-columnHeaders": {
    // background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    background: `linear-gradient(95deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.common.white,
    fontSize: "1rem",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    color: theme.palette.text.primary,
    fontWeight: 700,
  },
  "& .MuiDataGrid-row": {
    background: `linear-gradient(95deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[2],
    },
    "&.Mui-selected": {
      // backgroundColor: theme.palette.action.selected,
      backgroundColor: "rgb(92 199 68 / 20%)",
      outline: "1px solid rgb(92 199 68 / 35%)",
    },
  },
  "& .MuiDataGrid-cell": {
    display: "flex",
    alignItems: "center",
    borderColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[700]
        : theme.palette.grey[200],
    padding: theme.spacing(1),
  },
}));