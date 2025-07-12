const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config();
const axios = require('axios');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const multer = require('multer');

app.use(express.json());
// Configure CORS to allow requests from both the UI and the Admin dashboard
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8000'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// --- Multi-Tenant Database Setup ---
const dbInstances = new Map();

function getDbs(tenantId) {
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }
  // Validate tenant ID format (e.g., must start with 'VM-')
  if (!tenantId.startsWith('VM-')) {
    console.error(`Unauthorized access attempt with invalid tenant ID: ${tenantId}`);
    throw new Error('Invalid Tenant ID format');
  }

  if (dbInstances.has(tenantId)) {
    return dbInstances.get(tenantId);
  }

  const ordersDir = path.join(__dirname, 'databases', tenantId, 'Orders');
  const inventoryDir = path.join(__dirname, 'databases', tenantId, 'Inventory');

  if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir, { recursive: true });
  }
  if (!fs.existsSync(inventoryDir)) {
    fs.mkdirSync(inventoryDir, { recursive: true });
  }

  // Setup for orders.db
  const ordersDbPath = path.join(ordersDir, 'orders.db');
  const ordersAdapter = new FileSync(ordersDbPath);
  const ordersDb = low(ordersAdapter);

  // Initialize orders.db if it doesn't exist
  if (!fs.existsSync(ordersDbPath)) {
    ordersDb.defaults({ orders: [] }).write();
  }

  // Setup for inventory.db
  const inventoryDbPath = path.join(inventoryDir, 'inventory.db');
  const inventoryAdapter = new FileSync(inventoryDbPath);
  const inventoryDb = low(inventoryAdapter);

  // Initialize inventory.db if it doesn't exist
  if (!fs.existsSync(inventoryDbPath)) {
    inventoryDb.defaults({ inventory: [] }).write();
  }

  const dbs = { ordersDb, inventoryDb };
  dbInstances.set(tenantId, dbs);
  return dbs;
}

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
// --- End of Multi-Tenant Setup ---

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket-based machine status tracking
const machineSocketMap = new Map(); // machine_id -> ws

// Single machine status tracking
let singleMachine = {
  id: 'VM-001',
  status: 'offline',
  lastHeartbeat: null
};

wss.on('connection', (ws) => {
  let registeredId = null;
  console.log('[WebSocket] New connection');
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'register' && data.machine_id === singleMachine.id) {
        registeredId = data.machine_id;
        machineSocketMap.set(registeredId, ws);
        singleMachine.status = 'online';
        singleMachine.lastHeartbeat = new Date().toISOString();
        console.log(`[WebSocket] Registered machine: ${registeredId} (online)`);
      } else if (data.type === 'register' && data.machine_id) {
        registeredId = data.machine_id;
        machineSocketMap.set(registeredId, ws);
        console.log(`[WebSocket] Registered machine: ${registeredId} (online)`);
      }
    } catch (e) {
      // console.log('[WebSocket] Malformed message:', msg);
    }
  });
  ws.on('close', () => {
    if (registeredId === singleMachine.id) {
      machineSocketMap.delete(registeredId);
      singleMachine.status = 'offline';
      singleMachine.lastHeartbeat = new Date().toISOString();
      console.log(`[WebSocket] Disconnected: ${registeredId} (offline)`);
    } else if (registeredId) {
      machineSocketMap.delete(registeredId);
      console.log(`[WebSocket] Disconnected: ${registeredId} (offline)`);
    } else {
      console.log('[WebSocket] Connection closed (unregistered)');
    }
  });
});

function broadcastOrdersUpdate() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'ordersUpdated' }));
    }
  });
}

function broadcastInventoryUpdate() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'inventoryUpdated' }));
    }
  });
}

