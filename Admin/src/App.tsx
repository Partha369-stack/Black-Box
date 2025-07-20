import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Orders } from '@/pages/Orders';
import { Inventory } from '@/pages/Inventory';
import { Settings } from '@/pages/Settings';
import { Sales } from '@/pages/Sales';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedMachine, setSelectedMachine] = React.useState('VM-001');

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleSelectMachine = (machineId: string) => {
    setSelectedMachine(machineId);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <AdminLayout
                  collapsed={collapsed}
                  onToggle={handleToggle}
                  selectedMachine={selectedMachine}
                  onSelectMachine={handleSelectMachine}
                />
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="settings" element={<Settings />} />
              <Route path="sales" element={<Sales />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

