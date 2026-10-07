import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Save, KeyRound, AlertCircle, CheckCircle, Shield, Calendar, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import BookingReceiptModal from '../components/BookingReceiptModal';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // User reservations state
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [viewingReceiptReservation, setViewingReceiptReservation] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await api.get('/reservations/my');
        setReservations(res.data);
      } catch (err) {
        console.error('Failed to load reservations in profile:', err.message);
      } finally {
        setLoadingReservations(false);
      }
    };
    fetchReservations();
  }, []);

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });

    try {
      setIsUpdatingProfile(true);
      await updateProfile({ name, phone });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await changePassword({ currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password. Check your current password.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-2xl">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {user?.name}
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium capitalize bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {user?.role}
              </span>
            </h1>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <Link
          to="/reserve"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors"
        >
          Book a Table
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6 text-white font-semibold text-lg border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-amber-500" />
            <h2>Personal Information</h2>
          </div>

          {profileMsg.text && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/40 border border-slate-800/60 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full mt-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6 text-white font-semibold text-lg border-b border-slate-800 pb-3">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <h2>Security & Password</h2>
          </div>

          {passwordMsg.text && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {passwordMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                New Password (min. 6 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full mt-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Shield className="w-4 h-4" />
              {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* User Reservations History Section */}
      <div className="mt-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h2 className="text-white font-semibold text-lg">Your Dining Reservations</h2>
          </div>
          <Link
            to="/reserve"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            + Make a New Booking
          </Link>
        </div>

        {loadingReservations ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading your bookings...</div>
        ) : reservations.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            <p>You have no reservations on record.</p>
            <Link
              to="/reserve"
              className="inline-block mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Reserve a Table Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reservations.slice(0, 4).map((r) => (
              <div
                key={r._id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      Table #{r.tableId?.tableNumber || '?'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>{r.reservationDate}</span>
                    <span>•</span>
                    <span className="text-amber-400">{r.reservationTime}</span>
                    <span>•</span>
                    <span>{r.guestCount} guests</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingReceiptReservation(r)}
                    className="text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-semibold rounded-lg border border-amber-500/20 flex items-center gap-1 transition-colors"
                    title="View Ticket & Calendar Invite"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Ticket</span>
                  </button>

                  <Link
                    to="/reserve"
                    className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Digital Booking Receipt / Ticket Modal */}
      <BookingReceiptModal
        reservation={viewingReceiptReservation}
        isOpen={!!viewingReceiptReservation}
        onClose={() => setViewingReceiptReservation(null)}
      />
    </div>
  );
};

export default Profile;
