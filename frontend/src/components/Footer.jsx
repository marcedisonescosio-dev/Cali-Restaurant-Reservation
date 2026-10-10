import React from 'react';
import { UtensilsCrossed, Clock, MapPin, Phone, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-950 border-t border-slate-800 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-slate-900" />
              </div>
              <span className="text-lg font-bold">SaloTable</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience artisanal gourmet cuisine in an intimate setting. Effortless table reservations tailored for every occasion.
            </p>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              Hours of Service
            </h3>
            <ul className="text-sm space-y-2">
              <li className="flex justify-between">
                <span>Mon – Thu:</span>
                <span className="text-slate-300">11:00 AM – 10:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Fri – Sat:</span>
                <span className="text-slate-300">11:00 AM – 11:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-slate-300">10:00 AM – 9:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              Find Us
            </h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span>124 Culinary Boulevard, Downtown</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>+1 (555) 234-8890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>reservations@lareservebistro.com</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Reservations</h3>
            <p className="text-sm text-slate-400 mb-3">
              Planning a special dinner or celebratory gathering? Book your table in advance.
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Instant Confirmation
            </span>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SaloTable. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Restaurant Reservation System
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
