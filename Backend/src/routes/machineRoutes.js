const express = require('express');
const machineController = require('../controllers/machineController');

const router = express.Router();

// Endpoint to get single machine status
router.get('/machine/status', machineController.getMachineStatus);

module.exports = router;