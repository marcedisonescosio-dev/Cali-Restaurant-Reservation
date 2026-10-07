const Table = require('../models/Table');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public / Authenticated
const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.status(200).json(tables);
  } catch (error) {
    console.error('Get tables error:', error.message);
    res.status(500).json({ message: 'Failed to fetch tables' });
  }
};

// @desc    Get single table by ID
// @route   GET /api/tables/:id
// @access  Public / Authenticated
const getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.status(200).json(table);
  } catch (error) {
    console.error('Get table by ID error:', error.message);
    res.status(500).json({ message: 'Failed to fetch table details' });
  }
};

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private/Admin
const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, status } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({ message: 'Table number and capacity are required' });
    }

    const tableExists = await Table.findOne({ tableNumber });
    if (tableExists) {
      return res.status(400).json({ message: `Table #${tableNumber} already exists` });
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      status: status || 'available'
    });

    res.status(201).json(table);
  } catch (error) {
    console.error('Create table error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to create table' });
  }
};

// @desc    Update a table
// @route   PUT /api/tables/:id
// @access  Private/Admin
const updateTable = async (req, res) => {
  try {
    const { tableNumber, capacity, status } = req.body;
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Check if new tableNumber conflicts with another existing table
    if (tableNumber && tableNumber !== table.tableNumber) {
      const exists = await Table.findOne({ tableNumber });
      if (exists) {
        return res.status(400).json({ message: `Table #${tableNumber} already exists` });
      }
      table.tableNumber = tableNumber;
    }

    if (capacity !== undefined) table.capacity = capacity;
    if (status !== undefined) table.status = status;

    const updatedTable = await table.save();
    res.status(200).json(updatedTable);
  } catch (error) {
    console.error('Update table error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to update table' });
  }
};

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    await Table.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: `Table #${table.tableNumber} deleted successfully` });
  } catch (error) {
    console.error('Delete table error:', error.message);
    res.status(500).json({ message: 'Failed to delete table' });
  }
};

module.exports = {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable
};
