import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import App from "./App.tsx";
import { config } from "./wagmi.ts";
import { Toaster } from 'react-hot-toast';
import axios from "axios";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Error404 } from "./Error404.tsx";
import Dashboard from "./pages/Dashboard.tsx";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error404 />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider  coolMode
          theme={darkTheme({
            accentColor: "#102e43ff",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          <RouterProvider router={router} />
          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
