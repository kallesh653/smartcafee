const Order = require('../models/Order');
const Product = require('../models/Product');
const Bill = require('../models/Bill');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const {
      status,
      orderType,
      fromDate,
      toDate,
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (orderType) {
      query.orderType = orderType;
    }

    if (fromDate || toDate) {
      query.orderDate = {};
      if (fromDate) query.orderDate.$gte = new Date(fromDate);
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.orderDate.$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('items.product', 'name image imageUrl')
      .populate('completedBy', 'username')
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image imageUrl')
      .populate('completedBy', 'username');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order (Customer)
// @route   POST /api/orders
// @access  Public/Customer
exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, customerMobile, tableNumber, seatNumber, items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item'
      });
    }

    // Validate and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product is not available: ${product.name}`
        });
      }

      if (product.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for: ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        itemTotal
      });
    }

    const order = await Order.create({
      customerName,
      customerMobile,
      tableNumber,
      seatNumber,
      items: orderItems,
      subtotal,
      totalAmount: subtotal,
      orderType: 'Customer',
      notes,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Cashier
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;

    if (status === 'Completed' || status === 'Cancelled') {
      order.completedAt = new Date();
      order.completedBy = req.user._id;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order ${status.toLowerCase()} successfully`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Convert order to bill
// @route   POST /api/orders/:id/convert-to-bill
// @access  Private/Cashier
exports.convertToBill = async (req, res, next) => {
  try {
    const { paymentMode, discount = 0 } = req.body;

    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot convert cancelled order to bill'
      });
    }

    // Check stock availability again
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for: ${product.name}`
        });
      }
    }

    // Calculate bill totals
    const subtotal = order.subtotal;
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;
    const grandTotal = Math.round(total);
    const roundOff = grandTotal - total;

    // Create bill
    const billData = {
      userId: req.user._id,
      userName: req.user.username,
      customerName: order.customerName || 'Walk-in Customer',
      customerMobile: order.customerMobile,
      items: order.items.map(item => ({
        mainCode: null,
        mainCodeName: 'General',
        product: item.product._id,
        subCode: null,
        subCodeName: null,
        itemName: item.productName,
        quantity: item.quantity,
        unit: item.product.unit || 'Piece',
        price: item.price,
        itemTotal: item.itemTotal,
        costPrice: item.product.costPrice || 0
      })),
      subtotal,
      discountPercent: discount,
      discountAmount,
      gstAmount: 0,
      totalAmount: grandTotal - roundOff,
      roundOff,
      grandTotal,
      paymentMode: paymentMode || 'Cash',
      paymentDetails: {
        cash: paymentMode === 'Cash' ? grandTotal : 0,
        upi: paymentMode === 'UPI' ? grandTotal : 0,
        card: paymentMode === 'Card' ? grandTotal : 0
      }
    };

    const bill = await Bill.create(billData);

    // Update product stocks
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { currentStock: -item.quantity } }
      );
    }

    // Update order status
    order.status = 'Completed';
    order.completedAt = new Date();
    order.completedBy = req.user._id;
    await order.save();

    res.status(201).json({
      success: true,
      message: `Bill #${bill.billNo} created successfully from order #${order.orderNo}`,
      bill,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending orders count
// @route   GET /api/orders/stats/pending
// @access  Private
exports.getPendingOrdersCount = async (req, res, next) => {
  try {
    const count = await Order.countDocuments({
      status: { $in: ['Pending', 'Preparing'] }
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};
