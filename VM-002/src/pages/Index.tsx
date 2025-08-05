import React, { useState, useEffect, useRef } from 'react';
import VendingHeader from '@/components/VendingHeader';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import PaymentModal from '@/components/PaymentModal';
import { CustomerInfoModal } from '@/components/CustomerInfoModal';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
// Embedded API function to avoid import issues in Railway
const customFetch = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'x-tenant-id': 'VM-002',
    'x-api-key': 'blackbox-api-key-2024'
  };

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });
};

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const MACHINE_ID = 'VM-002';

const Index = () => {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerInfoModalOpen, setIsCustomerInfoModalOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>(undefined);
  const [qrCodeId, setQrCodeId] = useState<string | undefined>(undefined);
  const [qrError, setQrError] = useState<string | undefined>(undefined);
  const [lastOrderRequest, setLastOrderRequest] = useState<{items: any[], totalAmount: number} | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await customFetch(`https://black-box-production.up.railway.app/api/inventory`, {
        headers: {
          'x-tenant-id': MACHINE_ID
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        // Convert backend inventory format to UI product format
        const newProducts = data.inventory.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          description: item.description,
          stock: item.quantity
        }));
        
        // Check for stock changes and show notifications
        if (products.length > 0) {
          newProducts.forEach((newProduct) => {
            const oldProduct = products.find(p => p.id === newProduct.id);
            if (oldProduct && newProduct.stock < oldProduct.stock) {
              const sold = oldProduct.stock - newProduct.stock;
              toast({
                title: "Stock Updated",
                description: `${sold} unit(s) of ${newProduct.name} sold. Stock: ${newProduct.stock}`,
                duration: 3000,
              });
            }
          });
        }
        
        setProducts(newProducts);
      } else {
        console.error('Failed to load products: API returned unsuccessful response.');
      }
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize products if empty
  const initializeProducts = async () => {
    try {
      const res = await customFetch("https://black-box-production.up.railway.app/api/inventory/init");
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to initialize products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    
  }, []);

  // Removed connectWebSocket function

  useEffect(() => {
    fetchProducts();
    // Removed initial connection
    return () => {
      // Removed cleanup
    };
  }, []);

    // Initialize products if none exist
  useEffect(() => {
    if (products.length === 0 && !loading) {
      initializeProducts();
    }
  }, [products.length, loading]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  const getCartItems = (): CartItem[] => {
    return Object.entries(cart)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId)!;
        return {
          id: productId,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image
        };
      });
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: 0
    }));
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const requestOrderAndQr = async (cartItems: any[], totalAmount: number, customerInfo?: { name: string; phone: string }) => {
    try {
      const response = await fetch('https://black-box-production.up.railway.app/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': MACHINE_ID
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount,
          customerName: customerInfo?.name || null,
          customerPhone: customerInfo?.phone || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('Response status:', response.status);
        console.error('Response data:', data);
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      // Validate that we have a real Razorpay QR code
      const qrUrl = data.qrCodeUrl;
      if (!qrUrl || (!qrUrl.includes('rzp.io') && !qrUrl.includes('razorpay'))) {
        console.error('Invalid QR code URL:', qrUrl);
        throw new Error('Only Razorpay QR codes are supported. QR generation failed.');
      }

      setOrderId(data.orderId);
      setQrCodeUrl(data.qrCodeUrl);
      setQrCodeId(data.qrCodeId);
      setQrError(undefined); // Clear any previous errors
      toast({
        title: "Order Placed!",
        description: `Order ID: ${data.orderId}`,
      });
    } catch (error) {
      console.error('Order error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not place order. Please try again.';
      setQrError(errorMessage);
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive"
      });
      // Don't close the modal, show error instead
    }
  };

  const handleCheckout = async () => {
    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setLastOrderRequest({ items: cartItems, totalAmount });
    setIsCustomerInfoModalOpen(true);
  };

  const handleCustomerInfoSubmit = async (customerInfo: { name: string; phone: string }) => {
    setIsCustomerInfoModalOpen(false);
    setIsPaymentModalOpen(true);
    setOrderId(undefined);
    setQrCodeUrl(undefined);
    setQrCodeId(undefined);
    if (lastOrderRequest) {
      await requestOrderAndQr(lastOrderRequest.items, lastOrderRequest.totalAmount, customerInfo);
    }
  };

  const handleRetry = async () => {
    if (lastOrderRequest) {
      setOrderId(undefined);
      setQrCodeUrl(undefined);
      setQrCodeId(undefined);
      setQrError(undefined);
      await requestOrderAndQr(lastOrderRequest.items, lastOrderRequest.totalAmount);
    }
  };

  const cartItems = getCartItems();
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* <h1 style={{ textAlign: 'center', margin: '1rem 0', fontSize: '2rem', fontWeight: 'bold' }}>Vending Machine 2</h1> */}
      <VendingHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Inter, Orbitron, sans-serif', letterSpacing: '1px' }}>Choose Your Snacks</h2>
            <p className="text-muted-foreground" style={{ fontFamily: 'Poppins', fontSize: '16px' }}>Fresh snacks and beverages available 24/7</p>
          </div>
          <Cart 
            items={cartItems}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
          />
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg text-white">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-lg text-white">No products available</div>
            <button 
              onClick={initializeProducts}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
            >
              Initialize Products
            </button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            style={{ perspective: 800 }}
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
                        {products.map((product) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ProductCard
                  product={product}
                  quantity={cart[product.id] || 0}
                  onQuantityChange={handleQuantityChange}
                  onAddToCart={() => {}}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {cartItems.length > 0 && (
          <div className="fixed bottom-4 right-4 md:hidden">
            <Cart 
              items={cartItems}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
            />
          </div>
        )}
      </main>
      
      <CustomerInfoModal
        isOpen={isCustomerInfoModalOpen}
        onClose={() => setIsCustomerInfoModalOpen(false)}
        onSubmit={handleCustomerInfoSubmit}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cartItems={cartItems}
        totalAmount={totalAmount}
        orderId={orderId}
        qrCodeUrl={qrCodeUrl}
        qrCodeId={qrCodeId}
        qrError={qrError}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default Index;
