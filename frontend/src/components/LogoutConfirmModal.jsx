import React, { useEffect } from 'react';
import { LogOut } from 'lucide-react';

const LogoutConfirmModal = ({ onConfirm, onCancel }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm logout"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Log out?</h3>
        </div>

        <p className="text-sm text-slate-400">
          Are you sure you want to log out?
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-bold transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
