const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"🍕 PizzaCraft" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  return sendEmail({
    to: user.email,
    subject: '🍕 Verify Your PizzaCraft Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #ff6b35; text-align: center;">🍕 PizzaCraft</h1>
        <h2 style="color: #fff; text-align: center;">Verify Your Email</h2>
        <p style="color: #ccc;">Hi ${user.name},</p>
        <p style="color: #ccc;">Welcome to PizzaCraft! Please verify your email address to start ordering delicious custom pizzas.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #888; font-size: 12px; text-align: center;">This link expires in 24 hours. If you didn't create this account, ignore this email.</p>
      </div>
    `
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  return sendEmail({
    to: user.email,
    subject: '🍕 PizzaCraft - Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #ff6b35; text-align: center;">🍕 PizzaCraft</h1>
        <h2 style="color: #fff; text-align: center;">Reset Your Password</h2>
        <p style="color: #ccc;">Hi ${user.name},</p>
        <p style="color: #ccc;">You requested a password reset. Click the button below to set a new password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #888; font-size: 12px; text-align: center;">This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>
      </div>
    `
  });
};

const sendOrderStatusEmail = async (user, order, statusMessage) => {
  const statusColors = {
    confirmed: '#4CAF50',
    in_kitchen: '#FF9800',
    out_for_delivery: '#2196F3',
    delivered: '#4CAF50',
    cancelled: '#f44336'
  };
  const color = statusColors[order.status] || '#ff6b35';

  return sendEmail({
    to: user.email,
    subject: `🍕 Your PizzaCraft Order Update - ${statusMessage}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #ff6b35; text-align: center;">🍕 PizzaCraft</h1>
        <h2 style="color: ${color}; text-align: center;">${statusMessage}</h2>
        <p style="color: #ccc;">Hi ${user.name},</p>
        <p style="color: #ccc;">Your order #${order._id.toString().slice(-6).toUpperCase()} has been updated!</p>
        <div style="background: #16213e; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #ff6b35; font-weight: bold;">Order Status: <span style="color: ${color}">${statusMessage}</span></p>
          <p style="color: #ccc;">Total: ₹${order.totalPrice}</p>
        </div>
        <p style="color: #888; font-size: 12px; text-align: center;">Track your order on PizzaCraft dashboard.</p>
      </div>
    `
  });
};

const sendLowStockAlert = async (items) => {
  const itemRows = items.map(item => 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: #fff;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: #fff;">${item.category}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: #ff4444; font-weight: bold;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: #888;">${item.threshold}</td>
    </tr>`
  ).join('');

  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: '⚠️ PizzaCraft - Low Stock Alert!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #ff6b35; text-align: center;">🍕 PizzaCraft</h1>
        <h2 style="color: #ff4444; text-align: center;">⚠️ Low Stock Alert!</h2>
        <p style="color: #ccc;">The following items are running low on stock:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #16213e;">
              <th style="padding: 10px; text-align: left; color: #ff6b35;">Item</th>
              <th style="padding: 10px; text-align: left; color: #ff6b35;">Category</th>
              <th style="padding: 10px; text-align: left; color: #ff6b35;">Current Stock</th>
              <th style="padding: 10px; text-align: left; color: #ff6b35;">Threshold</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <p style="color: #ff4444; margin-top: 20px; font-weight: bold;">Please restock these items immediately to avoid order disruptions.</p>
      </div>
    `
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendOrderStatusEmail, sendLowStockAlert };
