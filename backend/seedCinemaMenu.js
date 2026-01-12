const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const cinemaMenuProducts = [
  // POPCORN CATEGORY
  {
    name: 'POP CORN SALTED',
    code: 'PC001',
    serialNo: '1',
    category: 'Popcorn',
    price: 99,
    unit: 'TUB',
    inStock: true,
    stockQuantity: 100,
    minStockLevel: 20,
    description: '1 TUB - Classic salted popcorn'
  },
  {
    name: 'POP CORN BUTTER CHEESE',
    code: 'PC002',
    serialNo: '2',
    category: 'Popcorn',
    price: 99,
    unit: 'TUB',
    inStock: true,
    stockQuantity: 100,
    minStockLevel: 20,
    description: '1 TUB - Butter cheese flavored popcorn'
  },
  {
    name: 'POP CORN BARBEQUE',
    code: 'PC003',
    serialNo: '3',
    category: 'Popcorn',
    price: 99,
    unit: 'TUB',
    inStock: true,
    stockQuantity: 100,
    minStockLevel: 20,
    description: '1 TUB - BBQ flavored popcorn'
  },
  {
    name: 'POP CORN TANGY TOMATO',
    code: 'PC004',
    serialNo: '4',
    category: 'Popcorn',
    price: 99,
    unit: 'TUB',
    inStock: true,
    stockQuantity: 100,
    minStockLevel: 20,
    description: '1 TUB - Tangy tomato flavored popcorn'
  },
  {
    name: 'POP CORN MEXICAN',
    code: 'PC005',
    serialNo: '5',
    category: 'Popcorn',
    price: 99,
    unit: 'TUB',
    inStock: true,
    stockQuantity: 100,
    minStockLevel: 20,
    description: '1 TUB - Mexican spice popcorn'
  },
  {
    name: 'POPCORN LARGE - ANY',
    code: 'PC006',
    serialNo: '6',
    category: 'Popcorn',
    price: 149,
    unit: 'LARGE',
    inStock: true,
    stockQuantity: 80,
    minStockLevel: 15,
    description: '1 LARGE - Any flavor popcorn large size'
  },

  // SNACKS CATEGORY
  {
    name: 'ALOO TIKKI',
    code: 'SN007',
    serialNo: '7',
    category: 'Snacks',
    price: 99,
    unit: 'PCS',
    inStock: true,
    stockQuantity: 50,
    minStockLevel: 10,
    description: '5 PCS - Crispy potato tikkis'
  },
  {
    name: 'CHEESE CORN TRINGLES/NUGGET',
    code: 'SN008',
    serialNo: '8',
    category: 'Snacks',
    price: 99,
    unit: 'PCS',
    inStock: true,
    stockQuantity: 50,
    minStockLevel: 10,
    description: '4 PCS - Cheese corn triangles/nuggets'
  },
  {
    name: 'FRENCH FRIES/FINGER CHIPS',
    code: 'SN009',
    serialNo: '9',
    category: 'Snacks',
    price: 99,
    unit: 'TRAY',
    inStock: true,
    stockQuantity: 60,
    minStockLevel: 15,
    description: '1 TRAY - Crispy french fries'
  },
  {
    name: 'PUNJABI SAMOSA',
    code: 'SN010',
    serialNo: '10',
    category: 'Snacks',
    price: 99,
    unit: 'PCS',
    inStock: true,
    stockQuantity: 50,
    minStockLevel: 10,
    description: '6 PCS - Authentic Punjabi samosa'
  },
  {
    name: 'VEG SAMOSA',
    code: 'SN011',
    serialNo: '11',
    category: 'Snacks',
    price: 59,
    unit: 'PCS',
    inStock: true,
    stockQuantity: 60,
    minStockLevel: 15,
    description: '2 PCS - Vegetable samosa'
  },
  {
    name: 'VEG SPRING ROLL',
    code: 'SN012',
    serialNo: '12',
    category: 'Snacks',
    price: 129,
    unit: 'PCS',
    inStock: true,
    stockQuantity: 40,
    minStockLevel: 10,
    description: '4 PCS - Crispy veg spring rolls'
  },
  {
    name: 'PIZZA POCKETS',
    code: 'SN013',
    serialNo: '13',
    category: 'Snacks',
    price: 99,
    unit: 'PCS',
    inStock: true,
    stockQuantity: 50,
    minStockLevel: 10,
    description: '3 PCS - Cheesy pizza pockets'
  },
  {
    name: 'LEBENEESE FALAFAL KEBAB',
    code: 'SN014',
    serialNo: '14',
    category: 'Snacks',
    price: 79,
    unit: 'PCS',
    inStock: true,
    stockQuantity: 40,
    minStockLevel: 10,
    description: '5 PCS - Lebanese falafel kebab'
  },
  {
    name: 'HARA BARA KEBAB',
    code: 'SN015',
    serialNo: '15',
    category: 'Snacks',
    price: 79,
    unit: 'PCS',
    inStock: true,
    stockQuantity: 40,
    minStockLevel: 10,
    description: '5 PCS - Green vegetable kebab'
  },
  {
    name: 'CHEESE SHOTS',
    code: 'SN016',
    serialNo: '16',
    category: 'Snacks',
    price: 99,
    unit: 'PCS',
    inStock: true,
    stockQuantity: 50,
    minStockLevel: 10,
    description: '5 PCS - Cheesy shots'
  },
  {
    name: 'CHILLI GARLIC BYTES/SHOTS',
    code: 'SN017',
    serialNo: '17',
    category: 'Snacks',
    price: 89,
    unit: 'PCS',
    inStock: true,
    stockQuantity: 50,
    minStockLevel: 10,
    description: '10 PCS - Spicy chilli garlic bites'
  },
  {
    name: 'CHEESE POPPERS',
    code: 'SN018',
    serialNo: '18',
    category: 'Snacks',
    price: 99,
    unit: 'PCS',
    inStock: true,
    stockQuantity: 50,
    minStockLevel: 10,
    description: '5 PCS - Cheesy poppers'
  },

  // BEVERAGES CATEGORY
  {
    name: 'COKE',
    code: 'BV019',
    serialNo: '19',
    category: 'Beverages',
    price: 49,
    unit: 'Bottle',
    inStock: true,
    stockQuantity: 200,
    minStockLevel: 50,
    description: '300 ML - Coca-Cola bottle'
  },
  {
    name: 'FANTA',
    code: 'BV020',
    serialNo: '20',
    category: 'Beverages',
    price: 49,
    unit: 'Bottle',
    inStock: true,
    stockQuantity: 200,
    minStockLevel: 50,
    description: '300 ML - Fanta Orange bottle'
  },
  {
    name: 'SPRITE',
    code: 'BV021',
    serialNo: '21',
    category: 'Beverages',
    price: 49,
    unit: 'Bottle',
    inStock: true,
    stockQuantity: 200,
    minStockLevel: 50,
    description: '300 ML - Sprite bottle'
  }
];

