const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ReadyItem = require('./models/ReadyItem');

dotenv.config();

const sampleReadyItems = [
  {
    itemName: 'Water Bottle 1L',
    category: 'Beverages',
    unit: 'Bottle',
    defaultQuantity: 24,
    costPrice: 15,
    sellingPrice: 20,
    minStockAlert: 50,
    icon: 'bottle',
    color: '#1890ff',
    isActive: true,
    displayOrder: 1,
    description: 'Packaged drinking water 1 liter bottle'
  },
  {
    itemName: 'Water Bottle 500ML',
    category: 'Beverages',
    unit: 'Bottle',
    defaultQuantity: 24,
    costPrice: 8,
    sellingPrice: 10,
    minStockAlert: 100,
    icon: 'bottle',
    color: '#13c2c2',
    isActive: true,
    displayOrder: 2,
    description: 'Packaged drinking water 500ml bottle'
  },
  {
    itemName: 'Coca Cola 250ML',
    category: 'Beverages',
    unit: 'Bottle',
    defaultQuantity: 24,
    costPrice: 25,
    sellingPrice: 40,
    minStockAlert: 50,
    icon: 'bottle',
    color: '#f5222d',
    isActive: true,
    displayOrder: 3,
    description: 'Coca Cola cold drink 250ml'
  },
  {
    itemName: 'Pepsi 250ML',
    category: 'Beverages',
    unit: 'Bottle',
    defaultQuantity: 24,
    costPrice: 25,
    sellingPrice: 40,
    minStockAlert: 50,
    icon: 'bottle',
    color: '#2f54eb',
    isActive: true,
    displayOrder: 4,
    description: 'Pepsi cold drink 250ml'
  },
  {
    itemName: 'Popcorn Large Tub',
    category: 'Snacks',
    unit: 'Piece',
    defaultQuantity: 50,
    costPrice: 15,
    sellingPrice: 80,
    minStockAlert: 30,
    icon: 'food',
    color: '#faad14',
    isActive: true,
    displayOrder: 5,
    description: 'Large popcorn tub ready to serve'
  },
  {
    itemName: 'Popcorn Small Tub',
    category: 'Snacks',
    unit: 'Piece',
    defaultQuantity: 50,
    costPrice: 10,
    sellingPrice: 50,
    minStockAlert: 30,
    icon: 'food',
    color: '#fa8c16',
    isActive: true,
    displayOrder: 6,
    description: 'Small popcorn tub ready to serve'
  },
  {
    itemName: 'Samosa',
    category: 'Snacks',
    unit: 'Piece',
    defaultQuantity: 20,
    costPrice: 8,
    sellingPrice: 15,
    minStockAlert: 20,
    icon: 'food',
    color: '#fa541c',
    isActive: true,
    displayOrder: 7,
    description: 'Hot samosa'
  },
  {
    itemName: 'Coffee Cup',
    category: 'Hot Beverages',
    unit: 'Cup',
    defaultQuantity: 50,
    costPrice: 5,
    sellingPrice: 20,
    minStockAlert: 30,
    icon: 'coffee',
    color: '#8c572b',
    isActive: true,
    displayOrder: 8,
    description: 'Hot coffee regular'
  },
  {
    itemName: 'Tea Cup',
    category: 'Hot Beverages',
    unit: 'Cup',
    defaultQuantity: 50,
    costPrice: 3,
    sellingPrice: 10,
    minStockAlert: 30,
    icon: 'coffee',
    color: '#d4b106',
    isActive: true,
    displayOrder: 9,
    description: 'Hot tea regular'
  },
  {
    itemName: 'Ice Cream Cup',
    category: 'Frozen Items',
    unit: 'Cup',
    defaultQuantity: 20,
    costPrice: 25,
    sellingPrice: 50,
    minStockAlert: 20,
    icon: 'food',
    color: '#eb2f96',
    isActive: true,
    displayOrder: 10,
    description: 'Vanilla ice cream cup'
  },
  {
    itemName: 'Chips Packet',
    category: 'Snacks',
    unit: 'Packet',
    defaultQuantity: 30,
    costPrice: 10,
    sellingPrice: 20,
    minStockAlert: 25,
    icon: 'food',
    color: '#722ed1',
    isActive: true,
    displayOrder: 11,
    description: 'Potato chips packet'
  },
  {
    itemName: 'Chocolate Bar',
    category: 'Confectionery',
    unit: 'Piece',
    defaultQuantity: 50,
    costPrice: 20,
    sellingPrice: 30,
    minStockAlert: 30,
    icon: 'gift',
    color: '#531dab',
    isActive: true,
    displayOrder: 12,
    description: 'Chocolate bar'
  },
  {
    itemName: 'Paper Cups (Pack)',
    category: 'Supplies',
    unit: 'Packet',
    defaultQuantity: 10,
    costPrice: 50,
    sellingPrice: 0,
    minStockAlert: 5,
    icon: 'shopping',
    color: '#595959',
    isActive: true,
    displayOrder: 13,
    description: 'Disposable paper cups pack of 100'
  },
  {
    itemName: 'Straws (Pack)',
    category: 'Supplies',
    unit: 'Packet',
    defaultQuantity: 5,
    costPrice: 30,
    sellingPrice: 0,
    minStockAlert: 3,
    icon: 'shopping',
    color: '#8c8c8c',
    isActive: true,
    displayOrder: 14,
    description: 'Disposable straws pack of 200'
  },
  {
    itemName: 'Napkins (Pack)',
    category: 'Supplies',
    unit: 'Packet',
    defaultQuantity: 10,
    costPrice: 40,
    sellingPrice: 0,
    minStockAlert: 5,
    icon: 'shopping',
    color: '#bfbfbf',
    isActive: true,
    displayOrder: 15,
    description: 'Paper napkins pack of 100'
  }
];

async function seedReadyItems() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartcafe_cinema');
    console.log('Connected to MongoDB');

    // Clear existing ready items
    await ReadyItem.deleteMany({});
    console.log('Cleared existing ready items');

    // Insert sample data
    const items = await ReadyItem.insertMany(sampleReadyItems);
    console.log(`✅ Successfully seeded ${items.length} ready items`);

    console.log('\nSeeded Ready Items:');
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.itemName} (${item.category}) - Cost: ₹${item.costPrice}, Sell: ₹${item.sellingPrice}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding ready items:', error);
    process.exit(1);
  }
}

seedReadyItems();
