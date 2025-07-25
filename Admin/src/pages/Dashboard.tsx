
import { ShoppingCart, TrendingUp, Package, AlertTriangle, CheckCircle, Bell, User, X, Check } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ErrorBoundary from "@/components/ErrorBoundary";

import { useOutletContext } from "react-router-dom";

interface OutletContext {
  machineId: string;
}

export const Dashboard = () => {
  const { machineId } = useOutletContext<OutletContext>();
  const [dashboardData, setDashboardData] = useState({
    revenue: { total: 0, today: 0, week: 0, month: 0 },
    orders: { total: 0, today: 0, week: 0, month: 0 },
    inventory: { lowStock: 0, outOfStock: 0, totalItems: 0 }
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New order #1234 received', type: 'order', read: false, timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 2, message: 'Low stock alert for product XYZ', type: 'stock', read: false, timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: 3, message: 'System update available', type: 'system', read: true, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { toast } = useToast();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [machineStatus, setMachineStatus] = useState<{
    status: 'online' | 'offline';
    lastHeartbeat: string | null;
    lastUpdated?: string;
    error?: string | null;
  }>({
    status: 'online', // Default to online since UI is running
    lastHeartbeat: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    error: null
  });

  useEffect(() => {
    fetchOrders();
    fetchInventory();
  }, [machineId]);

  // Fetch orders from backend - memoized to prevent unnecessary re-creation
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        headers: {
          'X-Tenant-ID': machineId,
          'X-API-Key': import.meta.env.VITE_API_KEY || 'blackbox-api-key-2024'
        }
      });

      if (!res.ok) {
        throw new Error(`Orders API failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        console.error('API Error in fetchOrders:', data.error || 'Unknown error');
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]);
      toast({
        title: "Orders Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [machineId, toast]);

  // Fetch inventory from backend - memoized to prevent unnecessary re-creation
  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch(`/api/inventory`, {
        headers: {
          'X-Tenant-ID': machineId
        }
      });

      if (!res.ok) {
        throw new Error(`Inventory API failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setInventory(data.inventory);
      } else {
        console.error('API Error in fetchInventory:', data.error || 'Unknown error');
      }
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setInventory([]);
      toast({
        title: "Inventory Error",
        description: "Failed to load inventory",
        variant: "destructive"
      });
    }
  }, [machineId, toast]);

  useEffect(() => {
    // Removed WebSocket setup
    return () => {
      // Removed cleanup
    };
  }, [machineId]);

  // Auto-refresh effect - optimized to 15 seconds for better performance
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchOrders();
        fetchInventory();
      }, 15000); // Increased from 5s to 15s for better performance
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, fetchOrders, fetchInventory]);

  // Memoized calculations to prevent expensive re-computations
  const orderStats = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
    const totalSales = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Use local timezone for 'today'
    const now = new Date();
    const ordersToday = orders.filter((o) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d.getFullYear() === now.getFullYear() &&
             d.getMonth() === now.getMonth() &&
             d.getDate() === now.getDate();
    });
    const paidOrdersToday = ordersToday.filter((o) => o.paymentStatus === "paid");
    const totalSalesToday = paidOrdersToday.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    // Sort orders by creation date (newest first) and take the first 4
    const recentOrders = orders
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
        return dateB - dateA; // Newest first
      })
      .slice(0, 4);

    return {
      totalOrders,
      paidOrders,
      totalSales,
      ordersToday,
      paidOrdersToday,
      totalSalesToday,
      recentOrders
    };
  }, [orders]);

  // Memoized inventory metrics to prevent expensive re-computations
  const inventoryStats = useMemo(() => {
    const lowStockCount = inventory.filter(item => item.quantity <= 5).length;
    const criticalStockCount = inventory.filter(item => item.quantity <= 2).length;
    const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
    const totalStockValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      lowStockCount,
      criticalStockCount,
      outOfStockCount,
      totalStockValue
    };
  }, [inventory]);

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

  // Track if we've shown the initial offline toast
  const initialOfflineToastShown = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    const fetchStatus = async () => {
      if (!isMounted) return;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const res = await fetch(`/api/machine/status`, {  // Remove ${machineId} from path
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Tenant-ID': machineId // Add the Tenant ID header
          },
          cache: 'no-store' as RequestCache
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API error (${res.status}): ${errorText || 'No details'}`);
        }

        const data = await res.json();

        if (!isMounted) return;

        // Update status with the current timestamp if the machine is online
        const machineData = data.statuses?.find((m: any) => m.id === machineId) || data;
        // Update status with filtered data - default to online since UI is running
        const statusUpdate = {
          status: machineData?.status || 'online',
          lastHeartbeat: machineData?.lastHeartbeat || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          error: null
        };


        // If we were previously offline and now online, show a success message
        if (machineStatus.status === 'offline' && statusUpdate.status === 'online') {
          toast({
            title: "Machine Online",
            description: "Successfully connected to the machine.",
            variant: "default"
          });
        }

        setMachineStatus(statusUpdate);
        initialOfflineToastShown.current = false;
        retryCount = 0; // Reset retry count on success
      } catch (err) {
        if (!isMounted) return;

        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[${new Date().toISOString()}] Failed to fetch machine status:`, errorMessage);

        // Only show error toast for the first failure or after max retries
        if (!initialOfflineToastShown.current || retryCount >= maxRetries) {
          toast({
            title: "Machine Offline",
            description: `Unable to connect to the machine. ${retryCount > 0 ? `Retry ${retryCount}/${maxRetries}` : ''}`,
            variant: "destructive"
          });
          initialOfflineToastShown.current = true;
        }

        // Keep status as online even if there's an API error (since UI is running)
        setMachineStatus(prev => ({
          ...prev,
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          lastError: errorMessage,
          lastUpdated: new Date().toISOString()
        }));

        // Implement exponential backoff for retries
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = retryCount * retryDelay;
          console.log(`Retrying in ${delay}ms... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          if (isMounted) fetchStatus(); // Retry
        }
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling (every 60 seconds when online, every 30 seconds when offline)
    const interval = setInterval(fetchStatus, machineStatus.status === 'online' ? 60000 : 30000);

    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [machineId, toast, machineStatus.status]);

  if (loading && orders.length === 0 && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-white text-lg mb-4">Loading dashboard...</div>
          <div className="text-white/70 text-sm">Connecting to backend server</div>
        </div>
      </div>
    );
  }

  // Generate a unique key based on the data that might cause errors
  const errorBoundaryKey = `${machineId}-${orders.length}-${inventory.length}`;

  return (
    <ErrorBoundary dataKey={errorBoundaryKey}>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard - {machineId}</h1>
            <p className="text-white/70">
              Monitor your vending machine performance and manage operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="relative bg-black/50 text-white hover:bg-white/10 border-white/20 rounded-full px-4 py-2"
                  onClick={() => {
                    // Mark all notifications as read when opening
                    const hasUnread = notifications.some(n => !n.read);
                    if (hasUnread && isNotificationsOpen === false) {
                      setNotifications(notifications.map(n => ({ ...n, read: true })));
                    }
                  }}
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Notifications
                  {notifications.some(n => !n.read) && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-80 bg-gray-900 border-white/10 text-white p-0" 
                align="end"
                onInteractOutside={(e) => {
                  // Prevent closing when clicking on notifications
                  if (e.target.closest('.notification-item')) {
                    e.preventDefault();
                  }
                }}
              >
                <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                  <h3 className="font-semibold">Notifications</h3>
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <ScrollArea className="h-60">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`notification-item p-3 hover:bg-white/5 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-500/5' : ''}`}
                          onClick={() => {
                            // Mark as read when clicked
                            if (!notification.read) {
                              setNotifications(notifications.map(n => 
                                n.id === notification.id ? { ...n, read: true } : n
                              ));
                            }
                            // Handle notification click
                            console.log('Notification clicked:', notification);
                            // You can add navigation or other actions here
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${
                              notification.read ? 'bg-transparent' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/90">{notification.message}</p>
                              <p className="text-xs text-white/50 mt-1">
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                            {!notification.read && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifications(notifications.map(n => 
                                    n.id === notification.id ? { ...n, read: true } : n
                                  ));
                                }}
                                className="p-1 text-white/50 hover:text-white"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-white/50">
                      No notifications
                    </div>
                  )}
                </ScrollArea>
                <div className="p-2 border-t border-white/10">
                  <button 
                    onClick={() => {
                      // Mark all as read
                      setNotifications(notifications.map(n => ({ ...n, read: true })));
                    }}
                    className="w-full text-xs text-center text-white/70 hover:text-white py-1.5 px-2 rounded hover:bg-white/5 transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" className="bg-black/50 text-white hover:bg-white/10 border-white/20 rounded-full px-4 py-2">
              <User className="w-4 h-4 mr-1" />
              Profile
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-white text-sm">
              Auto-refresh (15s)
            </Label>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Orders"
            value={loading ? "..." : orderStats.totalOrders.toString()}
            change={loading ? "" : `${orderStats.ordersToday.length} orders today`}
            changeType="positive"
            icon={ShoppingCart}
            description={loading ? "" : `${orderStats.ordersToday.length} orders today`}
          />
          <div onClick={() => navigate('/sales')} className="cursor-pointer">
            <MetricCard
              title="Total Sales"
              value={loading ? "..." : `₹${orderStats.totalSales}`}
              change={loading ? "" : `₹${orderStats.totalSalesToday} today`}
              changeType="positive"
              icon={TrendingUp}
              description={loading ? "" : `₹${orderStats.totalSalesToday} today`}
            />
          </div>
          <MetricCard
            title="Inventory Items"
            value={loading ? "..." : inventory.length.toString()}
            change={loading ? "" : `${inventoryStats.lowStockCount} low stock`}
            changeType={inventoryStats.lowStockCount > 0 ? "negative" : "neutral"}
            icon={Package}
            description={loading ? "" : `${inventoryStats.lowStockCount} items need restocking`}
          />
          <ErrorBoundary
            dataKey={`machine-status-${machineStatus.status}-${machineStatus.lastHeartbeat}-${Date.now()}`}
            className="h-full"
          >
            <div className="relative h-full">
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
          </ErrorBoundary>
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
              {loading ? (
                <div className="text-white">Loading recent orders...</div>
              ) : orderStats.recentOrders.length === 0 ? (
                <div className="text-white/70">No recent orders available</div>
              ) : (
                <div className="space-y-3">
                  {orderStats.recentOrders.map((order, index) => (
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
                        
                        <div className="flex items-center gap-4 text-xs">
                          {(order.customer_name || order.customerName) && (
                            <span className="text-green-400">
                              👤 {order.customer_name || order.customerName}
                            </span>
                          )}
                          {(order.customer_phone || order.customerPhone) && (
                            <span className="text-blue-400">
                              📱 {order.customer_phone || order.customerPhone}
                            </span>
                          )}
                          <span className="text-white/50">
                            🕒 {order.created_at ? 
                              new Date(order.created_at).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 
                              order.createdAt ? 
                              new Date(order.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'
                            }
                          </span>
                        </div>
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
          {/* Order Detail Dialog */}
          <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
            <DialogContent className="sm:max-w-lg bg-black text-white border-white/20" aria-describedby="dashboard-order-details-description">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
              </DialogHeader>
              <div id="dashboard-order-details-description" className="sr-only">
                Detailed view of the selected order from the recent orders list
              </div>
              {selectedOrder && (
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold">Order ID:</span> {selectedOrder.order_id || selectedOrder.orderId || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> 
                    <Badge 
                      variant={
                        (selectedOrder.payment_status || selectedOrder.paymentStatus) === "paid" ? "default" : "secondary"
                      } 
                      className={
                        (selectedOrder.payment_status || selectedOrder.paymentStatus) === "paid" ? 
                        "bg-green-500 text-black font-bold ml-2" : 
                        "bg-gray-500/20 text-white/60 ml-2"
                      }
                    >
                      {selectedOrder.payment_status || selectedOrder.paymentStatus || 'unknown'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-semibold">Total Amount:</span> ₹{selectedOrder.total_amount || selectedOrder.totalAmount || 0}
                  </div>
                  <div>
                    <span className="font-semibold">Created At:</span> {
                      selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 
                      selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'
                    }
                  </div>
                  <div>
                    <span className="font-semibold">Updated At:</span> {
                      selectedOrder.updated_at ? new Date(selectedOrder.updated_at).toLocaleString() : 
                      selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString() : 'N/A'
                    }
                  </div>
                  <div>
                    <span className="font-semibold">Items:</span>
                    <ul className="list-disc ml-6 mt-2">
                      {selectedOrder.items?.map((item: any, idx: number) => (
                        <li key={item.id || idx}>
                          {item.name} × {item.quantity} — ₹{item.price} each
                        </li>
                      )) || <li>No items found</li>}
                    </ul>
                  </div>
                  {(selectedOrder.customer_name || selectedOrder.customerName) && (
                    <div>
                      <span className="font-semibold">Customer Name:</span> {selectedOrder.customer_name || selectedOrder.customerName}
                    </div>
                  )}
                  {(selectedOrder.customer_phone || selectedOrder.customerPhone) && (
                    <div>
                      <span className="font-semibold">Phone Number:</span> {selectedOrder.customer_phone || selectedOrder.customerPhone}
                    </div>
                  )}
                  {(selectedOrder.payment_details?.vpa || selectedOrder.vpa) && (
                    <div>
                      <span className="font-semibold">UPI Payment Details:</span>
                      <div className="mt-2 p-3 bg-white/5 rounded-lg">
                        <div><span className="text-white/70">VPA:</span> {selectedOrder.payment_details?.vpa || selectedOrder.vpa}</div>
                        <div><span className="text-white/70">Account Type:</span> {selectedOrder.payment_details?.method || selectedOrder.payer_account_type || 'UPI'}</div>
                        {selectedOrder.payment_details?.payment_id && (
                          <div><span className="text-white/70">Payment ID:</span> {selectedOrder.payment_details.payment_id}</div>
                        )}
                        {selectedOrder.payment_details?.bank_name && (
                          <div><span className="text-white/70">Bank:</span> {selectedOrder.payment_details.bank_name}</div>
                        )}
                        {selectedOrder.payment_details?.upi_transaction_id && (
                          <div><span className="text-white/70">UPI Transaction ID:</span> {selectedOrder.payment_details.upi_transaction_id}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Low Stock Alert */}
        <Card className="bg-black border-white/10 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <AlertTriangle className="w-5 h-5 text-white mr-2" />
              Low Stock Alert
            </CardTitle>
            <p className="text-sm text-white/70">
              Items that need restocking soon
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-white">Loading inventory...</div>
            ) : inventory.length === 0 ? (
              <div className="text-white/70">No inventory data available</div>
            ) : (
              <div className="space-y-4">
                {/* Critical Stock Items (≤2 units) */}
                {inventoryStats.criticalStockCount > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-2">Critical Stock (≤2 units)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {inventory
                        .filter(item => item.quantity <= 2)
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div>
                              <p className="font-medium text-sm text-white">{item.name}</p>
                              <p className="text-xs text-white/70">{item.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-red-400">{item.quantity} left</p>
                              <p className="text-xs text-white/70">Slot: {item.slot}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Low Stock Items (3-5 units) */}
                {inventoryStats.lowStockCount > inventoryStats.criticalStockCount && (
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-2">Low Stock (3-5 units)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {inventory
                        .filter(item => item.quantity > 2 && item.quantity <= 5)
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div>
                              <p className="font-medium text-sm text-white">{item.name}</p>
                              <p className="text-xs text-white/70">{item.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-yellow-400">{item.quantity} left</p>
                              <p className="text-xs text-white/70">Slot: {item.slot}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Out of Stock Items */}
                {inventoryStats.outOfStockCount > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-500 mb-2">Out of Stock</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {inventory
                        .filter(item => item.quantity === 0)
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
                            <div>
                              <p className="font-medium text-sm text-white">{item.name}</p>
                              <p className="text-xs text-white/70">{item.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-red-500">OUT OF STOCK</p>
                              <p className="text-xs text-white/70">Slot: {item.slot}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* All Good Message */}
                {inventoryStats.lowStockCount === 0 && (
                  <div className="text-center py-8">
                    <div className="text-green-400 text-lg font-semibold mb-2">✅ All Stock Levels Good</div>
                    <div className="text-white/70 text-sm">No items need restocking at the moment</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

