import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Calendar as CalendarIcon,
  Users,
  CheckCircle,
  AlertCircle,
  Utensils,
  Info,
  XCircle,
  History,
  BookmarkCheck,
  Armchair,
  Ticket,
  Map,
  LayoutGrid
} from 'lucide-react';
import BookingReceiptModal from '../components/BookingReceiptModal';
import RestaurantFloorPlan from '../components/RestaurantFloorPlan';

const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM'
];

const getTableClassValue = (table) => {
  if (table?.tableClass) return table.tableClass;
  const number = Number(table?.tableNumber);
  if (number <= 2) return 'window_terrace';
  if (number >= 7 && number <= 8) return 'vip_salons';
  return 'main_hall';
};

const getSectionTableNumber = (table, allTables = []) => {
  if (!table || getTableClassValue(table) !== 'vip_salons') return table?.tableNumber;
  if (table.displayTableNumber) return table.displayTableNumber;

  const vipTables = allTables
    .filter((candidate) => getTableClassValue(candidate) === 'vip_salons')
    .sort((first, second) => Number(first.tableNumber) - Number(second.tableNumber));
  const index = vipTables.findIndex((candidate) => candidate._id === table._id);
  if (index >= 0) return index + 1;

  const legacyNumber = Number(table.tableNumber);
  return legacyNumber >= 7 && legacyNumber <= 8 ? legacyNumber - 6 : table.tableNumber;
};

const withSectionTableNumber = (reservation, allTables) => {
  if (!reservation?.tableId) return reservation;
  return {
    ...reservation,
    tableId: {
      ...reservation.tableId,
      displayTableNumber: getSectionTableNumber(reservation.tableId, allTables)
    }
  };
};

