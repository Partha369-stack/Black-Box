import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export const Sales = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [upiSearch, setUpiSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch orders from backend
  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    if (data.success) {
      setOrders(data.orders);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // Removed WebSocket
    return () => {
      // Removed cleanup
    };
  }, []);

  // --- Sales by Product ---
  const productMap: Record<string, { name: string; units: number; revenue: number }> = {};
  orders.forEach(order => {
    if (order.paymentStatus !== "paid") return;
    order.items.forEach((item: any) => {
      if (!productMap[item.name]) {
        productMap[item.name] = { name: item.name, units: 0, revenue: 0 };
      }
      productMap[item.name].units += item.quantity;
      productMap[item.name].revenue += item.price * item.quantity;
    });
  });
  const products = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);
  const maxUnits = Math.max(...products.map(p => p.units), 1);

  // --- Orders Table Filtering ---
  let filteredOrders = orders;
  if (statusFilter !== "all") filteredOrders = filteredOrders.filter(o => o.paymentStatus === statusFilter);
  if (minAmount) filteredOrders = filteredOrders.filter(o => o.totalAmount >= Number(minAmount));
  if (maxAmount) filteredOrders = filteredOrders.filter(o => o.totalAmount <= Number(maxAmount));
  if (itemSearch) filteredOrders = filteredOrders.filter(o => o.items.some((item: any) => item.name.toLowerCase().includes(itemSearch.toLowerCase())));
  if (upiSearch) filteredOrders = filteredOrders.filter(o => o.vpa && o.vpa.toLowerCase().includes(upiSearch.toLowerCase()));
  if (phoneSearch) filteredOrders = filteredOrders.filter(o => o.customerPhone && o.customerPhone.includes(phoneSearch));
  filteredOrders = filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination
  const pagedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  // --- Popularity Stars ---
  function getStars(units: number) {
    if (units >= maxUnits * 0.8) return 4;
    if (units >= maxUnits * 0.5) return 3;
    if (units >= maxUnits * 0.2) return 2;
    return 1;
  }

  // --- UPI Payment Statistics ---
  const upiPayments = orders.filter(o => o.paymentStatus === "paid" && o.vpa);
  const uniqueUpiUsers = new Set(upiPayments.map(o => o.vpa)).size;
  const totalUpiRevenue = upiPayments.reduce((sum, o) => sum + o.totalAmount, 0);
  const upiPaymentCount = upiPayments.length;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Total Sales</h1>
      
      {/* UPI Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black border-white/10 shadow-card">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{uniqueUpiUsers}</div>
              <div className="text-sm text-white/70">Unique UPI Users</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black border-white/10 shadow-card">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{upiPaymentCount}</div>
              <div className="text-sm text-white/70">UPI Payments</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black border-white/10 shadow-card">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">₹{totalUpiRevenue}</div>
              <div className="text-sm text-white/70">UPI Revenue</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sales by Product */}
      <Card className="bg-black border-white/10 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Sales by Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Units Sold</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Revenue</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Popularity</th>
                </tr>
              </thead>
              <tbody className="bg-black divide-y divide-white/10">
                {products.slice(0, 5).map((p) => (
                  <tr key={p.name}>
                    <td className="px-4 py-2 text-white">{p.name}</td>
                    <td className="px-4 py-2 text-white">{p.units}</td>
                    <td className="px-4 py-2 text-white">₹{p.revenue}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-2 bg-white" style={{ width: `${(p.units / maxUnits) * 100}%` }} />
                        </div>
                        <span>{'★'.repeat(getStars(p.units))}{'☆'.repeat(4 - getStars(p.units))}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Orders Table & Filters */}
      <Card className="bg-black border-white/10 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Orders Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-white mb-1">Order Status</label>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-black text-white border-white/20 rounded px-2 py-1">
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white mb-1">Min Amount</label>
              <Input type="number" value={minAmount} onChange={e => { setMinAmount(e.target.value); setPage(1); }} className="bg-black text-white border-white/20" />
            </div>
            <div>
              <label className="block text-xs text-white mb-1">Max Amount</label>
              <Input type="number" value={maxAmount} onChange={e => { setMaxAmount(e.target.value); setPage(1); }} className="bg-black text-white border-white/20" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-white mb-1">Item Search</label>
              <Input value={itemSearch} onChange={e => { setItemSearch(e.target.value); setPage(1); }} className="bg-black text-white border-white/20" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-white mb-1">UPI Search</label>
              <Input placeholder="Search by UPI ID..." value={upiSearch} onChange={e => { setUpiSearch(e.target.value); setPage(1); }} className="bg-black text-white border-white/20" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-white mb-1">Phone Search</label>
              <Input placeholder="Search by phone..." value={phoneSearch} onChange={e => { setPhoneSearch(e.target.value); setPage(1); }} className="bg-black text-white border-white/20" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Order ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Date & Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Items</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">UPI Details</th>
                </tr>
              </thead>
              <tbody className="bg-black divide-y divide-white/10">
                {pagedOrders.map(order => (
                  <tr key={order.orderId}>
                    <td className="px-4 py-2 text-white font-mono">{order.orderId}</td>
                    <td className="px-4 py-2 text-white">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</td>
                    <td className="px-4 py-2 text-white/80">
                      {order.customerName ? (
                        <span className="text-green-400 font-medium">{order.customerName}</span>
                      ) : (
                        <span className="text-white/40 text-xs">Anonymous</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-white/80">
                      {order.customerPhone ? (
                        <span className="text-yellow-400 font-medium">{order.customerPhone}</span>
                      ) : (
                        <span className="text-white/40 text-xs">Not provided</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-white/80">{order.items.map((item: any) => item.name).join(", ")}</td>
                    <td className="px-4 py-2 text-white">₹{order.totalAmount}</td>
                    <td className="px-4 py-2">
                      <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"} className="capitalize text-white bg-black border-white/20">
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-white/80">
                      {order.vpa ? (
                        <div className="text-xs">
                          <div className="font-medium text-blue-400">{order.vpa}</div>
                          <div className="text-white/60">{order.payer_account_type || 'UPI'}</div>
                        </div>
                      ) : (
                        <span className="text-white/40 text-xs">Not available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-white/70 text-xs">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="bg-black text-white border-white/20" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button size="sm" variant="outline" className="bg-black text-white border-white/20" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};