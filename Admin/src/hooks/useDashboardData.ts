import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  orders: {
    total: number;
    today: number;
    total_sales: number;
    sales_today: number;
  };
  inventory: {
    total_items: number;
    low_stock: number;
    critical_stock: number;
    out_of_stock: number;
  };
  recent_orders: any[];
}

interface DashboardData {
  success: boolean;
  stats: DashboardStats;
}

// Optimized dashboard data fetcher using the new aggregated endpoint
const fetchDashboardStats = async (machineId: string): Promise<DashboardData> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://black-box-production.up.railway.app';
  const response = await fetch(`${apiUrl}/api/dashboard/stats`, {
    headers: {
      'X-Tenant-ID': machineId
    }
  });

  if (!response.ok) {
    throw new Error(`Dashboard API failed with status ${response.status}`);
  }

  return response.json();
};

// Fetch orders with React Query
const fetchOrders = async (machineId: string) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://black-box-production.up.railway.app';
  const response = await fetch(`${apiUrl}/api/orders`, {
    headers: {
      'X-Tenant-ID': machineId,
      'X-API-Key': import.meta.env.VITE_API_KEY || 'blackbox-api-key-2024'
    }
  });

  if (!response.ok) {
    throw new Error(`Orders API failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.success ? data.orders : [];
};

// Fetch inventory with React Query
const fetchInventory = async (machineId: string) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://black-box-production.up.railway.app';
  const response = await fetch(`${apiUrl}/api/inventory`, {
    headers: {
      'X-Tenant-ID': machineId
    }
  });

  if (!response.ok) {
    throw new Error(`Inventory API failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.success ? data.inventory : [];
};

// Custom hook for dashboard stats with React Query
export const useDashboardStats = (machineId: string) => {
  return useQuery({
    queryKey: ['dashboardStats', machineId],
    queryFn: () => fetchDashboardStats(machineId),
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
    retryDelay: 1000,
  });
};

// Custom hook for orders with React Query
export const useOrders = (machineId: string) => {
  return useQuery({
    queryKey: ['orders', machineId],
    queryFn: () => fetchOrders(machineId),
    staleTime: 15000, // Consider data fresh for 15 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
    retryDelay: 1000,
  });
};

// Custom hook for inventory with React Query
export const useInventory = (machineId: string) => {
  return useQuery({
    queryKey: ['inventory', machineId],
    queryFn: () => fetchInventory(machineId),
    staleTime: 60000, // Consider data fresh for 1 minute (inventory changes less frequently)
    refetchInterval: 120000, // Refetch every 2 minutes
    retry: 2,
    retryDelay: 1000,
  });
};
