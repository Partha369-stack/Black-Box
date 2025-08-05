import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'https://black-box-production.up.railway.app',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));
app.use(express.json());

// Mock inventory data
const defaultInventory = [
  {
    id: "1",
    name: "Classic Cola",
    price: 25,
    image: "/images/cola.jpg",
    description: "Refreshing cola drink",
    quantity: 15
  },
  {
    id: "2", 
    name: "Chocolate Bar",
    price: 30,
    image: "/images/chocolate.jpg",
    description: "Rich milk chocolate",
    quantity: 20
  },
  {
    id: "3",
    name: "Energy Drink",
    price: 45,
    image: "/images/energy.jpg", 
    description: "Boost your energy",
    quantity: 10
  },
  {
    id: "4",
    name: "Cookies Pack",
    price: 35,
    image: "/images/cookies.jpg",
    description: "Crunchy chocolate cookies",
    quantity: 12
  },
  {
    id: "5",
    name: "Water Bottle",
    price: 15,
    image: "/images/water.jpg",
    description: "Pure drinking water 500ml",
    quantity: 25  
  },
  {
    id: "6",
    name: "Potato Chips",
    price: 20,
    image: "/images/chips.jpg",
    description: "Crispy salted chips",
    quantity: 18
  }
];

// Store inventory data (in a real app, this would be a database)
let inventoryData = {
  'VM-001': [...defaultInventory],
  'VM-002': [...defaultInventory]
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API server is running',
    timestamp: new Date().toISOString()
  });
});

// Get inventory for a specific tenant
app.get('/api/inventory', (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'VM-001';
    const inventory = inventoryData[tenantId] || defaultInventory;
    
    res.json({
      success: true,
      inventory: inventory,
      tenantId: tenantId,
      count: inventory.length
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory',
      message: error.message
    });
  }
});

// Initialize inventory for a tenant (creates default products if none exist)
app.post('/api/inventory/init', (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'VM-001';
    const apiKey = req.headers['x-api-key'];
    
    // Basic API key check
    if (apiKey !== 'blackbox-api-key-2024') {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
    }
    
    // Initialize inventory if it doesn't exist or is empty
    if (!inventoryData[tenantId] || inventoryData[tenantId].length === 0) {
      inventoryData[tenantId] = [...defaultInventory];
    }
    
    res.json({
      success: true,
      message: 'Inventory initialized successfully',
      tenantId: tenantId,
      inventoryCount: inventoryData[tenantId].length
    });
  } catch (error) {
    console.error('Error initializing inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize inventory',
      message: error.message
    });
  }
});

// Handle orders (basic implementation)
app.post('/api/orders', (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'VM-001';
    const { items, totalAmount, customerName, customerPhone } = req.body;
    
    // Generate mock order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Mock QR code URL (in real implementation, this would call Razorpay API)
    const qrCodeUrl = `https://rzp.io/i/${orderId}`;
    const qrCodeId = `qr_${orderId}`;
    
    console.log(`Order received for ${tenantId}:`, {
      orderId,
      items: items.length,
      totalAmount,
      customerName,
      customerPhone
    });
    
    res.json({
      success: true,
      orderId: orderId,
      qrCodeUrl: qrCodeUrl,
      qrCodeId: qrCodeId,
      amount: totalAmount,
      currency: 'INR',
      tenantId: tenantId
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message
    });
  }
});

// Debug endpoint for Razorpay
app.get('/debug/razorpay', (req, res) => {
  res.json({
    success: true,
    message: 'Razorpay debug endpoint',
    config: {
      keyId: 'rzp_test_03GDDKe1yQVSCT',
      environment: 'test'
    }
  });
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BlackBox API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📦 Inventory: http://localhost:${PORT}/api/inventory`);
  console.log(`🛒 Orders: http://localhost:${PORT}/api/orders`);
});
