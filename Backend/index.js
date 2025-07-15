const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 4000;
const axios = require('axios');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');

const { getDbs } = require('./src/dataAccess/lowdbDataAccess');
const inventoryService = require('./src/services/inventoryService');
const orderService = require('./src/services/orderService');
const machineService = require('./src/services/machineService');
const imageHandler = require('./src/imageHandler');
const logHandler = require('./src/logHandler');
const inventoryController = require('./src/controllers/inventoryController');
const orderController = require('./src/controllers/orderController');
const machineController = require('./src/controllers/machineController');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const machineRoutes = require('./src/routes/machineRoutes');
const imageRoutes = require('./src/routes/imageRoutes'); // Import image routes
const machineStatusRoutes = require('./src/routes/machineStatusRoutes'); // Import machine status routes

app.use(express.json());
// Configure CORS to allow requests from both the UI and the Admin dashboard
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8000', 'http://localhost:8081'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));

// Serve tenant-specific product images
// Serve static files from VM-002 UI build
// THIS IS PLACED BEFORE THE TENANT-SPECIFIC IMAGE HANDLER TO AVOID CONFLICTS
app.use('/vm-002/', express.static(path.join(__dirname, '..', 'VM-002', 'dist'), { index: 'index.html' }));
app.use('/:tenantId/Inventory/product_images', (req, res, next) => {
  const { tenantId } = req.params;
  if (!tenantId || !tenantId.startsWith('VM-')) {
    return res.status(404).send('Not Found');
  }
  const imageDir = path.join(__dirname, 'databases', tenantId, 'Inventory', 'product_images');
  express.static(imageDir)(req, res, next);
});

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Middleware to attach tenant-specific DBs to the request
function tenantDbMiddleware(req, res, next) {
  try {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required in headers as x-tenant-id' });
    }
    // Additional validation to ensure tenant ID matches expected format
    if (!tenantId.startsWith('VM-')) {
      console.error(`Unauthorized access attempt with invalid tenant ID: ${tenantId}`);
      return res.status(403).json({ error: 'Invalid Tenant ID format' });
    }
    req.dbs = getDbs(tenantId);
    next();
  } catch (error) {
    console.error('Middleware error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}


// Apply the middleware to all /api routes
app.use('/api', tenantDbMiddleware);

// Machine status routes (no tenant middleware needed)
app.use('/api/machines/status', machineStatusRoutes);

const server = http.createServer(app);
// Initialize WebSocket server using machineService
machineService.initializeWebSocketServer(server);

// Use the order routes
app.use('/api', orderRoutes);

// Use the inventory routes
app.use('/api', inventoryRoutes);

// Use the image routes
app.use('/api', imageRoutes);

// Serve static files from Admin UI build
app.use(express.static(path.join(__dirname, '..', '..', 'Admin', 'dist'), { index: 'index.html' }));

// Use the log handler router for the logs endpoint
app.use('/api', logHandler);

// Use the machine routes
app.use('/api', machineRoutes);


console.log('--- SERVER RESTARTING WITH LATEST ADMIN PAGE CODE ---');
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});