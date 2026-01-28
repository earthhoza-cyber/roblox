// ==========================================
// SERVER.JS - Express Backend Setup
// ==========================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ==========================================
// DATABASE CONNECTION
// ==========================================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roblox-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

connectDB();

// ==========================================
// ROUTES
// ==========================================

// Import controllers
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const gachaController = require('./controllers/gachaController');

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authController.protect, authController.getCurrentUser);

// Product Routes
app.get('/api/products', authController.protect, productController.getAllProducts);
app.get('/api/products/:productId', authController.protect, productController.getProduct);
app.post('/api/products/:productId/purchase', authController.protect, productController.purchaseProduct);

// Mystery Box Routes
app.get('/api/mystery-boxes', authController.protect, gachaController.getAllMysteryBoxes);
app.get('/api/mystery-boxes/:boxId', authController.protect, gachaController.getMysteryBox);
app.post('/api/mystery-boxes/:boxId/open', authController.protect, gachaController.openMysteryBox);

// User Routes
app.get('/api/user/orders', authController.protect, productController.getUserOrders);
app.get('/api/user/inventory', authController.protect, gachaController.getUserInventory);

// Transaction Routes (Top-up, etc.)
app.post('/api/transactions/top-up', authController.protect, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const { User, Transaction } = require('./database/schemas');
    
    const user = await User.findById(userId);
    const balanceBefore = user.pointBalance;
    user.pointBalance += amount;
    await user.save();

    await Transaction.create({
      user: userId,
      type: 'top_up',
      amount: amount,
      balanceBefore: balanceBefore,
      balanceAfter: user.pointBalance,
      description: `Points top-up via ${paymentMethod}`,
      paymentMethod: paymentMethod,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      message: 'Top-up successful',
      data: {
        newBalance: user.pointBalance,
        addedAmount: amount
      }
    });

  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process top-up',
      error: error.message
    });
  }
});

// Get user transactions
app.get('/api/transactions', authController.protect, async (req, res) => {
  try {
    const { Transaction } = require('./database/schemas');
    
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: { transactions }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🚀 Server Running Successfully     ║
  ║   📡 Port: ${PORT}                      ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}      ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;
