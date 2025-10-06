const express = require('express');
const router = express.Router();

// GET /api/providers - Get all providers
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Providers list',
    data: []
  });
});

// POST /api/providers/nearby - Get nearby providers
router.post('/nearby', (req, res) => {
  res.json({
    success: true,
    message: 'Nearby providers',
    data: []
  });
});

// GET /api/providers/:id - Get provider details
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Provider details',
    data: {
      id: req.params.id,
      name: 'Sample Provider',
      type: 'medical',
      status: 'available'
    }
  });
});

// POST /api/providers/register - Register new provider
router.post('/register', (req, res) => {
  res.json({
    success: true,
    message: 'Provider registered',
    data: {
      id: Date.now(),
      name: req.body.name || 'New Provider',
      status: 'pending_verification'
    }
  });
});

// PUT /api/providers/:id/status - Update provider status
router.put('/:id/status', (req, res) => {
  res.json({
    success: true,
    message: 'Provider status updated',
    data: {
      id: req.params.id,
      status: req.body.status || 'available'
    }
  });
});

module.exports = router;