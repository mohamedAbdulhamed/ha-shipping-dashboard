import { Suspense } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "@/app/theme";
import { CacheProvider } from "@emotion/react";
import createRtlCache from "@/app/providers/rtlCache";

import AppRoutes from "@/app/routes";
import { TruckLoader } from "@/components/ui/CustomLoader";

export default function App() {
  const [theme, colorMode] = useMode();

  const cacheRtl = createRtlCache();

  return (
    <Suspense
      fallback={
        // <PageLoader fullScreen color="#4CAF50" text="Initializing..." />
        <TruckLoader />
      }
    >
      <CacheProvider value={cacheRtl}>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            {/* Normalize CSS */}
            <CssBaseline enableColorScheme />

            <AppRoutes />
          </ThemeProvider>
        </ColorModeContext.Provider>
      </CacheProvider>
    </Suspense>
  );
}
