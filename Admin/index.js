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

app.use(express.json());
app.use(cors());

// Placeholder for future database integration
// const db = require('./db');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Set up Lowdb
const adapter = new FileSync('db.json');
const db = low(adapter);

// Log the absolute path to db.json at startup
console.log('Using db.json at:', path.resolve('db.json'));

// Initialize db with orders and inventory arrays if not present
db.defaults({ orders: [], inventory: [] }).write();

// Removed server and wss

// Removed broadcastOrdersUpdate

function broadcastInventoryUpdate() {
  // Removed WebSocket broadcast
}

// Order processing endpoint
app.post('/orders', async (req, res) => {
  const orderData = req.body;
  const orderId = `BB${Date.now()}`;
  
  // Log order details in JSON format
  console.log('Order Received:', JSON.stringify({ orderId, ...orderData }, null, 2));

  try {
    // Validate stock availability
    for (const item of orderData.items) {
      const inventoryItem = db.get('inventory').find({ id: item.id }).value();
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
      const inventoryItem = db.get('inventory').find({ id: item.id }).value();
      if (inventoryItem) {
        const oldQuantity = inventoryItem.quantity;
        const newQuantity = Math.max(0, inventoryItem.quantity - item.quantity);
        db.get('inventory')
          .find({ id: item.id })
          .assign({ quantity: newQuantity, updatedAt: new Date().toISOString() })
          .write();
        
        console.log(`Stock updated for ${inventoryItem.name}: ${oldQuantity} → ${newQuantity} (sold ${item.quantity})`);
      }
    });

    // Save order to Lowdb
    db.get('orders')
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
    
    // Removed broadcastOrdersUpdate();
    broadcastInventoryUpdate();

    // 1. Create a Razorpay order
    const razorpayOrder = await axios.post(
      `${process.env.VITE_RAZORPAY_API_BASE_URL}/orders`,
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
      `${process.env.VITE_RAZORPAY_API_BASE_URL}/payments/qr_codes`,
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

app.post('/verify-payment', async (req, res) => {
  const { qrCodeId } = req.body;
  console.log('/verify-payment called with qrCodeId:', qrCodeId);
  try {
    const response = await axios.get(
      `${process.env.VITE_RAZORPAY_API_BASE_URL}/payments/qr_codes/${qrCodeId}/payments`,
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
        const order = db.get('orders').find({ orderId }).value();
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

            db.get('orders')
              .find({ orderId })
              .assign(paymentDetails)
              .write();
            // Removed broadcastOrdersUpdate();
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

// Endpoint to get all orders
app.get('/orders', (req, res) => {
  try {
    const orders = db.get('orders').value();
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders', details: err.message });
  }
});

// Endpoint to manually set payment details (for testing)
app.post('/set-payment-details', (req, res) => {
  const { orderId, payer_account_type, vpa } = req.body;
  
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'orderId is required' });
  }
  
  const order = db.get('orders').find({ orderId }).value();
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
  
  db.get('orders')
    .find({ orderId })
    .assign(paymentDetails)
    .write();
  
  // Removed broadcastOrdersUpdate();
  res.json({ 
    success: true, 
    message: `Payment details set for order ${orderId}`,
    paymentDetails: paymentDetails.paymentInfo
  });
});

// Endpoint to cancel an order
app.post('/cancel-order', (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'orderId is required' });
  }
  const order = db.get('orders').find({ orderId }).value();
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  
  // Restore stock if order was pending (stock was already deducted)
  if (order.paymentStatus === 'pending') {
    order.items.forEach((item) => {
      const inventoryItem = db.get('inventory').find({ id: item.id }).value();
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity + item.quantity;
        db.get('inventory')
          .find({ id: item.id })
          .assign({ quantity: newQuantity, updatedAt: new Date().toISOString() })
          .write();
      }
    });
  }
  
  db.get('orders')
    .find({ orderId })
    .assign({ paymentStatus: 'cancelled', updatedAt: new Date().toISOString() })
    .write();
  
  // Removed broadcastOrdersUpdate();
  broadcastInventoryUpdate();
  res.json({ success: true, message: `Order ${orderId} cancelled and stock restored.` });
});

