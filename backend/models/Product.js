const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  serialNo: {
    type: Number,
    unique: true,
    sparse: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  costPrice: {
    type: Number,
    default: 0,
    min: [0, 'Cost price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  image: {
    type: String,
    default: null
  },
  imageUrl: {
    type: String,
    default: null
  },
  currentStock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  minStockAlert: {
    type: Number,
    default: 10,
    min: 0
  },
  unit: {
    type: String,
    enum: ['Piece', 'PCS', 'KG', 'Liter', 'ML', 'Gram', 'Cup', 'Bottle', 'Packet', 'TRAY', 'TUB', 'LARGE'],
    default: 'Piece'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for fast queries
productSchema.index({ name: 1, isActive: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isPopular: -1, displayOrder: 1 });

// Virtual for low stock alert
productSchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.minStockAlert;
});

// Method to check if product is available
productSchema.methods.isAvailable = function() {
  return this.isActive && this.currentStock > 0;
};

module.exports = mongoose.model('Product', productSchema);
