const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy - Required when behind Nginx
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000 // limit each IP to 2000 requests per windowMs
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/bills', require('./routes/billingRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/ready-items', require('./routes/readyItemRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Legacy routes (for backward compatibility)
app.use('/api/maincodes', require('./routes/mainCodeRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Cafe - Cinema Theater API is running',
    version: '2.0.0',
    timestamp: new Date()
  });
});

// Error handler
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ☕ Smart Cafe - Cinema Theater API v2.0            ║
║                                                       ║
║   Server running in ${process.env.NODE_ENV} mode           ║
║   Port: ${PORT}                                        ║
║   URL: http://localhost:${PORT}                       ║
║   Database: smartcafe_cinema                          ║
║                                                       ║
║   🚀 Ultra-Fast Order Taking System                   ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
