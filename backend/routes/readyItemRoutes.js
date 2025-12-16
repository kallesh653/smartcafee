const express = require('express');
const router = express.Router();
const {
  getAllReadyItems,
  getReadyItemsByCategory,
  createReadyItem,
  updateReadyItem,
  deleteReadyItem,
  addStockFromReadyItem,
  bulkAddStock
} = require('../controllers/readyItemController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public/Protected routes
router.get('/', protect, getAllReadyItems);
router.get('/category/:category', protect, getReadyItemsByCategory);

// Stock addition routes
router.post('/add-stock', protect, addStockFromReadyItem);
router.post('/bulk-add-stock', protect, bulkAddStock);

// Admin only routes
router.post('/', protect, adminOnly, createReadyItem);
router.put('/:id', protect, adminOnly, updateReadyItem);
router.delete('/:id', protect, adminOnly, deleteReadyItem);

module.exports = router;
