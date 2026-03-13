import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 15000,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Auth0 Provider wrapper so we can use React Router navigation
 */
function Auth0ProviderWithNavigate({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    const target = appState?.returnTo ?? "/app/dashboard";
    navigate(target, { replace: true });
  };

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "openid profile email",
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}

/**
 * React Root
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Auth0ProviderWithNavigate>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </Auth0ProviderWithNavigate>
      </BrowserRouter>

      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  </React.StrictMode>
);