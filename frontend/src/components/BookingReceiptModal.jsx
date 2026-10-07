import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Armchair,
  Download,
  Printer,
  Mail,
  MessageSquare,
  QrCode,
  X,
  CheckCircle,
  Copy,
  Check,
  MapPin,
  UtensilsCrossed
} from 'lucide-react';

const BookingReceiptModal = ({ reservation, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('ticket'); // 'ticket', 'email', 'sms'
  const [copied, setCopied] = useState(false);

  if (!isOpen || !reservation) return null;

  const tableNumber = reservation.tableId?.tableNumber || reservation.tableNumber || 'N/A';
  const guests = reservation.guestCount || 1;
  const resDate = reservation.reservationDate || '';
  const resTime = reservation.reservationTime || '';
  const bookingRef = reservation._id ? `LRB-${reservation._id.slice(-6).toUpperCase()}` : 'LRB-CONFIRMED';
  const userName = reservation.userId?.name || 'Valued Guest';
  const userEmail = reservation.userId?.email || 'guest@example.com';
  const userPhone = reservation.userId?.phone || '555-0199';
  const specialRequest = reservation.specialRequest || 'None';

  // Copy reference code to clipboard
  const handleCopyRef = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate and download standard .ics calendar file
  const handleDownloadICS = () => {
    try {
      // Parse date and time: date is YYYY-MM-DD, time is e.g. "07:00 PM"
      const [year, month, day] = resDate.split('-').map(Number);
      let [timePart, meridiem] = resTime.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      const startDate = new Date(year, month - 1, day, hours, minutes);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

      const pad = (n) => String(n).padStart(2, '0');
      const formatICSDate = (d) =>
        `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(
          d.getMinutes()
        )}00`;

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Cali Reserve//Reservation System//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `SUMMARY:Dinner at Cali Reserve (Table #${tableNumber})`,
        `DESCRIPTION:Reservation for party of ${guests} guests at Cali Reserve.\\nBooking Ref: ${bookingRef}\\nSpecial Requests: ${specialRequest}\\nAddress: 452 Gourmet Promenade, Culinary District`,
        'LOCATION:Cali Reserve, 452 Gourmet Promenade',
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Upcoming Dinner at Cali Reserve in 1 hour',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `LaReserveBistro-${bookingRef}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate .ics file:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden my-8">
        {/* Header navigation */}
        <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ticket')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'ticket'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Digital Ticket
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'email'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email Preview
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'sms'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              SMS Preview
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB 1: Digital Ticket */}
        {activeTab === 'ticket' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Ticket Card */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-6 overflow-hidden">

              {/* Branding & Status */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">Cali Reserve</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                      Table Reservation Pass
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {reservation.status || 'Confirmed'}
                </div>
              </div>

              {/* Booking Reference Code */}
              <div className="mt-5 flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Reservation Reference
                  </span>
                  <div className="text-xl font-mono font-extrabold text-amber-400 tracking-wider">
                    {bookingRef}
                  </div>
                </div>
                <button
                  onClick={handleCopyRef}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reservation Specs Grid */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">Date</span>
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{resDate}</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">Time</span>
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{resTime}</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">Table</span>
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <Armchair className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>#{tableNumber}</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">Guests</span>
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                  </div>
                </div>
              </div>

              {/* Guest & Venue Details */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Primary Guest:</span>
                  <span className="font-semibold text-white">{userName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Contact:</span>
                  <span>{userPhone} • {userEmail}</span>
                </div>
                {specialRequest && specialRequest !== 'None' && (
                  <div className="flex items-start justify-between gap-4 pt-1">
                    <span className="text-slate-400 shrink-0">Special Request:</span>
                    <span className="text-right text-amber-300/90 italic line-clamp-2">
                      "{specialRequest}"
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Location:</span>
                  <span className="flex items-center gap-1 text-slate-200">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    452 Gourmet Promenade
                  </span>
                </div>
              </div>

              {/* Decorative QR Check-In Area */}
              <div className="mt-5 pt-4 border-t border-dashed border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-semibold text-white">Digital Host Check-in</p>
                  <p className="text-[10px] text-slate-500">Show this ticket upon restaurant arrival</p>
                </div>
                <div className="w-12 h-12 bg-white p-1 rounded-lg flex items-center justify-center shadow-md">
                  <QrCode className="w-10 h-10 text-slate-950" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDownloadICS}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Add to Calendar (.ics)
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-colors"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                Print / Save Receipt
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Email Simulation */}
        {activeTab === 'email' && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Confirmation dispatch dispatched to <strong>{userEmail}</strong></span>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4 text-xs font-sans text-slate-300 shadow-inner">
              <div className="border-b border-slate-800 pb-3 space-y-1">
                <div><strong className="text-slate-400">From:</strong> reservations@lareservebistro.com</div>
                <div><strong className="text-slate-400">To:</strong> {userEmail}</div>
                <div><strong className="text-slate-400">Subject:</strong> Your Reservation is Confirmed - Cali Reserve ({bookingRef})</div>
              </div>

              <div className="space-y-3 pt-2 leading-relaxed">
                <p>Dear {userName},</p>
                <p>
                  Thank you for choosing <strong>Cali Reserve</strong>. Your table reservation is confirmed below.
                </p>

                <div className="p-4 bg-slate-900/90 rounded-xl border border-amber-500/20 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking Reference:</span>
                    <strong className="text-amber-400 font-mono">{bookingRef}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Time:</span>
                    <strong className="text-white">{resDate} at {resTime}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Table & Party:</span>
                    <span className="text-white font-medium">Table #{tableNumber} ({guests} Guests)</span>
                  </div>
                  {specialRequest && specialRequest !== 'None' && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Notes:</span>
                      <span className="text-amber-300/90 italic">"{specialRequest}"</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  <strong>Dress Code:</strong> Smart Elegant. Tables are held for up to 15 minutes past reserved time.
                </p>

                <p className="pt-2">Warm regards,<br /><strong>The Culinary Team at Cali Reserve</strong></p>
              </div>
            </div>

            <button
              onClick={handleDownloadICS}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-amber-500/20"
            >
              <Calendar className="w-3.5 h-3.5" />
              Download Calendar Invite (.ics)
            </button>
          </div>
        )}

        {/* TAB 3: SMS Simulation */}
        {activeTab === 'sms' && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center gap-2 text-xs text-sky-300">
              <CheckCircle className="w-4 h-4 shrink-0 text-sky-400" />
              <span>Instant SMS alert delivered to <strong>{userPhone}</strong></span>
            </div>

            {/* Smartphone Simulated Chat Bubble */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center shadow-inner">
              <div className="w-full max-w-sm space-y-3">
                <div className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  Today • {resTime}
                </div>

                <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl rounded-tl-none text-xs leading-relaxed font-medium">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    Cali Reserve
                  </p>
                  <p>
                    Hi {userName.split(' ')[0]}! Your table #{tableNumber} for {guests} {guests === 1 ? 'guest' : 'guests'} is confirmed on {resDate} at {resTime}. Ref: {bookingRef}.
                  </p>
                  <p className="mt-2 text-[10px] text-slate-800 font-semibold">
                    Address: 452 Gourmet Promenade. Reply CANCEL if plans change.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadICS}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-amber-500/20"
            >
              <Calendar className="w-3.5 h-3.5" />
              Download Calendar Invite (.ics)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingReceiptModal;