const seedCinemaMenu = async () => {
  try {
    console.log('🎬 Smart Moviiz Cinema Menu Seeding Started...\n');

    // Delete existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products\n');

    // Insert all cinema menu products
    const products = await Product.insertMany(cinemaMenuProducts);

    console.log('✅ Cinema Menu Products Added Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 PRODUCT SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Count by category
    const popcornCount = products.filter(p => p.category === 'Popcorn').length;
    const snacksCount = products.filter(p => p.category === 'Snacks').length;
    const beveragesCount = products.filter(p => p.category === 'Beverages').length;

    console.log(`🍿 Popcorn:   ${popcornCount} items (₹99-₹149)`);
    console.log(`🍟 Snacks:    ${snacksCount} items (₹59-₹129)`);
    console.log(`🥤 Beverages: ${beveragesCount} items (₹49)`);
    console.log(`\n📦 Total Products: ${products.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Display all products with serial numbers
    console.log('📝 ALL PRODUCTS LIST:\n');
    products.forEach(product => {
      console.log(`${String(product.serialNo).padStart(2, '0')}. ${product.name.padEnd(35)} ${product.code}  ₹${product.price}  ${product.unit}`);
    });

    console.log('\n✨ Cinema menu seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding cinema menu:', error);
    process.exit(1);
  }
};

// Run the seed function
seedCinemaMenu();
