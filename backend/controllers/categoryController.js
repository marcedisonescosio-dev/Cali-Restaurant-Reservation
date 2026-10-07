const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryExists = await MenuCategory.findOne({ name: name.trim() });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await MenuCategory.create({
      name: name.trim(),
      description: description ? description.trim() : ''
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to create category' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await MenuCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) {
      const exists = await MenuCategory.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
      if (exists) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to update category' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if there are menu items assigned to this category
    const itemsCount = await MenuItem.countDocuments({ categoryId: req.params.id });
    if (itemsCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category: ${itemsCount} menu item(s) are linked to it. Please reassign or delete them first.`
      });
    }

    await MenuCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: `Category '${category.name}' deleted successfully` });
  } catch (error) {
    console.error('Delete category error:', error.message);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
