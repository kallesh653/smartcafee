const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  itemTotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNo: {
    type: Number,
    unique: true,
    index: true
  },
  orderDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  customerName: {
    type: String,
    trim: true
  },
  customerMobile: {
    type: String,
    trim: true
  },
  tableNumber: {
    type: String,
    trim: true
  },
  seatNumber: {
    type: String,
    trim: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  orderType: {
    type: String,
    enum: ['Customer', 'Cashier'],
    default: 'Customer'
  },
  notes: {
    type: String,
    trim: true
  },
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ orderNo: -1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNo && this.isNew) {
    const lastOrder = await mongoose.model('Order').findOne().sort({ orderNo: -1 });
    this.orderNo = lastOrder ? lastOrder.orderNo + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
