import { useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";

export interface MultiLineChipInputProps<T> {
  /** Heading text */
  title: React.ReactNode;
  /** The icon to show in the header (optional) */
  headerIcon?: React.ReactNode;
  /** Placeholder for the text area */
  placeholder?: string;
  /** How to parse raw text into an array of items of type T */
  parseItems: (raw: string) => T[];
  /** How to render each chip’s label */
  renderLabel: (item: T) => React.ReactNode;
  /** Callback when button is clicked */
  onSubmit: (items: T[]) => Promise<void> | void;
  /** Button label (or loader) */
  buttonLabel: (count: number, loading: boolean) => React.ReactNode;
  /** Entire box sx override */
  containerSx?: object;
}

export function MultiLineChipInput<T>({
  title,
  headerIcon,
  placeholder = "",
  parseItems,
  renderLabel,
  onSubmit,
  buttonLabel,
  containerSx = {},
}: MultiLineChipInputProps<T>) {
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => parseItems(rawText), [rawText, parseItems]);

  // Auto-focus the TextField on mount
  useEffect(() => {
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(items);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(items.map((i) => String(i)).join("\n"));
  };

  const handleRemove = (idx: number) => {
    const arr = items.slice();
    arr.splice(idx, 1);
    setRawText(arr.join("\n"));
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        p: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        maxWidth: 700,
        mx: "auto",
        bgcolor: "background.paper",
        borderRadius: 4,
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        border: "1px solid rgba(255,255,255,0.1)",
        background: `
             linear-gradient(
               145deg,
               rgba(255,255,255,0.95) 0%,
               rgba(245,245,255,0.98) 100%
             )
           `,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -50,
          left: -50,
          width: 120,
          height: 120,
          background: "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          opacity: 0.3,
        },
        ...containerSx,
      }}
    >
      {headerIcon && (
        <Box
          component={motion.div}
          initial={{ rotate: -15, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2 }}
          sx={{
            bgcolor: "primary.main",
            p: 1.5,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {headerIcon}
        </Box>
      )}

      <Typography
        variant="h3"
        fontWeight={900}
        gutterBottom
        sx={{
          background: "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {/* مسح بوليصات الشحن */}
        {title}
      </Typography>

      <TextField
        inputRef={textFieldRef}
        multiline
        minRows={6}
        maxRows={12}
        fullWidth
        variant="outlined"
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesomeRounded color="primary" />
            <span>ألصق الأكواد الممسوحة هنا</span>
          </Box>
        }
        placeholder={placeholder}
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        sx={{
          bgcolor: "background.paper",
          transition: "all 0.3s ease",
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            border: "2px solid transparent",
            background:
              "linear-gradient(white, white) padding-box, linear-gradient(45deg, #4facfe 0%, #00f2fe 100%) border-box",
            "&:hover": {
              transform: "scale(1.02)",
            },
          },
        }}
      />

      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ width: "100%" }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 2,
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                maxHeight: 150,
                overflowY: "auto",
                background: "rgba(245, 248, 255, 0.6)",
                backdropFilter: "blur(8px)",
                position: "relative",
              }}
            >
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Chip
                      label={renderLabel(item)}
                      onDelete={() => handleRemove(index)}
                      deleteIcon={<DeleteIcon />}
                      sx={{
                        fontWeight: 600,
                        bgcolor: "background.paper",
                        boxShadow: 1,
                        "&:hover": { bgcolor: "primary.light" },
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              <Tooltip title="انسخ جميع الأكواد">
                <IconButton
                  onClick={handleCopy}
                  sx={{
                    ml: "auto",
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        component={motion.div}
        whileHover={{ scale: items.length > 0 ? 1.05 : 1 }}
        whileTap={{ scale: items.length > 0 ? 0.95 : 1 }}
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={items.length === 0 || loading}
        sx={{
          mt: 2,
          px: 5,
          py: 1.5,
          fontSize: "1rem",
          borderRadius: 3,
          boxShadow: 3,
          transition: "all 0.3s ease !important",
        }}
      >
        {buttonLabel(items.length, loading)}
      </Button>
    </Box>
  );
}
