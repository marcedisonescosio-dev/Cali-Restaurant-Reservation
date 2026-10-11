const Table = require('../models/Table');
const DiningAreaSetting = require('../models/DiningAreaSetting');
const {
  getDiningAreaSettings,
  getDiningAreaReservationFee
} = require('../utils/diningAreaSettings');

const TABLE_CLASSES = new Set(['window_terrace', 'main_hall', 'vip_salons']);

const inferTableClass = (tableNumber) => {
  const number = Number(tableNumber);
  if (number <= 2) return 'window_terrace';
  if (number >= 7 && number <= 8) return 'vip_salons';
  return 'main_hall';
};

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public / Authenticated
const getTables = async (req, res) => {
  try {
    const [tables, settings] = await Promise.all([
      Table.find().sort({ tableNumber: 1 }).lean(),
      getDiningAreaSettings()
    ]);
    const feeByClass = new Map(
      settings.map((setting) => [setting.tableClass, setting.reservationFee])
    );
    const tablesWithPricing = tables.map((table) => {
      const categoryReservationFee = Number(
        feeByClass.get(table.tableClass || inferTableClass(table.tableNumber))
      ) || 0;
      return {
        ...table,
        categoryReservationFee,
        reservationFee: table.reservationFeeOverride ?? categoryReservationFee
      };
    });
    res.status(200).json(tablesWithPricing);
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
    const categoryReservationFee = await getDiningAreaReservationFee(
      table.tableClass || inferTableClass(table.tableNumber)
    );
    res.status(200).json({
      ...table.toObject(),
      categoryReservationFee,
      reservationFee: table.reservationFeeOverride ?? categoryReservationFee
    });
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
    const { tableNumber, capacity, status, tableClass } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({ message: 'Table number and capacity are required' });
    }

    const resolvedTableClass = tableClass || inferTableClass(tableNumber);
    if (!TABLE_CLASSES.has(resolvedTableClass)) {
      return res.status(400).json({ message: 'Choose a valid dining area' });
    }

    const tableExists = await Table.findOne({ tableNumber });
    if (tableExists) {
      return res.status(400).json({ message: `Table #${tableNumber} already exists` });
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      tableClass: resolvedTableClass,
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
    const { tableNumber, capacity, status, tableClass } = req.body;
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
    if (tableClass !== undefined) {
      if (!TABLE_CLASSES.has(tableClass)) {
        return res.status(400).json({ message: 'Choose a valid dining area' });
      }
      table.tableClass = tableClass;
    }
    if (status !== undefined) table.status = status;

    const updatedTable = await table.save();
    res.status(200).json(updatedTable);
  } catch (error) {
    console.error('Update table error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to update table' });
  }
};

// @desc    Set or clear a table-specific reservation fee
// @route   PUT /api/tables/:id/pricing
// @access  Private/Admin
const updateTablePricing = async (req, res) => {
  try {
    const { useAreaPrice, reservationFee } = req.body;
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (useAreaPrice === true) {
      table.reservationFeeOverride = null;
    } else {
      const numericFee = Number(reservationFee);
      if (
        reservationFee === ''
        || !Number.isFinite(numericFee)
        || numericFee < 0
        || numericFee > 1000000
      ) {
        return res.status(400).json({
          message: 'Table price must be between ₱0 and ₱1,000,000'
        });
      }
      table.reservationFeeOverride = Math.round(numericFee * 100) / 100;
    }

    await table.save();
    const categoryReservationFee = await getDiningAreaReservationFee(
      table.tableClass || inferTableClass(table.tableNumber)
    );
    res.status(200).json({
      ...table.toObject(),
      categoryReservationFee,
      reservationFee: table.reservationFeeOverride ?? categoryReservationFee
    });
  } catch (error) {
    console.error('Update table pricing error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to update table pricing' });
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

// @desc    Get reservation pricing for each dining area
// @route   GET /api/tables/area-settings
// @access  Public
const getDiningAreaPricing = async (req, res) => {
  try {
    const settings = await getDiningAreaSettings();
    res.status(200).json(settings);
  } catch (error) {
    console.error('Get dining area pricing error:', error.message);
    res.status(500).json({ message: 'Failed to fetch dining area pricing' });
  }
};

// @desc    Update reservation pricing for a dining area
// @route   PUT /api/tables/area-settings
// @access  Private/Admin
const updateDiningAreaPricing = async (req, res) => {
  try {
    const { tableClass, reservationFee } = req.body;
    if (!TABLE_CLASSES.has(tableClass)) {
      return res.status(400).json({ message: 'Choose a valid dining area' });
    }

    const numericFee = Number(reservationFee);
    if (
      reservationFee === ''
      || !Number.isFinite(numericFee)
      || numericFee < 0
      || numericFee > 1000000
    ) {
      return res.status(400).json({
        message: 'Reservation fee must be between ₱0 and ₱1,000,000'
      });
    }

    const normalizedFee = Math.round(numericFee * 100) / 100;
    const setting = await DiningAreaSetting.findOneAndUpdate(
      { tableClass },
      { tableClass, reservationFee: normalizedFee },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(setting);
  } catch (error) {
    console.error('Update dining area pricing error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to update dining area pricing' });
  }
};

module.exports = {
  getTables,
  getTableById,
  getDiningAreaPricing,
  updateDiningAreaPricing,
  createTable,
  updateTable,
  updateTablePricing,
  deleteTable
};
