import { FC, ReactNode } from "react";
import { Paper, Typography, Box, SxProps } from "@mui/material";
import { Theme } from "@mui/material/styles";
import "./styles/EntityDetailsView.css";

export interface DetailItem {
  label: string;
  value: any;
  notFoundText?: string;
  /** Optional icon to display next to the label */
  icon?: ReactNode;
  iconColor?: string;
  fullWidth?: boolean;
  sx?: SxProps;
}

/**
 * Props for the `EntityDetailsView` component.
 *
 * @property title - The title of the entity details page.
 * @property details - An array of detail items to display.
 * @property actions - Optional action buttons or elements to display at the bottom.
 * @property sx - Optional style overrides, using the `SxProps` type from Material-UI.
 * @property density - The density of the layout, which can be either "normal" or "compact".
 */
export interface EntityDetailViewProps {
  /** The title of the entity details page */
  title: string;
  /** An array of detail items to display */
  details: DetailItem[];
  /** Optional action buttons or elements to display at the bottom */
  actions?: ReactNode;
  /** Optional style overrides */
  sx?: SxProps<Theme>;
  /** Optional The density of the layout */
  density?: "normal" | "compact";
}

export const EntityDetailsView: FC<EntityDetailViewProps> = ({
  title,
  details,
  actions,
  sx,
  density = "compact",
}) => {
  return (
    <Paper
     className="EntityDetailsView"
      sx={{
        width: "100%",
        maxWidth: 800,
        mx: "auto",
        boxShadow: 4,
        borderRadius: 4,
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
        ...sx,
      }}
    >
      {/* Header */}
      <Box
       className="EntityDetailsView-Header"
        sx={(theme) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          p: 4,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "2px",
            backgroundColor: "rgba(255,255,255,0.3)",
          },
        })}
      >
        <Typography
           className="EntityDetailsView-Title"
          variant="h3"
          component="h1"
          color="white"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            position: "relative",
            "&::after": {
              content: '""',
              display: "block",
              width: "60px",
              height: "4px",
              backgroundColor: "white",
              margin: "16px auto 0",
              borderRadius: 2,
            },
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Content Area */}
      <Box
         className="EntityDetailsView-Content"
        sx={(theme) => ({
          p: 4,
          background: `linear-gradient(45deg, 
              ${theme.palette.background.default} 0%, 
              ${theme.palette.background.paper} 100%)`,
          position: "relative",
        })}
      >
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns:
              density === "normal"
                ? "1fr"
                : { xs: "1fr", sm: "1fr 1fr 1fr 1fr" },
          }}
        >
          {details.map((detail, index) => (
            <Box
              key={index}
              className="EntityDetailsView-DetailItem"
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: "background.paper",
                boxShadow: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 3,
                gridColumn: detail.fullWidth ? "1 / -1" : undefined,
                ...detail.sx
              }}
            >
              {detail.icon && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "50%",
                    backgroundColor: detail.iconColor || "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 1,
                  }}
                >
                  {detail.icon}
                </Box>
              )}

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {detail.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    // wordBreak: "break-word",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: detail.fullWidth ? "5" : "2",
                    WebkitBoxOrient: "vertical",
                    whiteSpace: "normal",
                  }}
                >
                  {detail.value ?? detail.notFoundText ?? (
                    <Box
                      component="span"
                      sx={{
                        color: "text.disabled",
                        fontStyle: "italic",
                      }}
                    >
                      غير متوفر
                    </Box>
                  )}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Actions Footer */}
      {actions && (
        <Box
         className="EntityDetailsView-Actions"
          sx={(theme) => ({
            p: 3,
            background: `linear-gradient(45deg, 
              ${theme.palette.grey[100]} 0%, 
              ${theme.palette.background.paper} 100%)`,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            position: "sticky",
            bottom: 0,
            zIndex: 1,
          })}
        >
          {actions}
        </Box>
      )}
    </Paper>
  );
};
