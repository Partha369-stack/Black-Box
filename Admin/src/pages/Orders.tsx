import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Download, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as ReactCalendar } from "@/components/ui/calendar";
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

      const matchesStatus = statusFilter === "all" || order.paymentStatus === statusFilter;
      
      const matchesSearchTerm = !searchTerm || 
        (order.orderId && order.orderId.toLowerCase().includes(lowerSearchTerm)) ||
        order.items.some((item: any) => item.name.toLowerCase().includes(lowerSearchTerm));

      const matchesCustomer = !customerSearch ||
        (order.customerName && order.customerName.toLowerCase().includes(lowerCustomerSearch));
        
      const matchesPhone = !phoneSearch ||
        (order.customerPhone && order.customerPhone.includes(phoneSearch));

      const orderDate = new Date(order.createdAt);
      const matchesDate = !dateRange || !dateRange.from || (
        orderDate >= dateRange.from &&
        (!dateRange.to || orderDate <= dateRange.to)
      );

      return matchesStatus && matchesSearchTerm && matchesCustomer && matchesPhone && matchesDate;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(sortedOrders.length / pageSize);
  const pagedOrders = sortedOrders.slice((page - 1) * pageSize, page * pageSize);

  const getStatusBadgeVariant = (status: string) => {
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

  const exportToCSV = () => {
    const headers = ["Order ID", "Customer", "Phone", "Items", "Quantity", "Total", "Status", "UPI VPA", "Account Type", "Timestamp"];
    const csvContent = [
      headers.join(","),
      ...sortedOrders.map(order => [
        order.orderId,
        order.customerName || "Anonymous",
        order.customerPhone || "Not provided",
        `"${order.items.map((item: any) => item.name).join(", ")}"`,
        order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        order.totalAmount,
        order.paymentStatus,
        order.vpa || "Not provided",
        order.payer_account_type || "UPI",
        order.createdAt ? new Date(order.createdAt).toLocaleString() : ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders-export.csv";
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
                  <TableHead className="font-semibold text-white border-r border-white/5">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedOrders.map((order, index) => (
                  <TableRow
                    key={order.orderId}
                    className={`hover:bg-white/5 cursor-pointer border-b border-white/5 ${index % 2 === 0 ? 'bg-white/2' : 'bg-black'}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell className="font-medium text-white border-r border-white/5">{order.orderId}</TableCell>
                    <TableCell className="text-white/80 border-r border-white/5">
                      {order.customerName ? (
                        <span className="text-green-400 font-medium">{order.customerName}</span>
                      ) : (
                        <span className="text-white/40 text-xs">Anonymous</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white/80 border-r border-white/5">
                      {order.customerPhone ? (
                        <span className="text-yellow-400 font-medium">{order.customerPhone}</span>
                      ) : (
                        <span className="text-white/40 text-xs">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-white/80 border-r border-white/5">{order.items.map((item: any) => item.name).join(", ")}</TableCell>
                    <TableCell className="text-white/80 border-r border-white/5">{order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}</TableCell>
                    <TableCell className="font-semibold text-white border-r border-white/5">₹{order.totalAmount}</TableCell>
                    <TableCell className="border-r border-white/5">
                      <Badge 
                        variant={getStatusBadgeVariant(order.paymentStatus).variant}
                        className={getStatusBadgeVariant(order.paymentStatus).className}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/80 border-r border-white/5">
                      {order.vpa ? (
                        <div className="text-xs">
                          <div className="font-medium">{order.vpa}</div>
                          <div className="text-white/60">{order.payer_account_type || 'UPI'}</div>
                        </div>
                      ) : (
                        <span className="text-white/40 text-xs">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-white/60">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
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
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <div id="order-details-description" className="sr-only">
            Detailed information about the selected order including items, status, and payment details
          </div>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Order ID:</span> {selectedOrder.orderId}
              </div>
              <div>
                <span className="font-semibold">Status:</span> <Badge variant={getStatusBadgeVariant(selectedOrder.paymentStatus)}>{selectedOrder.paymentStatus}</Badge>
              </div>
              <div>
                <span className="font-semibold">Total Amount:</span> ₹{selectedOrder.totalAmount}
              </div>
              <div>
                <span className="font-semibold">Created At:</span> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ""}
              </div>
              <div>
                <span className="font-semibold">Updated At:</span> {selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString() : ""}
              </div>
              <div>
                <span className="font-semibold">Items:</span>
                <ul className="list-disc ml-6 mt-2">
                  {selectedOrder.items.map((item: any) => (
                    <li key={item.id}>
                      {item.name} × {item.quantity} — ₹{item.price} each
                    </li>
                  ))}
                </ul>
              </div>
              {selectedOrder.customerName && (
                <div>
                  <span className="font-semibold">Customer Name:</span> {selectedOrder.customerName}
                </div>
              )}
              {selectedOrder.customerPhone && (
                <div>
                  <span className="font-semibold">Phone Number:</span> {selectedOrder.customerPhone}
                </div>
              )}
              {selectedOrder.vpa && (
                <div>
                  <span className="font-semibold">UPI Payment Details:</span>
                  <div className="mt-2 p-3 bg-white/5 rounded-lg">
                    <div><span className="text-white/70">VPA:</span> {selectedOrder.vpa}</div>
                    <div><span className="text-white/70">Account Type:</span> {selectedOrder.payer_account_type || 'UPI'}</div>
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
