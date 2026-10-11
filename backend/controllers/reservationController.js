const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const {
  getDiningAreaSettings,
  getDiningAreaReservationFee
} = require('../utils/diningAreaSettings');

const resolveTableClass = (table) => {
  if (table.tableClass) return table.tableClass;
  const tableNumber = Number(table.tableNumber);
  if (tableNumber <= 2) return 'window_terrace';
  if (tableNumber >= 7 && tableNumber <= 8) return 'vip_salons';
  return 'main_hall';
};

// @desc    Create a new reservation (with strict double-booking check)
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res) => {
  try {
    const { tableId, reservationDate, reservationTime, guestCount, specialRequest, preOrders } = req.body;

    // 1. Basic validation
    if (!tableId || !reservationDate || !reservationTime || !guestCount) {
      return res.status(400).json({
        message: 'Table, reservation date, time, and guest count are required'
      });
    }

    const guests = parseInt(guestCount, 10);
    if (isNaN(guests) || guests < 1) {
      return res.status(400).json({ message: 'Guest count must be at least 1' });
    }

    // 2. Verify Table exists and is operational
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Selected table does not exist' });
    }

    if (table.status === 'maintenance') {
      return res.status(400).json({
        message: `Table #${table.tableNumber} is currently undergoing maintenance and cannot be reserved.`
      });
    }

    // 3. Verify Table Capacity
    if (table.capacity < guests) {
      return res.status(400).json({
        message: `Table #${table.tableNumber} only seats up to ${table.capacity} guests (requested: ${guests}).`
      });
    }

    // 4. Strict Double-Booking Validation
    // An active reservation has status Pending, Confirmed, or Checked In
    const conflictingReservation = await Reservation.findOne({
      tableId,
      reservationDate: reservationDate.trim(),
      reservationTime: reservationTime.trim(),
      status: { $in: ['Pending', 'Confirmed', 'Checked In'] }
    });

    if (conflictingReservation) {
      return res.status(409).json({
        message: `Table #${table.tableNumber} is already booked on ${reservationDate} at ${reservationTime}. Please choose another time or table.`
      });
    }

    // 5. Validate + snapshot pre-orders (optional)
    let preOrderDocs = [];
    if (preOrders !== undefined) {
      if (!Array.isArray(preOrders)) {
        return res.status(400).json({ message: 'preOrders must be an array' });
      }
      if (preOrders.length > 20) {
        return res.status(400).json({ message: 'Maximum 20 pre-ordered items per reservation' });
      }
      for (const entry of preOrders) {
        const qty = parseInt(entry?.quantity, 10);
        if (!entry?.menuItem || isNaN(qty) || qty < 1 || qty > 20) {
          return res.status(400).json({ message: 'Each pre-order needs a valid menuItem and quantity (1-20)' });
        }
        const dish = await MenuItem.findById(entry.menuItem).select('name price availability');
        if (!dish) {
          return res.status(404).json({ message: 'One of the selected dishes does not exist' });
        }
        if (dish.availability === false) {
          return res.status(400).json({ message: `Sorry, '${dish.name}' is currently sold out` });
        }
        preOrderDocs.push({
          menuItem: dish._id,
          name: dish.name,
          price: dish.price,
          quantity: qty
        });
      }
    }

    // 6. Snapshot the current dining-area fee on the reservation
    const categoryReservationFee = await getDiningAreaReservationFee(resolveTableClass(table));
    const reservationFee = table.reservationFeeOverride ?? categoryReservationFee;

    const reservation = await Reservation.create({
      userId: req.user._id,
      tableId,
      reservationDate: reservationDate.trim(),
      reservationTime: reservationTime.trim(),
      guestCount: guests,
      specialRequest: specialRequest ? specialRequest.trim() : '',
      reservationFee,
      preOrders: preOrderDocs,
      status: 'Pending'
    });

    const populated = await reservation.populate([
      { path: 'tableId', select: 'tableNumber capacity tableClass' },
      { path: 'userId', select: 'name email phone' },
      { path: 'preOrders.menuItem', select: 'name price' }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create reservation error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to create reservation' });
  }
};

// @desc    Get logged in user's reservation history
// @route   GET /api/reservations/my
// @access  Private
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user._id })
      .populate('tableId', 'tableNumber capacity status tableClass')
      .populate('preOrders.menuItem', 'name price')
      .sort({ reservationDate: -1, reservationTime: -1 });

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Get my reservations error:', error.message);
    res.status(500).json({ message: 'Failed to fetch your reservations' });
  }
};

