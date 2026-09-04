import { useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Router } from '@toolpad/core/AppProvider'; // adjust the import path as needed

export interface NavigateOptions {
  history?: 'auto' | 'push' | 'replace';
}

export interface Navigate {
  (url: string | URL, options?: NavigateOptions): void;
}

export default function useCustomRouter(): Router {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  // Wrap React Router's navigate so it matches our custom Navigate interface.
  const toolpadNavigate: Navigate = useCallback((url: string | URL, options?: NavigateOptions) => {
    const urlStr = typeof url === 'string' ? url : url.toString();

    // Translate our custom options to react-router-dom options.
    // React Router accepts a 'replace' flag.
    const rrOptions: { replace?: boolean } = {};

    if (options?.history === 'replace') {
      rrOptions.replace = true;
    } else if (options?.history === 'push' || options?.history === 'auto' || !options) {
      rrOptions.replace = false;
    }

    return navigate(urlStr, rrOptions);
  }, [navigate]);

  const router = useMemo<Router>(() => ({
    pathname,
    searchParams,
    navigate: toolpadNavigate,
  }), [pathname, searchParams, toolpadNavigate]);

  return router;
}
