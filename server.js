const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 4000; // Default to port 4000

// Proxy API requests to the backend
// Assumes backend is running on port 3001
app.all('/api/*', createProxyMiddleware({
  target: `http://localhost:${process.env.BACKEND_PORT || 3003}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // rewrite path
  },
}));

// Serve Admin frontend at the root
app.use('/', express.static(path.join(__dirname, 'Admin', 'dist')));

// Serve VM-001 frontend at /vm-001
app.use('/vm-001', express.static(path.join(__dirname, 'VM-001', 'dist')));

// Serve VM-002 frontend at /vm-002
app.use('/vm-002', express.static(path.join(__dirname, 'VM-002', 'dist')));

// Serve VM-001 index.html for the base path
app.get('/vm-001', (req, res) => {
  res.sendFile(path.join(__dirname, 'VM-001', 'dist', 'index.html'));
});

// Serve VM-002 index.html for the base path
app.get('/vm-002', (req, res) => {
  res.sendFile(path.join(__dirname, 'VM-002', 'dist', 'index.html'));
});

// For any other requests not matching static files or /api,
// serve the index.html of the Admin app (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Admin', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Root server running on port ${PORT}`);
  console.log(`Serving Admin from /`);
  console.log(`Serving VM-001 from /vm-001`);
  console.log(`Serving VM-002 from /vm-002`);
  console.log(`Proxying /api to backend on port ${process.env.BACKEND_PORT || 3001}`);
});