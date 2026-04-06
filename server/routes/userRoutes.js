const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController= require('../controllers/userController');

// Routes
router.get('/profile', authMiddleware.protect, userController.getProfile);
router.post('/update-fcm-token', authMiddleware.protect, userController.updateFCMToken);
router.put('/settings', authMiddleware.protect, userController.updateSettings);

module.exports = router;    