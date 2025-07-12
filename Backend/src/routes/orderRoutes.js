const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Orders endpoints
router.get('/orders', orderController.getOrders);
router.post('/orders', orderController.createOrder);
router.post('/verify-payment', orderController.verifyPayment);
router.post('/set-payment-details', orderController.setPaymentDetails);
router.post('/cancel-order', orderController.cancelOrder);

module.exports = router;