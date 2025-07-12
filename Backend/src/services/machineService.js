const WebSocket = require('ws');

// WebSocket-based machine status tracking
const machineSocketMap = new Map(); // machine_id -> ws

// Single machine status tracking
let singleMachine = {
  id: 'VM-001',
  status: 'offline',
  lastHeartbeat: null
};

let wss = null; // WebSocket server instance

function initializeWebSocketServer(server) {
  wss = new WebSocket.Server({ server });

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
}

function broadcastOrdersUpdate() {
  if (!wss) return;
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'ordersUpdated' }));
    }
  });
}

function broadcastInventoryUpdate() {
  if (!wss) return;
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'inventoryUpdated' }));
    }
  });
}

function getMachineStatus() {
  return singleMachine;
}

module.exports = {
  initializeWebSocketServer,
  broadcastOrdersUpdate,
  broadcastInventoryUpdate,
  getMachineStatus,
};