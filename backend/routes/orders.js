const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendOrderStatusEmail } = require('../utils/emailService');

const populateOrder = (query) => query.populate('user', 'name email phone').populate('pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats', 'name category price image description');

// GET /api/orders/my-orders - User's orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await populateOrder(
      Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    );
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/orders/:id - Single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await populateOrder(Order.findById(req.params.id));
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/orders - Admin: all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    
    const orders = await populateOrder(
      Order.find(filter).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit)
    );
    const total = await Order.countDocuments(filter);

    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/orders/:id/status - Admin: update order status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['confirmed', 'in_kitchen', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || getStatusNote(status) });
    await order.save();

    // Send email notification to user
    const statusMessages = {
      confirmed: '✅ Order Confirmed',
      in_kitchen: '👨‍🍳 In the Kitchen',
      out_for_delivery: '🚴 Out for Delivery',
      delivered: '🎉 Delivered!',
      cancelled: '❌ Order Cancelled'
    };

    await sendOrderStatusEmail(order.user, order, statusMessages[status]);

    const populated = await populateOrder(Order.findById(order._id));
    res.json({ success: true, message: 'Order status updated', order: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

function getStatusNote(status) {
  const notes = {
    confirmed: 'Order has been confirmed by the restaurant',
    in_kitchen: 'Your pizza is being prepared in the kitchen',
    out_for_delivery: 'Your order is on the way!',
    delivered: 'Order delivered successfully',
    cancelled: 'Order has been cancelled'
  };
  return notes[status] || '';
}

module.exports = router;
