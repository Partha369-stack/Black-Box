const inventoryService = require('../services/inventoryService');
const machineService = require('../services/machineService'); // Assuming broadcast is handled by controller

async function getInventory(req, res) {
  try {
    const inventory = await inventoryService.getInventory(req.headers['x-tenant-id']);
    res.json({ success: true, inventory });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory', details: err.message });
  }
}

async function addItemToInventory(req, res) {
  try {
    const newItem = await inventoryService.addItemToInventory(req.headers['x-tenant-id'], req.body);
    machineService.broadcastInventoryUpdate();
    res.status(201).json({ success: true, item: newItem });
  } catch (err) {
    console.error('Error adding item to inventory:', err);
    res.status(500).json({ success: false, error: 'Failed to add item to inventory', details: err.message });
  }
}

async function updateInventoryItem(req, res) {
  try {
    const item = await inventoryService.updateInventoryItem(req.headers['x-tenant-id'], req.params.id, req.body);
    if (item) {
      machineService.broadcastInventoryUpdate();
      res.json({ success: true, item });
    } else {
      res.status(404).json({ success: false, error: 'Item not found' });
    }
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ success: false, error: 'Failed to update item', details: err.message });
  }
}

async function updateInventoryItemQuantity(req, res) {
  try {
    const success = await inventoryService.updateInventoryItemQuantity(req.headers['x-tenant-id'], req.params.id, req.body.quantity);
    if (success) {
      machineService.broadcastInventoryUpdate();
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Item not found' });
    }
  } catch (err) {
    console.error('Error updating quantity:', err);
    res.status(500).json({ success: false, error: 'Failed to update quantity', details: err.message });
  }
}

async function deleteInventoryItem(req, res) {
  try {
    const success = await inventoryService.deleteInventoryItem(req.headers['x-tenant-id'], req.params.id);
    if (success) {
      machineService.broadcastInventoryUpdate();
      res.json({ success: true, message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Item not found' });
    }
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ success: false, error: 'Failed to delete item', details: err.message });
  }
}

async function initializeInventory(req, res) {
  const force = req.query.force === 'true';
  try {
    const inventory = await inventoryService.initializeInventory(req.headers['x-tenant-id'], force);
    machineService.broadcastInventoryUpdate();
    res.json({ success: true, message: 'Inventory initialized with default products', inventory });
  } catch (err) {
    console.error('Error initializing inventory:', err);
    res.status(500).json({ success: false, error: 'Failed to initialize inventory', details: err.message });
  }
}

module.exports = {
  getInventory,
  addItemToInventory,
  updateInventoryItem,
  updateInventoryItemQuantity,
  deleteInventoryItem,
  initializeInventory,
};