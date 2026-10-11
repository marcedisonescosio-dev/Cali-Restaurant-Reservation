import React, { useState } from 'react';
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
const inferTableClass = (table) => {
  if (table.tableClass) return table.tableClass;
  const number = Number(table.tableNumber);
  if (number <= 2) return 'window_terrace';
  if (number >= 7 && number <= 8) return 'vip_salons';
  return 'main_hall';
};

const RestaurantFloorPlan = ({
  allTables = [],
  availableTables = [],
  selectedTable,
  onSelectTable,
  guestCount = 2
}) => {
  const [activeArea, setActiveArea] = useState(null);

  const getAreaFee = (areaId) => Number(
    allTables.find((table) => inferTableClass(table) === areaId)?.reservationFee
  ) || 0;
  const formatAreaFee = (fee) => fee > 0
    ? `₱${fee.toLocaleString('en-PH')} reservation fee`
    : 'Free reservation';
  const areaFilters = [
    { id: 'window_terrace', label: 'Window Terrace', icon: Sun },
    { id: 'main_hall', label: 'Main Chandelier Hall', icon: Sparkles },
    { id: 'vip_salons', label: 'VIP & Executive Dining', icon: Crown }
  ].map((area) => ({ ...area, detail: formatAreaFee(getAreaFee(area.id)) }));

  // Map table positions & zones
  // Table 1, 2: Window Pavilion
  // Table 3, 4: Intimate Booths
  // Table 5, 6: Grand Central Dining
  // Table 7, 8: VIP & Banquet Salons
  const getTableMeta = (table) => {
    const tableNumber = Number(table.tableNumber);
    const tableClass = inferTableClass(table);

    if (tableClass === 'window_terrace') {
      return {
        zone: 'Window Terrace',
        zoneIcon: Sun,
        perk: tableNumber === 2 ? 'Sunset Glass Exposure' : 'Panoramic Garden View',
        shape: 'circle'
      };
    }

    if (tableClass === 'vip_salons') {
      return {
        zone: tableNumber === 8 ? 'Executive Banquet' : "Chef's VIP Dining",
        zoneIcon: Crown,
        perk: tableNumber === 8 ? 'Large Celebration Space' : 'Kitchen View Tasting',
        shape: 'oval'
      };
    }

    const intimateBooth = tableNumber === 3 || tableNumber === 4;
    return {
      zone: intimateBooth ? 'Intimate Booths' : 'Grand Central Dining',
      zoneIcon: intimateBooth ? Flame : Sparkles,
      perk: tableNumber === 3
        ? 'Plush Velvet Alcove'
        : tableNumber === 4
        ? 'Candlelight Seclusion'
        : tableNumber === 5
        ? 'Under Chandelier'
        : 'Main Hall Ambiance',
      shape: 'rect'
    };
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

  const selectedArea = areaFilters.find((area) => area.id === activeArea);
  const areaTables = selectedArea
    ? allTables.filter((table) => inferTableClass(table) === selectedArea.id)
    : [];
  const visibleTables = [...areaTables].sort((firstTable, secondTable) => {
    const firstNumber = Number(firstTable.tableNumber);
    const secondNumber = Number(secondTable.tableNumber);
    const firstIsVip = inferTableClass(firstTable) === 'vip_salons';
    const secondIsVip = inferTableClass(secondTable) === 'vip_salons';

    if (firstIsVip !== secondIsVip) return firstIsVip ? -1 : 1;
    return firstNumber - secondNumber;
  });

  const selectArea = (areaId) => setActiveArea(areaId);

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
        <div
          className="relative z-10 grid grid-cols-1 gap-2 border-b border-slate-800/80 pb-3 sm:grid-cols-3"
          role="group"
          aria-label="Filter tables by dining area"
        >
          {areaFilters.map((area) => {
            const AreaIcon = area.icon;
            const isActive = activeArea === area.id;
            const tableCount = allTables.filter((table) => inferTableClass(table) === area.id).length;

            return (
              <button
                key={area.id}
                type="button"
                onClick={() => selectArea(area.id)}
                aria-pressed={isActive}
                className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                    : 'border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-900/70 hover:text-slate-200'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <AreaIcon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-bold uppercase tracking-wide">{area.label}</span>
                    <span className="block truncate text-[10px] font-medium normal-case tracking-normal opacity-70">{area.detail}</span>
                  </span>
                </span>
                <span className="shrink-0 text-[10px] font-semibold" aria-label={`${tableCount} tables`}>{tableCount}</span>
              </button>
            );
          })}
        </div>

        <div className="relative z-10 flex min-h-9 items-center pt-3 text-xs text-slate-400" aria-live="polite">
          <span>{selectedArea ? `Showing ${selectedArea.label}` : 'Choose a dining area to view its tables'}</span>
        </div>

        {/* Floor Plan Tables Grid */}
        <div className="relative z-10 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {visibleTables.map((table, tableIndex) => {
            const status = getTableStatus(table);
            const meta = getTableMeta(table);
            const isVip = inferTableClass(table) === 'vip_salons';
            const displayTableNumber = isVip ? tableIndex + 1 : table.tableNumber;
            const reservationFee = Number(table.reservationFee) || 0;
            const ZoneIcon = meta.zoneIcon;
            const isClickable = status === 'available' || status === 'selected';
            const isSelected = status === 'selected';

            return (
              <div
                key={table._id}
                onClick={() => {
                  if (isClickable) {
                    onSelectTable({ ...table, displayTableNumber });
                  }
                }}
                className={`relative rounded-2xl p-4 flex flex-col justify-between transition-colors border ${
                  isSelected
                    ? isVip
                      ? 'bg-[#21190d] border-amber-300 cursor-pointer ring-1 ring-amber-300/20'
                      : 'bg-amber-500/15 border-amber-400 cursor-pointer'
                    : status === 'available'
                    ? isVip
                      ? 'bg-[#17130d] border-amber-500/70 hover:border-amber-300 hover:bg-[#1d170e] cursor-pointer'
                      : reservationFee > 0
                      ? 'bg-amber-950/20 border-amber-500/60 hover:border-amber-300 hover:bg-amber-950/30 cursor-pointer'
                      : 'bg-slate-900/80 border-emerald-500/40 hover:border-amber-400 hover:bg-slate-900 cursor-pointer'
                    : status === 'too_small'
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-40 cursor-not-allowed'
                    : status === 'maintenance'
                    ? 'bg-rose-950/20 border-rose-800/30 opacity-60 cursor-not-allowed'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60 cursor-not-allowed'
                }`}
              >
                {isVip && <div className="absolute inset-x-4 top-0 h-px bg-amber-300/70" aria-hidden="true" />}

                {/* Top Badge: Zone & Status */}
                <div className="flex items-center justify-between gap-1 mb-3">
                  <span className={`flex items-center gap-1 text-[10px] font-semibold ${isVip ? 'text-amber-200' : 'text-slate-400'}`}>
                    <ZoneIcon className={`h-3 w-3 ${isVip ? 'text-amber-300' : 'text-amber-400'}`} />
                    <span className="truncate max-w-[85px]">{meta.zone}</span>
                  </span>

                  {isSelected && (
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-sm">
                      Selected
                    </span>
                  )}
                  {status === 'available' && !isSelected && (
                    reservationFee > 0 ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40">
                        ₱{reservationFee}
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Free
                      </span>
                    )
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
                        ? isVip
                          ? 'bg-amber-400 text-slate-950 font-bold ring-1 ring-amber-200'
                          : 'bg-amber-500 text-slate-950 font-bold'
                        : status === 'available'
                        ? isVip
                          ? 'bg-[#2a1e0d] border border-amber-300 text-amber-50 ring-1 ring-amber-400/20'
                          : 'bg-slate-800 border-2 border-emerald-500/60 text-white hover:border-amber-400'
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}
                  >
                    {/* Simulated Chairs around table */}
                    <div className="absolute -top-1.5 w-4 h-1 rounded-full ${isVip ? 'bg-amber-300/70' : 'bg-slate-600/70'}"></div>
                    <div className="absolute -bottom-1.5 w-4 h-1 rounded-full ${isVip ? 'bg-amber-300/70' : 'bg-slate-600/70'}"></div>
                    <div className="absolute -left-1.5 w-1 h-4 rounded-full ${isVip ? 'bg-amber-300/70' : 'bg-slate-600/70'}"></div>
                    <div className="absolute -right-1.5 w-1 h-4 rounded-full ${isVip ? 'bg-amber-300/70' : 'bg-slate-600/70'}"></div>

                    <div className="text-center">
                      <span className="text-sm font-extrabold block leading-tight">
                        #{displayTableNumber}
                      </span>
                      <span className={`text-[9px] uppercase opacity-80 ${isVip ? 'tracking-wide text-amber-100' : 'tracking-tighter'}`}>
                        {isVip ? `VIP · ${table.capacity} seats` : `${table.capacity} seats`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table Perceived Atmosphere / Feature */}
                <div className={`mt-3 flex items-center justify-between border-t pt-2 text-[10px] ${
                  isVip ? 'border-amber-500/25 text-amber-100/70' : 'border-slate-800/80 text-slate-400'
                }`}>
                  <span className="truncate">{meta.perk}</span>
                  {reservationFee > 0 ? (
                    <span className="text-amber-300 font-bold shrink-0">₱{reservationFee} fee</span>
                  ) : status === 'available' && !isSelected ? (
                    <span className="text-amber-400 font-semibold shrink-0">Click</span>
                  ) : null}
                </div>
              </div>
            );
          })}

          {!selectedArea && (
            <div className="col-span-full border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-400">
              Select a dining area above to view available tables.
            </div>
          )}

          {selectedArea && visibleTables.length === 0 && (
            <div className="col-span-full border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-400">
              No tables are configured in this dining area yet.
            </div>
          )}
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
