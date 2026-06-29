/**
 * Run this script once to seed admin and demo user:
 * node seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pizzaapp';

const userSchema = new mongoose.Schema({
  name: String, email: String, password: String,
  role: String, isVerified: Boolean,
  phone: String, address: String
});

const User = mongoose.model('User', userSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Admin user
  const adminExists = await User.findOne({ email: 'admin@pizzacraft.com' });
  if (!adminExists) {
    const hashed = await bcrypt.hash('Admin@123', 12);
    await User.create({
      name: 'Admin',
      email: 'admin@pizzacraft.com',
      password: hashed,
      role: 'admin',
      isVerified: true,
      phone: '+91 9000000000',
      address: 'PizzaCraft HQ, Coimbatore'
    });
    console.log('✅ Admin created: admin@pizzacraft.com / Admin@123');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Demo user
  const userExists = await User.findOne({ email: 'user@test.com' });
  if (!userExists) {
    const hashed = await bcrypt.hash('User@123', 12);
    await User.create({
      name: 'Demo User',
      email: 'user@test.com',
      password: hashed,
      role: 'user',
      isVerified: true,
      phone: '+91 9876543210',
      address: '123, Main Street, Coimbatore - 641001'
    });
    console.log('✅ Demo user created: user@test.com / User@123');
  } else {
    console.log('ℹ️  Demo user already exists');
  }

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(console.error);
