const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const busController=require('../controllers/busController');

// ✅ Pass ['admin'] as an array to the authorize middleware
router.post('/add-student',protect, authorize(['admin']), adminController.addStudent);
router.post('/add-bus', protect, authorize(['admin']), adminController.addBus);
router.post('/register', protect, authorize(['admin']), adminController.addStaff);
router.get('/all-users', protect, authorize(['admin']), adminController.getAllUsers);
router.get('/buses', protect, authorize(['admin']), adminController.getAllBuses);
router.put('/parent/:parentId/student/:studentId', protect, authorize(['admin']), adminController.updateStudent);
router.put('/user/:id' , protect, authorize(['admin']), adminController.updateUser);
router.put('/bus/:id' , protect, authorize(['admin']), adminController.updateBus);
router.delete('/parent/:parentId/student/:studentId', protect, authorize(['admin']), adminController.deleteStudent);
router.delete('/user/:id', protect, authorize(['admin']), adminController.deleteUser);
router.delete('/bus/:id', protect, authorize(['admin']),adminController.deleteBus);

router.get('/bus-summary', protect, authorize(['admin']), busController.getBusSummary);

module.exports = router;