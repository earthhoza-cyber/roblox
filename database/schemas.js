// ==========================================
// DATABASE SCHEMAS - MongoDB with Mongoose
// ==========================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ==========================================
// 1. USER SCHEMA
// ==========================================
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  pointBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ==========================================
// 2. PRODUCT SCHEMA (Roblox IDs)
// ==========================================
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['roblox_account', 'robux', 'gamepass', 'limited_item'],
    default: 'roblox_account'
  },
  robloxDetails: {
    accountId: String,
    username: String,
    level: Number,
    robuxAmount: Number,
    rareSkins: [String],
    joinDate: Date
  },
  stockStatus: {
    type: String,
    enum: ['in_stock', 'sold_out', 'reserved'],
    default: 'in_stock'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  soldAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ==========================================
// 3. MYSTERY BOX ITEM SCHEMA
// ==========================================
const mysteryBoxItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    required: true
  },
  dropChance: {
    type: Number,
    required: true,
    min: 0,
    max: 100
    // Example: common=60, uncommon=25, rare=10, epic=4, legendary=1
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  itemType: {
    type: String,
    enum: ['robux', 'account', 'gamepass', 'cosmetic', 'points'],
    required: true
  },
  itemData: {
    type: mongoose.Schema.Types.Mixed,
    // Flexible field for different item types
    // Example: { robuxAmount: 1000 } or { accountId: "xyz" }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ==========================================
// 4. MYSTERY BOX SCHEMA
// ==========================================
const mysteryBoxSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  availableItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MysteryBoxItem'
  }],
  totalOpens: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ==========================================
// 5. ORDER SCHEMA
// ==========================================
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderType: {
    type: String,
    enum: ['direct_purchase', 'mystery_box'],
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() { return this.orderType === 'direct_purchase'; }
  },
  mysteryBox: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MysteryBox',
    required: function() { return this.orderType === 'mystery_box'; }
  },
  wonItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MysteryBoxItem',
    required: function() { return this.orderType === 'mystery_box'; }
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'delivered', 'cancelled', 'refunded'],
    default: 'completed'
  },
  deliveryData: {
    type: mongoose.Schema.Types.Mixed,
    // Store account credentials or item details
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ==========================================
// 6. TRANSACTION SCHEMA (Point Top-ups)
// ==========================================
const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['top_up', 'purchase', 'refund', 'bonus'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'crypto', 'bank_transfer', 'admin'],
    required: function() { return this.type === 'top_up'; }
  },
  paymentReference: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ==========================================
// 7. USER INVENTORY SCHEMA
// ==========================================
const inventorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MysteryBoxItem',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  isClaimed: {
    type: Boolean,
    default: false
  },
  claimedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
productSchema.index({ category: 1, stockStatus: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, createdAt: -1 });
inventorySchema.index({ user: 1, isClaimed: 1 });

// Export models
module.exports = {
  User: mongoose.model('User', userSchema),
  Product: mongoose.model('Product', productSchema),
  MysteryBoxItem: mongoose.model('MysteryBoxItem', mysteryBoxItemSchema),
  MysteryBox: mongoose.model('MysteryBox', mysteryBoxSchema),
  Order: mongoose.model('Order', orderSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
  Inventory: mongoose.model('Inventory', inventorySchema)
};
