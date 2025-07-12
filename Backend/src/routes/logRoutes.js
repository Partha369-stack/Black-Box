const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Serve the last 100 lines of a log file
router.get('/logs', (req, res) => {
  const logPath = path.join(__dirname, '..', '..', 'backend.log'); // Change to your log file if needed
  if (!fs.existsSync(logPath)) {
    return res.status(404).json({ error: 'Log file not found' });
  }
  const data = fs.readFileSync(logPath, 'utf-8');
  const lines = data.split('\n');
  const lastLines = lines.slice(-100).join('\n');
  res.type('text/plain').send(lastLines);
});

module.exports = router;