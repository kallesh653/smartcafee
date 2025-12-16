const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

// Using placeholder images and Unsplash for free images
const productImages = {
  // Hot Beverages
  'Coffee (Small)': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
  'Coffee (Medium)': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
  'Coffee (Large)': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
  'Tea (Small)': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
  'Tea (Medium)': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
  'Hot Chocolate': 'https://images.unsplash.com/photo-1542990253-a781e04c0082?w=400',

  // Cold Beverages
  'Coca Cola (300ml)': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
  'Pepsi (300ml)': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
  'Sprite (300ml)': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400',
  'Fanta (300ml)': 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400',
  'Mineral Water (500ml)': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
  'Mineral Water (1L)': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
  'Cold Coffee': 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
  'Iced Tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',

  // Snacks
  'Popcorn (Small)': 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400',
  'Popcorn (Medium)': 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400',
  'Popcorn (Large)': 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400',
  'Nachos with Cheese': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400',
  'French Fries': 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400',
  'Samosa (2pcs)': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
  'Veg Puff': 'https://images.unsplash.com/photo-1626774518432-77cbca69e83c?w=400',
  'Chips (Small)': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
  'Chips (Large)': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',

  // Food
  'Veg Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
  'Cheese Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
  'Veg Burger': 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400',
  'Chicken Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  'Hot Dog': 'https://images.unsplash.com/photo-1612392062422-ef19b42f74df?w=400',
  'Pizza Slice': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',

  // Combos
  'Popcorn + Coke Combo (M)': 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400',
  'Popcorn + Coke Combo (L)': 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400',
  'Nachos + Pepsi Combo': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400',
  'Burger + Fries + Drink': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400',

  // Desserts
  'Ice Cream Cup': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
  'Brownie': 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400',
  'Chocolate': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400',
  'Candy': 'https://images.unsplash.com/photo-1514517604298-cf80e0fb7f1e?w=400',
};

const addImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    console.log('Adding images to products...\n');

    let updated = 0;

    for (const [productName, imageUrl] of Object.entries(productImages)) {
      const result = await Product.updateOne(
        { name: productName },
        {
          $set: {
            imageUrl: imageUrl,
            image: imageUrl.split('/').pop() // Use last part of URL as filename
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Added image for: ${productName}`);
        updated++;
      }
    }

    console.log(`\n🎉 Images added successfully!`);
    console.log(`📊 Total products updated: ${updated}`);
    console.log('\n✨ All products now have beautiful images!');
    console.log('🔄 Refresh your browser to see the changes.');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addImages();
