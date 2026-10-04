import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '../store';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import '../styles/design-tokens.css';

// Initialize TanStack React Query Client with sensible cache rules
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#18181B',
                  color: '#F8FAFC',
                  border: '1px solid rgba(109, 93, 246, 0.4)',
                  borderRadius: '14px',
                  padding: '12px 18px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                  fontWeight: 500,
                },
                success: {
                  iconTheme: {
                    primary: '#22D3EE',
                    secondary: '#18181B',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#18181B',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default AppProviders;
