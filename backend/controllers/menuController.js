const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');

// @desc    Get all menu items (optionally filter by categoryId)
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.categoryId = req.query.category;
    }

    const items = await MenuItem.find(filter)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    console.error('Get menu items error:', error.message);
    res.status(500).json({ message: 'Failed to fetch menu items' });
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('categoryId', 'name');
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error('Get menu item by ID error:', error.message);
    res.status(500).json({ message: 'Failed to fetch menu item details' });
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = async (req, res) => {
  try {
    const { categoryId, name, description, price, image, availability } = req.body;

    if (!categoryId || !name || price === undefined) {
      return res.status(400).json({ message: 'Category, name, and price are required' });
    }

    // Verify category exists
    const category = await MenuCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Specified category does not exist' });
    }

    const item = await MenuItem.create({
      categoryId,
      name: name.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      image: image || '',
      availability: availability !== undefined ? availability : true
    });

    const populatedItem = await item.populate('categoryId', 'name');
    res.status(201).json(populatedItem);
  } catch (error) {
    console.error('Create menu item error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to create menu item' });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
  try {
    const { categoryId, name, description, price, image, availability } = req.body;
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (categoryId) {
      const category = await MenuCategory.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Specified category does not exist' });
      }
      item.categoryId = categoryId;
    }

    if (name !== undefined) item.name = name.trim();
    if (description !== undefined) item.description = description.trim();
    if (price !== undefined) item.price = Number(price);
    if (image !== undefined) item.image = image;
    if (availability !== undefined) item.availability = availability;

    const updatedItem = await item.save();
    const populated = await updatedItem.populate('categoryId', 'name');
    res.status(200).json(populated);
  } catch (error) {
    console.error('Update menu item error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to update menu item' });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: `Menu item '${item.name}' deleted successfully` });
  } catch (error) {
    console.error('Delete menu item error:', error.message);
    res.status(500).json({ message: 'Failed to delete menu item' });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
