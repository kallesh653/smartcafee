# 🎬 Smart Cafe - Cinema Theater Billing System

A professional, mobile-responsive cinema theater billing and inventory management system built with **React**, **Node.js**, **Express**, and **MongoDB**.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?logo=react)
![Node](https://img.shields.io/badge/Node.js-16+-339933.svg?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-47A248.svg?logo=mongodb)

---

## ✨ Features

### 🚀 Fast Order Entry
- **Ultra-fast POS system** for quick order taking
- Search products by serial number
- Category-based filtering
- Real-time stock updates
- Touch-optimized for tablets and mobile
- Haptic feedback support

### 📦 Purchase Management
- Professional purchase entry with GST calculations
- Supplier management
- Payment tracking (Paid/Partial/Pending)
- Purchase history with advanced filters
- Export to Excel/PDF

### ⚡ Ready Items (NEW!)
- Quick stock addition for frequently purchased items
- Pre-configured items: Water bottles, Snacks, Beverages, Supplies
- Category-based organization
- Bulk stock addition
- Auto product creation
- Stock ledger tracking

### 📊 Show-wise Collection
- Analyze sales by show timings
- Configurable show slots
- Payment mode breakdown (Cash/UPI/Card/Mixed)
- Summary cards with top show performance
- Beautiful mobile-responsive design

### 📱 Mobile Responsive
- **Completely mobile-friendly design**
- Drawer-based sidebar on mobile
- Touch-optimized buttons and inputs
- Bottom cart bar for easy checkout
- Responsive tables with horizontal scroll

### 📈 Reports & Analytics
- Sales Reports
- Item-wise Sales Analysis
- Daily Collection
- Profit Reports
- Stock Reports
- Supplier Reports
- User-wise Sales

### 🔐 Security
- JWT-based authentication
- Role-based access control (Admin/User)
- Bcrypt password hashing
- Secure API endpoints

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Ant Design 5** - UI components
- **React Router 6** - Routing
- **Axios** - HTTP client
- **Moment.js** - Date handling

### Additional
- **Recharts** - Charts and graphs
- **jsPDF** - PDF export
- **XLSX** - Excel export

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Fast Order
![Fast Order](docs/screenshots/fast-order.png)

### Ready Items
![Ready Items](docs/screenshots/ready-items.png)

### Show-wise Collection
![Show-wise Collection](docs/screenshots/show-wise.png)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB v5+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kallesh653/smartcafee.git
cd smartcafee
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**
Create `.env` file in `/backend`:
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/smartcafe_cinema
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
```

4. **Seed sample ready items (optional)**
```bash
node seedReadyItems.js
```

5. **Start backend server**
```bash
npm start
```

6. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

7. **Start frontend**
```bash
npm run dev
```

8. **Access the application**
```
Frontend: http://localhost:3000
Backend API: http://localhost:8000
```

---

## 📱 Mobile View

The application is fully optimized for mobile devices:
- ✅ Responsive sidebar (drawer on mobile)
- ✅ Touch-friendly buttons
- ✅ Bottom cart bar for easy checkout
- ✅ Optimized forms and tables
- ✅ Fast performance on mobile networks

---

## 🎯 Key Modules

### 1. Fast Order Cashier
Ultra-fast point-of-sale system for quick order entry.
- Search by serial number
- Category filters
- Cart management
- Multiple payment modes

### 2. Ready Items
Quick stock addition for frequently purchased items like water bottles.
- Pre-configured items
- Bulk addition
- Auto product linking
- Stock ledger tracking

### 3. Purchase Management
Complete purchase tracking with supplier management.
- GST calculations
- Payment tracking
- Purchase register
- Export capabilities

### 4. Show-wise Collection
Analyze sales performance by show timings.
- Configurable time slots
- Payment breakdowns
- Performance metrics
- Professional reports

### 5. Inventory Management
Track stock levels with complete audit trail.
- Real-time stock updates
- Low stock alerts
- Stock ledger
- Stock reports

---

## 📊 Database Schema

### Collections
- `users` - User accounts and permissions
- `products` - Product catalog
- `bills` - Sales transactions
- `orders` - Customer orders
- `purchases` - Purchase records
- `suppliers` - Supplier information
- `readyitems` - Ready items for quick stock
- `stockledger` - Stock movement audit trail

---

## 🔐 Default Credentials

Create an admin user manually in MongoDB:

```javascript
{
  username: "admin",
  password: "$2a$10$...", // Hash for "admin123"
  role: "admin",
  isActive: true,
  canEditPrice: true,
  canGiveDiscount: true,
  maxDiscountPercent: 100,
  canDeleteBill: true,
  canViewReports: true
}
```

---

## 📦 Deployment

### Option 1: VPS Deployment (DigitalOcean, AWS, etc.)

See [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) for detailed instructions.

### Option 2: Cloud Deployment

**Frontend:** Vercel, Netlify
**Backend:** Render, Railway, Heroku
**Database:** MongoDB Atlas

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: contact@smartcafe.com

---

## 🙏 Acknowledgments

- Built with ❤️ using React and Node.js
- UI components by Ant Design
- Icons by Ant Design Icons

---

## 📅 Changelog

### Version 2.0.0 (December 2024)
- ✨ Added Ready Items feature for quick stock addition
- 🎨 Complete mobile responsive design
- 📊 Enhanced Show-wise Collection report
- 🚀 Improved Fast Order UX
- 📱 Mobile-friendly dashboards
- 🔧 Performance optimizations

### Version 1.0.0 (Initial Release)
- Basic POS functionality
- Product management
- Bill generation
- Reports

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

---

**Made with 🎬 for Cinema Theaters**

**Version:** 2.0.0
**Author:** Smart Cafe Team
**Year:** 2024
