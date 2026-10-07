import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Calendar,
  Utensils,
  Star,
  ShieldCheck,
  ArrowRight,
  Clock,
  Users,
  Award,
  Wine,
  Quote
} from 'lucide-react';

const Home = () => {
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/menu');
        // Pick top 3 available dishes for the home showcase
        const available = res.data.filter((item) => item.availability);
        setFeaturedDishes(available.slice(0, 3));
      } catch (err) {
        console.error('Could not fetch featured dishes:', err.message);
      } finally {
        setLoadingDishes(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-amber-400/90">
                Open tonight · 5:00 – 10:00 PM · Downtown
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Fine Cuisine, <br />
                <span className="text-amber-300">
                  Unforgettable Moments
                </span>
              </h1>

              <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                Welcome to Cali Reserve. Charcoal-grilled cuts, seasonal produce, and a table held under your name — booked in under two minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/reserve"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  Reserve a Table
                </Link>

                <Link
                  to="/menu"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 text-white font-semibold transition-all"
                >
                  <Utensils className="w-5 h-5 text-amber-400" />
                  Explore Menu
                </Link>
              </div>

              {/* Quick Perks */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero Double Booking</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant Verification</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Users className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Up to 10 Guests</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-amber-500/10">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
                  alt="Dining room at Cali Reserve with set tables"
                  className="w-full h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Tonight's Highlight</p>
                    <p className="text-sm font-bold text-white">Prime Ribeye Steak & Saffron Risotto</p>
                  </div>
                  <Link
                    to="/menu"
                    className="p-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Chef's Dishes Section (Live API Connected) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Tonight in the kitchen · {featuredDishes.length > 0 ? `${featuredDishes.length} plates` : 'updated daily'}
            </p>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Chef's Signature Dishes</h2>
            <p className="text-sm text-slate-400 mt-1">The three plates guests re-order most this week.</p>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 hover:underline"
          >
            Browse Full Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingDishes ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-800/40 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDishes.map((dish) => (
              <div
                key={dish._id}
                className="group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img
                    src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/90 text-amber-400 font-bold text-sm border border-slate-700">
                    ${dish.price.toFixed(2)}
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1.5 line-clamp-2">{dish.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-medium">{dish.categoryId?.name}</span>
                    <Link
                      to="/reserve"
                      className="text-xs font-semibold text-white bg-slate-800 hover:bg-amber-500 hover:text-slate-950 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Book Table
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. The Restaurant Experience Highlights */}
      <section className="bg-slate-950/60 border-y border-slate-800/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">The Cali Reserve Experience</h2>
            <p className="text-sm text-slate-400 mt-2">
              Three reasons regulars book here: the grill, the cellar, and a table that is actually held.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="text-xl font-bold text-white">Culinary Artistry</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Prime-cut meats, wild-caught seafood, and farm produce — cooked over charcoal, listed by origin on the daily menu.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <Wine className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="text-xl font-bold text-white">Curated Pairings</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Each course lists a sommelier wine pairing and a zero-proof alternative, poured by the glass.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="text-xl font-bold text-white">Guaranteed Tables</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pick a numbered table on the floor plan. The backend blocks the same table in the same slot — no double bookings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Guest Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10 border-l-2 border-amber-500 pl-4">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">What Our Diners Say</h2>
          <p className="text-sm text-slate-400 mt-2">Three recent visits, in guests' own words.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <figure className="py-2 flex flex-col justify-between space-y-4 border-t border-slate-800 pt-6">
            <Quote className="w-6 h-6 text-amber-500/60" />
            <blockquote className="text-sm text-slate-300 leading-relaxed">
              "The ribeye came out medium-rare as ordered and our table for two was ready at 7 on the dot."
            </blockquote>
            <figcaption className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Julian Hayes</p>
                <p className="text-xs text-slate-500">Anniversary Dinner · Table 2</p>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </figcaption>
          </figure>

          <figure className="py-2 flex flex-col justify-between space-y-4 border-t border-slate-800 pt-6">
            <Quote className="w-6 h-6 text-amber-500/60" />
            <blockquote className="text-sm text-slate-300 leading-relaxed">
              "Salmon and passionfruit spritz were the standouts. Booking showed the exact table number — no wait at the door."
            </blockquote>
            <figcaption className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Sophia Martinez</p>
                <p className="text-xs text-slate-500">Business Gathering · Table 5</p>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </figcaption>
          </figure>

          <figure className="py-2 flex flex-col justify-between space-y-4 border-t border-slate-800 pt-6">
            <Quote className="w-6 h-6 text-amber-500/60" />
            <blockquote className="text-sm text-slate-300 leading-relaxed">
              "Tiramisu is worth the trip alone. The floor-plan picker made it easy to grab a quiet booth."
            </blockquote>
            <figcaption className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Marcus Sterling</p>
                <p className="text-xs text-slate-500">Weekend Regular · Table 4</p>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 5. Bottom Reservation Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready for a Memorable Evening?</h2>
            <p className="text-sm text-slate-400 max-w-lg">
              Pick a date, time, and numbered table. Confirmation shows your booking reference immediately.
            </p>
          </div>
          <Link
            to="/reserve"
            className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-colors shrink-0"
          >
            Reserve Table Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
