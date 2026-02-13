const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userController= require('../controllers/userController');

// Routes
router.get('/profile', protect, userController.getProfile);
router.put('/settings', protect, userController.updateSettings);

module.exports = router;