const express = require('express');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

// Inventory endpoints
router.get('/inventory', inventoryController.getInventory);
router.post('/inventory', inventoryController.addItemToInventory);
router.put('/inventory/:id', inventoryController.updateInventoryItem);
router.put('/inventory/:id/quantity', inventoryController.updateInventoryItemQuantity);
router.delete('/inventory/:id', inventoryController.deleteInventoryItem);
router.get('/inventory/init', inventoryController.initializeInventory);

module.exports = router;