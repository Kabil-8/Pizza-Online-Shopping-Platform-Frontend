const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pizza: {
    base: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    veggies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }],
    meats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }]
  },
  pizzaName: { type: String, default: 'Custom Pizza' },
  size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_kitchen', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  razorpayOrderId: String,
  deliveryAddress: { type: String, required: true },
  phone: String,
  specialInstructions: String,
  estimatedDelivery: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
