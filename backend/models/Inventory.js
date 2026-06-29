const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'],
    required: true
  },
  quantity: { type: Number, required: true, default: 100 },
  unit: { type: String, default: 'units' },
  threshold: { type: Number, default: 20 },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  lowStockAlertSent: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

inventoryItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.isAvailable = this.quantity > 0;
  next();
});

module.exports = mongoose.model('Inventory', inventoryItemSchema);
