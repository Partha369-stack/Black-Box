import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FlyToCartAnimator from "./components/FlyToCartAnimator";
import Particles from './Particles';
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useRef } from "react"; // Import useEffect and useRef

const queryClient = new QueryClient();

const App = () => {
  const { theme } = useTheme();
  const particleColors = theme === 'dark' ? ['#00BFFF', '#00BFFF'] : ['#39FF14', '#39FF14'];
  // Removed WebSocket refs
  // Removed WebSocket connection logic

  useEffect(() => {
    // Removed WebSocket connection logic
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {theme === 'dark' && (
          <div style={{
            position: 'fixed',
            inset: 1,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            pointerEvents: 'none',
          }}>
            <Particles
              particleCount={150}
              particleSpread={10}
              speed={0.5}
              particleBaseSize={1500}
              moveParticlesOnHover={true}
              alphaParticles={true}
              disableRotation={true}
            />
          </div>
        )}
        <div style={{ position: 'relative', zIndex: 0 }}>
          <BrowserRouter basename="/vm-001/">
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <FlyToCartAnimator />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
