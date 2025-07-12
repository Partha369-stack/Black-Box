const { getDbs } = require('../dataAccess/lowdbDataAccess');

async function getInventory(tenantId) {
  const { inventoryDb } = getDbs(tenantId);
  return inventoryDb.get('inventory').value();
}

async function addItemToInventory(tenantId, itemData) {
  const { inventoryDb } = getDbs(tenantId);
  const id = `${Date.now()}`;
  const newItem = {
    id,
    ...itemData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inventoryDb.get('inventory').push(newItem).write();
  // Assuming broadcastInventoryUpdate will be handled by the caller (e.g., controller)
  return newItem;
}

async function updateInventoryItem(tenantId, itemId, updatedData) {
  const { inventoryDb } = getDbs(tenantId);
  const item = inventoryDb.get('inventory').find({ id: itemId });
  if (item.value()) {
    updatedData.updatedAt = new Date().toISOString();
    item.assign(updatedData).write();
    // Assuming broadcastInventoryUpdate will be handled by the caller
    return item.value();
  }
  return null; // Item not found
}

async function updateInventoryItemQuantity(tenantId, itemId, quantity) {
  const { inventoryDb } = getDbs(tenantId);
  const item = inventoryDb.get('inventory').find({ id: itemId });
  if (item.value()) {
    item.assign({ quantity, updatedAt: new Date().toISOString() }).write();
    // Assuming broadcastInventoryUpdate will be handled by the caller
    return true;
  }
  return false; // Item not found
}

async function deleteInventoryItem(tenantId, itemId) {
  const { inventoryDb } = getDbs(tenantId);
  const item = inventoryDb.get('inventory').find({ id: itemId });
  if (item.value()) {
    inventoryDb.get('inventory').remove({ id: itemId }).write();
    // Assuming broadcastInventoryUpdate will be handled by the caller
    return true;
  }
  return false; // Item not found
}

async function initializeInventory(tenantId, force = false) {
  const { inventoryDb } = getDbs(tenantId);
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
      { id: "18", name: "Water Bottle", price: 20, quantity: 40, category: "Water", slot: "G1", image: "/product_img/e9280a387e8049210642406c032b6a60.jpg", description: "Purified drinking water" }
    ];
    
    // Note: Image paths in default inventory will need to be handled by the caller
    // to include the tenant ID if serving static files from tenant directories.
    inventoryDb.set('inventory', defaultInventory).write();
    // Assuming broadcastInventoryUpdate will be handled by the caller
    return defaultInventory;
  }
  return existingInventory;
}


module.exports = {
  getInventory,
  addItemToInventory,
  updateInventoryItem,
  updateInventoryItemQuantity,
  deleteInventoryItem,
  initializeInventory,
};