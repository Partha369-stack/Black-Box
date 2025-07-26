import React from 'react';
import { Bell, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export const AdminHeader = () => {
  return (
    <header className="bg-black border-b border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center p-0"
            >
              3
            </Badge>
          </Button>
          <Button variant="ghost" className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span className="hidden md:inline">Admin</span>
          </Button>
        </div>
      </div>
    </header>
  );
};