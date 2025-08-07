import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'Black Box Landing Page',
    timestamp: new Date().toISOString()
  });
});

// API endpoint for basic info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Black Box Landing Page',
    version: '1.0.0',
    description: 'Landing page for Black Box vending machine system'
  });
});

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Black Box Landing Page server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});
