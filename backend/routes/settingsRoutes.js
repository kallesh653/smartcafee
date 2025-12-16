const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route - for customer menu to get slider settings
router.get('/', getSettings);

// Protected routes
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;
