const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pizzaapp')
  .then(() => {
    console.log('MongoDB connected successfully');
    // Seed initial inventory
    require('./utils/seedInventory')();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pizza', require('./routes/pizza'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/inventory', require('./routes/inventory'));

// Stock check cron job - runs every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running stock check cron job...');
  const { checkLowStock } = require('./utils/stockChecker');
  await checkLowStock();
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Pizza API is running!' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
