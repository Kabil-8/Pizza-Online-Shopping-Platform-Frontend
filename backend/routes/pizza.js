const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');

// GET /api/pizza/options - Get all available pizza building options
router.get('/options', protect, async (req, res) => {
  try {
    const categories = ['base', 'sauce', 'cheese', 'veggie', 'meat'];
    const result = {};
    
    for (const cat of categories) {
      result[cat] = await Inventory.find({ category: cat, isAvailable: true }).select('-__v');
    }

    res.json({ success: true, options: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/pizza/calculate-price
router.post('/calculate-price', protect, async (req, res) => {
  try {
    const { baseId, sauceId, cheeseId, veggieIds = [], meatIds = [], size = 'medium', quantity = 1 } = req.body;

    const sizeMultiplier = { small: 0.8, medium: 1, large: 1.3 };

    const [base, sauce, cheese] = await Promise.all([
      Inventory.findById(baseId),
      Inventory.findById(sauceId),
      Inventory.findById(cheeseId)
    ]);

    const veggies = veggieIds.length ? await Inventory.find({ _id: { $in: veggieIds } }) : [];
    const meats = meatIds.length ? await Inventory.find({ _id: { $in: meatIds } }) : [];

    if (!base || !sauce || !cheese) {
      return res.status(400).json({ success: false, message: 'Invalid ingredients selected' });
    }

    let basePrice = base.price + sauce.price + cheese.price;
    veggies.forEach(v => basePrice += v.price);
    meats.forEach(m => basePrice += m.price);

    const totalPrice = Math.round(basePrice * sizeMultiplier[size] * quantity);

    res.json({ success: true, breakdown: { base: base.price, sauce: sauce.price, cheese: cheese.price, veggies: veggies.reduce((s,v)=>s+v.price,0), meats: meats.reduce((s,m)=>s+m.price,0) }, totalPrice, size, quantity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
