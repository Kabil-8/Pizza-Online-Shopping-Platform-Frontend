const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');
const { checkLowStock } = require('../utils/stockChecker');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

// POST /api/payment/create-order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', pizzaConfig, deliveryAddress, phone, specialInstructions, size, quantity } = req.body;

    // Create Razorpay order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amount * 100, // in paise
        currency,
        receipt: `order_${Date.now()}`,
        notes: { userId: req.user._id.toString() }
      });
    } catch (razorpayError) {
      // Fallback for test mode without real keys
      razorpayOrder = {
        id: `rzp_test_${Date.now()}`,
        amount: amount * 100,
        currency,
        status: 'created'
      };
    }

    // Create pending order in DB
    const order = await Order.create({
      user: req.user._id,
      pizza: {
        base: pizzaConfig.baseId,
        sauce: pizzaConfig.sauceId,
        cheese: pizzaConfig.cheeseId,
        veggies: pizzaConfig.veggieIds || [],
        meats: pizzaConfig.meatIds || []
      },
      size: size || 'medium',
      quantity: quantity || 1,
      totalPrice: amount,
      deliveryAddress,
      phone,
      specialInstructions,
      paymentStatus: 'pending',
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
      statusHistory: [{ status: 'pending', note: 'Order created, awaiting payment' }]
    });

    res.json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
    });
  } catch (error) {
    console.error('Payment order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// POST /api/payment/verify - Verify payment and confirm order
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, testMode } = req.body;

    let isValidPayment = false;

    if (testMode) {
      // Test mode: automatically validate
      isValidPayment = true;
    } else {
      // Verify Razorpay signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      isValidPayment = expectedSignature === razorpay_signature;
    }

    if (!isValidPayment) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update order
    const order = await Order.findById(orderId)
      .populate('pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentStatus = 'paid';
    order.paymentId = razorpay_payment_id || `test_${Date.now()}`;
    order.status = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', note: 'Payment received, order confirmed' });
    order.estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000); // 45 mins
    await order.save();

    // Deduct inventory
    await deductInventory(order);

    // Check low stock after order
    await checkLowStock();

    res.json({
      success: true,
      message: 'Payment verified and order placed successfully!',
      order: await Order.findById(orderId).populate('pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats')
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

async function deductInventory(order) {
  const updates = [];
  
  if (order.pizza.base?._id) updates.push(Inventory.findByIdAndUpdate(order.pizza.base._id, { $inc: { quantity: -1 } }));
  if (order.pizza.sauce?._id) updates.push(Inventory.findByIdAndUpdate(order.pizza.sauce._id, { $inc: { quantity: -1 } }));
  if (order.pizza.cheese?._id) updates.push(Inventory.findByIdAndUpdate(order.pizza.cheese._id, { $inc: { quantity: -1 } }));
  
  (order.pizza.veggies || []).forEach(v => {
    if (v._id) updates.push(Inventory.findByIdAndUpdate(v._id, { $inc: { quantity: -1 } }));
  });
  (order.pizza.meats || []).forEach(m => {
    if (m._id) updates.push(Inventory.findByIdAndUpdate(m._id, { $inc: { quantity: -1 } }));
  });

  await Promise.all(updates);

  // Update availability
  await Inventory.updateMany({ quantity: { $lte: 0 } }, { isAvailable: false });
  await Inventory.updateMany({ quantity: { $gt: 0 }, isAvailable: false }, { isAvailable: true });
}

module.exports = router;
