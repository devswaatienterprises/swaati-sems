'use client';

import React, { useState } from 'react';
import { X, CalendarCheck2, Send, AlertCircle } from 'lucide-react';

export default function LeaveModal({ isOpen, onClose, onApply }) {
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    totalDays: 1,
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDateChange = (field, val) => {
    setErrorMsg('');
    const updated = { ...formData, [field]: val };
    const start = new Date(updated.startDate);
    const end = new Date(updated.endDate);
    const diffTime = end - start;
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    updated.totalDays = isNaN(diffDays) ? 1 : diffDays;
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.reason.trim()) {
      setErrorMsg('Please enter a clear reason for your leave request.');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setErrorMsg('End date cannot be earlier than start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onApply(formData);
      if (res && res.success === false) {
        setErrorMsg(res.message || 'Failed to submit leave request. Please check your dates and try again.');
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      setFormData({
        leaveType: 'Casual Leave',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        totalDays: 1,
        reason: '',
      });
      onClose();
    } catch (err) {
      console.error('Leave submission error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Apply for Leave</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Submit a leave request for administrator review and approval.
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Leave Type *</label>
            <select
              value={formData.leaveType}
              onChange={(e) => {
                setErrorMsg('');
                setFormData({ ...formData, leaveType: e.target.value });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="Casual Leave">Casual Leave (CL)</option>
              <option value="Sick Leave">Sick Leave (SL)</option>
              <option value="Earned Leave">Earned Leave (EL)</option>
              <option value="Unpaid Leave">Unpaid Leave (LWP)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">From Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">To Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <span className="font-bold text-slate-600">Calculated Duration:</span>
            <span className="font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
              {formData.totalDays} Day{formData.totalDays > 1 ? 's' : ''}
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Leave *</label>
            <textarea
              rows={3}
              required
              value={formData.reason}
              onChange={(e) => {
                setErrorMsg('');
                setFormData({ ...formData, reason: e.target.value });
              }}
              placeholder="State clear purpose of leave..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Leave Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
