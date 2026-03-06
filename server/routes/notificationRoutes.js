const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.post('/broadcast', authMiddleware.protect, notificationController.broadcastNotification);

module.exports = router;