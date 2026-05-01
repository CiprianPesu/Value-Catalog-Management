import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import App from './app/App';

import './index.css';
import { Toaster } from 'sonner';
import { KeycloakProvider } from './features/Auth/KeycloakContext';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './lib/theme-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <KeycloakProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider delayDuration={100}>
            <BrowserRouter>
              <App />
            </BrowserRouter>

            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </KeycloakProvider>
  </React.StrictMode>,
);
