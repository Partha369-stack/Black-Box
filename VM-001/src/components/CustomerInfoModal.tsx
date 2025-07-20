import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customerInfo: { name: string; phone: string }) => void;
}

export const CustomerInfoModal = ({ isOpen, onClose, onSubmit }: CustomerInfoModalProps) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const handleSubmit = () => {
    if (customerName.trim() && customerPhone.trim()) {
      onSubmit({ name: customerName.trim(), phone: customerPhone.trim() });
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setCustomerPhone('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white text-black border-gray-200 dark:bg-black dark:text-white dark:border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black dark:text-white">
            Customer Information
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-600 text-sm dark:text-white/70">
            Please provide your details for better service and order tracking
          </p>
          <div>
            <Label htmlFor="customerName" className="text-black dark:text-white">Your Name *</Label>
            <Input
              id="customerName"
              placeholder="Enter your full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 bg-white text-black border-gray-300 placeholder-gray-500 dark:bg-black dark:text-white dark:border-white/20 dark:placeholder-white/50"
              required
            />
          </div>
          <div>
            <Label htmlFor="customerPhone" className="text-black dark:text-white">Phone Number *</Label>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="Enter your phone number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="mt-1 bg-white text-black border-gray-300 placeholder-gray-500 dark:bg-black dark:text-white dark:border-white/20 dark:placeholder-white/50"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleClose}
              variant="outline"
              className="flex-1 bg-white text-black border-gray-300 hover:bg-gray-50 dark:bg-black dark:text-white dark:border-white/20 dark:hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!customerName.trim() || !customerPhone.trim()}
              className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-white/80"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 