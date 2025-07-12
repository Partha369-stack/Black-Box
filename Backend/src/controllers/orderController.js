const orderService = require('../services/orderService');
const machineService = require('../services/machineService'); // Assuming broadcast is handled by controller

async function getOrders(req, res) {
  try {
    const orders = await orderService.getOrders(req.headers['x-tenant-id']);
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders', details: err.message });
  }
}

async function createOrder(req, res) {
  try {
    const result = await orderService.createOrder(req.headers['x-tenant-id'], req.body);
    machineService.broadcastOrdersUpdate();
    machineService.broadcastInventoryUpdate();
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, error: 'Failed to create order', details: err.message });
  }
}

async function verifyPayment(req, res) {
  try {
    const result = await orderService.verifyPayment(req.headers['x-tenant-id'], req.body.qrCodeId);
    if (result.success) {
      machineService.broadcastOrdersUpdate();
      res.json(result);
    } else {
      res.status(400).json(result); // Or appropriate status based on error type
    }
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ success: false, error: 'Verification failed', details: err.message });
  }
}

async function setPaymentDetails(req, res) {
  try {
    const { orderId, payer_account_type, vpa } = req.body;
    const result = await orderService.setPaymentDetails(req.headers['x-tenant-id'], orderId, payer_account_type, vpa);
    if (result.success) {
      machineService.broadcastOrdersUpdate();
      res.json(result);
    } else {
      res.status(404).json(result); // Or appropriate status
    }
  } catch (err) {
    console.error('Error setting payment details:', err);
    res.status(500).json({ success: false, error: 'Failed to set payment details', details: err.message });
  }
}

async function cancelOrder(req, res) {
  try {
    const { orderId } = req.body;
    const result = await orderService.cancelOrder(req.headers['x-tenant-id'], orderId);
    if (result.success) {
      machineService.broadcastOrdersUpdate();
      machineService.broadcastInventoryUpdate();
      res.json(result);
    } else {
      res.status(404).json(result); // Or appropriate status
    }
  } catch (err) {
    console.error('Error canceling order:', err);
    res.status(500).json({ success: false, error: 'Failed to cancel order', details: err.message });
  }
}

module.exports = {
  getOrders,
  createOrder,
  verifyPayment,
  setPaymentDetails,
  cancelOrder,
};