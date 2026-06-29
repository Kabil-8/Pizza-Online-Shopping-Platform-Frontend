const Inventory = require('../models/Inventory');
const { sendLowStockAlert } = require('./emailService');

const checkLowStock = async () => {
  try {
    const threshold = parseInt(process.env.STOCK_THRESHOLD) || 20;
    const lowStockItems = await Inventory.find({
      quantity: { $lte: threshold },
      lowStockAlertSent: false
    });

    if (lowStockItems.length > 0) {
      console.log(`⚠️ Found ${lowStockItems.length} low stock items. Sending alert...`);
      await sendLowStockAlert(lowStockItems);
      
      // Mark alerts as sent
      await Inventory.updateMany(
        { _id: { $in: lowStockItems.map(i => i._id) } },
        { lowStockAlertSent: true }
      );
    }

    // Reset alert flag for restocked items
    await Inventory.updateMany(
      { quantity: { $gt: threshold }, lowStockAlertSent: true },
      { lowStockAlertSent: false }
    );
  } catch (error) {
    console.error('Stock check error:', error);
  }
};

module.exports = { checkLowStock };
