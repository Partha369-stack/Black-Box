const WebSocket = require('ws');

// WebSocket-based machine status tracking
const machineSocketMap = new Map(); // machine_id -> ws

// Multi-machine status tracking
const machineStatuses = new Map();

let wss = null; // WebSocket server instance

function initializeWebSocketServer(server) {
  wss = new WebSocket.Server({
    server,
    clientTracking: true,
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      serverMaxWindowBits: 10,
      concurrencyLimit: 10,
      threshold: 1024,
    },
    keepalive: true,
    keepaliveInterval: 30000,
    keepaliveGracePeriod: 10000,
  });

  wss.on('connection', (ws, req) => {
    let registeredId = null;
    const ip = req.socket.remoteAddress;
    console.log(`[WebSocket] New connection from ${ip}`);
    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        console.log(`[WebSocket] Message from ${ip}:`, data);
        if (data.type === 'register' && data.machine_id) {
          registeredId = data.machine_id;
          machineSocketMap.set(registeredId, ws);
          machineStatuses.set(registeredId, {
            id: registeredId,
            status: 'online',
            lastHeartbeat: new Date().toISOString()
          });
          console.log(`[WebSocket] Registered machine: ${registeredId} (online) from ${ip}`);
          broadcastMachineStatusUpdate();
        } else if (data.type === 'heartbeat' && registeredId) {
          machineStatuses.set(registeredId, {
            id: registeredId,
            status: 'online',
            lastHeartbeat: new Date().toISOString()
          });
          broadcastMachineStatusUpdate();
        }
      } catch (e) {
        console.error('[WebSocket] Error processing message:', e);
        console.log('[WebSocket] Malformed message:', msg);
      }
    });
    ws.on('close', (code, reason) => {
      if (registeredId) {
        machineSocketMap.delete(registeredId);
        if (machineStatuses.has(registeredId)) {
          machineStatuses.get(registeredId).status = 'offline';
          machineStatuses.get(registeredId).lastHeartbeat = new Date().toISOString();
        }
        console.log(`[WebSocket] Disconnected: ${registeredId} (offline). Code: ${code}, Reason: ${reason}`);
        broadcastMachineStatusUpdate();
      } else {
        console.log(`[WebSocket] Connection closed (unregistered) from ${ip}. Code: ${code}, Reason: ${reason}`);
      }
    });
    ws.on('error', (error) => {
      console.error(`[WebSocket] Error on connection from ${registeredId || ip}:`, error);
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

function broadcastMachineStatusUpdate() {
  if (!wss) return;
  const statuses = Array.from(machineStatuses.values());
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'machineStatusUpdated', statuses }));
    }
  });
}

function getMachineStatus(machineId) {
  return machineStatuses.get(machineId) || { id: machineId, status: 'offline', lastHeartbeat: null };
}

function getAllMachineStatuses() {
  return Array.from(machineStatuses.values());
}

setInterval(() => {
  const now = new Date();
  let needsUpdate = false;

  machineStatuses.forEach((status, machineId) => {
    if (status.status === 'online') {
      const lastHeartbeat = new Date(status.lastHeartbeat);
      const secondsSinceLastHeartbeat = (now - lastHeartbeat) / 1000;
      
      if (secondsSinceLastHeartbeat > 30) {
        status.status = 'offline';
        needsUpdate = true;
        console.log(`[WebSocket] Marking machine ${machineId} as offline - no recent heartbeats`);
      }
    }
  });

  if (needsUpdate) {
    broadcastMachineStatusUpdate();
  }
}, 10000);

module.exports = {
  initializeWebSocketServer,
  broadcastOrdersUpdate,
  broadcastInventoryUpdate,
  getMachineStatus,
  getAllMachineStatuses,
  broadcastMachineStatusUpdate,
};