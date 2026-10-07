import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Utensils, Calendar, AlertCircle, Loader2, Tag } from 'lucide-react';

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError('');
        const [categoriesRes, menuRes] = await Promise.all([
          api.get('/categories'),
          api.get('/menu'),
        ]);

        setCategories(categoriesRes.data);
        setMenuItems(menuRes.data);
      } catch (err) {
        console.error('Failed to load menu:', err);
        setError('Failed to load menu items. Please check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Filter items based on category selection and search query
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      item.categoryId?._id === selectedCategory ||
      item.categoryId === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          Updated daily · {menuItems.length > 0 ? `${menuItems.length} dishes` : 'kitchen menu'}
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Dining Menu
        </h1>
        <p className="mt-3 text-base text-slate-400">
          Dishes by category, with tonight's availability marked on each card.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-10 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat._id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or ingredients..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 mb-8">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-sm text-slate-400">Curating the menu selection...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty state */
        <div className="min-h-[30vh] flex flex-col items-center justify-center text-center p-8 bg-slate-900/30 border border-slate-800/60 rounded-2xl">
          <Utensils className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white">No dishes found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            We couldn't find any dishes matching "{searchQuery}". Try searching for something else or switch categories.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-500/20 rounded-lg hover:bg-amber-500/10 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Dishes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Dish Image */}
              <div className="relative h-52 overflow-hidden bg-slate-950">
                <img
                  src={
                    item.image ||
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'
                  }
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Price Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-amber-400 font-bold text-sm shadow-lg">
                  ${item.price.toFixed(2)}
                </div>

                {/* Category Pill */}
                {item.categoryId?.name && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300">
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>{item.categoryId.name}</span>
                  </div>
                )}
              </div>

              {/* Dish Content */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                    {item.description || 'Delicious culinary preparation crafted with fresh seasonal flavors.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      item.availability ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.availability ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                      }`}
                    />
                    {item.availability ? 'Available Tonight' : 'Sold Out'}
                  </span>

                  <Link
                    to="/reserve"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Reserve Table
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Reservation Call to Action */}
      <div className="mt-16 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white">Hungry tonight?</h3>
          <p className="text-sm text-slate-400 mt-1">Pick a numbered table and time — confirmation is immediate.</p>
        </div>
        <Link
          to="/reserve"
          className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shrink-0"
        >
          Book Your Table
        </Link>
      </div>
    </div>
  );
};

export default Menu;
