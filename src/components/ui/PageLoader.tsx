import { spinAnimation } from "@/common/animations";
import { styled, SxProps } from "@mui/system";
import { ReactNode } from "react";

interface PageLoaderProps {
  size?: "small" | "medium" | "large";
  color?: string;
  text?: string;
  textColor?: string,
  fullScreen?: boolean;
  className?: string;
  style?: SxProps;
  action?: () => ReactNode;
  version?: string;
  brandName?: string; 
}

const LoaderContainer = styled("div")<{ fullScreen?: boolean }>(
  ({ fullScreen }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    ...(fullScreen && {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      zIndex: 9999,
    }),
  })
);

const Spinner = styled("div")<{ size: number; color: string }>(
  ({ size, color }) => ({
    width: size,
    height: size,
    borderRadius: "50%",
    border: `3px solid ${color}20`,
    borderTopColor: color,
    animation: "spin 1s linear infinite",
    animationName: spinAnimation,
  })
);

const LoaderText = styled("div")(({ theme, color }) => ({
  marginTop: theme.spacing(2),
  color: color || theme.palette.text.secondary,
  fontWeight: 500,
}));

const VersionInfo = styled("div")(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
  fontWeight: 400,
  opacity: 0.7,
  pointerEvents: "none",
}));

export function PageLoader({
  size = "medium",
  color = "#1976d2",
  text = "جاري التحميل ...",
  textColor = "#1e1e1e",
  fullScreen = true,
  className,
  style,
  action,
  version = "1.0.1",
  brandName = "H&A",
}: PageLoaderProps) {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  return (
    <LoaderContainer
      fullScreen={fullScreen}
      className={className}
      role="status"
      aria-live="polite"
      sx={style}
    >
      <Spinner
        size={sizeMap[size]}
        color={color}
        aria-label="Loading spinner"
      />
      <LoaderText color={textColor}>{text}</LoaderText>
      {action && action()}
      <VersionInfo>
        {brandName} v{version}
      </VersionInfo>
    </LoaderContainer>
  );
}
