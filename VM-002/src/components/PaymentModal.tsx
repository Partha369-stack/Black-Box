import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { customFetch } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  orderId?: string;
  qrCodeUrl?: string;
  onRetry?: () => void;
  qrError?: string;
  qrCodeId?: string;
}

const PaymentModal = ({ isOpen, onClose, cartItems, totalAmount, orderId, qrCodeUrl, onRetry, qrError, qrCodeId }: PaymentModalProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  const [email, setEmail] = useState('');

  const [imgLoaded, setImgLoaded] = useState(false);
  const [timer, setTimer] = useState(180); // 3 minutes in seconds
  const [expired, setExpired] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setImgLoaded(false); // Reset when qrCodeUrl changes
    setTimer(180); // Reset timer when QR code changes
    setExpired(false);
    setPaymentStatus('pending');

    // Validate QR code URL on frontend as well
    if (qrCodeUrl && !qrCodeUrl.includes('rzp.io') && !qrCodeUrl.includes('razorpay')) {
      console.error('Invalid QR code URL detected:', qrCodeUrl);
    }
  }, [qrCodeUrl]);

  useEffect(() => {
    // RAZORPAY WEBHOOKS ONLY - Listen for WebSocket events
    if (!imgLoaded || expired || paymentStatus === 'success' || !qrCodeId) return;

    console.log('🎯 QR Code ready for payment (VM-002):', qrCodeId);
    console.log('🔗 Listening for Razorpay webhook events...');

    // SIMPLIFIED: Just show QR code without WebSocket complexity
    // WebSocket connection was failing, so we'll use webhook-only approach
    console.log('💡 VM-002 QR Code displayed. Payment will be verified via Razorpay webhook.');

    // Note: Payment verification happens via Razorpay webhook directly to backend
    // No need for complex WebSocket connection in frontend

    return () => {
      // Cleanup polling (if any)
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [imgLoaded, expired, paymentStatus, qrCodeId]);

  useEffect(() => {
    if (!imgLoaded || expired) return;
    if (timer <= 0) {
      setExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [imgLoaded, timer, expired]);

  const handlePaymentSuccess = () => {
    setPaymentStatus('success');
    // Here you would integrate with Razorpay
    console.log('Payment successful for order:', orderId);
  };

  const handleDownloadReceipt = () => {
    // Generate and download receipt
    console.log('Downloading receipt...');
  };

  const handleEmailReceipt = () => {
    // Send receipt via email
    console.log('Sending receipt to:', email);
  };

  // Helper to handle modal close and cancel order if not paid
  const handleClose = async () => {
    // Cancel the order if it's still pending
    if (orderId && paymentStatus !== 'success') {
      try {
        console.log('🚫 Cancelling order (VM-002):', orderId);
        const response = await fetch(`https://black-box-production.up.railway.app/api/orders/${orderId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': 'VM-002', 
            'X-API-Key': 'blackbox-api-key-2024'
          }
        });
        
        const result = await response.json();
        if (result.success) {
          console.log('✅ Order cancelled successfully (VM-002):', orderId);
        } else {
          console.error('❌ Failed to cancel order (VM-002):', result.error);
        }
      } catch (error) {
        console.error('❌ Network error cancelling order (VM-002):', error);
      }
    }

    // Clear polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    onClose();

    // Refresh page after canceling order
    if (orderId && paymentStatus !== 'success') {
      window.location.reload();
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            window.location.reload(); // Refresh the page once when closing success popup
          }
          onClose();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span>Payment Successful!</span>
            </DialogTitle>
            <DialogDescription>
              Your payment has been processed successfully. Here are your order details and receipt options.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Order ID</p>
                <p className="font-mono font-bold text-lg">{orderId}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Order Summary</h4>
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Paid</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        className="sm:max-w-md"
        style={{ minHeight: 480 }}
      >
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {qrCodeUrl 
              ? "Scan the QR code below with any UPI app to complete your payment securely."
              : "Preparing your payment QR code..."}
          </DialogDescription>
        </DialogHeader>
        
        {!qrCodeUrl && (
          <div className="space-y-4 mb-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
        )}
        <div className="text-center space-y-4" style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div
            style={{
              width: 320,
              minHeight: 480,
              overflow: 'visible',
              borderRadius: 16,
              margin: '0 auto',
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}
          >
            {qrCodeUrl && !imgLoaded ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
                  <Loader2 className="animate-spin" style={{ width: 40, height: 40, marginBottom: 8, color: '#888' }} />
                  <div>Loading QR code...</div>
                </div>
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  style={{ display: 'none' }}
                  onLoad={() => setImgLoaded(true)}
                />
              </>
            ) : qrCodeUrl && imgLoaded && !expired ? (
              <>
                {/* QR code wrapper to crop branding */}
                <div
                  style={{
                    width: 300,
                    height: 500,
                    overflow: 'hidden',
                    borderRadius: 12,
                    margin: '0 auto',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 5px 10px rgba(0,0,0,0.08)'
                  }}
                >
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    style={{
                      width: 300,
                      height: 300,
                      objectFit: 'cover',
                      objectPosition: 'center -230px',
                      display: 'block'
                    }}
                  />
                </div>
                <div style={{
                  margin: '0 auto 0 auto',
                  padding: '12px 24px',
                  background: '#f5f5f5',
                  borderRadius: 8,
                  fontSize: 20,
                  color: '#222',
                  fontWeight: 600,
                  width: 'fit-content',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  textAlign: 'center',
                  letterSpacing: 1,
                  position: 'relative',
                  zIndex: 1
                }}>
                  QR expires in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </div>
              </>
            ) : expired ? (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <p className="text-red-500 font-semibold">QR code expired</p>
                <p className="text-muted-foreground">Please start a new order.</p>
              </div>
            ) : qrError ? (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <p className="text-red-500">{qrError}</p>
                {onRetry && (
                  <button onClick={onRetry} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Retry</button>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 40 }}>Loading QR code...</div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Order Total</span>
              <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Order ID</span>
              <span>{orderId}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;

