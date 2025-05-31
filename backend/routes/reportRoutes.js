const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/', reportController.createReport);
router.get('/', reportController.getAllReports);
router.patch('/:id/action', reportController.processReport);

module.exports = router;
