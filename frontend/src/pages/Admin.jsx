import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  LayoutDashboard,
  CalendarCheck,
  Armchair,
  UtensilsCrossed,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Search,
  Clock,
  Database,
  Tag,
  Download,
  Printer,
  ClipboardList
} from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Stats state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState('');

  // Reservations state
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingResId, setUpdatingResId] = useState(null);
  const [isRunSheetModalOpen, setIsRunSheetModalOpen] = useState(false);

  // Tables state
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableFormData, setTableFormData] = useState({ tableNumber: '', capacity: 2, status: 'available' });
  const [editingTableId, setEditingTableId] = useState(null);

  // Menu items & Categories state
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    image: '',
    availability: true
  });
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });

  // Notifications
  const [bannerMsg, setBannerMsg] = useState({ type: '', text: '' });

  const showBanner = (type, text) => {
    setBannerMsg({ type, text });
    setTimeout(() => setBannerMsg({ type: '', text: '' }), 5000);
  };

  // Fetch Functions wrapped in useCallback
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchReservations = useCallback(async () => {
    try {
      setLoadingReservations(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      const res = await api.get('/admin/reservations', { params });
      setReservations(res.data);
    } catch (err) {
      console.error('Failed to fetch reservations:', err.message);
    } finally {
      setLoadingReservations(false);
    }
  }, [statusFilter, dateFilter]);

  const fetchTables = useCallback(async () => {
    try {
      setLoadingTables(true);
      const res = await api.get('/tables');
      setTables(res.data);
    } catch (err) {
      console.error('Failed to fetch tables:', err.message);
    } finally {
      setLoadingTables(false);
    }
  }, []);

  const fetchMenuAndCategories = useCallback(async () => {
    try {
      setLoadingMenu(true);
      const [menuRes, catRes] = await Promise.all([
        api.get('/menu', { params: selectedCategoryFilter ? { category: selectedCategoryFilter } : {} }),
        api.get('/categories')
      ]);
      setMenuItems(menuRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load menu or categories:', err.message);
    } finally {
      setLoadingMenu(false);
    }
  }, [selectedCategoryFilter]);

  // Initial loads
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    } else if (activeTab === 'tables') {
      fetchTables();
    } else if (activeTab === 'menu') {
      fetchMenuAndCategories();
    }
  }, [activeTab, fetchReservations, fetchTables, fetchMenuAndCategories]);

  const handleSeedDatabase = async () => {
    if (!window.confirm('This will insert default tables, categories, and sample dishes if empty. Continue?')) {
      return;
    }
    try {
      setSeedingLoading(true);
      const res = await api.post('/admin/seed');
      setSeedSuccessMsg(res.data.message || 'Seeded successfully!');
      fetchStats();
      setTimeout(() => setSeedSuccessMsg(''), 6000);
    } catch (err) {
      showBanner('error', err.response?.data?.message || 'Database seeding failed.');
    } finally {
      setSeedingLoading(false);
    }
  };

  const handleStatusChange = async (resId, newStatus) => {
    try {
      setUpdatingResId(resId);
      await api.put(`/admin/reservations/${resId}/status`, { status: newStatus });
      showBanner('success', `Reservation updated to ${newStatus}`);
      fetchReservations();
      fetchStats();
    } catch (err) {
      showBanner('error', err.response?.data?.message || 'Failed to update reservation status');
    } finally {
      setUpdatingResId(null);
    }
  };

  const handleExportCSV = () => {
    const dataToExport = filteredReservations.length > 0 ? filteredReservations : reservations;
    if (dataToExport.length === 0) {
      showBanner('error', 'No reservations available to export.');
      return;
    }

    const headers = ['Reservation ID', 'Guest Name', 'Email', 'Phone', 'Date', 'Time', 'Table Number', 'Guest Count', 'Status', 'Special Requests'];
    const rows = dataToExport.map((r) => [
      `"${r._id}"`,
      `"${r.userId?.name || 'Guest'}"`,
      `"${r.userId?.email || ''}"`,
      `"${r.userId?.phone || ''}"`,
      `"${r.reservationDate || ''}"`,
      `"${r.reservationTime || ''}"`,
      `"${r.tableId?.tableNumber || ''}"`,
      r.guestCount || 1,
      `"${r.status || ''}"`,
      `"${(r.specialRequest || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservations-export-${dateFilter || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showBanner('success', 'Reservations exported to CSV successfully.');
  };

  // TABLES

  const handleTableSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTableId) {
        await api.put(`/tables/${editingTableId}`, tableFormData);
        showBanner('success', 'Table updated successfully');
      } else {
        await api.post('/tables', tableFormData);
        showBanner('success', 'Table created successfully');
      }
      setIsTableModalOpen(false);
      setEditingTableId(null);
      setTableFormData({ tableNumber: '', capacity: 2, status: 'available' });
      fetchTables();
      fetchStats();
    } catch (err) {
      showBanner('error', err.response?.data?.message || 'Failed to save table');
    }
  };

  const handleDeleteTable = async (id, number) => {
    if (!window.confirm(`Are you sure you want to delete Table #${number}?`)) return;
    try {
      await api.delete(`/tables/${id}`);
      showBanner('success', `Table #${number} deleted`);
      fetchTables();
      fetchStats();
    } catch (err) {
      showBanner('error', err.response?.data?.message || 'Failed to delete table');
    }
  };

  // MENU & CATEGORIES

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMenuId) {
        await api.put(`/menu/${editingMenuId}`, menuFormData);
        showBanner('success', 'Menu item updated successfully');
      } else {
        await api.post('/menu', menuFormData);
        showBanner('success', 'Menu item created successfully');
      }
      setIsMenuModalOpen(false);
      setEditingMenuId(null);
      setMenuFormData({
        name: '',
        categoryId: categories[0]?._id || '',
        price: '',
        description: '',
        image: '',
        availability: true
      });
      fetchMenuAndCategories();
      fetchStats();
    } catch (err) {
      showBanner('error', err.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleDeleteMenuItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'?`)) return;
    try {
      await api.delete(`/menu/${id}`);
      showBanner('success', `Menu item '${name}' deleted`);
      fetchMenuAndCategories();
      fetchStats();
    } catch (err) {
      showBanner('error', err.response?.data?.message || 'Failed to delete menu item');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', categoryFormData);
      showBanner('success', 'Category created successfully');
      setIsCategoryModalOpen(false);
      setCategoryFormData({ name: '', description: '' });
      fetchMenuAndCategories();
      fetchStats();
    } catch (err) {
      showBanner('error', err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category '${name}'?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      showBanner('success', `Category '${name}' deleted`);
      fetchMenuAndCategories();
      fetchStats();
    } catch (err) {
      showBanner('error', err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Filtered reservations by search
  const filteredReservations = reservations.filter((r) => {
    const q = searchQuery.toLowerCase();
    const guestName = r.userId?.name?.toLowerCase() || '';
    const guestEmail = r.userId?.email?.toLowerCase() || '';
    const tableNum = String(r.tableId?.tableNumber || '');
    return guestName.includes(q) || guestEmail.includes(q) || tableNum.includes(q);
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner Message */}
      {bannerMsg.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm border shadow-lg ${
            bannerMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {bannerMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-amber-500" />
            Restaurant Admin Panel
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time management for reservations, dining tables, categories, and gourmet menus.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'reservations'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Reservations
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'tables'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Armchair className="w-4 h-4" />
            Tables
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'menu'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            Menu & Categories
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: OVERVIEW ===================== */}
      {activeTab === 'overview' && (
        <div className="mt-8 space-y-8">
          {/* Seed Database Banner if tables or categories are 0 */}
          {seedSuccessMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{seedSuccessMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">System Quick Actions</h3>
              <p className="text-xs text-slate-400">Initialize default tables, categories, and signature dishes</p>
            </div>
            <button
              onClick={handleSeedDatabase}
              disabled={seedingLoading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              {seedingLoading ? 'Seeding...' : 'Seed Sample Restaurant Data'}
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Reservations</span>
              <p className="text-3xl font-extrabold text-white mt-2">
                {loadingStats ? '...' : (stats?.reservations?.total ?? '-')}
              </p>
              <div className="mt-3 text-xs text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {stats?.reservations?.pending ?? 0} Pending Confirmation
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 uppercase font-semibold">Confirmed & Seated</span>
              <p className="text-3xl font-extrabold text-emerald-400 mt-2">
                {(stats?.reservations?.confirmed ?? 0) + (stats?.reservations?.completed ?? 0)}
              </p>
              <div className="mt-3 text-xs text-slate-400">
                {stats?.reservations?.completed ?? 0} Completed Dinings
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 uppercase font-semibold">Dining Tables</span>
              <p className="text-3xl font-extrabold text-white mt-2">{stats?.tables?.total ?? '-'}</p>
              <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5">
                <Armchair className="w-3.5 h-3.5" />
                {stats?.tables?.available ?? 0} Operational
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 uppercase font-semibold">Menu Items</span>
              <p className="text-3xl font-extrabold text-white mt-2">{stats?.menu?.totalItems ?? '-'}</p>
              <div className="mt-3 text-xs text-slate-400">
                Across {stats?.menu?.totalCategories ?? 0} Categories
              </div>
            </div>
          </div>

          {/* Quick Shortcuts to other tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => setActiveTab('reservations')}
              className="cursor-pointer bg-slate-900/50 hover:bg-slate-900 border border-slate-800 p-6 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <CalendarCheck className="w-5 h-5 text-amber-500 shrink-0" />
                <h3 className="text-base font-bold text-white">Review Reservations</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Accept pending reservations, check in arriving parties, or cancel duplicate requests.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('tables')}
              className="cursor-pointer bg-slate-900/50 hover:bg-slate-900 border border-slate-800 p-6 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <Armchair className="w-5 h-5 text-amber-500 shrink-0" />
                <h3 className="text-base font-bold text-white">Manage Dining Tables</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure table seating capacity, set tables to maintenance, and add new floor tables.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('menu')}
              className="cursor-pointer bg-slate-900/50 hover:bg-slate-900 border border-slate-800 p-6 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-500 shrink-0" />
                <h3 className="text-base font-bold text-white">Menu & Dishes</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Create new seasonal dishes, update pricing, manage stock availability, and categories.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: RESERVATIONS ===================== */}
      {activeTab === 'reservations' && (
        <div className="mt-8 space-y-6">
          {/* Filters Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest, email, table #..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked In">Checked In</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rejected">Rejected</option>
              </select>

              {(dateFilter || statusFilter || searchQuery) && (
                <button
                  onClick={() => {
                    setDateFilter('');
                    setStatusFilter('');
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              )}

              <button
                onClick={fetchReservations}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsRunSheetModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                title="Print Daily Host Stand Run Sheet"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Host Run Sheet</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-colors"
                title="Export to CSV"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Reservations List / Table */}
          {loadingReservations ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-sm">Loading reservations...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
              No reservations found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4">Guest Details</th>
                    <th className="px-4 py-4">Table</th>
                    <th className="px-4 py-4">Party Size</th>
                    <th className="px-4 py-4">Date & Time</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredReservations.map((res) => (
                    <tr key={res._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white">{res.userId?.name || 'Guest'}</div>
                        <div className="text-[11px] text-slate-400">{res.userId?.email}</div>
                        <div className="text-[11px] text-slate-500">{res.userId?.phone}</div>
                        {res.specialRequest && (
                          <div className="mt-1 text-[11px] text-amber-300/80 italic">
                            Note: "{res.specialRequest}"
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-white">
                          Table #{res.tableId?.tableNumber || 'N/A'}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          Cap: {res.tableId?.capacity || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-200">
                        {res.guestCount} {res.guestCount === 1 ? 'Guest' : 'Guests'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-white font-medium">{res.reservationDate}</div>
                        <div className="text-amber-400 font-semibold">{res.reservationTime}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-bold border text-[11px] ${getStatusBadge(
                            res.status
                          )}`}
                        >
                          {res.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-1">
                        {res.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(res._id, 'Confirmed')}
                              disabled={updatingResId === res._id}
                              className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusChange(res._id, 'Rejected')}
                              disabled={updatingResId === res._id}
                              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {res.status === 'Confirmed' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(res._id, 'Checked In')}
                              disabled={updatingResId === res._id}
                              className="px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Check In
                            </button>
                            <button
                              onClick={() => handleStatusChange(res._id, 'Cancelled')}
                              disabled={updatingResId === res._id}
                              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {res.status === 'Checked In' && (
                          <button
                            onClick={() => handleStatusChange(res._id, 'Completed')}
                            disabled={updatingResId === res._id}
                            className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Complete
                          </button>
                        )}

                        {['Completed', 'Cancelled', 'Rejected'].includes(res.status) && (
                          <span className="text-[11px] text-slate-500 italic">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: TABLES ===================== */}
      {activeTab === 'tables' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Armchair className="w-5 h-5 text-amber-500" />
              Dining Tables ({tables.length})
            </h2>

            <button
              onClick={() => {
                setEditingTableId(null);
                setTableFormData({ tableNumber: '', capacity: 2, status: 'available' });
                setIsTableModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Dining Table
            </button>
          </div>

          {loadingTables ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-sm">Loading dining tables...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
              No tables configured yet. Click "Add Dining Table" or seed initial sample data.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map((table) => (
                <div
                  key={table._id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Table #{table.tableNumber}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        Seats {table.capacity} guests
                      </p>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        table.status === 'available'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : table.status === 'maintenance'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {table.status}
                    </span>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingTableId(table._id);
                        setTableFormData({
                          tableNumber: table.tableNumber,
                          capacity: table.capacity,
                          status: table.status
                        });
                        setIsTableModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table._id, table.tableNumber)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table Modal */}
          {isTableModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingTableId ? 'Edit Table' : 'Add New Table'}
                  </h3>
                  <button
                    onClick={() => setIsTableModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleTableSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Table Number
                    </label>
                    <input
                      type="number"
                      required
                      value={tableFormData.tableNumber}
                      onChange={(e) =>
                        setTableFormData({ ...tableFormData, tableNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Guest Capacity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={tableFormData.capacity}
                      onChange={(e) =>
                        setTableFormData({ ...tableFormData, capacity: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Status
                    </label>
                    <select
                      value={tableFormData.status}
                      onChange={(e) =>
                        setTableFormData({ ...tableFormData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTableModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      Save Table
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 4: MENU & CATEGORIES ===================== */}
      {activeTab === 'menu' && (
        <div className="mt-8 space-y-8">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 font-semibold rounded-xl text-xs transition-colors"
              >
                <Tag className="w-3.5 h-3.5" />
                Add Category
              </button>

              <button
                onClick={() => {
                  setEditingMenuId(null);
                  setMenuFormData({
                    name: '',
                    categoryId: categories[0]?._id || '',
                    price: '',
                    description: '',
                    image: '',
                    availability: true
                  });
                  setIsMenuModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Menu Item
              </button>
            </div>
          </div>

          {/* Categories Pill List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Categories In System</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="font-semibold text-white">{cat.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                    className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          {loadingMenu ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-sm">Loading menu items...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
              No dishes found for this category. Click "Add Menu Item" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {item.image && (
                      <div className="h-44 w-full overflow-hidden bg-slate-950">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-bold text-white">{item.name}</h4>
                        <span className="text-amber-400 font-bold text-sm shrink-0">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {item.categoryId?.name || 'Uncategorized'}
                      </span>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/80 mt-2">
                    <span
                      className={`text-[10px] font-semibold flex items-center gap-1 ${
                        item.availability ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.availability ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      ></span>
                      {item.availability ? 'In Stock' : 'Out of Stock'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingMenuId(item._id);
                          setMenuFormData({
                            name: item.name,
                            categoryId: item.categoryId?._id || item.categoryId || '',
                            price: item.price,
                            description: item.description || '',
                            image: item.image || '',
                            availability: item.availability
                          });
                          setIsMenuModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item._id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Menu Item Modal */}
          {isMenuModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingMenuId ? 'Edit Dish' : 'Add New Gourmet Dish'}
                  </h3>
                  <button
                    onClick={() => setIsMenuModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleMenuSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Dish Name
                    </label>
                    <input
                      type="text"
                      required
                      value={menuFormData.name}
                      onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                      placeholder="E.g., Grilled Filet Mignon"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                        Category
                      </label>
                      <select
                        required
                        value={menuFormData.categoryId}
                        onChange={(e) =>
                          setMenuFormData({ ...menuFormData, categoryId: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                        Price ($ USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={menuFormData.price}
                        onChange={(e) =>
                          setMenuFormData({ ...menuFormData, price: e.target.value })
                        }
                        placeholder="24.99"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Photo (URL or Upload — saved in database)
                    </label>
                    <input
                      type="text"
                      value={menuFormData.image}
                      onChange={(e) => setMenuFormData({ ...menuFormData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/... or upload below"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Image too large (max 2MB). Please compress or use a URL.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setMenuFormData({ ...menuFormData, image: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 file:cursor-pointer cursor-pointer"
                      />
                      {menuFormData.image && (
                        <button
                          type="button"
                          onClick={() => setMenuFormData({ ...menuFormData, image: '' })}
                          className="text-[11px] text-rose-400 hover:text-rose-300 shrink-0"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {menuFormData.image && (
                      <div className="mt-2 h-32 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                        <img
                          src={menuFormData.image}
                          alt="Dish preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Upload stores the photo as a data-URL string in MongoDB (same `image` field). URLs still work.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Description & Ingredients
                    </label>
                    <textarea
                      rows="3"
                      value={menuFormData.description}
                      onChange={(e) =>
                        setMenuFormData({ ...menuFormData, description: e.target.value })
                      }
                      placeholder="Tender beef tenderloin with truffle puree and red wine reduction..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="availToggle"
                      checked={menuFormData.availability}
                      onChange={(e) =>
                        setMenuFormData({ ...menuFormData, availability: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="availToggle" className="text-xs text-slate-300 cursor-pointer">
                      Available for ordering in restaurant
                    </label>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMenuModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      Save Dish
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Category Modal */}
          {isCategoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Add Menu Category</h3>
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      value={categoryFormData.name}
                      onChange={(e) =>
                        setCategoryFormData({ ...categoryFormData, name: e.target.value })
                      }
                      placeholder="E.g., Artisanal Cocktails"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      rows="2"
                      value={categoryFormData.description}
                      onChange={(e) =>
                        setCategoryFormData({ ...categoryFormData, description: e.target.value })
                      }
                      placeholder="Crafted signatures and imported vintage wines..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Host Stand Run Sheet Modal */}
          {isRunSheetModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-4xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-amber-500" />
                      Daily Host Stand Run Sheet
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Date: <strong className="text-amber-400">{dateFilter || 'All Scheduled Dates'}</strong> • Total Parties: {filteredReservations.length} • Total Expected Covers: {filteredReservations.reduce((sum, r) => sum + (r.guestCount || 0), 0)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md"
                    >
                      <Printer className="w-4 h-4" />
                      Print Run Sheet
                    </button>
                    <button
                      onClick={() => setIsRunSheetModalOpen(false)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {filteredReservations.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    No reservations found matching the current filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-3 py-3 w-10 text-center">In</th>
                          <th className="px-3 py-3">Time</th>
                          <th className="px-3 py-3">Table</th>
                          <th className="px-4 py-3">Primary Guest</th>
                          <th className="px-3 py-3">Party</th>
                          <th className="px-4 py-3">Contact</th>
                          <th className="px-3 py-3">Status</th>
                          <th className="px-4 py-3">Notes & Requests</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                        {filteredReservations
                          .slice()
                          .sort((a, b) => (a.reservationTime || '').localeCompare(b.reservationTime || ''))
                          .map((res) => (
                            <tr key={res._id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-3 py-3 text-center">
                                <input
                                  type="checkbox"
                                  defaultChecked={['Checked In', 'Completed'].includes(res.status)}
                                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-3 py-3 font-bold text-amber-400">{res.reservationTime}</td>
                              <td className="px-3 py-3 font-semibold text-white">#{res.tableId?.tableNumber || '?'}</td>
                              <td className="px-4 py-3 font-medium text-white">{res.userId?.name || 'Guest'}</td>
                              <td className="px-3 py-3 font-bold text-slate-200">{res.guestCount}p</td>
                              <td className="px-4 py-3 text-slate-400">{res.userId?.phone || res.userId?.email || 'N/A'}</td>
                              <td className="px-3 py-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(res.status)}`}>
                                  {res.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400 italic">
                                {res.specialRequest || '—'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
