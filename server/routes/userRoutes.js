const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController= require('../controllers/userController');

// Routes
router.get('/profile', authMiddleware.protect, userController.getProfile);
router.put('/settings', authMiddleware.protect, userController.updateSettings);

module.exports = router;