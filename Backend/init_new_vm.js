const fs = require('fs');
const path = require('path');

// Function to initialize a new vending machine database structure
function initNewVM(vmId) {
  if (!vmId) {
    console.error('Error: Vending Machine ID is required. Usage: node init_new_vm.js <VM-ID>');
    process.exit(1);
  }

  const baseDir = path.join(__dirname, 'databases', vmId);
  const ordersDir = path.join(baseDir, 'Orders');
  const inventoryDir = path.join(baseDir, 'Inventory');
  const ordersDbPath = path.join(ordersDir, 'orders.db');
  const inventoryDbPath = path.join(inventoryDir, 'inventory.db');

  // Create directories if they don't exist
  if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir, { recursive: true });
    console.log(`Created Orders directory for ${vmId}`);
  }
  if (!fs.existsSync(inventoryDir)) {
    fs.mkdirSync(inventoryDir, { recursive: true });
    console.log(`Created Inventory directory for ${vmId}`);
  }

  // Initialize empty orders database
  if (!fs.existsSync(ordersDbPath)) {
    fs.writeFileSync(ordersDbPath, JSON.stringify({ orders: [] }, null, 2));
    console.log(`Initialized empty orders.db for ${vmId}`);
  } else {
    console.log(`orders.db already exists for ${vmId}, skipping initialization.`);
  }

  // Initialize empty inventory database
  if (!fs.existsSync(inventoryDbPath)) {
    fs.writeFileSync(inventoryDbPath, JSON.stringify({ inventory: [] }, null, 2));
    console.log(`Initialized empty inventory.db for ${vmId}`);
  } else {
    console.log(`inventory.db already exists for ${vmId}, skipping initialization.`);
  }
}

// Get VM ID from command line argument
const vmId = process.argv[2];
initNewVM(vmId);

console.log(`Initialization complete for Vending Machine: ${vmId}`);
