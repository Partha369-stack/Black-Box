const { getDbs } = require('../dataAccess/lowdbDataAccess');
const axios = require('axios');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

async function getOrders(tenantId) {
  try {
    const { ordersDb } = getDbs(tenantId);
    const orders = ordersDb.get('orders').value();
    return orders;
  } catch (error) {
    console.error('Error fetching orders from Lowdb:', error);
    throw error;
  }
}

async function createOrder(tenantId, orderData) {
  const { inventoryDb, ordersDb } = getDbs(tenantId);
  const orderId = `BB${Date.now()}`;

  // Log order details in JSON format
  console.log('Order Received:', JSON.stringify({ orderId, ...orderData }, null, 2));

  // Validate stock availability (using Lowdb for inventory)
  for (const item of orderData.items) {
    const inventoryItem = inventoryDb.get('inventory').find({ id: item.id }).value();
    if (!inventoryItem) {
      throw new Error(`Product with ID ${item.id} not found in inventory`);
    }
    if (inventoryItem.quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`);
    }
  }

  // Update inventory stock levels (using Lowdb for inventory)
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
  const newOrder = {
    tenantId,
    orderId,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    paymentStatus: 'pending',
    customerName: orderData.customerName || null,
    customerPhone: orderData.customerPhone || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    ordersDb.get('orders').push(newOrder).write();
    console.log('Order saved to Lowdb:', orderId);
  } catch (error) {
    console.error('Error saving order to Lowdb:', error);
    // Revert inventory changes if saving order fails
    orderData.items.forEach((item) => {
      const inventoryItem = inventoryDb.get('inventory').find({ id: item.id }).value();
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity + item.quantity; // Add back the deducted quantity
        inventoryDb.get('inventory')
          .find({ id: item.id })
          .assign({ quantity: newQuantity, updatedAt: new Date().toISOString() })
          .write();
        console.log(`Stock reverted for ${inventoryItem.name}: ${inventoryItem.quantity} → ${newQuantity} (reverted ${item.quantity})`);
      }
    });
    throw error; // Re-throw the error after reverting inventory
  }


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

  return {
    orderId,
    order: orderData,
    razorpayOrderId: razorpayOrder.data.id,
    qrCodeUrl: qrResponse.data.image_url,
    qrCodeId: qrResponse.data.id,
  };
}

async function verifyPayment(tenantId, qrCodeId) {
  console.log('/verify-payment called with qrCodeId:', qrCodeId);
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
  console.log('Payment items received:', response.data.items.map(item => ({ id: item.id, status: item.status })));
  const paidPayment = response.data.items.find(payment => payment.status === 'captured');
  console.log('Found paid payment:', paidPayment);

  if (paidPayment) {
    // Update order status in db using orderId from payment notes
    const orderId = paidPayment.notes && paidPayment.notes.orderId;
    console.log('OrderId from payment notes:', orderId);
    if (orderId) {
      try {
        const { ordersDb } = getDbs(tenantId);
        const order = ordersDb.get('orders').find({ orderId }).value();
        if (order) {
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
              paymentCreatedAt: new Date(paidPayment.created_at * 1000).toISOString(), // Convert Unix timestamp to Date
              // Additional UPI details from Razorpay
              upiTransactionId: paidPayment.acquirer_data?.upi_transaction_id || null,
              bankCode: paidPayment.acquirer_data?.bank_code || null,
              bankName: paidPayment.acquirer_data?.bank_name || null
            }
          };

          ordersDb.get('orders').find({ orderId }).assign(paymentDetails).write();
          console.log(`Order ${orderId} status updated to paid in Lowdb.`);
          // Assuming broadcastOrdersUpdate will be handled by the caller
          return { success: true, message: `Order ${orderId} status updated to paid.`, paymentDetails: paymentDetails.paymentInfo };
        } else {
          console.log(`Order with orderId ${orderId} not found in db.`);
          return { success: false, error: `Order with orderId ${orderId} not found.` };
        }
      } catch (error) {
        console.error('Error updating order status in Lowdb:', error);
        throw error;
      }
    } else {
      console.log('No orderId found in payment notes.');
      return { success: false, error: 'No orderId found in payment notes.' };
    }
  } else {
    return { success: false, message: 'No captured payment found.' };
  }
}

async function setPaymentDetails(tenantId, orderId, payer_account_type, vpa) {
  try {
    const { ordersDb } = getDbs(tenantId);
    const order = ordersDb.get('orders').find({ orderId }).value();
    if (!order) {
      return { success: false, error: 'Order not found' };
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

    ordersDb.get('orders').find({ orderId }).assign(paymentDetails).write();
    console.log(`Payment details set for order ${orderId} in Lowdb.`);

    // Assuming broadcastOrdersUpdate will be handled by the caller
    return {
      success: true,
      message: `Payment details set for order ${orderId}`,
      paymentDetails: paymentDetails.paymentInfo
    };
  } catch (error) {
    console.error('Error setting payment details in Lowdb:', error);
    throw error;
  }
}

async function cancelOrder(tenantId, orderId) {
  const { inventoryDb, ordersDb } = getDbs(tenantId);
  try {
    const order = ordersDb.get('orders').find({ orderId }).value();
    if (!order) {
      return { success: false, error: 'Order not found' };
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
      console.log(`Stock restored for cancelled order ${orderId}.`);
    }

    ordersDb.get('orders').find({ orderId }).assign({ paymentStatus: 'cancelled', updatedAt: new Date().toISOString() }).write();
    console.log(`Order ${orderId} cancelled in Lowdb.`);

    // Assuming broadcastOrdersUpdate and broadcastInventoryUpdate will be handled by the caller
    return { success: true, message: `Order ${orderId} cancelled and stock restored.` };
  } catch (error) {
    console.error('Error canceling order in Lowdb:', error);
    throw error;
  }
}

module.exports = {
  getOrders,
  createOrder,
  verifyPayment,
  setPaymentDetails,
  cancelOrder,
};