// @desc    Get available tables for a specific date, time, and guest count
// @route   GET /api/reservations/available-tables
// @access  Public / Authenticated
const getAvailableTables = async (req, res) => {
  try {
    const { date, time, guests } = req.query;

    if (!date || !time) {
      return res.status(400).json({ message: 'Both date and time query parameters are required' });
    }

    const minGuests = guests ? parseInt(guests, 10) : 1;

    // 1. Find all table IDs currently booked for this date and time slot
    const bookedReservations = await Reservation.find({
      reservationDate: date.trim(),
      reservationTime: time.trim(),
      status: { $in: ['Pending', 'Confirmed', 'Checked In'] }
    }).select('tableId');

    const bookedTableIds = bookedReservations.map((r) => r.tableId);

    // 2. Find tables not under maintenance, with sufficient capacity, and not in bookedTableIds
    const [availableTables, settings] = await Promise.all([
      Table.find({
        _id: { $nin: bookedTableIds },
        status: { $ne: 'maintenance' },
        capacity: { $gte: minGuests }
      }).sort({ capacity: 1, tableNumber: 1 }).lean(),
      getDiningAreaSettings()
    ]);
    const feeByClass = new Map(
      settings.map((setting) => [setting.tableClass, setting.reservationFee])
    );
    const pricedTables = availableTables.map((table) => {
      const categoryReservationFee = Number(feeByClass.get(resolveTableClass(table))) || 0;
      return {
        ...table,
        categoryReservationFee,
        reservationFee: table.reservationFeeOverride ?? categoryReservationFee
      };
    });

    res.status(200).json(pricedTables);
  } catch (error) {
    console.error('Get available tables error:', error.message);
    res.status(500).json({ message: 'Failed to search available tables' });
  }
};

// @desc    Get single reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('tableId', 'tableNumber capacity tableClass')
      .populate('userId', 'name email phone')
      .populate('preOrders.menuItem', 'name price');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only owner or admin can view
    const isOwner = reservation.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this reservation' });
    }

    res.status(200).json(reservation);
  } catch (error) {
    console.error('Get reservation error:', error.message);
    res.status(500).json({ message: 'Failed to fetch reservation' });
  }
};

// @desc    Cancel a reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only owner or admin can cancel
    const isOwner = reservation.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    if (reservation.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed reservation' });
    }

    if (reservation.status === 'Cancelled') {
      return res.status(400).json({ message: 'Reservation is already cancelled' });
    }

    reservation.status = 'Cancelled';
    const updated = await reservation.save();

    res.status(200).json({
      message: 'Reservation cancelled successfully',
      reservation: updated
    });
  } catch (error) {
    console.error('Cancel reservation error:', error.message);
    res.status(500).json({ message: 'Failed to cancel reservation' });
  }
};

// @desc    Admin: Get all reservations with optional filters
// @route   GET /api/admin/reservations
// @access  Private/Admin
const getAllReservationsAdmin = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.date) {
      filter.reservationDate = req.query.date;
    }

    const reservations = await Reservation.find(filter)
      .populate('userId', 'name email phone')
      .populate('tableId', 'tableNumber capacity tableClass')
      .populate('preOrders.menuItem', 'name price')
      .sort({ reservationDate: -1, reservationTime: -1 });

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Admin get reservations error:', error.message);
    res.status(500).json({ message: 'Failed to fetch all reservations' });
  }
};

// @desc    Admin: Update reservation status
// @route   PUT /api/admin/reservations/:id/status
// @access  Private/Admin
const updateReservationStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Checked In', 'Completed', 'Cancelled', 'Rejected'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // If changing from Cancelled/Rejected back to Confirmed/Checked In, verify no double booking
    if (
      ['Cancelled', 'Rejected'].includes(reservation.status) &&
      ['Pending', 'Confirmed', 'Checked In'].includes(status)
    ) {
      const conflict = await Reservation.findOne({
        _id: { $ne: reservation._id },
        tableId: reservation.tableId,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        status: { $in: ['Pending', 'Confirmed', 'Checked In'] }
      });

      if (conflict) {
        return res.status(409).json({
          message: 'Cannot reactivate reservation: another reservation has already booked this table and time slot.'
        });
      }
    }

    reservation.status = status;
    const updated = await reservation.save();

    const populated = await updated.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'tableId', select: 'tableNumber capacity tableClass' }
    ]);

    res.status(200).json(populated);
  } catch (error) {
    console.error('Admin update status error:', error.message);
    res.status(500).json({ message: 'Failed to update reservation status' });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getAvailableTables,
  getReservationById,
  cancelReservation,
  getAllReservationsAdmin,
  updateReservationStatusAdmin
};
