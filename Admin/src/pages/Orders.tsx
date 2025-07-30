import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Calendar, Download, Filter, FileText, X } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";
import { Calendar as ReactCalendar } from "../components/ui/calendar";
import { DateRange } from "react-day-picker";

interface OutletContext {
  machineId: string;
}

export const Orders = () => {
  const { machineId } = useOutletContext<OutletContext>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'X-Tenant-ID': machineId,
            'X-API-Key': import.meta.env.VITE_API_KEY || 'blackbox-api-key-2024'
          }
        });
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        } else {
          console.error('API Error:', data.error || 'Unknown error');
          setError(data.error || "Failed to fetch orders");
        }
      } catch (err: any) {
        console.error('Fetch Error:', err);
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [machineId]);

  const sortedOrders = orders
    .filter(order => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const lowerCustomerSearch = customerSearch.toLowerCase();

      // Handle both field name formats (snake_case and camelCase)
      const paymentStatus = order.payment_status || order.paymentStatus;
      const orderId = order.order_id || order.orderId;
      const customerName = order.customer_name || order.customerName;
      const customerPhone = order.customer_phone || order.customerPhone;
      const createdAt = order.created_at || order.createdAt;

      const matchesStatus = statusFilter === "all" || paymentStatus === statusFilter;

      const matchesSearchTerm = !searchTerm ||
        (orderId && orderId.toLowerCase().includes(lowerSearchTerm)) ||
        (order.items && Array.isArray(order.items) && order.items.some((item: any) =>
          item.name && item.name.toLowerCase().includes(lowerSearchTerm)
        ));

      const matchesCustomer = !customerSearch ||
        (customerName && customerName.toLowerCase().includes(lowerCustomerSearch));

      const matchesPhone = !phoneSearch ||
        (customerPhone && customerPhone.includes(phoneSearch));

      const orderDate = new Date(createdAt);
      const matchesDate = !dateRange || !dateRange.from || (
        orderDate >= dateRange.from &&
        (!dateRange.to || orderDate <= dateRange.to)
      );

      return matchesStatus && matchesSearchTerm && matchesCustomer && matchesPhone && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt).getTime();
      const dateB = new Date(b.created_at || b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(sortedOrders.length / pageSize);
  const pagedOrders = sortedOrders.slice((page - 1) * pageSize, page * pageSize);

  const getStatusBadgeVariant = (status: string) => {
    if (!status) {
      return { variant: "secondary", className: "bg-secondary/20 hover:bg-secondary/30 text-white/60" };
    }
    
    switch (status.toLowerCase()) {
      case "paid": 
        return { variant: "default", className: "bg-green-500 hover:bg-green-600 text-black font-bold" };
      case "cancelled":
        return { variant: "secondary", className: "bg-gray-500/20 hover:bg-gray-500/30 text-white/60" };
      case "pending": 
        return { variant: "secondary", className: "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400" };
      case "failed": 
        return { variant: "destructive", className: "bg-red-500/20 hover:bg-red-500/30 text-red-400" };
      default: 
        return { variant: "secondary", className: "bg-secondary/20 hover:bg-secondary/30 text-white/60" };
    }
  };

  const downloadOrderSlip = (order: any) => {
    const orderId = order.order_id || order.orderId || 'N/A';
    const customerName = order.customer_name || order.customerName || 'Anonymous';
    const customerPhone = order.customer_phone || order.customerPhone || 'Not provided';
    const totalAmount = order.total_amount || order.totalAmount || 0;
    const paymentStatus = order.payment_status || order.paymentStatus || 'unknown';
    const createdAt = order.created_at || order.createdAt;
    const vpa = order.payment_details?.vpa || order.vpa || 'Not provided';
    const paymentMethod = order.payment_details?.method || order.payer_account_type || 'UPI';

    // Calculate totals
    const itemsTotal = order.items && Array.isArray(order.items) ?
      order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) : 0;
    const totalQuantity = order.items && Array.isArray(order.items) ?
      order.items.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0;

    // Create organized order slip content
    const orderSlipContent = `
╔═══════════════════════════════════════╗
║                BLACK BOX              ║
║           Smart Vending Machine       ║
╚═══════════════════════════════════════╝

┌─────────────────────────────────────────┐
│ RECEIPT                                 │
└─────────────────────────────────────────┘

Order ID: ${orderId}
Machine: ${machineId}
Date: ${createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}

┌─────────────────────────────────────────┐
│ CUSTOMER INFORMATION                    │
└─────────────────────────────────────────┘
Name: ${customerName}
Phone: ${customerPhone}

┌─────────────────────────────────────────┐
│ ORDER DETAILS                           │
└─────────────────────────────────────────┘
${order.items && Array.isArray(order.items) ?
  order.items.map((item: any, index: number) =>
    `${(index + 1).toString().padStart(2, '0')}. ${item.name}
    Qty: ${item.quantity} × ₹${item.price} = ₹${(item.price * item.quantity).toFixed(2)}`
  ).join('\n\n') :
  'No items found'
}

─────────────────────────────────────────
SUMMARY:
Total Items: ${totalQuantity}
Subtotal: ₹${itemsTotal.toFixed(2)}
${itemsTotal !== totalAmount ? `Taxes/Fees: ₹${(totalAmount - itemsTotal).toFixed(2)}` : ''}
─────────────────────────────────────────
TOTAL AMOUNT: ₹${totalAmount}
─────────────────────────────────────────

┌─────────────────────────────────────────┐
│ PAYMENT INFORMATION                     │
└─────────────────────────────────────────┘
Status: ${paymentStatus.toUpperCase()}
Method: ${paymentMethod}
${vpa !== 'Not provided' ? `UPI ID: ${vpa}` : ''}
${order.payment_details?.payment_id ? `Payment ID: ${order.payment_details.payment_id}` : ''}
${order.payment_details?.upi_transaction_id ? `UPI Txn ID: ${order.payment_details.upi_transaction_id}` : ''}

┌─────────────────────────────────────────┐
│ THANK YOU FOR YOUR PURCHASE!            │
│                                         │
│ Visit us again soon at Black Box        │
│ Smart Vending Machines                  │
│                                         │
│ For support: support@blackbox.com       │
│ Website: www.blackbox.com               │
└─────────────────────────────────────────┘

Generated on: ${new Date().toLocaleString()}
    `.trim();

    // Create and download the file
    const blob = new Blob([orderSlipContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BlackBox-Receipt-${orderId}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': machineId,
          'X-API-Key': import.meta.env.VITE_API_KEY || 'blackbox-api-key-2024'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Order Cancelled",
          description: "Order has been cancelled and inventory restored",
        });

        // Refresh orders list
        const fetchOrders = async () => {
          setLoading(true);
          setError(null);
          try {
            const response = await fetch('/api/orders', {
              headers: {
                'X-Tenant-ID': machineId,
                'X-API-Key': import.meta.env.VITE_API_KEY || 'blackbox-api-key-2024'
              }
            });
            const data = await response.json();
            if (data.success) {
              setOrders(data.orders);
            } else {
              console.error('API Error:', data.error || 'Unknown error');
              setError(data.error || "Failed to fetch orders");
            }
          } catch (err: any) {
            console.error('Fetch Error:', err);
            setError(err.message || "Failed to fetch orders");
          } finally {
            setLoading(false);
          }
        };
        fetchOrders();

        // Close dialog if the cancelled order was selected
        if (selectedOrder && (selectedOrder.order_id === orderId || selectedOrder.orderId === orderId)) {
          setSelectedOrder(null);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to cancel order",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Cancel order error:', error);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Items Detail",
      "Total Quantity",
      "Total Amount",
      "Status",
      "UPI VPA",
      "Payment Method",
      "Created At"
    ];

    const csvContent = [
      headers.join(","),
      ...sortedOrders.map(order => [
        order.order_id || order.orderId || 'N/A',
        `"${order.customer_name || order.customerName || "Anonymous"}"`,
        order.customer_phone || order.customerPhone || "Not provided",
        `"${order.items?.map((item: any) => `${item.name} x${item.quantity} @₹${item.price}`).join("; ") || "No items"}"`,
        order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
        order.total_amount || order.totalAmount || 0,
        order.payment_status || order.paymentStatus || 'unknown',
        order.payment_details?.vpa || order.vpa || "Not provided",
        order.payment_details?.method || order.payer_account_type || "UPI",
        order.created_at ? new Date(order.created_at).toLocaleString() : 
        order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-white">Loading orders...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders - {machineId}</h1>
          <p className="text-white/70">
            Manage and track all vending machine orders
          </p>
        </div>
        <Button onClick={exportToCSV} className="bg-white text-black hover:bg-white/80 shadow-glow">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>
      {/* Filters */}
      <Card className="bg-black border-white/10 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by Order ID or items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black text-white border-white/20 placeholder-white/50"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search by customer name..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="bg-black text-white border-white/20 placeholder-white/50"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search by phone number..."
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                className="bg-black text-white border-white/20 placeholder-white/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-black text-white border-white/20">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border-white/20">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative inline-block">
              <Button variant="outline" className="bg-black text-white border-white/20" onClick={() => setShowDatePicker(v => !v)}>
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </Button>
              {showDatePicker && (
                <div className="bg-black p-4 rounded-lg border border-white/20 mt-2 z-50 absolute right-0 top-full shadow-lg min-w-[260px]">
                  <ReactCalendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="bg-black text-white border-white/20" onClick={() => setShowDatePicker(false)}>Apply</Button>
                    <Button size="sm" variant="outline" className="bg-black text-white border-white/20" onClick={() => { setDateRange(undefined); setShowDatePicker(false); }}>Clear</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Orders Table */}
      <Card className="bg-black border-white/10 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Order History ({sortedOrders.length} orders)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/5 border-b border-white/5">
                  <TableHead className="font-semibold text-white border-r border-white/5">Order ID</TableHead>
                  <TableHead className="font-semibold text-white border-r border-white/5">Customer</TableHead>
                  <TableHead className="font-semibold text-white border-r border-white/5">Phone</TableHead>
                  <TableHead className="font-semibold text-white border-r border-white/5">Items</TableHead>
                  <TableHead className="font-semibold text-white border-r border-white/5">Qty</TableHead>
                  <TableHead className="font-semibold text-white border-r border-white/5">Total</TableHead>
                  <TableHead className="font-semibold text-white border-r border-white/5">Status</TableHead>
                  <TableHead className="font-semibold text-white border-r border-white/5">UPI Details</TableHead>
                  <TableHead className="font-semibold text-white">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedOrders.map((order, index) => (
                  <TableRow
                    key={order.order_id || order.orderId || `order-${index}`}
                    className={`hover:bg-white/5 cursor-pointer border-b border-white/5 ${index % 2 === 0 ? 'bg-white/2' : 'bg-black'}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell className="font-medium text-white border-r border-white/5">
                      {order.order_id || order.orderId || 'N/A'}
                    </TableCell>
                    <TableCell className="text-white/80 border-r border-white/5">
                      {order.customer_name || order.customerName ? (
                        <span className="text-green-400 font-medium">
                          {order.customer_name || order.customerName}
                        </span>
                      ) : (
                        <span className="text-white/40 text-xs">Anonymous</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white/80 border-r border-white/5">
                      {order.customer_phone || order.customerPhone ? (
                        <span className="text-yellow-400 font-medium">
                          {order.customer_phone || order.customerPhone}
                        </span>
                      ) : (
                        <span className="text-white/40 text-xs">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-white/80 border-r border-white/5">
                      {order.items?.map((item: any) => item.name).join(", ") || 'No items'}
                    </TableCell>
                    <TableCell className="text-white/80 border-r border-white/5">
                      {order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0}
                    </TableCell>
                    <TableCell className="font-semibold text-white border-r border-white/5">
                      ₹{order.total_amount || order.totalAmount || 0}
                    </TableCell>
                    <TableCell className="border-r border-white/5">
                      <Badge 
                        variant={getStatusBadgeVariant(order.payment_status || order.paymentStatus).variant}
                        className={getStatusBadgeVariant(order.payment_status || order.paymentStatus).className}
                      >
                        {order.payment_status || order.paymentStatus || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/80 border-r border-white/5">
                      {(order.payment_details?.vpa || order.vpa) ? (
                        <div className="text-xs">
                          <div className="font-medium">{order.payment_details?.vpa || order.vpa}</div>
                          <div className="text-white/60">
                            {order.payment_details?.method || order.payer_account_type || 'UPI'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-white/40 text-xs">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-white/60">
                      {order.created_at ? new Date(order.created_at).toLocaleString() :
                       order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-white/70 text-xs">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="bg-black text-white border-white/20" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button size="sm" variant="outline" className="bg-black text-white border-white/20" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg bg-black text-white border-white/20" aria-describedby="order-details-description">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Order Details</DialogTitle>
              {selectedOrder && (
                <Button
                  onClick={() => downloadOrderSlip(selectedOrder)}
                  size="sm"
                  variant="outline"
                  className="bg-black/50 border-white/20 hover:bg-white/10 text-white/80 hover:text-white text-xs px-2 py-1 h-7"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Receipt
                </Button>
              )}
            </div>
          </DialogHeader>
          <div id="order-details-description" className="sr-only">
            Detailed information about the selected order including items, status, and payment details
          </div>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Order ID:</span> {selectedOrder.order_id || selectedOrder.orderId || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Status:</span>
                <Badge
                  variant={getStatusBadgeVariant(selectedOrder.payment_status || selectedOrder.paymentStatus).variant}
                  className={getStatusBadgeVariant(selectedOrder.payment_status || selectedOrder.paymentStatus).className}
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
                  {selectedOrder.items && Array.isArray(selectedOrder.items) ?
                    selectedOrder.items.map((item: any, idx: number) => (
                      <li key={item.id || idx}>
                        {item.name} × {item.quantity} — ₹{item.price} each
                      </li>
                    )) :
                    <li>No items found</li>
                  }
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
  );
};






