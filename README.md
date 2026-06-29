# 🍕 PizzaCraft - Full Stack Pizza Ordering App

A complete full-stack pizza ordering application with custom pizza builder, Razorpay payments, real-time order tracking, and admin inventory management.

---

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Payments | Razorpay (Test Mode) |
| Email | Nodemailer (Gmail) |
| Cron Jobs | node-cron |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gmail account (for email features)
- Razorpay Test Account

---

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pizzaapp
JWT_SECRET=your_super_secret_key_here

# Gmail - use App Password (not your real password)
# Enable 2FA on Gmail → Google Account → Security → App Passwords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
ADMIN_EMAIL=admin@pizzacraft.com

# Razorpay Test Keys (from dashboard.razorpay.com → Settings → API Keys)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXX

CLIENT_URL=http://localhost:3000
STOCK_THRESHOLD=20
```

---

### 3. Seed Database

```bash
cd backend

# Seed admin + demo user
node seedAdmin.js

# (Inventory seeds automatically on first server start)
```

---

### 4. Add Razorpay Script to Frontend

In `frontend/index.html`, add inside `<head>`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

### 5. Run the App

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App starts on http://localhost:3000
```

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pizzacraft.com | Admin@123 |
| User | user@test.com | User@123 |

---

## ✨ Features

### User Features
- 📧 Registration with email verification
- 🔐 JWT-based login/logout
- 🔑 Forgot & Reset password via email
- 🍕 Pizza builder with 5 steps (Base → Sauce → Cheese → Veggies → Review)
- 💳 Razorpay payment (test mode with simulated success)
- 📦 Real-time order tracking with status timeline
- 📋 Order history with live status updates (polls every 15s)
- 👤 Profile management

### Admin Features
- 📊 Dashboard with revenue, order stats
- 📋 Order management with status updates (Confirmed → Kitchen → Delivery → Delivered)
- 📧 Automatic email to user on every status change
- 📦 Inventory management for all ingredients
- ⚠️ Low stock alerts via email (cron job, hourly)
- 📉 Auto inventory deduction after each order
- 🔄 Quick restock (+50) and bulk restock for low items

### Pizza Options
**Bases (5):** Classic Hand-Tossed, Thin & Crispy, Thick Pan Crust, Whole Wheat, Gluten-Free

**Sauces (5):** Classic Marinara, Spicy Arrabbiata, White Garlic Cream, Pesto Basil, BBQ Smoky

**Cheese (5):** Mozzarella, Cheddar, Parmesan, Gouda, Vegan Cheese

**Veggies (10):** Bell Peppers, Mushrooms, Black Olives, Onions, Corn, Jalapeños, Spinach, Cherry Tomatoes, Artichoke Hearts, Sun-dried Tomatoes

**Meats (5):** Chicken Tikka, Pepperoni, Sausage Crumbles, BBQ Pulled Chicken, Mutton Keema

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register
GET    /api/auth/verify-email/:token
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
GET    /api/auth/me
POST   /api/auth/resend-verification
```

### Pizza
```
GET    /api/pizza/options
POST   /api/pizza/calculate-price
```

### Orders
```
GET    /api/orders/my-orders         (user)
GET    /api/orders/:id               (user/admin)
GET    /api/orders                   (admin)
PUT    /api/orders/:id/status        (admin)
```

### Payment
```
POST   /api/payment/create-order
POST   /api/payment/verify
```

### Inventory (Admin)
```
GET    /api/inventory
GET    /api/inventory/stats
PUT    /api/inventory/:id
POST   /api/inventory/restock
```

---

## 💳 Razorpay Test Mode

1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to Settings → API Keys → Generate Test Keys
3. Add `rzp_test_...` key to `.env`
4. In the payment modal, use test card: `4111 1111 1111 1111` with any future date and CVV

**Without Razorpay keys:** The app runs in "test mode" and clicking Pay will automatically simulate a successful payment.

---

## 📁 Project Structure

```
pizza-app/
├── backend/
│   ├── models/          # User, Order, Inventory
│   ├── routes/          # auth, pizza, orders, payment, inventory
│   ├── middleware/       # JWT auth
│   ├── utils/           # emailService, seedInventory, stockChecker
│   ├── server.js
│   └── seedAdmin.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── auth/    # Login, Register, VerifyEmail, ForgotPassword, ResetPassword
        │   ├── user/    # Dashboard, BuildPizza, MyOrders, OrderDetail, Profile
        │   └── admin/   # Dashboard, Orders, Inventory
        ├── components/  # Navbar
        ├── context/     # AuthContext
        └── utils/       # api.js (axios)
```
