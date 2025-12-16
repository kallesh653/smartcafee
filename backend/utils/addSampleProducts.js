const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

const sampleProducts = [
  // Hot Beverages
  { slno: 1, name: 'Coffee (Small)', category: 'Hot Beverages', price: 30, qty: 100, unit: 'Cup' },
  { slno: 2, name: 'Coffee (Medium)', category: 'Hot Beverages', price: 50, qty: 100, unit: 'Cup' },
  { slno: 3, name: 'Coffee (Large)', category: 'Hot Beverages', price: 70, qty: 100, unit: 'Cup' },
  { slno: 4, name: 'Tea (Small)', category: 'Hot Beverages', price: 20, qty: 100, unit: 'Cup' },
  { slno: 5, name: 'Tea (Medium)', category: 'Hot Beverages', price: 30, qty: 100, unit: 'Cup' },
  { slno: 6, name: 'Hot Chocolate', category: 'Hot Beverages', price: 60, qty: 50, unit: 'Cup' },

  // Cold Beverages
  { slno: 7, name: 'Coca Cola (300ml)', category: 'Cold Beverages', price: 40, qty: 200, unit: 'Bottle' },
  { slno: 8, name: 'Pepsi (300ml)', category: 'Cold Beverages', price: 40, qty: 200, unit: 'Bottle' },
  { slno: 9, name: 'Sprite (300ml)', category: 'Cold Beverages', price: 40, qty: 200, unit: 'Bottle' },
  { slno: 10, name: 'Fanta (300ml)', category: 'Cold Beverages', price: 40, qty: 200, unit: 'Bottle' },
  { slno: 11, name: 'Mineral Water (500ml)', category: 'Cold Beverages', price: 20, qty: 300, unit: 'Bottle' },
  { slno: 12, name: 'Mineral Water (1L)', category: 'Cold Beverages', price: 30, qty: 200, unit: 'Bottle' },
  { slno: 13, name: 'Cold Coffee', category: 'Cold Beverages', price: 70, qty: 50, unit: 'Cup' },
  { slno: 14, name: 'Iced Tea', category: 'Cold Beverages', price: 50, qty: 50, unit: 'Cup' },

  // Snacks
  { slno: 15, name: 'Popcorn (Small)', category: 'Snacks', price: 60, qty: 150, unit: 'Piece' },
  { slno: 16, name: 'Popcorn (Medium)', category: 'Snacks', price: 100, qty: 150, unit: 'Piece' },
  { slno: 17, name: 'Popcorn (Large)', category: 'Snacks', price: 150, qty: 150, unit: 'Piece' },
  { slno: 18, name: 'Nachos with Cheese', category: 'Snacks', price: 120, qty: 100, unit: 'Piece' },
  { slno: 19, name: 'French Fries', category: 'Snacks', price: 80, qty: 100, unit: 'Piece' },
  { slno: 20, name: 'Samosa (2pcs)', category: 'Snacks', price: 30, qty: 100, unit: 'Piece' },
  { slno: 21, name: 'Veg Puff', category: 'Snacks', price: 25, qty: 80, unit: 'Piece' },
  { slno: 22, name: 'Chips (Small)', category: 'Snacks', price: 20, qty: 200, unit: 'Packet' },
  { slno: 23, name: 'Chips (Large)', category: 'Snacks', price: 40, qty: 150, unit: 'Packet' },

  // Sandwiches & Burgers
  { slno: 24, name: 'Veg Sandwich', category: 'Food', price: 60, qty: 50, unit: 'Piece' },
  { slno: 25, name: 'Cheese Sandwich', category: 'Food', price: 80, qty: 50, unit: 'Piece' },
  { slno: 26, name: 'Veg Burger', category: 'Food', price: 90, qty: 50, unit: 'Piece' },
  { slno: 27, name: 'Chicken Burger', category: 'Food', price: 120, qty: 40, unit: 'Piece' },
  { slno: 28, name: 'Hot Dog', category: 'Food', price: 70, qty: 50, unit: 'Piece' },
  { slno: 29, name: 'Pizza Slice', category: 'Food', price: 80, qty: 40, unit: 'Piece' },

  // Combo Offers
  { slno: 30, name: 'Popcorn + Coke Combo (M)', category: 'Combos', price: 130, qty: 100, unit: 'Piece' },
  { slno: 31, name: 'Popcorn + Coke Combo (L)', category: 'Combos', price: 180, qty: 100, unit: 'Piece' },
  { slno: 32, name: 'Nachos + Pepsi Combo', category: 'Combos', price: 150, qty: 80, unit: 'Piece' },
  { slno: 33, name: 'Burger + Fries + Drink', category: 'Combos', price: 200, qty: 50, unit: 'Piece' },

  // Desserts
  { slno: 34, name: 'Ice Cream Cup', category: 'Desserts', price: 50, qty: 60, unit: 'Cup' },
  { slno: 35, name: 'Brownie', category: 'Desserts', price: 60, qty: 40, unit: 'Piece' },
  { slno: 36, name: 'Chocolate', category: 'Desserts', price: 30, qty: 100, unit: 'Piece' },
  { slno: 37, name: 'Candy', category: 'Desserts', price: 10, qty: 200, unit: 'Piece' },
];

const addProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing products (optional)
    console.log('Clearing existing products...');
    await Product.deleteMany({});

    // Add all sample products
    console.log('Adding sample products...');

    for (const item of sampleProducts) {
      await Product.create({
        serialNo: item.slno,
        name: item.name,
        category: item.category,
        price: item.price,
        currentStock: item.qty,
        unit: item.unit,
        minStockAlert: 10,
        isActive: true,
        isPopular: item.slno <= 5 || [15, 16, 17, 30, 31].includes(item.slno), // Mark some as popular
        displayOrder: item.slno
      });
      console.log(`✅ Added: ${item.slno}. ${item.name} - ₹${item.price}`);
    }

    console.log('\n🎉 Sample products added successfully!');
    console.log(`📊 Total products: ${sampleProducts.length}`);
    console.log('\nCategories:');
    console.log('  - Hot Beverages (6 items)');
    console.log('  - Cold Beverages (8 items)');
    console.log('  - Snacks (9 items)');
    console.log('  - Food (6 items)');
    console.log('  - Combos (4 items)');
    console.log('  - Desserts (4 items)');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addProducts();
