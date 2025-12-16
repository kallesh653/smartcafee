const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

const updateSerialNumbers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    console.log('Updating serial numbers based on displayOrder...\n');

    const products = await Product.find({}).sort({ displayOrder: 1 });

    let updated = 0;
    for (const product of products) {
      if (product.displayOrder && !product.serialNo) {
        product.serialNo = product.displayOrder;
        await product.save();
        console.log(`✅ Updated: #${product.serialNo} - ${product.name}`);
        updated++;
      }
    }

    console.log(`\n🎉 Serial numbers updated successfully!`);
    console.log(`📊 Total products updated: ${updated}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateSerialNumbers();
