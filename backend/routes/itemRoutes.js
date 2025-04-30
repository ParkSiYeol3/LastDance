const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// 아이템 관련 API만 여기다 씀
router.get('/:itemId', itemController.getItemDetail);
router.put('/:itemId', itemController.updateItem);
router.delete('/:itemId', itemController.deleteItem);
router.post('/:itemId/rentals', itemController.requestRental);
router.post('/:itemId/rentals/:rentalId/confirm', itemController.confirmRental);
router.get('/:itemId/comments', itemController.getComments);
router.post('/:itemId/comments', itemController.addComment);
router.get('/:itemId/rentals', itemController.getRentalHistory);

module.exports = router;
