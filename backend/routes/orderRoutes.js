const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  convertToBill,
  deleteOrder,
  getPendingOrdersCount
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes - Customer can create order
router.post('/', createOrder);

// Protected routes
router.get('/', protect, getOrders);
router.get('/stats/pending', protect, getPendingOrdersCount);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);
router.post('/:id/convert-to-bill', protect, convertToBill);
router.delete('/:id', protect, authorize('admin'), deleteOrder);

module.exports = router;
