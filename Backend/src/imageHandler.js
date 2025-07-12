const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// --- Tenant-Specific Image Handling ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
      return cb(new Error('Tenant ID is missing'));
    }
    const tenantImageDir = path.join(__dirname, '..', 'databases', tenantId, 'Inventory', 'product_images');
    if (!fs.existsSync(tenantImageDir)) {
      fs.mkdirSync(tenantImageDir, { recursive: true });
    }
    cb(null, tenantImageDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, jpeg, and png files are allowed'));
    }
  }
});

// Image upload endpoint (requires tenant middleware)
router.post('/upload', upload.single('image'), (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  // The path returned should be relative to the root server's static serving
  const imagePath = `/${tenantId}/Inventory/product_images/${req.file.filename}`;
  res.json({ success: true, path: imagePath });
});

// Serve static product images from tenant-specific folders
router.use('/:tenantId/Inventory/product_images', (req, res, next) => {
  const { tenantId } = req.params;
  const imagePath = path.join(__dirname, '..', 'databases', tenantId, 'Inventory', 'product_images', req.url);
  if (fs.existsSync(imagePath)) {
    return res.sendFile(imagePath);
  }
  res.status(404).send('Image not found');
});

module.exports = router;