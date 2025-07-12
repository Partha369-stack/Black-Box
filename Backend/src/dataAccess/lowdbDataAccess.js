const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

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

  const ordersDir = path.join(__dirname, '..', '..', 'databases', tenantId, 'Orders');
  const inventoryDir = path.join(__dirname, '..', '..', 'databases', tenantId, 'Inventory');

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

module.exports = {
  getDbs,
};