const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getStats);
router.get('/follow-ups', dashboardController.getFollowUps);

module.exports = router;
