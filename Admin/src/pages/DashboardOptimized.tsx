import { ShoppingCart, TrendingUp, Package, AlertTriangle, CheckCircle, Bell, User, X, Check } from "lucide-react";
import { MetricCard } from "./components/dashboard/MetricCard";
import { SalesChart } from "./components/dashboard/SalesChart";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import ErrorBoundary from "./components/ErrorBoundary";
import { useOutletContext } from "react-router-dom";
import { useDashboardStats, useOrders, useInventory } from "../hooks/useDashboardData";
import { Skeleton } from "../components/ui/skeleton";

interface OutletContext {
  machineId: string;
}

export const DashboardOptimized = memo(() => {
  const { machineId } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // React Query hooks for optimized data fetching
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboardStats(machineId);
  const { data: orders = [], isLoading: isOrdersLoading } = useOrders(machineId);
  const { data: inventory = [], isLoading: isInventoryLoading } = useInventory(machineId);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New order #1234 received', type: 'order', read: false, timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 2, message: 'Low stock alert for product XYZ', type: 'stock', read: false, timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: 3, message: 'System update available', type: 'system', read: true, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [machineStatus, setMachineStatus] = useState<{
    status: 'online' | 'offline';
    lastHeartbeat: string | null;
    lastUpdated?: string;
    error?: string | null;
  }>({
    status: 'offline',
    lastHeartbeat: null,
    lastUpdated: new Date().toISOString(),
    error: null
  });

  // Memoized calculations using dashboard stats when available
  const orderStats = useMemo(() => {
    if (dashboardData?.success && dashboardData.stats) {
      const stats = dashboardData.stats;
      return {
        totalOrders: stats.orders.total,
        ordersToday: { length: stats.orders.today },
        totalSales: stats.orders.total_sales,
        totalSalesToday: stats.orders.sales_today,
        recentOrders: stats.recent_orders || []
      };
    }

    // Fallback to client-side calculations if dashboard stats not available
    const totalOrders = orders.length;
    const paidOrders = orders.filter((o: any) => o.paymentStatus === "paid");
    const totalSales = paidOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    const now = new Date();
    const ordersToday = orders.filter((o: any) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d.getFullYear() === now.getFullYear() &&
             d.getMonth() === now.getMonth() &&
             d.getDate() === now.getDate();
    });
    const paidOrdersToday = ordersToday.filter((o: any) => o.paymentStatus === "paid");
    const totalSalesToday = paidOrdersToday.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const recentOrders = orders.slice(-4).reverse();

    return {
      totalOrders,
      ordersToday,
      totalSales,
      totalSalesToday,
      recentOrders
    };
  }, [dashboardData, orders]);

  // Memoized inventory stats using dashboard stats when available
  const inventoryStats = useMemo(() => {
    if (dashboardData?.success && dashboardData.stats) {
      const stats = dashboardData.stats;
      return {
        lowStockCount: stats.inventory.low_stock,
        criticalStockCount: stats.inventory.critical_stock,
        outOfStockCount: stats.inventory.out_of_stock,
        totalStockValue: 0 // Not calculated in backend yet
      };
    }

    // Fallback to client-side calculations
    const lowStockCount = inventory.filter((item: any) => item.quantity <= 5).length;
    const criticalStockCount = inventory.filter((item: any) => item.quantity <= 2).length;
    const outOfStockCount = inventory.filter((item: any) => item.quantity === 0).length;
    const totalStockValue = inventory.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    return {
      lowStockCount,
      criticalStockCount,
      outOfStockCount,
      totalStockValue
    };
  }, [dashboardData, inventory]);

  // New order notification effect
  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount > 0) {
      const newOrders = orders.length - lastOrderCount;
      toast({
        title: "New Order(s) Received!",
        description: `${newOrders} new order${newOrders > 1 ? 's' : ''} has been placed.`,
        duration: 5000,
      });
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount, toast]);

  // Stock alert notification effect
  useEffect(() => {
    if (inventoryStats.criticalStockCount > 0) {
      toast({
        title: "Low Stock Alert!",
        description: `${inventoryStats.criticalStockCount} product(s) have critical stock levels (≤2 units).`,
        duration: 8000,
        variant: "destructive",
      });
    }
  }, [inventoryStats.criticalStockCount, toast]);

  // Loading state
  const isLoading = isDashboardLoading || isOrdersLoading || isInventoryLoading;

  if (isLoading && orders.length === 0 && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-white text-lg mb-4">Loading dashboard...</div>
          <div className="text-white/70 text-sm">Fetching optimized data...</div>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">Error loading dashboard</div>
          <div className="text-white/70 text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard - {machineId}</h1>
            <p className="text-white/70">
              Monitor your vending machine performance with optimized loading
            </p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Orders"
            value={isLoading ? "..." : orderStats.totalOrders.toString()}
            change={isLoading ? "" : `${orderStats.ordersToday.length} orders today`}
            changeType="positive"
            icon={ShoppingCart}
            description={isLoading ? "" : `${orderStats.ordersToday.length} orders today`}
          />
          <div onClick={() => navigate('/sales')} className="cursor-pointer">
            <MetricCard
              title="Total Sales"
              value={isLoading ? "..." : `₹${orderStats.totalSales}`}
              change={isLoading ? "" : `₹${orderStats.totalSalesToday} today`}
              changeType="positive"
              icon={TrendingUp}
              description={isLoading ? "" : `₹${orderStats.totalSalesToday} today`}
            />
          </div>
          <MetricCard
            title="Inventory Items"
            value={isLoading ? "..." : inventory.length.toString()}
            change={isLoading ? "" : `${inventoryStats.lowStockCount} low stock`}
            changeType={inventoryStats.lowStockCount > 0 ? "negative" : "neutral"}
            icon={Package}
            description={isLoading ? "" : `${inventoryStats.lowStockCount} items need restocking`}
          />
          <MetricCard
            title="Machine Status"
            value={machineStatus.status === 'online' ? 'Online' : 'Offline'}
            change={
              machineStatus.status === 'online'
                ? 'Connected and operational'
                : machineStatus.lastHeartbeat
                  ? `Last seen: ${new Date(machineStatus.lastHeartbeat).toLocaleString()}`
                  : 'No heartbeat received'
            }
            changeType={machineStatus.status === 'online' ? 'positive' : 'negative'}
            icon={machineStatus.status === 'online' ? CheckCircle : AlertTriangle}
            description={
              machineStatus.status === 'online'
                ? `Last update: ${new Date().toLocaleTimeString()}`
                : machineStatus.lastHeartbeat
                  ? `Last connection: ${new Date(machineStatus.lastHeartbeat).toLocaleString()}`
                  : 'This machine has never connected.'
            }
          />
        </div>

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <SalesChart machineId={machineId} />

          {/* Recent Orders */}
          <Card className="bg-black border-white/10 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <ShoppingCart className="w-5 h-5 text-white mr-2" />
                Recent Orders
              </CardTitle>
              <p className="text-sm text-white/70">
                Latest transactions from your vending machine
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="text-right space-y-1">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : orderStats.recentOrders.length === 0 ? (
                <div className="text-white/70">No recent orders available</div>
              ) : (
                <div className="space-y-3">
                  {orderStats.recentOrders.map((order: any, index: number) => (
                    <div 
                      key={order.order_id || order.orderId || `order-${index}`}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white text-sm">
                            #{order.order_id || order.orderId || 'N/A'}
                          </p>
                          <Badge 
                            variant="outline"
                            className={
                              (order.payment_status || order.paymentStatus) === "paid" ? 
                              "bg-green-500/20 text-green-400 border-green-500/30" :
                              (order.payment_status || order.paymentStatus) === "cancelled" ? 
                              "bg-red-500/20 text-red-400 border-red-500/30" :
                              (order.payment_status || order.paymentStatus) === "pending" ? 
                              "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                              "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            }
                          >
                            {order.payment_status || order.paymentStatus || 'unknown'}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-white/60">
                          {order.items && Array.isArray(order.items) ? 
                            order.items.map((item: any) => `${item.name} x${item.quantity}`).join(", ") : 
                            'No items'
                          }
                        </p>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <p className="font-bold text-white text-lg">
                          ₹{order.total_amount || order.totalAmount || 0}
                        </p>
                        <p className="text-xs text-white/50">
                          {order.items && Array.isArray(order.items) ? 
                            `${order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)} items` : 
                            '0 items'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
});

DashboardOptimized.displayName = 'DashboardOptimized';
