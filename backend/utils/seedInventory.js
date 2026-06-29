const Inventory = require('../models/Inventory');

const seedData = [
  // Pizza Bases
  { name: 'Classic Hand-Tossed', category: 'base', quantity: 100, price: 80, description: 'Traditional hand-tossed dough, crispy outside, chewy inside', image: '🫓' },
  { name: 'Thin & Crispy', category: 'base', quantity: 100, price: 70, description: 'Ultra-thin crust for a lighter bite', image: '🫓' },
  { name: 'Thick Pan Crust', category: 'base', quantity: 100, price: 90, description: 'Deep-dish style, thick and fluffy', image: '🫓' },
  { name: 'Whole Wheat', category: 'base', quantity: 80, price: 85, description: 'Healthy whole wheat base, nutty flavor', image: '🫓' },
  { name: 'Gluten-Free', category: 'base', quantity: 60, price: 110, description: 'Perfect for gluten-sensitive pizza lovers', image: '🫓' },

  // Sauces
  { name: 'Classic Marinara', category: 'sauce', quantity: 100, price: 30, description: 'Traditional tomato sauce with basil', image: '🍅' },
  { name: 'Spicy Arrabbiata', category: 'sauce', quantity: 100, price: 35, description: 'Fiery tomato sauce with red chillies', image: '🌶️' },
  { name: 'White Garlic Cream', category: 'sauce', quantity: 80, price: 40, description: 'Rich creamy garlic béchamel sauce', image: '🧄' },
  { name: 'Pesto Basil', category: 'sauce', quantity: 70, price: 45, description: 'Fresh basil pesto sauce, vibrant and herby', image: '🌿' },
  { name: 'BBQ Smoky', category: 'sauce', quantity: 90, price: 35, description: 'Sweet and smoky barbecue sauce', image: '🔥' },

  // Cheeses
  { name: 'Mozzarella', category: 'cheese', quantity: 120, price: 60, description: 'Classic stretchy mozzarella, a pizza staple', image: '🧀' },
  { name: 'Cheddar', category: 'cheese', quantity: 100, price: 55, description: 'Sharp cheddar for a bold flavor punch', image: '🧀' },
  { name: 'Parmesan', category: 'cheese', quantity: 80, price: 70, description: 'Finely grated parmesan for rich umami', image: '🧀' },
  { name: 'Gouda', category: 'cheese', quantity: 70, price: 75, description: 'Creamy Dutch gouda, slightly sweet', image: '🧀' },
  { name: 'Vegan Cheese', category: 'cheese', quantity: 50, price: 90, description: 'Dairy-free cashew-based cheese blend', image: '🧀' },

  // Veggies
  { name: 'Bell Peppers', category: 'veggie', quantity: 150, price: 20, description: 'Colorful mix of red, yellow, green peppers', image: '🫑' },
  { name: 'Mushrooms', category: 'veggie', quantity: 120, price: 25, description: 'Fresh button mushrooms, earthy flavor', image: '🍄' },
  { name: 'Black Olives', category: 'veggie', quantity: 100, price: 30, description: 'Sliced Mediterranean black olives', image: '🫒' },
  { name: 'Onions', category: 'veggie', quantity: 200, price: 15, description: 'Sliced red and white onions', image: '🧅' },
  { name: 'Corn', category: 'veggie', quantity: 150, price: 20, description: 'Sweet golden corn kernels', image: '🌽' },
  { name: 'Jalapeños', category: 'veggie', quantity: 100, price: 25, description: 'Spicy pickled jalapeño slices', image: '🌶️' },
  { name: 'Spinach', category: 'veggie', quantity: 80, price: 20, description: 'Fresh baby spinach leaves', image: '🥬' },
  { name: 'Cherry Tomatoes', category: 'veggie', quantity: 100, price: 30, description: 'Sweet halved cherry tomatoes', image: '🍅' },
  { name: 'Artichoke Hearts', category: 'veggie', quantity: 60, price: 40, description: 'Tender marinated artichoke hearts', image: '🌿' },
  { name: 'Sun-dried Tomatoes', category: 'veggie', quantity: 70, price: 35, description: 'Intensely flavored sun-dried tomatoes', image: '🍅' },

  // Meats
  { name: 'Chicken Tikka', category: 'meat', quantity: 100, price: 80, description: 'Spiced Indian-style grilled chicken', image: '🍗' },
  { name: 'Pepperoni', category: 'meat', quantity: 100, price: 90, description: 'Classic spicy pepperoni slices', image: '🥩' },
  { name: 'Sausage Crumbles', category: 'meat', quantity: 80, price: 85, description: 'Italian-style seasoned pork sausage', image: '🌭' },
  { name: 'BBQ Pulled Chicken', category: 'meat', quantity: 80, price: 85, description: 'Smoky slow-cooked pulled chicken', image: '🍗' },
  { name: 'Mutton Keema', category: 'meat', quantity: 70, price: 100, description: 'Spiced minced mutton', image: '🥩' }
];

const seedInventory = async () => {
  try {
    const count = await Inventory.countDocuments();
    if (count === 0) {
      await Inventory.insertMany(seedData);
      console.log('✅ Inventory seeded successfully');
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
};

module.exports = seedInventory;