const Reserve = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Active view tab: 'book' or 'my-bookings'
  const [activeTab, setActiveTab] = useState('book');

  // Booking Form State
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState('07:00 PM');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedTable, setSelectedTable] = useState(null);
  const [specialRequest, setSpecialRequest] = useState('');

  // Pre-order food state (optional)
  const [menuItems, setMenuItems] = useState([]);
  const [showPreOrder, setShowPreOrder] = useState(false);
  const [preOrderQty, setPreOrderQty] = useState({});

  // Tables state
  const [tables, setTables] = useState([]);
  const [allTables, setAllTables] = useState([]);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'cards'
  const [loadingTables, setLoadingTables] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // My Reservations state
  const [myReservations, setMyReservations] = useState([]);
  const [loadingMyReservations, setLoadingMyReservations] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState({ type: '', text: '' });
  const [viewingReceiptReservation, setViewingReceiptReservation] = useState(null);

  // Fetch menu once for optional pre-orders
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get('/menu');
        setMenuItems((res.data || []).filter((m) => m.availability !== false));
      } catch (err) {
        console.error('Failed to load menu for pre-orders:', err.message);
      }
    };
    fetchMenu();
  }, []);

  // Fetch all tables once for floor plan layout
  useEffect(() => {
    const fetchAllTables = async () => {
      try {
        const res = await api.get('/tables');
        setAllTables(res.data);
      } catch (err) {
        console.error('Failed to load all tables:', err);
      }
    };
    fetchAllTables();
  }, []);

  const fetchAvailableTables = useCallback(async () => {
    try {
      setLoadingTables(true);
      setBookingError('');
      const res = await api.get('/reservations/available-tables', {
        params: {
          date: selectedDate,
          time: selectedTime,
          guests: guestCount
        }
      });
      setTables(res.data);
      // If previously selected table is no longer available, reset selection
      if (selectedTable && !res.data.some((t) => t._id === selectedTable._id)) {
        setSelectedTable(null);
      }
    } catch (err) {
      console.error('Failed to fetch available tables:', err.message);
      setBookingError('Unable to load available tables for this slot. Please try another time.');
    } finally {
      setLoadingTables(false);
    }
  }, [selectedDate, selectedTime, guestCount, selectedTable]);

  const fetchMyReservations = useCallback(async () => {
    try {
      setLoadingMyReservations(true);
      const res = await api.get('/reservations/my');
      setMyReservations(res.data);
    } catch (err) {
      console.error('Failed to fetch my reservations:', err.message);
    } finally {
      setLoadingMyReservations(false);
    }
  }, []);

  // Fetch available tables whenever date, time, or guest count changes
  useEffect(() => {
    if (activeTab === 'book') {
      fetchAvailableTables();
    }
  }, [activeTab, fetchAvailableTables]);

  // Fetch user's reservations when tab switched to 'my-bookings'
  useEffect(() => {
    if (activeTab === 'my-bookings' && isAuthenticated) {
      fetchMyReservations();
    }
  }, [activeTab, isAuthenticated, fetchMyReservations]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!isAuthenticated) {
      navigate('/login?redirect=/reserve');
      return;
    }

    if (!selectedTable) {
      setBookingError('Please choose an available dining table from the list below.');
      return;
    }

    try {
      setBookingLoading(true);
      const preOrders = showPreOrder
        ? Object.entries(preOrderQty)
            .filter(([, qty]) => qty > 0)
            .map(([menuItem, quantity]) => ({ menuItem, quantity }))
        : [];
      const res = await api.post('/reservations', {
        tableId: selectedTable._id,
        reservationDate: selectedDate,
        reservationTime: selectedTime,
        guestCount,
        specialRequest,
        preOrders
      });

      const reservationWithDisplayNumber = withSectionTableNumber(
        {
          ...res.data,
          tableId: res.data.tableId
            ? {
                ...res.data.tableId,
                displayTableNumber: getSectionTableNumber(selectedTable, allTables)
              }
            : res.data.tableId
        },
        allTables
      );
      setBookingSuccess(reservationWithDisplayNumber);
      setViewingReceiptReservation(reservationWithDisplayNumber);
      setSelectedTable(null);
      setSpecialRequest('');
      setPreOrderQty({});
      setShowPreOrder(false);
      // Refresh available tables
      fetchAvailableTables();
    } catch (err) {
      setBookingError(
        err.response?.data?.message || 'Failed to complete reservation. Table might have just been booked.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      setCancellingId(reservationId);
      setCancelMessage({ type: '', text: '' });
      await api.put(`/reservations/${reservationId}/cancel`);
      setCancelMessage({ type: 'success', text: 'Reservation cancelled successfully.' });
      fetchMyReservations();
    } catch (err) {
      setCancelMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel reservation.'
      });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Checked In':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Completed':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Live availability · confirmation with reference code
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Reserve Your Table</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1">
            Choose a date, time, and numbered table. Held for 15 minutes past booking time.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('book')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'book'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Book a Table
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'my-bookings'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              My Bookings
            </button>
          )}
        </div>
      </div>

      {/* Success Modal / Banner */}
      {bookingSuccess && (
        <div className="mt-8 p-6 bg-slate-900 border border-emerald-500/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Reservation Confirmed!</h3>
              <p className="text-sm text-slate-300 mt-0.5">
                We reserved {getTableClassValue(bookingSuccess.tableId) === 'vip_salons' ? 'VIP Table' : 'Table'} #{bookingSuccess.tableId?.displayTableNumber || bookingSuccess.tableId?.tableNumber || 'Selected'} for{' '}
                <span className="text-amber-400 font-semibold">{bookingSuccess.guestCount} guests</span> on{' '}
                <span className="text-white font-medium">{bookingSuccess.reservationDate}</span> at{' '}
                <span className="text-white font-medium">{bookingSuccess.reservationTime}</span>.
              </p>
              <p className="text-xs text-slate-400 mt-1">Status: Pending manager verification</p>
              {Number(bookingSuccess.reservationFee) > 0 && (
                <p className="mt-1 text-xs font-semibold text-amber-300">
                  Reservation fee: ₱{Number(bookingSuccess.reservationFee).toLocaleString('en-PH')}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setViewingReceiptReservation(bookingSuccess)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Ticket className="w-3.5 h-3.5" />
              Digital Ticket & Calendar
            </button>
            <button
              onClick={() => {
                setActiveTab('my-bookings');
                setBookingSuccess(null);
              }}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              View My Bookings
            </button>
            <button
              onClick={() => setBookingSuccess(null)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: Booking Flow */}
      {activeTab === 'book' && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Filter and Slot Selection Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <CalendarIcon className="w-5 h-5 text-amber-500" />
                Select Details
              </h2>

              {bookingError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Reservation Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Guest Count Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Number of Guests
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuestCount(num)}
                      className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                        guestCount === num
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Time Slot
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all ${
                        selectedTime === slot
                          ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows="3"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="E.g., Window view, anniversary celebration, quiet area, high chair..."
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 placeholder-slate-600"
                ></textarea>
              </div>

              {/* Pre-order toggle */}
              <div className="border border-slate-800 rounded-xl p-4 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPreOrder}
                    onChange={(e) => setShowPreOrder(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-white">
                    Pre-order food for your table <span className="text-slate-400 font-normal">(Optional)</span>
                  </span>
                </label>
                <p className="text-xs text-slate-400">
                  Ready on your table when you arrive. Pay on site.
                </p>

                {showPreOrder && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pt-1">
                    {menuItems.length === 0 ? (
                      <p className="text-xs text-slate-500">Menu unavailable right now. You can still book the table.</p>
                    ) : (
                      menuItems.map((dish) => {
                        const qty = preOrderQty[dish._id] || 0;
                        return (
                          <div
                            key={dish._id}
                            className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{dish.name}</p>
                              <p className="text-xs text-amber-400 font-bold">₱{Number(dish.price).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreOrderQty((prev) => ({
                                    ...prev,
                                    [dish._id]: Math.max(0, (prev[dish._id] || 0) - 1)
                                  }))
                                }
                                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 text-sm font-bold hover:bg-slate-700"
                                aria-label={`Remove one ${dish.name}`}
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-sm font-bold text-white">{qty}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setPreOrderQty((prev) => ({
                                    ...prev,
                                    [dish._id]: Math.min(20, (prev[dish._id] || 0) + 1)
                                  }))
                                }
                                className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 text-sm font-bold hover:bg-amber-400"
                                aria-label={`Add one ${dish.name}`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Confirmation CTA button */}
              <button
                type="button"
                onClick={handleBookingSubmit}
                disabled={bookingLoading || !selectedTable}
                className={`w-full py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                  !selectedTable
                    ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                <BookmarkCheck className="w-5 h-5" />
                {bookingLoading
                  ? 'Confirming Reservation...'
                  : selectedTable
                  ? Number(selectedTable.reservationFee) > 0
                    ? `Book ${getTableClassValue(selectedTable) === 'vip_salons' ? 'VIP Table' : 'Table'} #${getSectionTableNumber(selectedTable, allTables)} — ₱${Number(selectedTable.reservationFee).toLocaleString('en-PH')} Fee`
                    : `Book ${getTableClassValue(selectedTable) === 'vip_salons' ? 'VIP Table' : 'Table'} #${getSectionTableNumber(selectedTable, allTables)} for ${guestCount} Guests`
                  : 'Select an Available Table to Book'}
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-slate-400">
                  You will be prompted to <Link to="/login" className="text-amber-400 underline">Sign In</Link> before finalizing.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Available Tables Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Armchair className="w-5 h-5 text-amber-500" />
                    Table Selection
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedDate} at {selectedTime} • Party of {guestCount}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setViewMode('map')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'map'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Map className="w-3.5 h-3.5" />
                      Seating Map
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'cards'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      Cards
                    </button>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{tables.length} Available</span>
                  </div>
                </div>
              </div>

              {loadingTables ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-400 text-sm">Checking restaurant availability...</p>
                </div>
              ) : viewMode === 'map' ? (
                <RestaurantFloorPlan
                  allTables={allTables.length > 0 ? allTables : tables}
                  availableTables={tables}
                  selectedTable={selectedTable}
                  onSelectTable={(table) => setSelectedTable(table)}
                  guestCount={guestCount}
                />
              ) : tables.length === 0 ? (
                <div className="py-16 text-center space-y-4 px-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                  <XCircle className="w-12 h-12 text-slate-600 mx-auto" />
                  <div>
                    <h3 className="text-base font-semibold text-white">No Tables Available</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      All tables are booked for this specific slot. Try adjusting your guest count or selecting an earlier or later time slot.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tables.map((table) => {
                    const isSelected = selectedTable?._id === table._id;
                    const isVip = getTableClassValue(table) === 'vip_salons';
                    const displayTableNumber = getSectionTableNumber(table, allTables);
                    return (
                      <div
                        key={table._id}
                        onClick={() => setSelectedTable({ ...table, displayTableNumber })}
                        className={`cursor-pointer rounded-2xl p-5 border transition-colors relative ${
                          isSelected
                            ? isVip
                              ? 'bg-[#21190d] border-amber-300'
                              : 'bg-amber-500/10 border-amber-500 shadow-lg'
                            : isVip
                            ? 'bg-[#17130d] border-amber-500/60 hover:border-amber-300 hover:bg-[#1d170e]'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-white">
                                {isVip ? 'VIP Table' : 'Table'} #{displayTableNumber}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-amber-400" />
                              Seats up to <span className="text-slate-200 font-semibold">{table.capacity} Guests</span>
                            </p>
                          </div>

                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-900 border border-slate-800 text-slate-400'
                            }`}
                          >
                            <Armchair className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Ready to Reserve
                          </span>
                          {Number(table.reservationFee) > 0 ? (
                            <span className="font-semibold text-amber-300">
                              ₱{Number(table.reservationFee).toLocaleString('en-PH')} fee
                            </span>
                          ) : (
                            <span className="font-semibold text-emerald-400">Free reservation</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Information Footnote */}
              <div className="mt-6 p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  Reservations are held for 15 minutes past booking time. Please contact us in advance if your arrival is delayed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: My Reservations List */}
      {activeTab === 'my-bookings' && (
        <div className="mt-10 space-y-6">
          {cancelMessage.text && (
            <div
              className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                cancelMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {cancelMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{cancelMessage.text}</span>
            </div>
          )}

          {loadingMyReservations ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-sm">Loading your booking history...</p>
            </div>
          ) : myReservations.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <Utensils className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Reservations Yet</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                You haven't made any dining reservations yet. Reserve a table today to enjoy our Michelin-inspired culinary journey.
              </p>
              <button
                onClick={() => setActiveTab('book')}
                className="mt-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-md"
              >
                Book Your First Table
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myReservations.map((res) => {
                const canCancel = ['Pending', 'Confirmed'].includes(res.status);
                return (
                  <div
                    key={res._id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getStatusBadge(
                            res.status
                          )}`}
                        >
                          {res.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(res.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                            #{getSectionTableNumber(res.tableId, allTables) || '?'}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">
                              {getTableClassValue(res.tableId) === 'vip_salons' ? 'VIP Table' : 'Table'} #{getSectionTableNumber(res.tableId, allTables) || 'N/A'}
                            </h4>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-amber-400" />
                              Party of {res.guestCount}
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Date:</span>
                            <span className="font-semibold text-white">{res.reservationDate}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Time:</span>
                            <span className="font-semibold text-amber-400">{res.reservationTime}</span>
                          </div>
                          {res.specialRequest && (
                            <div className="pt-1.5 border-t border-slate-800/80 text-slate-400 italic">
                              "{res.specialRequest}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => setViewingReceiptReservation(withSectionTableNumber(res, allTables))}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-500/20"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        Ticket & Calendar
                      </button>

                      {canCancel && (
                        <button
                          onClick={() => handleCancelReservation(res._id)}
                          disabled={cancellingId === res._id}
                          className="py-2 px-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {cancellingId === res._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Digital Booking Receipt / Ticket Modal */}
      <BookingReceiptModal
        reservation={viewingReceiptReservation}
        isOpen={!!viewingReceiptReservation}
        onClose={() => setViewingReceiptReservation(null)}
      />
    </div>
  );
};

export default Reserve;
