import React from 'react';
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedMachine: string;
  onSelectMachine: (id: string) => void;
}

export const AdminLayout = ({ collapsed, onToggle, selectedMachine, onSelectMachine }: AdminLayoutProps) => {
  return (
    <div className="flex h-screen bg-black text-white">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={onToggle}
        onSelectMachine={onSelectMachine}
        selectedMachine={selectedMachine}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-black">
          <Outlet context={{ machineId: selectedMachine }} />
        </main>
      </div>
    </div>
  );
};