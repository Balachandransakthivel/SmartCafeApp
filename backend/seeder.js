const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const menuItems = require('./data/menuItems');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const Feedback = require('./models/Feedback');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear out existing data
    await Order.deleteMany();
    await MenuItem.deleteMany();
    await User.deleteMany();
    await Feedback.deleteMany();

    // Import the mock data
    const createdUsers = await User.insertMany(users);
    console.log('✅ Users Imported!');

    // Import menu items
    await MenuItem.insertMany(menuItems);
    console.log('✅ Menu Items Imported!');

    // Create a mock order to test with
    const adminUser = createdUsers[0]._id;
    const insertedItems = await MenuItem.find({});
    
    if (insertedItems.length > 0) {
      await Order.create({
        user: adminUser,
        items: [
          {
            menuItem: insertedItems[0]._id, // First item
            quantity: 2,
            price: insertedItems[0].price
          },
          {
            menuItem: insertedItems[4]._id, // Fifth item (pizza)
            quantity: 1,
            price: insertedItems[4].price
          }
        ],
        totalAmount: (insertedItems[0].price * 2) + insertedItems[4].price,
        status: 'completed'
      });
      console.log('✅ Base Test Order Generated!');
    }

    console.log('🚀 Data Import Completely Successful!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await MenuItem.deleteMany();
    await User.deleteMany();
    await Feedback.deleteMany();

    console.log('🗑️ Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

// Check arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
