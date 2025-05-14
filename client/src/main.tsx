import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { MapContextProvider } from "@/lib/MapContext";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <MapContextProvider>
      <App />
      <Toaster />
    </MapContextProvider>
  </QueryClientProvider>
);
