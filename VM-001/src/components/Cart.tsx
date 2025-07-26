import React from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartProps {
  items: CartItem[];
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

const getImageUrl = (image: string) => {
  // If the image path is already a full URL, use it directly.
  if (image && (image.startsWith('http://') || image.startsWith('https://')))
    return image;

  // For relative paths from the backend, prepend the backend URL.
  // This now handles paths like '/<tenant-id>/Inventory/product_images/...'
  if (image && image.startsWith('/')) {
    return `https://black-box-production.up.railway.app${image}`;
  }

  // Fallback for any other case.
  return image;
};

const Cart = ({ items, onRemoveItem, onCheckout }: CartProps) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative" id="cart-button">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Order</SheetTitle>
          <SheetDescription>
            Review your selected items and proceed to checkout
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Your cart is empty
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-card rounded-lg">
                    <img 
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                
                <Button 
                  onClick={onCheckout}
                  className="w-full" 
                  size="lg"
                  disabled={items.length === 0}
                >
                  Proceed to Payment
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
