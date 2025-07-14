const express = require('express');
const router = express.Router();
const { getMachineStatus, getAllMachineStatuses } = require('../services/machineService');

// Get status of a specific machine
router.get('/:machineId', (req, res) => {
  try {
    const { machineId } = req.params;
    const status = getMachineStatus(machineId);
    if (!status) {
      return res.status(404).json({ success: false, error: 'Machine not found' });
    }
    res.json({ success: true, status });
  } catch (error) {
    console.error('Error getting machine status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get status of all machines
router.get('/', (req, res) => {
  try {
    const statuses = getAllMachineStatuses();
    res.json({ success: true, statuses });
  } catch (error) {
    console.error('Error getting all machine statuses:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