// Orders endpoints
app.get('/api/orders', (req, res) => {
  try {
    const orders = req.dbs.ordersDb.get('orders').value();
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders', details: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const orderData = req.body;
  const orderId = `BB${Date.now()}`;
  const { ordersDb, inventoryDb } = req.dbs;
  
  // Log order details in JSON format
  console.log('Order Received:', JSON.stringify({ orderId, ...orderData }, null, 2));

  try {
    // Validate stock availability
    for (const item of orderData.items) {
      const inventoryItem = inventoryDb.get('inventory').find({ id: item.id }).value();
      if (!inventoryItem) {
        return res.status(400).json({ 
          message: `Product with ID ${item.id} not found in inventory` 
        });
      }
      if (inventoryItem.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}` 
        });
      }
    }
    // Update inventory stock levels
    orderData.items.forEach((item) => {
      const inventoryItem = inventoryDb.get('inventory').find({ id: item.id }).value();
      if (inventoryItem) {
        const oldQuantity = inventoryItem.quantity;
        const newQuantity = Math.max(0, inventoryItem.quantity - item.quantity);
        inventoryDb.get('inventory')
          .find({ id: item.id })
          .assign({ quantity: newQuantity, updatedAt: new Date().toISOString() })
          .write();
        
        console.log(`Stock updated for ${inventoryItem.name}: ${oldQuantity} → ${newQuantity} (sold ${item.quantity})`);
      }
    });

    // Save order to Lowdb
    ordersDb.get('orders')
      .push({
        orderId,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        paymentStatus: 'pending',
        customerName: orderData.customerName || null,
        customerPhone: orderData.customerPhone || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .write();
    
    broadcastOrdersUpdate();
    broadcastInventoryUpdate();

    // 1. Create a Razorpay order
    const razorpayOrder = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount: Math.round(orderData.totalAmount * 100), // amount in paise
        currency: 'INR',
        receipt: orderId,
        payment_capture: 1,
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    // 2. Generate a QR code for the order
    const qrResponse = await axios.post(
      'https://api.razorpay.com/v1/payments/qr_codes',
      {
        type: 'upi_qr',
        name: 'Order Payment',
        usage: 'single_use',
        fixed_amount: true,
        payment_amount: Math.round(orderData.totalAmount * 100),
        description: `Payment for order ${orderId}`,
        close_by: Math.floor(Date.now() / 1000) + 3600, // QR expires in 1 hour
        notes: {
          orderId,
        },
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    // 3. Return order and QR code info to frontend
    res.status(201).json({
      message: 'Order received successfully!',
      orderId,
      order: orderData,
      razorpayOrderId: razorpayOrder.data.id,
      qrCodeUrl: qrResponse.data.image_url,
      qrCodeId: qrResponse.data.id,
    });
  } catch (error) {
    console.error('Razorpay error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to create Razorpay order/QR code.' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  const { qrCodeId } = req.body;
  const { ordersDb } = req.dbs;
  console.log('/verify-payment called with qrCodeId:', qrCodeId);
  try {
    const response = await axios.get(
      `https://api.razorpay.com/v1/payments/qr_codes/${qrCodeId}/payments`,
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );
    // Debug: Log the full response from Razorpay
    console.log('Razorpay payment response:', JSON.stringify(response.data, null, 2));
    // Check if any payment is successful
    const paidPayment = response.data.items.find(payment => payment.status === 'captured');
    console.log('Found paid payment:', paidPayment);
    if (paidPayment) {
      // Update order status in db using orderId from payment notes
      const orderId = paidPayment.notes && paidPayment.notes.orderId;
      console.log('OrderId from payment notes:', orderId);
      if (orderId) {
        const order = ordersDb.get('orders').find({ orderId }).value();
        if (order) {
          try {
            // Extract UPI details from Razorpay payment response
            const vpa = paidPayment.vpa || paidPayment.email || null;
            const payer_account_type = paidPayment.method === 'upi' ? 'bank_account' : 
                                     paidPayment.method === 'wallet' ? 'wallet' : 
                                     paidPayment.method || 'bank_account';
            
            // Extract payment details
            const paymentDetails = {
              paymentStatus: 'paid',
              updatedAt: new Date().toISOString(),
              vpa: vpa,
              payer_account_type: payer_account_type,
              paymentInfo: {
                payer_account_type: payer_account_type,
                vpa: vpa,
                paymentId: paidPayment.id,
                paymentMethod: paidPayment.method,
                paymentAmount: paidPayment.amount,
                paymentCurrency: paidPayment.currency,
                paymentStatus: paidPayment.status,
                paymentCreatedAt: paidPayment.created_at,
                // Additional UPI details from Razorpay
                upiTransactionId: paidPayment.acquirer_data?.upi_transaction_id || null,
                bankCode: paidPayment.acquirer_data?.bank_code || null,
                bankName: paidPayment.acquirer_data?.bank_name || null
              }
            };

            ordersDb.get('orders')
              .find({ orderId })
              .assign(paymentDetails)
              .write();
            broadcastOrdersUpdate();
            console.log(`Order ${orderId} status updated to paid with payment details.`);
            res.json({ 
              success: true, 
              message: `Order ${orderId} status updated to paid.`,
              paymentDetails: paymentDetails.paymentInfo
            });
          } catch (writeErr) {
            console.error('Error writing to db.json:', writeErr);
            res.status(500).json({ success: false, error: 'Failed to write to db.json', details: writeErr.message });
          }
        } else {
          console.log(`Order with orderId ${orderId} not found in db.`);
          res.status(404).json({ success: false, error: `Order with orderId ${orderId} not found.` });
        }
      } else {
        console.log('No orderId found in payment notes.');
        res.status(400).json({ success: false, error: 'No orderId found in payment notes.' });
      }
    } else {
      res.json({ success: false, message: 'No captured payment found.' });
    }
  } catch (error) {
    console.error('Error in /verify-payment:', error);
    res.status(500).json({ success: false, error: 'Verification failed', details: error.message });
  }
});

// Endpoint to manually set payment details (for testing)
app.post('/api/set-payment-details', (req, res) => {
  const { orderId, payer_account_type, vpa } = req.body;
  const { ordersDb } = req.dbs;
  
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'orderId is required' });
  }
  
  const order = ordersDb.get('orders').find({ orderId }).value();
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  
  const paymentDetails = {
    paymentStatus: 'paid',
    updatedAt: new Date().toISOString(),
    paymentInfo: {
      payer_account_type: payer_account_type || 'bank_account',
      vpa: vpa || 'pradhanparthasarthi3@okaxis',
      paymentId: `manual_${Date.now()}`,
      paymentMethod: 'upi',
      paymentAmount: order.totalAmount * 100, // Convert to paise
      paymentCurrency: 'INR',
      paymentStatus: 'captured',
      paymentCreatedAt: new Date().toISOString()
    }
  };
  
  ordersDb.get('orders')
    .find({ orderId })
    .assign(paymentDetails)
    .write();
  
  broadcastOrdersUpdate();
  res.json({ 
    success: true, 
    message: `Payment details set for order ${orderId}`,
    paymentDetails: paymentDetails.paymentInfo
  });
});

