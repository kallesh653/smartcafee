const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const BusinessSettings = require('../models/BusinessSettings');

dotenv.config();

async function reset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const dbName = mongoose.connection.name;

    console.log(`Connected to MongoDB: ${dbName}`);
    console.log('Dropping database...');
    await mongoose.connection.dropDatabase();
    console.log('Database dropped.');

    console.log('Seeding admin and cashier users...');
    await User.create([
      {
        name: 'Administrator',
        username: 'admin',
        password: 'admin123',
        email: 'admin@smartcafe.local',
        role: 'admin',
        permissions: {
          canEditPrice: true,
          canGiveDiscount: true,
          maxDiscountPercent: 100,
          canDeleteBill: true,
          canViewReports: true
        }
      },
      {
        name: 'Cashier',
        username: 'cashier',
        password: 'cashier123',
        email: 'cashier@smartcafe.local',
        role: 'user',
        permissions: {
          canEditPrice: false,
          canGiveDiscount: true,
          maxDiscountPercent: 10,
          canDeleteBill: false,
          canViewReports: false
        }
      }
    ]);

    console.log('Creating default business settings...');
    await BusinessSettings.create({
      shopName: 'Smart Cafe - Cinema Theater',
      shopAddress: 'navanager bagalkot',
      shopMobile: '+91 9380947087',
      shopEmail: 'contact@smartcafe.com',
      gstEnabled: false,
      defaultGstPercent: 5
    });

    console.log('Reset complete. You can now login with:');
    console.log('  Admin:    admin / admin123');
    console.log('  Cashier:  cashier / cashier123');
    process.exit(0);
  } catch (err) {
    console.error('Reset error:', err);
    process.exit(1);
  }
}

reset();
