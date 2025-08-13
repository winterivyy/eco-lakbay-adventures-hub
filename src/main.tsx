import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './hooks/useAuth';
import { UserRoleProvider } from './hooks/useUserRole';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Create the query client instance
const queryClient = new QueryClient();

// This is now the single source of truth for your application's providers.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* The Router must wrap everything */}
    <BrowserRouter>
      {/* Data fetching provider */}
      <QueryClientProvider client={queryClient}>
        {/* Authentication provider */}
        <AuthProvider>
          {/* Role provider (needs to be inside AuthProvider) */}
          <UserRoleProvider>
            {/* Tooltip provider for UI elements */}
            <TooltipProvider>
              {/* Your main App component with all the pages and routes */}
              <App />
              {/* Toaster components for notifications */}
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </UserRoleProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
