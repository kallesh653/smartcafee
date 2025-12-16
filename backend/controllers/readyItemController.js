const ReadyItem = require('../models/ReadyItem');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

// Get all ready items
exports.getAllReadyItems = async (req, res) => {
  try {
    const readyItems = await ReadyItem.find({ isActive: true })
      .populate('product', 'name serialNo currentStock')
      .sort({ displayOrder: 1, itemName: 1 });

    res.status(200).json({
      success: true,
      data: readyItems
    });
  } catch (error) {
    console.error('Error fetching ready items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ready items',
      error: error.message
    });
  }
};

// Get ready items by category
exports.getReadyItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const readyItems = await ReadyItem.find({ category, isActive: true })
      .populate('product', 'name serialNo currentStock')
      .sort({ displayOrder: 1, itemName: 1 });

    res.status(200).json({
      success: true,
      data: readyItems
    });
  } catch (error) {
    console.error('Error fetching ready items by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ready items',
      error: error.message
    });
  }
};

// Create ready item
exports.createReadyItem = async (req, res) => {
  try {
    const readyItem = await ReadyItem.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Ready item created successfully',
      data: readyItem
    });
  } catch (error) {
    console.error('Error creating ready item:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create ready item',
      error: error.message
    });
  }
};

// Update ready item
exports.updateReadyItem = async (req, res) => {
  try {
    const readyItem = await ReadyItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!readyItem) {
      return res.status(404).json({
        success: false,
        message: 'Ready item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ready item updated successfully',
      data: readyItem
    });
  } catch (error) {
    console.error('Error updating ready item:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update ready item',
      error: error.message
    });
  }
};

// Delete ready item
exports.deleteReadyItem = async (req, res) => {
  try {
    const readyItem = await ReadyItem.findByIdAndDelete(req.params.id);

    if (!readyItem) {
      return res.status(404).json({
        success: false,
        message: 'Ready item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ready item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ready item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ready item',
      error: error.message
    });
  }
};

// Add stock using ready item (Quick Stock Addition)
exports.addStockFromReadyItem = async (req, res) => {
  try {
    const { readyItemId, quantity, notes } = req.body;

    if (!readyItemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Ready item ID and quantity are required'
      });
    }

    const readyItem = await ReadyItem.findById(readyItemId).populate('product');

    if (!readyItem) {
      return res.status(404).json({
        success: false,
        message: 'Ready item not found'
      });
    }

    let product = readyItem.product;

    // If no product linked, try to find or create one
    if (!product) {
      product = await Product.findOne({ name: readyItem.itemName });

      if (!product) {
        // Create product automatically
        product = await Product.create({
          name: readyItem.itemName,
          category: readyItem.category,
          unit: readyItem.unit,
          costPrice: readyItem.costPrice,
          price: readyItem.sellingPrice,
          currentStock: 0,
          minStockAlert: readyItem.minStockAlert,
          serialNo: `AUTO-${Date.now()}`
        });

        // Link product to ready item
        readyItem.product = product._id;
        await readyItem.save();
      }
    }

    // Update product stock
    const previousStock = product.currentStock || 0;
    product.currentStock = previousStock + quantity;
    await product.save();

    // Create stock ledger entry
    await StockLedger.create({
      itemId: product._id,
      itemName: product.name,
      transactionType: 'Purchase',
      quantity: quantity,
      unit: readyItem.unit,
      rate: readyItem.costPrice,
      transactionDate: new Date(),
      referenceType: 'Manual',
      referenceNo: `READY-${Date.now()}`,
      balanceQty: product.currentStock,
      notes: notes || `Quick stock addition via Ready Item: ${readyItem.itemName}`
    });

    res.status(200).json({
      success: true,
      message: `Successfully added ${quantity} ${readyItem.unit} of ${readyItem.itemName} to stock`,
      data: {
        product,
        previousStock,
        newStock: product.currentStock,
        quantityAdded: quantity
      }
    });
  } catch (error) {
    console.error('Error adding stock from ready item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add stock',
      error: error.message
    });
  }
};

// Bulk add stock (multiple ready items at once)
exports.bulkAddStock = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ readyItemId, quantity, notes }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        const { readyItemId, quantity, notes } = item;

        const readyItem = await ReadyItem.findById(readyItemId).populate('product');

        if (!readyItem) {
          errors.push({ readyItemId, error: 'Ready item not found' });
          continue;
        }

        let product = readyItem.product;

        if (!product) {
          product = await Product.findOne({ name: readyItem.itemName });

          if (!product) {
            product = await Product.create({
              name: readyItem.itemName,
              category: readyItem.category,
              unit: readyItem.unit,
              costPrice: readyItem.costPrice,
              price: readyItem.sellingPrice,
              currentStock: 0,
              minStockAlert: readyItem.minStockAlert,
              serialNo: `AUTO-${Date.now()}`
            });

            readyItem.product = product._id;
            await readyItem.save();
          }
        }

        const previousStock = product.currentStock || 0;
        product.currentStock = previousStock + quantity;
        await product.save();

        await StockLedger.create({
          itemId: product._id,
          itemName: product.name,
          transactionType: 'Purchase',
          quantity: quantity,
          unit: readyItem.unit,
          rate: readyItem.costPrice,
          transactionDate: new Date(),
          referenceType: 'Manual',
          referenceNo: `READY-BULK-${Date.now()}`,
          balanceQty: product.currentStock,
          notes: notes || `Bulk stock addition via Ready Item: ${readyItem.itemName}`
        });

        results.push({
          itemName: readyItem.itemName,
          previousStock,
          newStock: product.currentStock,
          quantityAdded: quantity
        });
      } catch (err) {
        errors.push({ readyItemId: item.readyItemId, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${results.length} items`,
      data: {
        successful: results,
        failed: errors,
        totalProcessed: items.length,
        successCount: results.length,
        errorCount: errors.length
      }
    });
  } catch (error) {
    console.error('Error in bulk stock addition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk stock addition',
      error: error.message
    });
  }
};
