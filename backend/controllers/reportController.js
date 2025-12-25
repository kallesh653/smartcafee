const Bill = require('../models/Bill');
const Purchase = require('../models/Purchase');
const SubCode = require('../models/SubCode');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');
const Supplier = require('../models/Supplier');
const moment = require('moment');

// @desc    Sales Report
// @route   GET /api/reports/sales
// @access  Private
exports.salesReport = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const filter = { status: 'Completed' };
    if (startDate) filter.billDate = { $gte: new Date(startDate) };
    if (endDate) filter.billDate = { ...filter.billDate, $lte: new Date(endDate) };
    if (userId) filter.userId = userId;

    const bills = await Bill.find(filter).populate('userId', 'name').sort({ billDate: -1 });
    const totalSales = bills.reduce((sum, b) => sum + b.grandTotal, 0);

    res.json({ success: true, count: bills.length, totalSales, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Item-wise Sales Report
// @route   GET /api/reports/itemwise-sales
// @access  Private
exports.itemwiseSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { status: 'Completed' };
    if (startDate) filter.billDate = { $gte: new Date(startDate) };
    if (endDate) filter.billDate = { ...filter.billDate, $lte: new Date(endDate) };

    const bills = await Bill.find(filter);

    const itemSales = {};
    bills.forEach(bill => {
      bill.items.forEach(item => {
        // Use product ID if available, otherwise use subCode for backward compatibility
        const key = (item.product || item.subCode)?.toString();
        if (!key) return; // Skip items without product/subCode reference

        if (!itemSales[key]) {
          itemSales[key] = {
            itemName: item.itemName,
            subCodeName: item.itemName, // Use itemName for both fields
            quantity: 0,
            totalAmount: 0,
            profit: 0
          };
        }
        itemSales[key].quantity += item.quantity;
        itemSales[key].totalAmount += item.itemTotal;
        itemSales[key].profit += (item.price - (item.costPrice || 0)) * item.quantity;
      });
    });

    const report = Object.values(itemSales);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    User-wise Sales Report
// @route   GET /api/reports/userwise-sales
// @access  Private/Admin
exports.userwiseSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { status: 'Completed' };
    if (startDate) filter.billDate = { $gte: new Date(startDate) };
    if (endDate) filter.billDate = { ...filter.billDate, $lte: new Date(endDate) };

    const report = await Bill.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$userId',
          userName: { $first: '$userName' },
          totalBills: { $sum: 1 },
          totalSales: { $sum: '$grandTotal' }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Daily Collection Report
// @route   GET /api/reports/daily-collection
// @access  Private
exports.dailyCollectionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { status: 'Completed' };
    if (startDate) filter.billDate = { $gte: new Date(startDate) };
    if (endDate) filter.billDate = { ...filter.billDate, $lte: new Date(endDate) };

    const bills = await Bill.find(filter);

    const dailyData = {};
    bills.forEach(bill => {
      const date = moment(bill.billDate).format('YYYY-MM-DD');
      if (!dailyData[date]) {
        dailyData[date] = { date, totalBills: 0, cash: 0, upi: 0, card: 0, mixed: 0, totalSales: 0 };
      }
      dailyData[date].totalBills += 1;
      dailyData[date].totalSales += bill.grandTotal;
      dailyData[date][bill.paymentMode.toLowerCase()] += bill.grandTotal;
    });

    const report = Object.values(dailyData).sort((a, b) => b.date.localeCompare(a.date));
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Purchase Summary Report
// @route   GET /api/reports/purchase-summary
// @access  Private/Admin
exports.purchaseSummaryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate) filter.invoiceDate = { $gte: new Date(startDate) };
    if (endDate) filter.invoiceDate = { ...filter.invoiceDate, $lte: new Date(endDate) };

    const purchases = await Purchase.find(filter).populate('supplier', 'supplierName').sort({ invoiceDate: -1 });
    const totalAmount = purchases.reduce((sum, p) => sum + p.invoiceAmount, 0);
    const totalPending = purchases.reduce((sum, p) => sum + p.pendingAmount, 0);

    res.json({ success: true, count: purchases.length, totalAmount, totalPending, purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Stock Report
// @route   GET /api/reports/stock
// @access  Private/Admin
exports.stockReport = async (req, res) => {
  try {
    const items = await Product.find({ isActive: true })
      .select('name serialNo category currentStock unit minStockAlert price costPrice')
      .sort({ currentStock: 1 });

    const report = items.map(item => ({
      itemName: item.name,
      subCode: item.serialNo || '-',
      mainCode: item.category,
      currentStock: item.currentStock,
      unit: item.unit,
      minStockAlert: item.minStockAlert,
      isLowStock: item.currentStock <= item.minStockAlert,
      value: item.currentStock * (item.costPrice || 0)
    }));

    res.json({ success: true, report });
  } catch (error) {
    console.error('Stock report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Profit Report
// @route   GET /api/reports/profit
// @access  Private/Admin
exports.profitReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { status: 'Completed' };
    if (startDate) filter.billDate = { $gte: new Date(startDate) };
    if (endDate) filter.billDate = { ...filter.billDate, $lte: new Date(endDate) };

    const bills = await Bill.find(filter);

    let totalRevenue = 0;
    let totalCost = 0;
    const itemProfits = {};

    bills.forEach(bill => {
      totalRevenue += bill.grandTotal;
      bill.items.forEach(item => {
        const cost = (item.costPrice || 0) * item.quantity;
        const revenue = item.itemTotal;
        const profit = revenue - cost;

        totalCost += cost;

        // Use product ID if available, otherwise use subCode for backward compatibility
        const key = (item.product || item.subCode)?.toString();
        if (!key) return; // Skip items without product/subCode reference

        if (!itemProfits[key]) {
          itemProfits[key] = {
            itemName: item.itemName,
            quantitySold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
            profitPercent: 0
          };
        }
        itemProfits[key].quantitySold += item.quantity;
        itemProfits[key].revenue += revenue;
        itemProfits[key].cost += cost;
        itemProfits[key].profit += profit;
      });
    });

    const report = Object.values(itemProfits).map(item => ({
      ...item,
      profitPercent: item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(2) : 0
    }));

    const totalProfit = totalRevenue - totalCost;

    res.json({
      success: true,
      summary: { totalRevenue, totalCost, totalProfit, profitPercent: ((totalProfit / totalRevenue) * 100).toFixed(2) },
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Supplier Report
// @route   GET /api/reports/supplier
// @access  Private/Admin
exports.supplierReport = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    const report = suppliers.map(s => ({
      supplierName: s.supplierName,
      mobile: s.mobile,
      totalPurchased: s.totalPurchased,
      totalPending: s.totalPending
    }));

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Stock Ledger Report
// @route   GET /api/reports/stock-ledger
// @access  Private/Admin
exports.stockLedgerReport = async (req, res) => {
  try {
    const { itemId, startDate, endDate } = req.query;

    const filter = {};
    if (itemId) filter.itemId = itemId;
    if (startDate) filter.transactionDate = { $gte: new Date(startDate) };
    if (endDate) filter.transactionDate = { ...filter.transactionDate, $lte: new Date(endDate) };

    const ledger = await StockLedger.find(filter)
      .populate('itemId', 'name subCode')
      .sort({ transactionDate: -1 });

    res.json({ success: true, count: ledger.length, ledger });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.showWiseCollectionReport = async (req, res) => {
  try {
    const { date, slots } = req.query;
    const baseDate = date ? new Date(date) : new Date();
    baseDate.setHours(0, 0, 0, 0);
    const dayEnd = new Date(baseDate);
    dayEnd.setHours(23, 59, 59, 999);

    let slotDefs = [
      { name: 'Morning', start: '10:00', end: '13:00' },
      { name: 'Matinee', start: '13:00', end: '16:00' },
      { name: 'Evening', start: '18:00', end: '21:00' },
      { name: 'Night', start: '21:00', end: '23:59' }
    ];

    if (slots) {
      try {
        const parsed = JSON.parse(slots);
        if (Array.isArray(parsed) && parsed.length > 0) {
          slotDefs = parsed.map(s => ({
            name: String(s.name || '').trim() || 'Show',
            start: String(s.start || '00:00'),
            end: String(s.end || '23:59')
          }));
        }
      } catch (e) {}
    }

    const bills = await Bill.find({
      status: 'Completed',
      billDate: { $gte: baseDate, $lte: dayEnd }
    }).lean();

    const toTime = (hhmm) => {
      const [hh, mm] = hhmm.split(':').map(v => parseInt(v, 10));
      const d = new Date(baseDate);
      d.setHours(hh || 0, mm || 0, 0, 0);
      return d;
    };

    const report = slotDefs.map(slot => {
      const startTs = toTime(slot.start);
      const endTs = toTime(slot.end);

      const inSlot = bills.filter(b => {
        const t = new Date(b.billDate);
        return t >= startTs && t <= endTs;
      });

      const totalBills = inSlot.length;
      const totalSales = inSlot.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

      let cash = 0;
      let upi = 0;
      let card = 0;
      let mixed = 0;

      inSlot.forEach(b => {
        const pd = b.paymentDetails || {};

        if (b.paymentMode === 'Cash') {
          cash += (b.grandTotal || 0);
        } else if (b.paymentMode === 'UPI') {
          upi += (b.grandTotal || 0);
        } else if (b.paymentMode === 'Card') {
          card += (b.grandTotal || 0);
        } else if (b.paymentMode === 'Mixed') {
          // For mixed payments, split into individual payment types
          // Don't add to mixed total (to avoid double counting)
          cash += (pd.cash || 0);
          upi += (pd.upi || 0);
          card += (pd.card || 0);
          mixed += (b.grandTotal || 0);
        }
      });

      return {
        slotName: slot.name,
        start: slot.start,
        end: slot.end,
        totalBills,
        totalSales,
        cash,
        upi,
        card,
        mixed
      };
    });

    res.json({ success: true, date: moment(baseDate).format('YYYY-MM-DD'), report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
