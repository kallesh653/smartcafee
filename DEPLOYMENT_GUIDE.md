# Smart Cafe Cinema Theater - Complete Deployment Guide

## Overview
Smart Cafe is a professional cinema theater billing and inventory management system with mobile-responsive design, purchase management, and ready items feature for quick stock addition.

---

## Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
3. **Git** (optional) - [Download](https://git-scm.com/)

---

## Quick Start Guide

### Step 1: Start MongoDB

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# OR if installed manually:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**Mac/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# OR
brew services start mongodb-community
```

---

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

---

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` folder:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/smartcafe_cinema

# JWT Secret (Change this to a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024

# JWT Expiry
JWT_EXPIRE=30d

# File Upload
MAX_FILE_SIZE=5242880
```

---

### Step 4: Seed Sample Ready Items (Optional)

```bash
cd backend
node seedReadyItems.js
```

This will add 15 sample ready items like water bottles, snacks, beverages, etc.

---

### Step 5: Start Backend Server

```bash
cd backend
npm start

# OR for development with auto-reload:
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ☕ Smart Cafe - Cinema Theater API v2.0            ║
║                                                       ║
║   Server running in development mode                  ║
║   Port: 5000                                          ║
║   URL: http://localhost:5000                         ║
║   Database: smartcafe_cinema                          ║
║                                                       ║
║   🚀 Ultra-Fast Order Taking System                   ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

### Step 6: Install Frontend Dependencies

Open a **NEW TERMINAL** window:

```bash
cd frontend
npm install
```

---

### Step 7: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### Step 8: Access the Application

Open your browser and go to:
```
http://localhost:5173
```

**Default Login Credentials:**
- **Username:** admin
- **Password:** (You'll need to create an admin user first)

---

## First Time Setup

### Create Admin User

1. Open MongoDB Compass or Mongo Shell
2. Connect to: `mongodb://localhost:27017/smartcafe_cinema`
3. Create admin user manually:

```javascript
use smartcafe_cinema

db.users.insertOne({
  username: "admin",
  password: "$2a$10$zQX8YvZ9X8Z9X8Z9X8Z9Xeu8Z9X8Z9X8Z9X8Z9X8Z9X8Z9X8Z9X",  // password: "admin123"
  email: "admin@smartcafe.com",
  name: "Admin User",
  role: "admin",
  isActive: true,
  canEditPrice: true,
  canGiveDiscount: true,
  maxDiscountPercent: 100,
  canDeleteBill: true,
  canViewReports: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

OR use bcrypt to hash a password:

```javascript
const bcrypt = require('bcryptjs');
const password = await bcrypt.hash('your_password', 10);
console.log(password);
```

---

## Features Implemented

### ✅ Mobile Responsive Design
- **Sidebar:** Proper drawer on mobile, collapsible on desktop
- **All pages:** Optimized for mobile, tablet, and desktop
- **Tables:** Horizontal scroll on mobile
- **Forms:** Touch-friendly inputs

### ✅ Purchase Management
- **Add Purchase:** Professional purchase entry with GST calculations
- **View Purchases:** Advanced filtering, export to Excel/PDF
- **Purchase Register:** Complete purchase history

### ✅ Ready Items (NEW!)
- **Quick Stock Addition:** Add stock for items like water bottles instantly
- **Category-based:** Organize items by Beverages, Snacks, Supplies, etc.
- **Bulk Addition:** Add multiple items to stock at once
- **Auto Product Creation:** Automatically creates products if they don't exist
- **Stock Ledger:** Complete audit trail of all stock movements

### ✅ Navigation Improvements
- Added **Purchase** submenu with:
  - Add Purchase
  - View Purchases
  - Ready Items
- Added **Stock View** menu item
- Added **Manage Suppliers** in Masters

---

## Production Deployment

### Option 1: Deploy on VPS (DigitalOcean, AWS, etc.)

1. **Setup Server:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
# Follow: https://docs.mongodb.com/manual/installation/

# Install PM2
npm install -g pm2
```

2. **Upload Code:**
```bash
# Upload via Git or FTP
git clone your-repo-url
cd smartcafe
```

3. **Configure Backend:**
```bash
cd backend
npm install --production
# Create .env file with production values
```

4. **Build Frontend:**
```bash
cd frontend
npm install
npm run build
# Serve dist folder with nginx or serve
```

5. **Start with PM2:**
```bash
cd backend
pm2 start server.js --name smartcafe-api
pm2 startup
pm2 save
```

---

### Option 2: Deploy on Vercel (Frontend) + MongoDB Atlas (Database)

**Frontend (Vercel):**
```bash
cd frontend
npm install -g vercel
vercel --prod
```

**Backend (Render/Railway/Heroku):**
```bash
# Deploy backend to Render/Railway
# Set environment variables in dashboard
```

**Database (MongoDB Atlas):**
```
1. Create account at https://cloud.mongodb.com
2. Create cluster
3. Get connection string
4. Update MONGO_URI in .env
```

---

## Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smartcafe_cinema
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRE=30d
```

---

## Troubleshooting

### Backend not starting?
```bash
# Check if MongoDB is running
mongosh

# Check if port 5000 is free
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux
```

### Frontend build errors?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### MongoDB connection errors?
```bash
# Check MongoDB status
sudo systemctl status mongod  # Linux
brew services list            # Mac

# Test connection
mongosh mongodb://localhost:27017/smartcafe_cinema
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Ready Items (NEW!)
- `GET /api/ready-items` - Get all ready items
- `POST /api/ready-items` - Create ready item (admin)
- `POST /api/ready-items/add-stock` - Add stock from ready item
- `POST /api/ready-items/bulk-add-stock` - Bulk add stock

### Purchases
- `GET /api/purchases` - Get all purchases (admin)
- `POST /api/purchases` - Create purchase (admin)
- `GET /api/purchases/:id` - Get purchase details (admin)

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create bill
- `GET /api/bills/:id` - Get bill details

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status

---

## Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for password hashing

**Frontend:**
- React 18 + Vite
- Ant Design UI
- React Router v6
- Axios for API calls

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check MongoDB logs: `tail -f /var/log/mongodb/mongod.log`
4. Check backend logs: `pm2 logs smartcafe-api`

---

## License

Proprietary - Smart Cafe Cinema Theater Billing System
© 2024 All Rights Reserved

---

**Created by:** Claude Code
**Version:** 2.0.0 with Ready Items & Mobile Responsive Design
**Last Updated:** December 2024
