import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Suppress WebGL warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('uCycleColor1 uniform is missing a value parameter')) {
    return; // Suppress this specific WebGL warning
  }
  originalWarn.apply(console, args);
};
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { Button } from "../ui/button";

const chartConfig = {
  sales: {
    label: "Sales (₹)",
    color: "#fff",
  },
  count: {
    label: "Order Count",
    color: "#fff",
  },
};

interface SalesChartProps {
  machineId: string;
}

const SalesChart = memo(({ machineId }: SalesChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [mode, setMode] = useState<'sales' | 'count'>('sales');

  const fetchChartData = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", {
        headers: {
          'X-Tenant-ID': machineId
        }
      });
      const data = await res.json();
      if (data.success) {
        const orders = data.orders.filter((o: any) => o.paymentStatus === "paid");
        if (range === 'weekly') {
          const today = new Date();
          const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - i));
            return d;
          });
          const salesByDay = days.map((date) => {
            const label = date.toLocaleDateString(undefined, { weekday: 'short' });
            const filtered = orders.filter((o: any) => {
              if (!o.createdAt) return false;
              const d = new Date(o.createdAt);
              return d.getFullYear() === date.getFullYear() &&
                     d.getMonth() === date.getMonth() &&
                     d.getDate() === date.getDate();
            });
            return {
              label,
              sales: filtered.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
              count: filtered.length
            };
          });
          setChartData(salesByDay);
        } else if (range === 'daily') {
          const now = new Date();
          const hours = Array.from({ length: 24 }, (_, i) => i);
          const salesByHour = hours.map((hour) => {
            const label = `${hour}:00`;
            const filtered = orders.filter((o: any) => {
              if (!o.createdAt) return false;
              const d = new Date(o.createdAt);
              return d.getFullYear() === now.getFullYear() &&
                     d.getMonth() === now.getMonth() &&
                   d.getDate() === now.getDate() &&
                   d.getHours() === hour;
          });
          return {
            label,
            sales: filtered.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
            count: filtered.length
          };
        });
        setChartData(salesByHour);
      } else if (range === 'monthly') {
        const now = new Date();
        const months = Array.from({ length: 12 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          return d;
        });
        const salesByMonth = months.map((date) => {
          const label = date.toLocaleString(undefined, { month: 'short', year: '2-digit' });
          const year = date.getFullYear();
          const month = date.getMonth();
          const filtered = orders.filter((o: any) => {
            if (!o.createdAt) return false;
            const d = new Date(o.createdAt);
            return d.getFullYear() === year && d.getMonth() === month;
          });
          return {
            label,
            sales: filtered.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
            count: filtered.length
          };
        });
        setChartData(salesByMonth);
      }
    }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData([]);
    }
  }, [machineId, range]);

  useEffect(() => {
    fetchChartData();

    // TODO: Re-enable WebSocket when Socket.IO client is properly configured
    // For now, chart will update when user navigates or refreshes
    console.log('[SalesChart] Chart data fetched, WebSocket temporarily disabled');

  }, [range, mode, machineId, fetchChartData]);

  // Memoized description to prevent unnecessary re-renders
  const chartDescription = useMemo(() => {
    if (range === 'weekly') return mode === 'sales' ? 'Sales performance over the last 7 days' : 'Order count over the last 7 days';
    if (range === 'daily') return mode === 'sales' ? 'Sales by hour for today' : 'Order count by hour for today';
    if (range === 'monthly') return mode === 'sales' ? 'Sales by month for the last year' : 'Order count by month for the last year';
    return '';
  }, [range, mode]);

  // Memoized button handlers to prevent unnecessary re-renders
  const handleRangeChange = useCallback((newRange: 'daily' | 'weekly' | 'monthly') => {
    setRange(newRange);
  }, []);

  const handleModeChange = useCallback((newMode: 'sales' | 'count') => {
    setMode(newMode);
  }, []);

  return (
    <Card className="bg-black border-white/10 shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-white">
              Sales Trend
            </CardTitle>
            <p className="text-sm text-white/70">
              {chartDescription}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={range === 'daily' ? 'default' : 'outline'} className={range === 'daily' ? 'bg-white text-black hover:text-black' : 'bg-black text-white border-white/20 hover:text-black'} onClick={() => handleRangeChange('daily')}>Daily</Button>
            <Button size="sm" variant={range === 'weekly' ? 'default' : 'outline'} className={range === 'weekly' ? 'bg-white text-black hover:text-black' : 'bg-black text-white border-white/20 hover:text-black'} onClick={() => handleRangeChange('weekly')}>Weekly</Button>
            <Button size="sm" variant={range === 'monthly' ? 'default' : 'outline'} className={range === 'monthly' ? 'bg-white text-black hover:text-black' : 'bg-black text-white border-white/20 hover:text-black'} onClick={() => handleRangeChange('monthly')}>Monthly</Button>
            <Button size="sm" variant={mode === 'sales' ? 'default' : 'outline'} className={mode === 'sales' ? 'bg-white text-black hover:text-black' : 'bg-black text-white border-white/20 hover:text-black'} onClick={() => handleModeChange('sales')}>Total Sales</Button>
            <Button size="sm" variant={mode === 'count' ? 'default' : 'outline'} className={mode === 'count' ? 'bg-white text-black hover:text-black' : 'bg-black text-white border-white/20 hover:text-black'} onClick={() => handleModeChange('count')}>Order Count</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              stroke="#fff"
              className="text-xs text-white/70"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              stroke="#fff"
              className="text-xs text-white/70"
              allowDecimals={false}
              tickFormatter={mode === 'sales' ? (v) => `₹${v}` : (v) => v}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey={mode}
              stroke="#fff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
});

SalesChart.displayName = 'SalesChart';

export { SalesChart };