// Endpoint to cancel an order
app.post('/api/cancel-order', (req, res) => {
  const { orderId } = req.body;
  const { ordersDb, inventoryDb } = req.dbs;
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'orderId is required' });
  }
  const order = ordersDb.get('orders').find({ orderId }).value();
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  
  // Restore stock if order was pending (stock was already deducted)
  if (order.paymentStatus === 'pending') {
    order.items.forEach((item) => {
      const inventoryItem = inventoryDb.get('inventory').find({ id: item.id }).value();
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity + item.quantity;
        inventoryDb.get('inventory')
          .find({ id: item.id })
          .assign({ quantity: newQuantity, updatedAt: new Date().toISOString() })
          .write();
      }
    });
  }
  
  ordersDb.get('orders')
    .find({ orderId })
    .assign({ paymentStatus: 'cancelled', updatedAt: new Date().toISOString() })
    .write();
  
  broadcastOrdersUpdate();
  broadcastInventoryUpdate();
  res.json({ success: true, message: `Order ${orderId} cancelled and stock restored.` });
});

// Inventory endpoints
app.get('/api/inventory', (req, res) => {
  const { inventoryDb } = req.dbs;
  try {
    const inventory = inventoryDb.get('inventory').value();
    res.json({ success: true, inventory });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch inventory', details: err.message });
  }
});

