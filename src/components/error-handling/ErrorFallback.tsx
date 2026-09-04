import { FC } from "react";
import { styled } from "@mui/material/styles";
import { Box, Button, Typography } from "@mui/material";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Styled container using MUI's styled API (theme-aware)
const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  padding: theme.spacing(4),
  backgroundColor: "#ffe6e6",
  color: "#cc0000",
  textAlign: "center",
}));

// Styled error box for showing the error message
const ErrorBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#ffffff",
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  margin: theme.spacing(4, 0),
  maxWidth: 800,
  width: "100%",
}));

// Styled button that accepts a color variant prop
const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "colorVariant",
})<{ colorVariant: "green" | "blue" }>(({ theme, colorVariant }) => ({
  padding: theme.spacing(1, 3),
  margin: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  fontSize: "1rem",
  fontWeight: "bold",
  backgroundColor: colorVariant === "green" ? "#4CAF50" : "#2196F3",
  color: "#fff",
  "&:hover": {
    opacity: 0.9,
  },
}));

export const ErrorFallback: FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <Container role="alert">
      <Typography variant="h3" gutterBottom>
        فيه حاجه غلط ي كبير ⚠️
      </Typography>
      <Typography variant="h5" gutterBottom>
        معلش واحده واحده هتيجي
      </Typography>
      <ErrorBox>
        <Typography variant="h4" gutterBottom>
          الايرور بيقول:
        </Typography>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "monospace",
            color: "#333",
          }}
        >
          {error.message}
        </pre>
      </ErrorBox>
      <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
        <StyledButton colorVariant="green" onClick={resetErrorBoundary}>
          Try Again
        </StyledButton>
        <StyledButton colorVariant="blue" onClick={() => window.location.reload()}>
          Reload App
        </StyledButton>
      </Box>
    </Container>
  );
};
