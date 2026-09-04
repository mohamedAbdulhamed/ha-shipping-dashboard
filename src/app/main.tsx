// entry point
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { AppRoot } from '@/app/AppRoot';
import '@/app/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    },
  },
});

const container = document.getElementById('root');

if (!container) throw new Error('No root element found');

createRoot(container).render(<AppRoot queryClient={queryClient} />);
