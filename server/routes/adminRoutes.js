const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// ✅ Pass ['admin'] as an array to the authorize middleware
router.post('/add-bus', protect, authorize(['admin']), adminController.addBus);
router.post('/create-driver', protect, authorize(['admin']), adminController.createDriver);
router.get('/all-users', protect, authorize(['admin']), adminController.getAllUsers);
router.get('/buses', protect, authorize(['admin']), adminController.getAllBuses);
router.delete('/user/:id', protect, authorize(['admin']), adminController.deleteUser);

module.exports = router;