// ===== INVENTORY ENDPOINTS =====

// Initialize inventory with default products if empty
app.get('/inventory/init', (req, res) => {
  try {
    const existingInventory = db.get('inventory').value();
    if (existingInventory.length === 0) {
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
        { id: "18", name: "Water Bottle", price: 20, quantity: 40, category: "Water", slot: "G1", image: "/product_img/e9280a387e8049210642406c032b6a60.jpg", description: "Purified drinking water" }
      ];
      
      db.set('inventory', defaultInventory).write();
      broadcastInventoryUpdate();
      res.json({ success: true, message: 'Inventory initialized with default products', inventory: defaultInventory });
    } else {
      res.json({ success: true, message: 'Inventory already exists', inventory: existingInventory });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to initialize inventory', details: err.message });
  }
});

// Get all inventory items
app.get('/inventory', (req, res) => {
  try {
    const inventory = db.get('inventory').value();
    res.json({ success: true, inventory });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch inventory', details: err.message });
  }
});

// Update inventory item quantity
app.put('/inventory/:id/quantity', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  
  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ success: false, error: 'Valid quantity is required' });
  }
  
  try {
    const item = db.get('inventory').find({ id }).value();
    if (!item) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    db.get('inventory')
      .find({ id })
      .assign({ quantity, updatedAt: new Date().toISOString() })
      .write();
    
    broadcastInventoryUpdate();
    res.json({ success: true, message: `Quantity updated for ${item.name}`, item: { ...item, quantity } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update quantity', details: err.message });
  }
});

// Update inventory item details
app.put('/inventory/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, category, slot, description } = req.body;
  
  try {
    const item = db.get('inventory').find({ id }).value();
    if (!item) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    const updates = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (slot !== undefined) updates.slot = slot;
    if (description !== undefined) updates.description = description;
    
    db.get('inventory')
      .find({ id })
      .assign(updates)
      .write();
    
    broadcastInventoryUpdate();
    res.json({ success: true, message: `Product updated successfully`, item: { ...item, ...updates } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update product', details: err.message });
  }
});

// Add new inventory item
app.post('/inventory', (req, res) => {
  const { name, price, quantity, category, slot, description, image } = req.body;
  
  if (!name || !slot) {
    return res.status(400).json({ success: false, error: 'Name and slot are required' });
  }
  
  try {
    const newId = Date.now().toString();
    const newItem = {
      id: newId,
      name,
      price: price || 0,
      quantity: quantity || 0,
      category: category || 'Other',
      slot,
      description: description || '',
      image: image || '/product_img/download.png',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.get('inventory').push(newItem).write();
    broadcastInventoryUpdate();
    res.status(201).json({ success: true, message: 'Product added successfully', item: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add product', details: err.message });
  }
});

// Delete inventory item
app.delete('/inventory/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const item = db.get('inventory').find({ id }).value();
    if (!item) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    db.get('inventory').remove({ id }).write();
    broadcastInventoryUpdate();
    res.json({ success: true, message: `Product ${item.name} deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete product', details: err.message });
  }
});

// Serve static files from the 'dist' directory in Admin
app.use(express.static(path.join(__dirname, 'dist')));

// Also serve static files from D:\BLACK_BOX\dist as a fallback
const rootDist = path.join(__dirname, '..', 'dist');
app.use(express.static(rootDist));

// SPA fallback: serve index.html for all non-API routes
app.get('*', (req, res) => {
  const adminDistIndex = path.join(__dirname, 'dist', 'index.html');
  const rootDistIndex = path.join(__dirname, '..', 'dist', 'index.html');
  console.log('Trying to serve index.html from:', adminDistIndex);
  res.sendFile(adminDistIndex, err => {
    if (err) {
      console.log('Admin dist index.html not found, trying root dist:', rootDistIndex);
      res.sendFile(rootDistIndex, err2 => {
        if (err2) {
          res.status(404).send('index.html not found in Admin/dist or root dist');
        }
      });
    }
  });
});

// Removed server.listen(PORT, () => { ... });
 