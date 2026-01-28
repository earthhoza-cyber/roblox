# 🎮 Roblox E-Commerce Platform with Mystery Box System

A comprehensive full-stack web application for selling digital Roblox goods with an integrated Gacha (Mystery Box) system.

## 📁 Project Structure

```
roblox-platform/
├── backend/                    # Node.js + Express Backend
│   ├── server.js              # Main server file
│   ├── authController.js      # Authentication logic
│   ├── gachaController.js     # Mystery Box & Gacha logic
│   ├── productController.js   # Product management
│   └── package.json           # Backend dependencies
│
├── frontend/                   # React Frontend
│   ├── AuthPage.jsx           # Login/Register component
│   ├── MysteryBox.jsx         # Mystery Box component
│   ├── ProductStore.jsx       # Product store component
│   ├── UserDashboard.jsx      # User dashboard
│   └── mysterybox-animations.css  # CSS animations
│
├── database/                   # Database Schemas
│   └── schemas.js             # MongoDB models
│
└── docs/                       # Documentation
    └── COMPLETE_GUIDE.md      # Full setup & API guide
```

## ✨ Key Features

### 🔐 Authentication System
- User registration with password hashing (bcrypt)
- JWT-based authentication
- Secure session management
- Protected API routes

### 🏪 Product Store
- Grid layout for Roblox accounts
- Direct purchase system
- Stock status management
- Product categories and filtering
- Detailed product information

### 🎁 Mystery Box (Gacha) System
- Probability-based randomization
- Fair drop rate algorithm
- Rarity tiers (Common, Uncommon, Rare, Epic, Legendary)
- Beautiful opening animations
- Real-time inventory updates
- Transaction history

### 👤 User Dashboard
- Point balance display
- Purchase history
- Inventory management
- Transaction tracking
- Point top-up system

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/roblox-platform
JWT_SECRET=your-super-secret-key-min-32-characters
FRONTEND_URL=http://localhost:3000
EOF

# Start server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure Tailwind CSS
npx tailwindcss init -p

# Start development server
npm start
```

### Seed Database (Optional)

```bash
cd backend
node seedData.js
```

## 🎯 Core Technologies

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React.js
- Tailwind CSS
- Framer Motion (animations)
- Axios (API calls)

## 📚 Documentation

Comprehensive documentation is available in `docs/COMPLETE_GUIDE.md` including:

- Installation instructions
- Database schema details
- API endpoint documentation
- Authentication flow
- Gacha probability logic
- Deployment guide
- Troubleshooting tips

## 🎨 Design Theme

- Modern dark mode UI
- Neon green & purple accents
- Gaming-inspired aesthetics
- Responsive mobile-first design
- Smooth animations and transitions

## 🔑 Key Components

### 1. Database Schemas (`database/schemas.js`)
Complete MongoDB schemas for:
- Users
- Products
- Mystery Boxes & Items
- Orders
- Transactions
- Inventory

### 2. Backend Controllers

**Authentication Controller** (`backend/authController.js`)
- User registration
- Login with JWT
- Password hashing
- Token verification

**Gacha Controller** (`backend/gachaController.js`)
- Fair randomization algorithm
- Mystery box opening logic
- Inventory management
- Probability calculations

**Product Controller** (`backend/productController.js`)
- Product listing
- Direct purchases
- Order management

### 3. Frontend Components

**AuthPage** (`frontend/AuthPage.jsx`)
- Login/Register forms
- Form validation
- Token storage

**MysteryBox** (`frontend/MysteryBox.jsx`)
- Interactive box opening
- Animated reveals
- Probability display
- Won item showcase

**ProductStore** (`frontend/ProductStore.jsx`)
- Product grid layout
- Category filtering
- Purchase modal
- Stock status

**UserDashboard** (`frontend/UserDashboard.jsx`)
- Statistics overview
- Order history
- Inventory display
- Point management

## 🎲 Gacha System Explained

The Mystery Box system uses a fair probability-based algorithm:

```javascript
// Example drop rates
Common:     60% chance
Uncommon:   25% chance
Rare:       10% chance
Epic:        4% chance
Legendary:   1% chance
```

**How it works:**
1. Generate random number (0-100)
2. Map to cumulative probability ranges
3. Select corresponding item
4. Deduct user points
5. Add item to inventory
6. Create transaction record

All probabilities are transparent and displayed to users.

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token authentication
- ✅ Environment variable protection
- ✅ Input validation
- ✅ Protected API routes
- ✅ CORS configuration
- ✅ Transaction atomicity

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimized
- Desktop enhanced
- Touch-friendly interfaces

## 🚀 Deployment Ready

The application is production-ready and can be deployed to:
- Backend: Heroku, Railway, Render
- Frontend: Vercel, Netlify
- Database: MongoDB Atlas

See `docs/COMPLETE_GUIDE.md` for detailed deployment instructions.

## 🎓 Learning Resources

This project demonstrates:
- Full-stack JavaScript development
- RESTful API design
- JWT authentication
- MongoDB database design
- React component architecture
- Probability algorithms
- Animation implementation
- Responsive design patterns

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs!

## 📞 Support

For detailed setup instructions and troubleshooting, refer to:
- `docs/COMPLETE_GUIDE.md` - Complete documentation
- API endpoints documentation
- Database schema reference

---

**Built with ❤️ for the Roblox community**

Start building your digital marketplace today! 🚀
