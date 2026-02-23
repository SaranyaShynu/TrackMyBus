const express = require('express');
const router = express.Router();
const { getDriverProfile } = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware.protect, getDriverProfile);

module.exports = router;