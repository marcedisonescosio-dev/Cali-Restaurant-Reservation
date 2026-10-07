import React from 'react';
import {
  Lock,
  Wrench,
  Compass,
  Wine,
  Sun,
  Flame,
  Crown,
  Sparkles
} from 'lucide-react';

/**
 * RestaurantFloorPlan component
 * Visual architectural dining room seating map with interactive table selection
 *
 * @param {Array} allTables - All tables in restaurant (from DB or fallback)
 * @param {Array} availableTables - Tables currently available for selected date/time/guests
 * @param {Object} selectedTable - The table currently selected by customer
 * @param {Function} onSelectTable - Callback when user clicks an available table
 * @param {Number} guestCount - Requested party size
 */
const RestaurantFloorPlan = ({
  allTables = [],
  availableTables = [],
  selectedTable,
  onSelectTable,
  guestCount = 2
}) => {

  // Map table positions & zones
  // Table 1, 2: Window Pavilion
  // Table 3, 4: Intimate Booths
  // Table 5, 6: Grand Central Dining
  // Table 7, 8: VIP & Banquet Salons
  const getTableMeta = (tableNumber) => {
    switch (Number(tableNumber)) {
      case 1:
        return {
          zone: 'Window Pavilion',
          zoneIcon: Sun,
          perk: 'Panoramic Garden View',
          x: '18%',
          y: '22%',
          shape: 'circle',
          w: 'w-20',
          h: 'h-20'
        };
      case 2:
        return {
          zone: 'Window Pavilion',
          zoneIcon: Sun,
          perk: 'Sunset Glass Exposure',
          x: '18%',
          y: '65%',
          shape: 'circle',
          w: 'w-20',
          h: 'h-20'
        };
      case 3:
        return {
          zone: 'Intimate Booths',
          zoneIcon: Flame,
          perk: 'Plush Velvet Alcove',
          x: '45%',
          y: '22%',
          shape: 'rect',
          w: 'w-24',
          h: 'h-20'
        };
      case 4:
        return {
          zone: 'Intimate Booths',
          zoneIcon: Flame,
          perk: 'Candlelight Seclusion',
          x: '45%',
          y: '65%',
          shape: 'rect',
          w: 'w-24',
          h: 'h-20'
        };
      case 5:
        return {
          zone: 'Grand Central Dining',
          zoneIcon: Sparkles,
          perk: 'Under Chandelier',
          x: '72%',
          y: '22%',
          shape: 'rect',
          w: 'w-28',
          h: 'h-22'
        };
      case 6:
        return {
          zone: 'Grand Central Dining',
          zoneIcon: Sparkles,
          perk: 'Main Hall Ambiance',
          x: '72%',
          y: '65%',
          shape: 'rect',
          w: 'w-28',
          h: 'h-22'
        };
      case 7:
        return {
          zone: "Chef's VIP Salon",
          zoneIcon: Crown,
          perk: 'Kitchen View Tasting',
          x: '92%',
          y: '22%',
          shape: 'oval',
          w: 'w-32',
          h: 'h-24'
        };
      case 8:
        return {
          zone: 'Executive Banquet',
          zoneIcon: Crown,
          perk: 'Large Celebration Space',
          x: '92%',
          y: '65%',
          shape: 'oval',
          w: 'w-36',
          h: 'h-26'
        };
      default:
        return {
          zone: 'Dining Hall',
          zoneIcon: Sparkles,
          perk: 'Comfortable Dining',
          x: '50%',
          y: '50%',
          shape: 'rect',
          w: 'w-24',
          h: 'h-20'
        };
    }
  };

  // Determine state of table
  const getTableStatus = (table) => {
    if (table.status === 'maintenance') return 'maintenance';
    if (table.capacity < guestCount) return 'too_small';
    const isAvailable = availableTables.some((t) => t._id === table._id);
    if (!isAvailable) return 'booked';
    if (selectedTable?._id === table._id) return 'selected';
    return 'available';
  };

  return (
    <div className="space-y-4">
      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            Available
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50 ring-2 ring-amber-300"></span>
            Selected
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></span>
            Reserved / Booked
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-3 rounded-full bg-slate-900 border border-dashed border-slate-700"></span>
            Under Capacity
          </span>
        </div>

        <p className="text-[11px] text-amber-400/80 font-medium hidden sm:block">
          Click any available table on the floor plan to select
        </p>
      </div>

      {/* Architectural Map Canvas */}
      <div className="relative w-full bg-slate-950 rounded-2xl border border-slate-800 p-6 overflow-hidden min-h-[460px] flex flex-col justify-between select-none">
        {/* Subtle floor grid */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        ></div>

        {/* Room Boundaries & Architectural Labels */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800/80 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Sun className="w-3.5 h-3.5" />
            <span>Window Terrace (Garden View)</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Main Chandelier Hall</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400">
            <Crown className="w-3.5 h-3.5" />
            <span>VIP & Executive Salons</span>
          </div>
        </div>

        {/* Floor Plan Tables Grid */}
        <div className="relative z-10 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {allTables.map((table) => {
            const status = getTableStatus(table);
            const meta = getTableMeta(table.tableNumber);
            const ZoneIcon = meta.zoneIcon;
            const isClickable = status === 'available' || status === 'selected';
            const isSelected = status === 'selected';

            return (
              <div
                key={table._id}
                onClick={() => {
                  if (isClickable) {
                    onSelectTable(table);
                  }
                }}
                className={`relative rounded-2xl p-4 flex flex-col justify-between transition-colors border ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 cursor-pointer'
                    : status === 'available'
                    ? 'bg-slate-900/80 border-emerald-500/40 hover:border-amber-400 hover:bg-slate-900 cursor-pointer'
                    : status === 'too_small'
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-40 cursor-not-allowed'
                    : status === 'maintenance'
                    ? 'bg-rose-950/20 border-rose-800/30 opacity-60 cursor-not-allowed'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Top Badge: Zone & Status */}
                <div className="flex items-center justify-between gap-1 mb-3">
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                    <ZoneIcon className="w-3 h-3 text-amber-400" />
                    <span className="truncate max-w-[85px]">{meta.zone}</span>
                  </span>

                  {isSelected && (
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-sm">
                      Selected
                    </span>
                  )}
                  {status === 'available' && !isSelected && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Free
                    </span>
                  )}
                  {status === 'booked' && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Booked
                    </span>
                  )}
                  {status === 'too_small' && (
                    <span className="text-[9px] text-slate-500">Max {table.capacity}p</span>
                  )}
                  {status === 'maintenance' && (
                    <span className="text-[9px] text-rose-400 flex items-center gap-1">
                      <Wrench className="w-2.5 h-2.5" /> Maint.
                    </span>
                  )}
                </div>

                {/* Table Physical Representation Visual */}
                <div className="py-2 flex items-center justify-center">
                  <div
                    className={`relative flex items-center justify-center ${
                      meta.shape === 'circle'
                        ? 'w-16 h-16 rounded-full'
                        : meta.shape === 'oval'
                        ? 'w-20 h-16 rounded-3xl'
                        : 'w-18 h-16 rounded-2xl'
                    } ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : status === 'available'
                        ? 'bg-slate-800 border-2 border-emerald-500/60 text-white hover:border-amber-400'
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}
                  >
                    {/* Simulated Chairs around table */}
                    <div className="absolute -top-1.5 w-4 h-1 rounded-full bg-slate-600/70"></div>
                    <div className="absolute -bottom-1.5 w-4 h-1 rounded-full bg-slate-600/70"></div>
                    <div className="absolute -left-1.5 w-1 h-4 rounded-full bg-slate-600/70"></div>
                    <div className="absolute -right-1.5 w-1 h-4 rounded-full bg-slate-600/70"></div>

                    <div className="text-center">
                      <span className="text-sm font-extrabold block leading-tight">
                        #{table.tableNumber}
                      </span>
                      <span className="text-[9px] uppercase tracking-tighter opacity-80">
                        {table.capacity} seats
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table Perceived Atmosphere / Feature */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] flex items-center justify-between text-slate-400">
                  <span className="truncate">{meta.perk}</span>
                  {status === 'available' && !isSelected && (
                    <span className="text-amber-400 font-semibold shrink-0">Click</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Entrance & Bar Anchors */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Grand Main Entrance & Hostess Station</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Wine className="w-4 h-4 text-amber-500" />
            <span>Sommelier Wine Cellar & Bar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantFloorPlan;
