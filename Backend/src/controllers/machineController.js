const machineService = require('../services/machineService');

async function getMachineStatus(req, res) {
  try {
    const status = machineService.getMachineStatus();
    res.json(status);
  } catch (err) {
    console.error('Error fetching machine status:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch machine status', details: err.message });
  }
}

module.exports = {
  getMachineStatus,
};