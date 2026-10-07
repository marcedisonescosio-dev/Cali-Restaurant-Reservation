const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');
const User = require('../models/User');

// @desc    Get dashboard statistics for Admin
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalReservations = await Reservation.countDocuments();
    const pendingReservations = await Reservation.countDocuments({ status: 'Pending' });
    const confirmedReservations = await Reservation.countDocuments({ status: 'Confirmed' });
    const completedReservations = await Reservation.countDocuments({ status: 'Completed' });
    const cancelledReservations = await Reservation.countDocuments({
      status: { $in: ['Cancelled', 'Rejected'] }
    });

    const totalTables = await Table.countDocuments();
    const availableTables = await Table.countDocuments({ status: 'available' });

    const totalMenuItems = await MenuItem.countDocuments();
    const totalCategories = await MenuCategory.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });

    res.status(200).json({
      reservations: {
        total: totalReservations,
        pending: pendingReservations,
        confirmed: confirmedReservations,
        completed: completedReservations,
        cancelled: cancelledReservations
      },
      tables: {
        total: totalTables,
        available: availableTables
      },
      menu: {
        totalItems: totalMenuItems,
        totalCategories: totalCategories
      },
      users: {
        totalCustomers: totalUsers
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve admin stats' });
  }
};

// @desc    Seed sample initial data (Admin user, Categories, Menu Items, Tables)
// @route   POST /api/admin/seed
// @access  Public / Initial setup
const seedInitialData = async (req, res) => {
  try {
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
    }

    // 2. Seed Dining Tables if empty
    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      const sampleTables = [
        { tableNumber: 1, capacity: 2, status: 'available' },
        { tableNumber: 2, capacity: 2, status: 'available' },
        { tableNumber: 3, capacity: 4, status: 'available' },
        { tableNumber: 4, capacity: 4, status: 'available' },
        { tableNumber: 5, capacity: 6, status: 'available' },
        { tableNumber: 6, capacity: 6, status: 'available' },
        { tableNumber: 7, capacity: 8, status: 'available' },
        { tableNumber: 8, capacity: 10, status: 'available' }
      ];
      await Table.insertMany(sampleTables);
    }

    // 3. Seed Menu Categories if empty
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

      // 4. Seed Menu Items
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
    }

    res.status(200).json({
      message: 'Database seeded successfully with default admin, tables, categories, and menu items',
      adminAccount: {
        email: 'admin@restaurant.com',
        password: 'admin123',
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Seed error:', error.message);
    res.status(500).json({ message: error.message || 'Database seeding failed' });
  }
};

module.exports = {
  getAdminStats,
  seedInitialData
};
