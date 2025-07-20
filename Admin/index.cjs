const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

// Database setup
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ orders: [], inventory: [] }).write();
console.log('Using db.json at:', path.resolve('db.json'));

// --- API Endpoints ---
// Example: Get all inventory
app.get('/inventory', (req, res) => {
  try {
    const inventory = db.get('inventory').value();
    res.json({ success: true, inventory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Static File Serving ---
// Serve static files from Admin/dist
app.use(express.static(path.join(__dirname, 'dist')));
// Also serve static files from D:\BLACK_BOX\dist as fallback
const rootDist = path.join(__dirname, '..', 'dist');
app.use(express.static(rootDist));

// SPA fallback for client-side routing
app.get('*', (req, res) => {
  const adminDistIndex = path.join(__dirname, 'dist', 'index.html');
  const rootDistIndex = path.join(__dirname, '..', 'dist', 'index.html');
  console.log('Trying to serve index.html from:', adminDistIndex);
  res.sendFile(adminDistIndex, err => {
    if (err) {
      console.log('Admin dist index.html not found, trying root dist:', rootDistIndex);
      res.sendFile(rootDistIndex, err2 => {
        if (err2) {
          res.status(404).send('index.html not found in Admin/dist or root dist');
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Admin server running on port ${PORT}`);
});
