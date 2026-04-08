const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

router.get('/:leadId', activityController.getActivities);
router.post('/', activityController.logActivity);

module.exports = router;
