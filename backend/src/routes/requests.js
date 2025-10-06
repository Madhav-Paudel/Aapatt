const express = require('express');
const router = express.Router();

// GET /api/requests - Get emergency requests
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Emergency requests endpoint',
    data: []
  });
});

// POST /api/requests/create - Create emergency request
router.post('/create', (req, res) => {
  res.json({
    success: true,
    message: 'Emergency request created',
    data: {
      id: Date.now(),
      status: 'pending',
      type: req.body.emergencyType || 'general',
      location: req.body.location || 'Unknown'
    }
  });
});

// GET /api/requests/:id - Get specific emergency request
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Emergency request details',
    data: {
      id: req.params.id,
      status: 'pending',
      type: 'medical',
      location: 'Sample Location'
    }
  });
});

// POST /api/requests/:id/cancel - Cancel emergency request
router.post('/:id/cancel', (req, res) => {
  res.json({
    success: true,
    message: 'Emergency request cancelled',
    data: {
      id: req.params.id,
      status: 'cancelled'
    }
  });
});

// GET /api/requests/history - Get user emergency history
router.get('/history', (req, res) => {
  res.json({
    success: true,
    message: 'Emergency history',
    data: []
  });
});

module.exports = router;