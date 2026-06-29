const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/inventory - Get all inventory items
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items = await Inventory.find(filter).sort({ category: 1, name: 1 });
    
    const summary = {
      total: items.length,
      lowStock: items.filter(i => i.quantity <= i.threshold).length,
      outOfStock: items.filter(i => i.quantity === 0).length
    };

    res.json({ success: true, items, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { quantity, threshold, price, isAvailable, description } = req.body;
    const updates = {};
    
    if (quantity !== undefined) { updates.quantity = quantity; updates.isAvailable = quantity > 0; updates.lowStockAlertSent = quantity > (threshold || 20) ? false : undefined; }
    if (threshold !== undefined) updates.threshold = threshold;
    if (price !== undefined) updates.price = price;
    if (description !== undefined) updates.description = description;

    const item = await Inventory.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/inventory/restock - Bulk restock
router.post('/restock', protect, adminOnly, async (req, res) => {
  try {
    const { items } = req.body; // [{ id, quantity }]
    const updates = items.map(({ id, quantity }) =>
      Inventory.findByIdAndUpdate(id, { $inc: { quantity }, isAvailable: true, lowStockAlertSent: false }, { new: true })
    );
    const results = await Promise.all(updates);
    res.json({ success: true, message: `Restocked ${results.length} items`, items: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/inventory/stats - Dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const [totalOrders, todayOrders, pendingOrders, totalRevenue, inventoryCount] = await Promise.all([
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }, paymentStatus: 'paid' }),
      Order.countDocuments({ status: { $in: ['confirmed', 'in_kitchen', 'out_for_delivery'] } }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Inventory.countDocuments({ quantity: { $lte: 20 } })
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        lowStockItems: inventoryCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
