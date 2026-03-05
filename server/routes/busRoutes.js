const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/summary', authMiddleware.protect, busController.getBusSummary);
router.get('/:busId/students', authMiddleware.protect, busController.getBusStudents);

module.exports = router;