app.post('/api/inventory', (req, res) => {
  const { inventoryDb } = req.dbs;
  try {
    const { name, price, quantity, category, slot, description, image } = req.body;
    if (!name || price == null || quantity == null || !category || !slot) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const id = `${Date.now()}`;
    const newItem = {
      id,
      name,
      price,
      quantity,
      category,
      slot,
      description,
      image: image || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inventoryDb.get('inventory').push(newItem).write();
    broadcastInventoryUpdate();
    res.status(201).json({ success: true, item: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add item to inventory', details: err.message });
  }
});

app.put('/api/inventory/:id', (req, res) => {
  const { inventoryDb } = req.dbs;
  try {
    const { id } = req.params;
    const updatedData = req.body;
    updatedData.updatedAt = new Date().toISOString();

    const item = inventoryDb.get('inventory').find({ id });
    if (item.value()) {
      item.assign(updatedData).write();
      broadcastInventoryUpdate();
      res.json({ success: true, item: item.value() });
    } else {
      res.status(404).json({ success: false, error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update item', details: err.message });
  }
});

app.put('/api/inventory/:id/quantity', (req, res) => {
  const { inventoryDb } = req.dbs;
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    if (quantity == null) {
      return res.status(400).json({ success: false, error: 'Quantity is required' });
    }
    const item = inventoryDb.get('inventory').find({ id });
    if (item.value()) {
      item.assign({ quantity, updatedAt: new Date().toISOString() }).write();
      broadcastInventoryUpdate();
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update quantity', details: err.message });
  }
});

app.delete('/api/inventory/:id', (req, res) => {
  const { inventoryDb } = req.dbs;
  try {
    const { id } = req.params;
    const item = inventoryDb.get('inventory').find({ id });
    if (item.value()) {
      inventoryDb.get('inventory').remove({ id }).write();
      broadcastInventoryUpdate();
      res.json({ success: true, message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete item', details: err.message });
  }
});

app.get('/api/inventory/init', (req, res) => {
  const { inventoryDb } = req.dbs;
  const force = req.query.force === 'true';
  try {
    const existingInventory = inventoryDb.get('inventory').value();
    if (existingInventory.length === 0 || force) {
      const defaultInventory = [
        { id: "0", name: "Test Product", price: 1, quantity: 100, category: "Test", slot: "A1", image: "/product_img/download.png", description: "A test product for 1 Rs" },
        { id: "1", name: "Classic Chips", price: 25, quantity: 15, category: "Snacks", slot: "A2", image: "/product_img/1cb22c3bb69c63b305b98a758709ce74.jpg", description: "Crispy potato chips with a classic flavor" },
        { id: "2", name: "Chocolate Bar", price: 45, quantity: 20, category: "Chocolates", slot: "A3", image: "/product_img/f2bbe83c1063a941a3c3f00723c38d09.jpg", description: "Rich milk chocolate bar" },
        { id: "3", name: "Energy Drink", price: 60, quantity: 12, category: "Beverages", slot: "B1", image: "/product_img/4e9143c5db094dd1e38f7179eb5c46ed.jpg", description: "Refreshing energy drink to boost your day" },
        { id: "4", name: "Cookies Pack", price: 35, quantity: 18, category: "Cookies", slot: "B2", image: "/product_img/fe0286b72522261bd2537444c3e7edd1.jpg", description: "Delicious chocolate chip cookies" },
        { id: "5", name: "Nuts Mix", price: 55, quantity: 10, category: "Nuts", slot: "B3", image: "/product_img/268f8bcab68ad3682f212d1dc9a682f5.jpg", description: "Premium mixed nuts for healthy snacking" },
        { id: "6", name: "Soda Can", price: 30, quantity: 25, category: "Beverages", slot: "C1", image: "/product_img/471c378262264215a354c98dcaf919e0.jpg", description: "Refreshing carbonated soft drink" },
        { id: "7", name: "Granola Bar", price: 20, quantity: 22, category: "Health", slot: "C2", image: "/product_img/072bced279d2a391ec771bceb968306c.jpg", description: "Healthy and wholesome granola bar" },
        { id: "8", name: "Pretzels", price: 20, quantity: 15, category: "Snacks", slot: "C3", image: "/product_img/0d104252bc53d286048f189994d1df15.jpg", description: "Salty and crunchy pretzels" },
        { id: "9", name: "Gummy Bears", price: 30, quantity: 18, category: "Candies", slot: "D1", image: "/product_img/705ece546b97e15f93b6296153757952.jpg", description: "Chewy and fruity gummy bears" },
        { id: "10", name: "Trail Mix", price: 50, quantity: 14, category: "Nuts", slot: "D2", image: "/product_img/3413adebaffe1abc33a4cb6859f0a112.jpg", description: "A mix of nuts, seeds, and dried fruit" },
        { id: "11", name: "Popcorn", price: 25, quantity: 20, category: "Snacks", slot: "D3", image: "/product_img/e8afb88c23626fcf20480941e3efa7b4.jpg", description: "Classic buttered popcorn" },
        { id: "12", name: "Beef Jerky", price: 70, quantity: 10, category: "Meat", slot: "E1", image: "/product_img/0ce988fabca6792fddce93c38f4c12ed.jpg", description: "Savory and high-protein beef jerky" },
        { id: "13", name: "Mint Gum", price: 15, quantity: 30, category: "Candies", slot: "E2", image: "/product_img/8b34cfffb15975590f87bd2361bf434e.jpg", description: "Refreshing mint-flavored chewing gum" },
        { id: "14", name: "Fruit Snacks", price: 25, quantity: 25, category: "Fruits", slot: "E3", image: "/product_img/a137489d48a5c315310cd1f9ecc70170.jpg", description: "Fruity and chewy snacks" },
        { id: "15", name: "Iced Tea", price: 40, quantity: 15, category: "Beverages", slot: "F1", image: "/product_img/11eb431a354c0ffa19368c330d233934.jpg", description: "Chilled and refreshing iced tea" },
        { id: "16", name: "Orange Juice", price: 50, quantity: 12, category: "Beverages", slot: "F2", image: "/product_img/477a1a78e30d03dfaf2afbf7894ee5fb.jpg", description: "Fresh and pulpy orange juice" },
        { id: "17", name: "Apple Juice", price: 50, quantity: 12, category: "Beverages", slot: "F3", image: "/product_img/183431741593d9fb14c6459a2d4b889d.jpg", description: "Sweet and refreshing apple juice" },
        { id: "18", name: "Water Bottle", price: 20, quantity: 40, category: "Water", slot: "G1", image: `/${req.headers['x-tenant-id']}/Inventory/product_images/e9280a387e8049210642406c032b6a60.jpg`, description: "Purified drinking water" }
      ].map(item => ({...item, image: item.image.replace('/product_img/', `/${req.headers['x-tenant-id']}/Inventory/product_images/`) }));
      
      inventoryDb.set('inventory', defaultInventory).write();
      broadcastInventoryUpdate();
      res.json({ success: true, message: 'Inventory initialized with default products', inventory: defaultInventory });
    } else {
      res.json({ success: true, message: 'Inventory already exists', inventory: existingInventory });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to initialize inventory', details: err.message });
  }
});

// --- Tenant-Specific Image Handling ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
      return cb(new Error('Tenant ID is missing'));
    }
    const tenantImageDir = path.join(__dirname, 'databases', tenantId, 'Inventory', 'product_images');
    if (!fs.existsSync(tenantImageDir)) {
      fs.mkdirSync(tenantImageDir, { recursive: true });
    }
    cb(null, tenantImageDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, jpeg, and png files are allowed'));
    }
  }
});

// Image upload endpoint (requires tenant middleware)
app.post('/api/upload', upload.single('image'), (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  const imagePath = `/${tenantId}/Inventory/product_images/${req.file.filename}`;
  res.json({ success: true, path: imagePath });
});

// Serve static product images from tenant-specific folders
app.use('/:tenantId/Inventory/product_images', (req, res, next) => {
  const { tenantId } = req.params;
  const imagePath = path.join(__dirname, 'databases', tenantId, 'Inventory', 'product_images', req.url);
  if (fs.existsSync(imagePath)) {
    return res.sendFile(imagePath);
  }
  res.status(404).send('Image not found');
});

// Serve static files from Admin UI build
app.use(express.static(path.join(__dirname, '..', '..', 'Admin', 'dist')));

// Serve the last 100 lines of a log file
app.get('/api/logs', (req, res) => {
  const logPath = path.join(__dirname, 'backend.log'); // Change to your log file if needed
  if (!fs.existsSync(logPath)) {
    return res.status(404).json({ error: 'Log file not found' });
  }
  const data = fs.readFileSync(logPath, 'utf-8');
  const lines = data.split('\n');
  const lastLines = lines.slice(-100).join('\n');
  res.type('text/plain').send(lastLines);
});

// Endpoint to get single machine status
app.get('/api/machine/status', (req, res) => {
  res.json(singleMachine);
});

// Fallback to index.html for SPA (must be last)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

console.log('--- SERVER RESTARTING WITH LATEST ADMIN PAGE CODE ---');
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 