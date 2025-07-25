import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  className?: string;
  showInSidebar?: boolean;
}

export const PerformanceMonitor = ({ className, showInSidebar = false }: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    // Measure initial load time
    const loadTime = performance.now();

    // Measure render time
    const renderStart = performance.now();

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;

      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize;

      setMetrics({
        loadTime,
        renderTime,
        memoryUsage: memoryUsage ? Math.round(memoryUsage / 1024 / 1024) : undefined
      });
    });
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null;
  }

  if (showInSidebar) {
    return (
      <div className={`bg-white/5 text-white p-3 rounded-lg text-xs font-mono border border-white/10 ${className}`}>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Performance
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Load:</span>
            <span className="text-green-400">{metrics.loadTime.toFixed(0)}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Render:</span>
            <span className="text-blue-400">{metrics.renderTime.toFixed(0)}ms</span>
          </div>
          {metrics.memoryUsage && (
            <div className="flex justify-between">
              <span className="text-gray-400">Memory:</span>
              <span className="text-yellow-400">{metrics.memoryUsage}MB</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono border border-white/20 z-50">
      <div className="space-y-1">
        <div>Load: {metrics.loadTime.toFixed(2)}ms</div>
        <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
        {metrics.memoryUsage && (
          <div>Memory: {metrics.memoryUsage}MB</div>
        )}
      </div>
    </div>
  );
};
