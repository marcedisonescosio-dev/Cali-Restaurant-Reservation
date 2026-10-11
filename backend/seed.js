const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load models
const User = require('./models/User');
const Table = require('./models/Table');
const MenuCategory = require('./models/MenuCategory');
const MenuItem = require('./models/MenuItem');

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Seeding restaurant data...');

    // 1. Create Default Admin if not exists
    let admin = await User.findOne({ email: 'admin@restaurant.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Restaurant Manager',
        email: 'admin@restaurant.com',
        phone: '555-0100',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✔ Admin user created: admin@restaurant.com (pass: admin123)');
    } else {
      console.log('ℹ Admin user already exists');
    }

    // 2. Create Default Customer if not exists
    let customer = await User.findOne({ email: 'guest@example.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Jane Doe',
        email: 'guest@example.com',
        phone: '555-0199',
        password: 'password123',
        role: 'customer'
      });
      console.log('✔ Sample customer created: guest@example.com (pass: password123)');
    } else {
      console.log('ℹ Sample customer already exists');
    }

    // 3. Seed Dining Tables
    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      const sampleTables = [
        { tableNumber: 1, capacity: 2, tableClass: 'window_terrace', status: 'available' },
        { tableNumber: 2, capacity: 2, tableClass: 'window_terrace', status: 'available' },
        { tableNumber: 3, capacity: 4, tableClass: 'main_hall', status: 'available' },
        { tableNumber: 4, capacity: 4, tableClass: 'main_hall', status: 'available' },
        { tableNumber: 5, capacity: 6, tableClass: 'main_hall', status: 'available' },
        { tableNumber: 6, capacity: 6, tableClass: 'main_hall', status: 'available' },
        { tableNumber: 7, capacity: 8, tableClass: 'vip_salons', status: 'available' },
        { tableNumber: 8, capacity: 10, tableClass: 'vip_salons', status: 'available' }
      ];
      await Table.insertMany(sampleTables);
      console.log(`✔ Created ${sampleTables.length} dining tables`);
    } else {
      console.log(`ℹ Found ${tableCount} existing tables`);
    }

    // 4. Seed Menu Categories & Items
    const categoryCount = await MenuCategory.countDocuments();
    if (categoryCount === 0) {
      const starters = await MenuCategory.create({
        name: 'Starters',
        description: 'Flavorful appetizers to awaken your palate'
      });

      const mains = await MenuCategory.create({
        name: 'Main Courses',
        description: 'Chef-crafted signature gourmet entrees'
      });

      const desserts = await MenuCategory.create({
        name: 'Desserts',
        description: 'Artisan sweet treats and delicate pastries'
      });

      const beverages = await MenuCategory.create({
        name: 'Beverages',
        description: 'Freshly prepared mocktails, wines, and craft drinks'
      });

      console.log('✔ Created 4 menu categories');

      const sampleItems = [
        {
          categoryId: starters._id,
          name: 'Crispy Calamari',
          description: 'Tender calamari rings with spicy marinara and garlic aioli dip',
          price: 13.99,
          image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60',
          availability: true
        },
        {
          categoryId: starters._id,
          name: 'Truffle Bruschetta',
          description: 'Toasted sourdough with vine-ripe tomatoes, basil, and black truffle oil',
          price: 11.5,
          image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500&auto=format&fit=crop&q=60',
          availability: true
        },
        {
          categoryId: starters._id,
          name: 'Sizzling Pork Sisig',
          description: 'A famous Kapampangan delicacy. Crispy, savory chopped pork served on a sizzling cast-iron platter, topped with fresh chili, onions, and a crackling egg.',
          price: 12.5,
          image: '',
          availability: true
        },
        {
          categoryId: mains._id,
          name: 'Prime Ribeye Steak',
          description: '12oz grilled USDA prime ribeye with rosemary garlic butter & roasted asparagus',
          price: 36.0,
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
          availability: true
        },
        {
          categoryId: mains._id,
          name: 'Pan-Seared Atlantic Salmon',
          description: 'Wild-caught salmon fillet with lemon herb butter sauce and saffron risotto',
          price: 28.5,
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=60',
          availability: true
        },
        {
          categoryId: mains._id,
          name: 'Wild Mushroom Risotto',
          description: 'Creamy Arborio rice with porcini mushrooms, parmesan, and thyme',
          price: 22.0,
          image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500&auto=format&fit=crop&q=60',
          availability: true
        },
        {
          categoryId: desserts._id,
          name: 'Classic Italian Tiramisu',
          description: 'Espresso-soaked ladyfingers with whipped mascarpone and dark cocoa',
          price: 9.5,
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=60',
          availability: true
        },
        {
          categoryId: desserts._id,
          name: 'Molten Chocolate Lava Cake',
          description: 'Warm chocolate cake with a molten center and Madagascar vanilla gelato',
          price: 10.5,
          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60',
          availability: true
        },
        {
          categoryId: beverages._id,
          name: 'Signature Passionfruit Spritz',
          description: 'Fresh passionfruit puree, sparkling water, mint leaves, and lime',
          price: 7.5,
          image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&auto=format&fit=crop&q=60',
          availability: true
        }
      ];

      await MenuItem.insertMany(sampleItems);
      console.log(`✔ Created ${sampleItems.length} menu items`);
    } else {
      console.log(`ℹ Found ${categoryCount} existing menu categories`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
