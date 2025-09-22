import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TabletInterface from "./pages/TabletInterface";
import PanelInterface from "./pages/PanelInterface";
import ConsoleInterface from "./pages/ConsoleInterface";
import AuthPage from "./pages/AuthPage";
import AdminInterface from "./pages/AdminInterface";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tablet" element={<TabletInterface />} />
          <Route path="/panel" element={<PanelInterface />} />
          <Route path="/console" element={<ConsoleInterface />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminInterface />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
