const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const menuProducts = [
  // POPCORN CATEGORY
  {
    serialNo: 101,
    name: 'POP CORN SALTED',
    description: 'Classic salted popcorn',
    price: 99,
    costPrice: 40,
    category: 'Popcorn',
    unit: 'TUB',
    currentStock: 50,
    minStockAlert: 10,
    isActive: true,
    isPopular: true,
    displayOrder: 1,
    tags: ['popcorn', 'snacks', 'salted']
  },
  {
    serialNo: 102,
    name: 'POP CORN BUTTER CHEESE',
    description: 'Buttery cheese flavored popcorn',
    price: 99,
    costPrice: 45,
    category: 'Popcorn',
    unit: 'TUB',
    currentStock: 50,
    minStockAlert: 10,
    isActive: true,
    isPopular: true,
    displayOrder: 2,
    tags: ['popcorn', 'snacks', 'cheese', 'butter']
  },
  {
    serialNo: 103,
    name: 'POP CORN BARBEQUE',
    description: 'Smoky BBQ flavored popcorn',
    price: 99,
    costPrice: 45,
    category: 'Popcorn',
    unit: 'TUB',
    currentStock: 50,
    minStockAlert: 10,
    isActive: true,
    isPopular: true,
    displayOrder: 3,
    tags: ['popcorn', 'snacks', 'barbeque']
  },
  {
    serialNo: 104,
    name: 'POP CORN TANGY TOMATO',
    description: 'Tangy tomato flavored popcorn',
    price: 99,
    costPrice: 45,
    category: 'Popcorn',
    unit: 'TUB',
    currentStock: 50,
    minStockAlert: 10,
    isActive: true,
    displayOrder: 4,
    tags: ['popcorn', 'snacks', 'tomato', 'tangy']
  },
  {
    serialNo: 105,
    name: 'POP CORN MEXICAN',
    description: 'Spicy Mexican flavored popcorn',
    price: 99,
    costPrice: 45,
    category: 'Popcorn',
    unit: 'TUB',
    currentStock: 50,
    minStockAlert: 10,
    isActive: true,
    displayOrder: 5,
    tags: ['popcorn', 'snacks', 'mexican', 'spicy']
  },
  {
    serialNo: 106,
    name: 'POPCORN LARGE - ANY',
    description: 'Large size popcorn - any flavor',
    price: 149,
    costPrice: 60,
    category: 'Popcorn',
    unit: 'LARGE',
    currentStock: 50,
    minStockAlert: 10,
    isActive: true,
    isPopular: true,
    displayOrder: 6,
    tags: ['popcorn', 'snacks', 'large']
  },

  // SNACKS CATEGORY
  {
    serialNo: 107,
    name: 'ALOO TIKKI',
    description: 'Crispy potato patties - 5 pieces',
    price: 99,
    costPrice: 50,
    category: 'Snacks',
    unit: 'PCS',
    currentStock: 100,
    minStockAlert: 20,
    isActive: true,
    isPopular: true,
    displayOrder: 7,
    tags: ['snacks', 'fried', 'potato', 'tikki']
  },
  {
    serialNo: 108,
    name: 'CHEESE CORN TRINGLES/NUGGET',
    description: 'Cheesy corn triangles - 4 pieces',
    price: 99,
    costPrice: 55,
    category: 'Snacks',
    unit: 'PCS',
    currentStock: 100,
    minStockAlert: 20,
    isActive: true,
    displayOrder: 8,
    tags: ['snacks', 'cheese', 'corn', 'nugget']
  },
  {
    serialNo: 109,
    name: 'FRENCH FRIES/FINGER CHIPS',
    description: 'Crispy golden french fries',
    price: 99,
    costPrice: 40,
    category: 'Snacks',
    unit: 'TRAY',
    currentStock: 100,
    minStockAlert: 20,
    isActive: true,
    isPopular: true,
    displayOrder: 9,
    tags: ['snacks', 'fries', 'potato', 'chips']
  },
  {
    serialNo: 110,
    name: 'PUNJABI SAMOSA',
    description: 'Traditional Punjabi samosa - 6 pieces',
    price: 99,
    costPrice: 45,
    category: 'Snacks',
    unit: 'PCS',
    currentStock: 150,
    minStockAlert: 30,
    isActive: true,
    isPopular: true,
    displayOrder: 10,
    tags: ['snacks', 'samosa', 'punjabi', 'fried']
  },
  {
    serialNo: 111,
    name: 'VEG SAMOSA',
    description: 'Vegetable samosa - 2 pieces',
    price: 59,
    costPrice: 25,
    category: 'Snacks',
    unit: 'PCS',
    currentStock: 150,
    minStockAlert: 30,
    isActive: true,
    displayOrder: 11,
    tags: ['snacks', 'samosa', 'veg', 'fried']
  },
  {
    serialNo: 112,
    name: 'VEG SPRING ROLL',
    description: 'Crispy vegetable spring rolls - 4 pieces',
    price: 129,
    costPrice: 60,
    category: 'Snacks',
    unit: 'PCS',
    currentStock: 100,
    minStockAlert: 20,
    isActive: true,
    displayOrder: 12,
    tags: ['snacks', 'spring roll', 'veg', 'chinese']
  },
  {
    serialNo: 113,
    name: 'PIZZA POCKETS',
    description: 'Mini pizza pockets - 3 pieces',
    price: 99,
    costPrice: 50,
    category: 'Snacks',
    unit: 'PCS',
    currentStock: 80,
    minStockAlert: 15,
    isActive: true,
    displayOrder: 13,
    tags: ['snacks', 'pizza', 'italian']
  },
  {
    serialNo: 114,
    name: 'LEBENEESE FALAFAL KEBAB',
    description: 'Lebanese style falafel kebab - 5 pieces',
    price: 79,
    costPrice: 40,
    category: 'Snacks',
    unit: 'PCS',
    currentStock: 80,
    minStockAlert: 15,
    isActive: true,
    displayOrder: 14,
    tags: ['snacks', 'falafel', 'kebab', 'lebanese']
  },
  {
    serialNo: 115,
    name: 'HARA BARA KEBAB',
    description: 'Green vegetable kebab - 5 pieces',
    price: 99,
    costPrice: 50,
    category: 'Snacks',
    unit: 'PCS',
    currentStock: 80,
    minStockAlert: 15,
    isActive: true,
    displayOrder: 15,
    tags: ['snacks', 'kebab', 'veg', 'green']
  },
  {
    serialNo: 116,
    name: 'CHEESE SHOTS',
    description: 'Cheesy bites - 10 pieces',
    price: 89,
    costPrice: 45,
    category: 'Snacks',
    unit: 'PCS',
    currentStock: 100,
    minStockAlert: 20,
    isActive: true,
    displayOrder: 16,
    tags: ['snacks', 'cheese', 'shots']
  },
  {
    serialNo: 117,
    name: 'CHILLI GARLIC BYTES/SHOTS',
    description: 'Spicy chilli garlic bites - 5 pieces',
    price: 99,
    costPrice: 50,
    category: 'Snacks',
    unit: 'PCS',
    currentStock: 100,
    minStockAlert: 20,
    isActive: true,
    displayOrder: 17,
    tags: ['snacks', 'chilli', 'garlic', 'spicy']
  },
  {
    serialNo: 118,
    name: 'CHEESE POPPERS',
    description: 'Cheesy poppers',
    price: 49,
    costPrice: 25,
    category: 'Snacks',
    unit: 'ML',
    currentStock: 100,
    minStockAlert: 20,
    isActive: true,
    displayOrder: 18,
    tags: ['snacks', 'cheese', 'poppers']
  },

  // BEVERAGES CATEGORY
  {
    serialNo: 119,
    name: 'COKE',
    description: 'Coca-Cola 300ml',
    price: 49,
    costPrice: 25,
    category: 'Beverages',
    unit: 'ML',
    currentStock: 200,
    minStockAlert: 50,
    isActive: true,
    isPopular: true,
    displayOrder: 19,
    tags: ['beverages', 'cold drink', 'coke', 'coca cola']
  },
  {
    serialNo: 120,
    name: 'FANTA',
    description: 'Fanta Orange 300ml',
    price: 49,
    costPrice: 25,
    category: 'Beverages',
    unit: 'ML',
    currentStock: 200,
    minStockAlert: 50,
    isActive: true,
    displayOrder: 20,
    tags: ['beverages', 'cold drink', 'fanta', 'orange']
  },
  {
    serialNo: 121,
    name: 'SPRITE',
    description: 'Sprite Lemon 300ml',
    price: 49,
    costPrice: 25,
    category: 'Beverages',
    unit: 'ML',
    currentStock: 200,
    minStockAlert: 50,
    isActive: true,
    displayOrder: 21,
    tags: ['beverages', 'cold drink', 'sprite', 'lemon']
  }
];

async function seedProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartcafe_cinema');
    console.log('✓ Connected to MongoDB');

    console.log('\nDeleting existing menu products (serialNo 101-121)...');
    await Product.deleteMany({ serialNo: { $gte: 101, $lte: 121 } });
    console.log('✓ Existing products deleted');

    console.log('\nSeeding menu products...');
    for (const product of menuProducts) {
      try {
        await Product.create(product);
        console.log(`  ✓ Added: ${product.name} - ₹${product.price} (${product.unit})`);
      } catch (error) {
        console.error(`  ✗ Failed to add ${product.name}:`, error.message);
      }
    }

    console.log('\n========================================');
    console.log('✓ Menu seeding completed successfully!');
    console.log('========================================');
    console.log(`Total products added: ${menuProducts.length}`);
    console.log('\nCategories:');
    console.log('  - Popcorn: 6 items');
    console.log('  - Snacks: 12 items');
    console.log('  - Beverages: 3 items');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding products:', error);
    process.exit(1);
  }
}

// Run the seeder
seedProducts();
