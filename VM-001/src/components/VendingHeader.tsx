import React from 'react';
import { Box, Sun, Moon } from 'lucide-react';
import { useTheme } from "@/components/ThemeProvider";
import { Button } from './ui/button';
import BlackBoxLogo from './BlackBoxLogo';

const VendingHeader = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-border bg-transparent backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg">
              <BlackBoxLogo size={48} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '28px', fontWeight: 800, textTransform: 'uppercase', color: theme === 'dark' ? '#FFFFFF' : '#000000', letterSpacing: '1px', textShadow: 'none' }}>Black Box</h1>
              <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '12px', fontWeight: 400, color: theme === 'dark' ? '#39FF14' : '#555555', marginTop: '0px', letterSpacing: '0.5px', textShadow: 'none' }}>Think Out of Box</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">Quick & Easy</p>
              <p className="text-xs text-muted-foreground">Select • Pay • Enjoy</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default VendingHeader;
