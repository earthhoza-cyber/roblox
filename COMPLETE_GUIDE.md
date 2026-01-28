# 🎮 ROBLOX E-COMMERCE PLATFORM - COMPLETE SETUP GUIDE

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Installation Guide](#installation-guide)
4. [Database Setup](#database-setup)
5. [Authentication System](#authentication-system)
6. [API Documentation](#api-documentation)
7. [Frontend Integration](#frontend-integration)
8. [Gacha System Logic](#gacha-system-logic)
9. [Deployment Guide](#deployment-guide)

---

## 🎯 Project Overview

This is a full-stack digital goods e-commerce platform specifically designed for selling Roblox accounts and implementing a Mystery Box (Gacha) system. Users can register, top-up points, purchase direct items, and play mystery boxes to win random prizes.

### Key Features:
- ✅ User Authentication (JWT-based)
- ✅ Product Store (Direct Sales)
- ✅ Mystery Box System (Probability-based Gacha)
- ✅ User Dashboard & Inventory
- ✅ Transaction History
- ✅ Point-based Economy
- ✅ Responsive Dark-themed UI

---

## 💻 Technology Stack

### Backend:
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend:
- **React.js** (or Next.js)
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls

### Additional Libraries:
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **morgan** - HTTP request logger

---

## 🚀 Installation Guide

### 1. Clone or Create Project Structure

```bash
# Create main directory
mkdir roblox-platform
cd roblox-platform

# Create subdirectories
mkdir backend frontend database
```

### 2. Backend Setup

```bash
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken morgan

# Install dev dependencies
npm install --save-dev nodemon
```

### 3. Frontend Setup

```bash
cd ../frontend

# Create React app
npx create-react-app .

# OR use Next.js
npx create-next-app@latest .

# Install additional dependencies
npm install axios framer-motion
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4. Configure Tailwind CSS

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
```

---

## 🗄️ Database Setup

### 1. Install MongoDB

**Option A - Local Installation:**
- Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- Follow installation instructions for your OS

**Option B - MongoDB Atlas (Cloud):**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string

### 2. Create Environment Variables

Create `.env` file in backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/roblox-platform
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roblox-platform

# JWT Secret (Change this to a random string!)
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Initialize Database with Sample Data

Create `backend/seedData.js`:

```javascript
const mongoose = require('mongoose');
const { Product, MysteryBox, MysteryBoxItem } = require('./database/schemas');
require('dotenv').config();

const sampleProducts = [
  {
    title: "Legendary Roblox Account - Level 150",
    description: "Premium account with rare items and 10,000 Robux",
    price: 500,
    imageUrl: "https://via.placeholder.com/400x300?text=Legendary+Account",
    category: "roblox_account",
    robloxDetails: {
      accountId: "ACC001",
      username: "LegendPlayer2024",
      level: 150,
      robuxAmount: 10000,
      rareSkins: ["Dominus", "Valk", "Shaggy"]
    },
    stockStatus: "in_stock",
    isFeatured: true
  },
  {
    title: "Epic Account - Level 100",
    description: "Great starter account with 5,000 Robux",
    price: 300,
    imageUrl: "https://via.placeholder.com/400x300?text=Epic+Account",
    category: "roblox_account",
    robloxDetails: {
      accountId: "ACC002",
      username: "EpicGamer123",
      level: 100,
      robuxAmount: 5000,
      rareSkins: ["Valk"]
    },
    stockStatus: "in_stock"
  }
];

const sampleMysteryBoxItems = [
  // Common Items (60%)
  {
    name: "100 Robux",
    description: "Small Robux package",
    imageUrl: "https://via.placeholder.com/200?text=100+Robux",
    rarity: "common",
    dropChance: 40,
    value: 50,
    itemType: "robux",
    itemData: { robuxAmount: 100 }
  },
  {
    name: "Starter Account",
    description: "Basic Roblox account",
    imageUrl: "https://via.placeholder.com/200?text=Starter+Account",
    rarity: "common",
    dropChance: 20,
    value: 75,
    itemType: "account",
    itemData: { level: 10 }
  },
  
  // Uncommon Items (25%)
  {
    name: "500 Robux",
    description: "Medium Robux package",
    imageUrl: "https://via.placeholder.com/200?text=500+Robux",
    rarity: "uncommon",
    dropChance: 15,
    value: 200,
    itemType: "robux",
    itemData: { robuxAmount: 500 }
  },
  {
    name: "Advanced Account",
    description: "Account with some rare items",
    imageUrl: "https://via.placeholder.com/200?text=Advanced+Account",
    rarity: "uncommon",
    dropChance: 10,
    value: 250,
    itemType: "account",
    itemData: { level: 50 }
  },
  
  // Rare Items (10%)
  {
    name: "1,000 Robux",
    description: "Large Robux package",
    imageUrl: "https://via.placeholder.com/200?text=1000+Robux",
    rarity: "rare",
    dropChance: 7,
    value: 400,
    itemType: "robux",
    itemData: { robuxAmount: 1000 }
  },
  {
    name: "Rare Account",
    description: "Account with exclusive items",
    imageUrl: "https://via.placeholder.com/200?text=Rare+Account",
    rarity: "rare",
    dropChance: 3,
    value: 500,
    itemType: "account",
    itemData: { level: 80 }
  },
  
  // Epic Items (4%)
  {
    name: "5,000 Robux",
    description: "Huge Robux package",
    imageUrl: "https://via.placeholder.com/200?text=5000+Robux",
    rarity: "epic",
    dropChance: 3,
    value: 1500,
    itemType: "robux",
    itemData: { robuxAmount: 5000 }
  },
  {
    name: "Epic Account",
    description: "High-level account with legendaries",
    imageUrl: "https://via.placeholder.com/200?text=Epic+Account",
    rarity: "epic",
    dropChance: 1,
    value: 2000,
    itemType: "account",
    itemData: { level: 120 }
  },
  
  // Legendary Items (1%)
  {
    name: "50,000 Robux + Legendary Account",
    description: "Ultimate prize with everything!",
    imageUrl: "https://via.placeholder.com/200?text=LEGENDARY",
    rarity: "legendary",
    dropChance: 1,
    value: 10000,
    itemType: "account",
    itemData: { level: 200, robuxAmount: 50000 }
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await MysteryBoxItem.deleteMany({});
    await MysteryBox.deleteMany({});

    // Insert products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${products.length} products`);

    // Insert mystery box items
    const items = await MysteryBoxItem.insertMany(sampleMysteryBoxItems);
    console.log(`✅ Inserted ${items.length} mystery box items`);

    // Create mystery box
    const mysteryBox = await MysteryBox.create({
      name: "Premium Mystery Box",
      description: "Open for a chance to win legendary prizes!",
      imageUrl: "https://via.placeholder.com/400?text=Mystery+Box",
      price: 100,
      availableItems: items.map(item => item._id),
      isActive: true
    });
    console.log(`✅ Created mystery box: ${mysteryBox.name}`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
```

Run seeder:
```bash
node seedData.js
```

---

## 🔐 Authentication System

### How JWT Authentication Works:

1. **User Registration:**
   - User submits username, email, password
   - Password is hashed with bcrypt
   - User saved to database
   - JWT token generated and returned

2. **User Login:**
   - User submits email, password
   - System verifies credentials
   - JWT token generated and returned

3. **Protected Routes:**
   - Client includes token in Authorization header
   - Server verifies token
   - Request proceeds if valid

### Frontend Integration:

```javascript
// src/utils/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Usage in Components:

```javascript
import api from './utils/api';

// Register
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  localStorage.setItem('token', response.data.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.data.user));
};

// Login
const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  localStorage.setItem('token', response.data.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.data.user));
};

// Get current user
const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.data.user;
};
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Body: {
  username: string,
  email: string,
  password: string
}
Response: {
  success: true,
  data: {
    token: string,
    user: {...}
  }
}
```

#### Login User
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  success: true,
  data: {
    token: string,
    user: {...}
  }
}
```

### Product Endpoints

#### Get All Products
```
GET /api/products?category=roblox_account&limit=20&page=1
Headers: Authorization: Bearer {token}
Response: {
  success: true,
  data: {
    products: [...],
    pagination: {...}
  }
}
```

#### Purchase Product
```
POST /api/products/:productId/purchase
Headers: Authorization: Bearer {token}
Response: {
  success: true,
  data: {
    order: {...},
    userBalance: number
  }
}
```

### Mystery Box Endpoints

#### Get Mystery Box Details
```
GET /api/mystery-boxes/:boxId
Headers: Authorization: Bearer {token}
Response: {
  success: true,
  data: {
    mysteryBox: {...},
    items: {...},
    statistics: {...}
  }
}
```

#### Open Mystery Box
```
POST /api/mystery-boxes/:boxId/open
Headers: Authorization: Bearer {token}
Response: {
  success: true,
  data: {
    wonItem: {...},
    order: {...},
    userBalance: number
  }
}
```

### User Endpoints

#### Get User Orders
```
GET /api/user/orders?type=mystery_box
Headers: Authorization: Bearer {token}
Response: {
  success: true,
  data: {
    orders: [...],
    total: number
  }
}
```

#### Get User Inventory
```
GET /api/user/inventory
Headers: Authorization: Bearer {token}
Response: {
  success: true,
  data: {
    inventory: [...],
    total: number,
    totalValue: number
  }
}
```

---

## 🎲 Gacha System Logic Explained

### How the Randomizer Works:

```javascript
// Example probability distribution
const items = [
  { name: "Common Item", dropChance: 60 },
  { name: "Uncommon Item", dropChance: 25 },
  { name: "Rare Item", dropChance: 10 },
  { name: "Epic Item", dropChance: 4 },
  { name: "Legendary Item", dropChance: 1 }
];

// Total: 100%

// Algorithm:
1. Generate random number between 0 and 100
2. Build cumulative probability ranges:
   - Common: 0-60
   - Uncommon: 60-85
   - Rare: 85-95
   - Epic: 95-99
   - Legendary: 99-100
3. Check which range the random number falls into
4. Return corresponding item
```

### Fair Probability Guarantees:

- Total drop chances must equal 100%
- Each item has exact percentage chance
- No manipulation of odds
- Transparent probability display to users
- Optional pity system for legendary items

---

## 🚀 Deployment Guide

### Backend Deployment (Heroku Example)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variable
# Add REACT_APP_API_URL pointing to your backend
```

### Environment Variables for Production:

**Backend (.env):**
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super-long-random-string-min-32-characters
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env):**
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

---

## 📝 Additional Notes

### Security Best Practices:

1. ✅ Always use HTTPS in production
2. ✅ Store JWT secret in environment variables
3. ✅ Implement rate limiting for API endpoints
4. ✅ Validate all user inputs
5. ✅ Use secure password hashing (bcrypt with 10+ rounds)
6. ✅ Implement CORS properly
7. ✅ Never expose sensitive data in responses

### Testing:

```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Create test file
touch backend/__tests__/gacha.test.js
```

Example test:
```javascript
const { GachaRandomizer } = require('../controllers/gachaController');

test('Gacha probability distribution is fair', () => {
  const items = [
    { _doc: { name: 'Common', dropChance: 70 } },
    { _doc: { name: 'Rare', dropChance: 30 } }
  ];

  const results = {};
  for (let i = 0; i < 1000; i++) {
    const item = GachaRandomizer.selectRandomItem(items);
    results[item.name] = (results[item.name] || 0) + 1;
  }

  // Common should be ~70% (680-720 out of 1000)
  expect(results.Common).toBeGreaterThan(680);
  expect(results.Common).toBeLessThan(720);
});
```

---

## 🎨 Customization Tips

### Change Color Theme:

Update Tailwind config or CSS variables to change from green/purple to other colors:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color'
    }
  }
}
```

### Add Payment Integration:

```javascript
// Example: Stripe integration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/payments/create-checkout', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    // ... checkout config
  });
  res.json({ sessionId: session.id });
});
```

---

## 🆘 Troubleshooting

**Issue: MongoDB connection fails**
- Check MongoDB is running: `mongod --version`
- Verify connection string in .env
- Check network/firewall settings

**Issue: JWT token invalid**
- Verify JWT_SECRET is set
- Check token is included in Authorization header
- Ensure token hasn't expired (7-day default)

**Issue: CORS errors**
- Add frontend URL to CORS whitelist
- Check API URL in frontend is correct

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Check MongoDB/Express documentation
4. Test API endpoints with Postman

---

**Happy Coding! 🚀**
