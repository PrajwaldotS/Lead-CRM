const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.get('/', listController.getLists);
router.get('/:id', listController.getListById);
router.get('/:id/stats', listController.getListStats);
router.post('/', listController.createList);
router.put('/:id', listController.updateList);
router.delete('/:id', listController.deleteList);

module.exports = router;
