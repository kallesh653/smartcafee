# Smart Cafe - Point of Sale System

A professional, full-featured Point of Sale (POS) system for cafes and restaurants with customer ordering, inventory management, billing, and comprehensive reporting.

## 🎯 Features

- **Customer Menu**: Beautiful public menu for customers to browse and order
- **Fast Order Cashier**: Quick billing interface for staff
- **Product Management**: Full CRUD operations with image uploads
- **Order Management**: Track and manage customer orders
- **Inventory Management**: Real-time stock tracking and alerts
- **Multiple Payment Modes**: Cash, UPI, Card, Mixed payments
- **Comprehensive Reports**: Sales, Profit, Stock, User-wise, Item-wise reports
- **User Management**: Admin and Cashier roles with permissions
- **Business Settings**: Configurable shop details, GST, printer settings
- **Menu Slider**: Beautiful customizable slider for customer menu
- **Mobile Responsive**: Works perfectly on all devices

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your local machine:

### Required Software

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (v4.4 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - OR use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
   - Verify installation: `mongod --version`

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

4. **Code Editor** (recommended)
   - VS Code: https://code.visualstudio.com/
   - Or any editor of your choice

## 🚀 Local Installation Guide

### Step 1: Clone the Repository

Open your terminal/command prompt and run:

```bash
# Clone the repository
git clone https://github.com/kallesh653/smartcafee.git

# Navigate to project directory
cd smartcafee
```

### Step 2: Backend Setup

#### 2.1 Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install all required packages
npm install
```

#### 2.2 Create Environment File

Create a `.env` file in the `backend` directory:

```bash
# On Windows (Command Prompt)
copy .env.example .env

# On Windows (PowerShell)
Copy-Item .env.example .env

# On Mac/Linux
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` manually with this content:

```env
# Server Configuration
NODE_ENV=development
PORT=8000

# MongoDB Configuration (Local)
MONGODB_URI=mongodb://localhost:27017/smartcafe

# OR use MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartcafe

# JWT Secret (Change this to a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

**Important**: Change `JWT_SECRET` to a random secure string!

#### 2.3 Start MongoDB

**Option A: Local MongoDB**
```bash
# On Windows (run in separate terminal)
mongod

# On Mac/Linux
sudo mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update MONGODB_URI in .env file

#### 2.4 Seed Initial Data (Optional but Recommended)

```bash
# Create default admin user
node seedAdmin.js

# Add all 21 menu products
node seedMenuProducts.js
```

This creates:
- **Admin User**: Username: `admin`, Password: `admin123`
- **21 Products**: All menu items with categories

#### 2.5 Start Backend Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

You should see:
```
✓ MongoDB Connected
✓ Server running on http://localhost:8000
```

### Step 3: Frontend Setup

Open a **new terminal/command prompt** (keep backend running):

#### 3.1 Install Frontend Dependencies

```bash
# From project root, navigate to frontend
cd frontend

# Install all required packages
npm install
```

#### 3.2 Create Environment File

Create `.env` file in the `frontend` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:8000/api
```

#### 3.3 Start Frontend Development Server

```bash
# Start development server
npm run dev
```

You should see:
```
  VITE v5.4.21  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Access the Application

Open your web browser and visit:

#### Customer Menu (Public - No Login)
```
http://localhost:5173/menu
```
Customers can browse menu and place orders

#### Admin/Cashier Login
```
http://localhost:5173/login
```

**Default Login Credentials:**

Admin:
- Username: `admin`
- Password: `admin123`
- Access: Full system control

#### Create Cashier Account
1. Login as Admin
2. Go to Masters → User Management
3. Click "Add New User"
4. Fill details:
   - Name: Your cashier name
   - Username: Choose username
   - Password: Set password
   - Role: Select "Cashier"
5. Click "Create User"

## 📁 Project Structure

```
smartcafee/
│
├── backend/                    # Node.js/Express Backend
│   ├── config/                # Configuration files
│   │   └── multer.js         # Image upload configuration
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── billController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── reportController.js
│   │   └── settingsController.js
│   ├── middleware/           # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/               # MongoDB schemas
│   │   ├── Bill.js
│   │   ├── BusinessSettings.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── billRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── reportRoutes.js
│   │   └── settingsRoutes.js
│   ├── uploads/              # Uploaded product images
│   ├── .env                  # Environment variables
│   ├── package.json          # Dependencies
│   ├── seedAdmin.js          # Create admin user
│   ├── seedMenuProducts.js   # Seed menu items
│   └── server.js             # Main entry point
│
├── frontend/                  # React/Vite Frontend
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── auth/        # Login
│   │   │   ├── billing/     # Fast Order, View Bills
│   │   │   ├── customer/    # Customer Menu
│   │   │   ├── dashboard/   # Admin & User Dashboard
│   │   │   ├── orders/      # Order Management
│   │   │   ├── products/    # Product Management
│   │   │   ├── reports/     # All Reports
│   │   │   ├── settings/    # Business Settings
│   │   │   ├── masters/     # User Management
│   │   │   └── common/      # Layout, Header, Sidebar
│   │   ├── context/         # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Entry point
│   ├── .env                  # Environment variables
│   ├── package.json          # Dependencies
│   └── vite.config.js        # Vite configuration
│
├── README.md                  # This file
└── CLIENT-DELIVERY-README.md  # Client documentation
```

## 🔧 Configuration

### Database Configuration

Edit `backend/.env`:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/smartcafe

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartcafe?retryWrites=true&w=majority
```

### Port Configuration

**Backend Port** (default: 8000)
Edit `backend/.env`:
```env
PORT=8000
```

**Frontend Port** (default: 5173)
Edit `frontend/vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 5173
  }
})
```

### CORS Configuration

If frontend is on different port, update `backend/.env`:
```env
CLIENT_URL=http://localhost:5173
```

## 🎨 Customization

### Shop Details
1. Login as Admin
2. Go to Settings → Business Info
3. Update:
   - Shop Name
   - Shop Tagline (for customer menu)
   - Address, Phone, Email
   - GST Number
   - Bill Prefix

### Menu Slider
1. Go to Settings → Menu Slider
2. Configure up to 3 slides:
   - Title
   - Subtitle
   - Image URL (full https:// link)
3. Leave blank to skip

### Product Images
1. Go to Products Management
2. Click Edit on any product
3. Upload image file (JPG, PNG)
4. Images stored in `backend/uploads/`

## 📊 Available Reports

Access from sidebar after login:

1. **Sales Report**: Daily/date-range sales with bill details
2. **Item-wise Sales**: Product performance analysis
3. **User-wise Sales**: Cashier performance tracking
4. **Daily Collection**: Payment mode breakdown
5. **Show-wise Collection**: Time-slot based sales
6. **Stock Report**: Current inventory status
7. **Profit Report**: Profit margins by product
8. **Purchase Summary**: Supplier purchases (if used)

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/Cashier)
- Protected API routes
- Input validation
- XSS protection
- CORS configuration

## 🐛 Troubleshooting

### Backend Won't Start

**Problem**: `MongoDB connection error`
```bash
# Solution 1: Check if MongoDB is running
mongod

# Solution 2: Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/smartcafe
```

**Problem**: `Port 8000 already in use`
```bash
# Solution: Change port in backend/.env
PORT=8001
```

### Frontend Won't Start

**Problem**: `Cannot connect to backend`
```bash
# Solution: Check VITE_API_URL in frontend/.env
VITE_API_URL=http://localhost:8000/api
```

**Problem**: `Module not found`
```bash
# Solution: Reinstall dependencies
cd frontend
rm -rf node_modules
npm install
```

### Login Issues

**Problem**: `Invalid credentials`
```bash
# Solution: Reset admin password by running seed script
cd backend
node seedAdmin.js
```

**Problem**: `Cashier account not working`
- Check role is set to 'cashier' (not 'user')
- Ensure account is active (isActive: true)

### Database Issues

**Problem**: `Collection doesn't exist`
```bash
# Solution: Seed the database
cd backend
node seedAdmin.js
node seedMenuProducts.js
```

**Problem**: `Database reset needed`
```bash
# Connect to MongoDB and drop database
mongo
use smartcafe
db.dropDatabase()

# Then re-seed
node seedAdmin.js
node seedMenuProducts.js
```

## 📱 Mobile Access

To access from mobile devices on same network:

1. Find your computer's local IP:
   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```

2. Access from mobile browser:
   ```
   http://YOUR_LOCAL_IP:5173/menu
   ```

3. Update `frontend/.env` for API:
   ```env
   VITE_API_URL=http://YOUR_LOCAL_IP:8000/api
   ```

## 🌐 Production Deployment

For deploying to production server (VPS/Cloud):

### Backend Deployment

1. Install Node.js and MongoDB on server
2. Clone repository
3. Set environment to production:
   ```env
   NODE_ENV=production
   ```
4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name smartcafe-backend
   ```

### Frontend Deployment

1. Build production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve `dist/` folder with Nginx/Apache
3. Update API URL to production backend

### Database Backup

Regular backups recommended:
```bash
# Backup
mongodump --db smartcafe --out ./backup

# Restore
mongorestore --db smartcafe ./backup/smartcafe
```

## 🆘 Support

For issues or questions:

1. Check this README
2. Check CLIENT-DELIVERY-README.md
3. Review error messages in terminal
4. Check browser console for frontend errors
5. Check MongoDB logs for database issues

## 📝 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Style
- Backend: Node.js/Express best practices
- Frontend: React hooks, functional components
- Database: MongoDB/Mongoose patterns

## 🎓 Learning Resources

- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Node.js**: https://nodejs.org/
- **Express**: https://expressjs.com/
- **MongoDB**: https://www.mongodb.com/docs/
- **Ant Design**: https://ant.design/

## 📄 License

This project is proprietary software. All rights reserved.

## ✨ Credits

Developed with ❤️ for Smart Cafe

---

**Quick Start Summary:**

```bash
# 1. Clone and setup backend
git clone https://github.com/kallesh653/smartcafee.git
cd smartcafee/backend
npm install
# Create .env file (see Step 2.2)
node seedAdmin.js
node seedMenuProducts.js
npm run dev

# 2. In new terminal, setup frontend
cd frontend
npm install
# Create .env file (see Step 3.2)
npm run dev

# 3. Open browser
# Customer Menu: http://localhost:5173/menu
# Admin Login: http://localhost:5173/login
# Username: admin, Password: admin123
```

**You're ready to go! 🚀**
