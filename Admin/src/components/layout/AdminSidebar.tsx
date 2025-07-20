import { NavLink, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  Menu
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onSelectMachine: (id: string) => void;
  selectedMachine: string;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: TrendingUp },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const AdminSidebar = ({ collapsed, onToggle, onSelectMachine, selectedMachine }: AdminSidebarProps) => {
  const location = useLocation();
  const [machineStatuses, setMachineStatuses] = useState<Record<string, { status: string; lastHeartbeat?: string }>>({});
  // Removed unused toast for now
  // const { toast } = useToast();
  const [machines, setMachines] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const loadMachines = () => {
      const storedMachines = localStorage.getItem('machines');
      if (storedMachines) {
        try {
          const parsedMachines = JSON.parse(storedMachines);
          setMachines(Array.isArray(parsedMachines) ? parsedMachines : []);
        } catch (e) {
          console.error('Error parsing machines from localStorage:', e);
          setMachines([]);
        }
      } else {
        // Initialize with default machines if none exist
        const defaultMachines = [
          { id: 'VM-001', name: 'Vending Machine 001' },
          { id: 'VM-002', name: 'Vending Machine 002' }
        ];
        localStorage.setItem('machines', JSON.stringify(defaultMachines));
        setMachines(defaultMachines);
      }
    };

    loadMachines();
  }, []);

  // Function to fetch initial machine statuses
  const fetchMachineStatuses = async () => {
    try {
      const newStatuses: Record<string, { status: string; lastHeartbeat?: string }> = {};
      for (const machine of machines) {
        const response = await fetch('/api/machine/status', {
          headers: {
            'X-Tenant-ID': machine.id
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} for ${machine.id}`);
        }
        const data = await response.json();
        newStatuses[machine.id] = { status: data.status, lastHeartbeat: data.lastHeartbeat };
      }
      setMachineStatuses(newStatuses);
    } catch (error) {
      console.error('Failed to fetch machine statuses:', error);
    }
  };

  // Set up WebSocket connection and initial status check
  useEffect(() => {
    // Removed WebSocket connection and handlers
    // Keep initial and periodic status checks
    const statusCheckInterval = setInterval(() => {
      fetchMachineStatuses().catch(error => {
        console.error('Error in periodic status check:', error);
      });
    }, 30000);

    fetchMachineStatuses().catch(error => {
      console.error('Error in initial status check:', error);
    });

    return () => {
      clearInterval(statusCheckInterval);
    };
  }, [fetchMachineStatuses]);

  // Function to get status badge with tooltip
  const getStatusBadge = (status: string, machineId: string) => {
    const statusInfo = machineStatuses[machineId] || { status: 'unknown' };
    const lastSeen = statusInfo.lastHeartbeat 
      ? new Date(statusInfo.lastHeartbeat).toLocaleString() 
      : 'Never';
    
    let statusElement;
    switch (status) {
      case 'online':
        statusElement = (
          <span 
            className="h-2 w-2 rounded-full bg-green-500"
            title={`Online (Last seen: ${lastSeen})`}
          />
        );
        break;
      case 'offline':
        statusElement = (
          <span 
            className="h-2 w-2 rounded-full bg-red-500"
            title={`Offline (Last seen: ${lastSeen})`}
          />
        );
        break;
      default:
        statusElement = (
          <span 
            className="h-2 w-2 rounded-full bg-yellow-500"
            title={`Unknown status (Last seen: ${lastSeen})`}
          />
        );
    }
    
    return (
      <div className="relative group">
        {statusElement}
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          Status: {status}
          <br />
          Last seen: {lastSeen}
        </div>
      </div>
    );
  };

  return (
    <aside className={cn(
      "h-full flex-shrink-0 bg-black border-r border-white/10 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex-grow flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className={cn(
              "flex items-center space-x-3 transition-opacity duration-300",
              collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
            )}>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <img 
                  src="/logo/325ff5276f7bc224e0e3ee1dcd50e186.svg" 
                  alt="Black Box Logo" 
                  className="w-6 h-6"
                />
              </div>
              <span className="text-white font-bold">Black Box</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="text-white hover:bg-white/10"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-lg p-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Machines section */}
          {!collapsed && machines.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between px-2 py-1">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Machines
                </h3>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-white/5 hover:text-white">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-1 space-y-1">
                {machines.map((machine) => {
                  const isSelected = machine.id === selectedMachine;
                  return (
                    <div
                      key={machine.id}
                      onClick={() => onSelectMachine(machine.id)}
                      className={cn(
                        "flex items-center rounded-lg p-2 text-sm cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-blue-500/10 text-blue-400" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {getStatusBadge(machineStatuses[machine.id]?.status || 'offline', machine.id)}
                      {!collapsed && <span className="ml-2 truncate">{machine.name}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};