const mongoose = require('mongoose');

const readyItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  category: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['Piece', 'KG', 'Liter', 'ML', 'Gram', 'Cup', 'Bottle', 'Packet', 'Box', 'TRAY']
  },
  defaultQuantity: {
    type: Number,
    default: 1
  },
  costPrice: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true
  },
  minStockAlert: {
    type: Number,
    default: 10
  },
  icon: {
    type: String,
    default: 'shopping'
  },
  color: {
    type: String,
    default: '#1890ff'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

// Index for fast queries
readyItemSchema.index({ isActive: 1, displayOrder: 1 });
readyItemSchema.index({ category: 1 });

const ReadyItem = mongoose.model('ReadyItem', readyItemSchema);

module.exports = ReadyItem;
