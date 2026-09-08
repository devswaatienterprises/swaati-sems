'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import {
  Settings as SettingsIcon,
  Clock,
  Building2,
  ShieldCheck,
  User,
  Save,
  CheckCircle2,
  History,
  Languages,
} from 'lucide-react';
import TranslationGrid from '@/components/TranslationGrid';

export default function SettingsPage() {
  const {
    currentRole,
    currentUser,
    systemSettings,
    updateSystemSettings,
    auditLogs,
    t,
  } = useCrm();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'timing' | 'audit' | 'translations'
  const [officeStartTime, setOfficeStartTime] = useState(systemSettings.officeStartTime || '10:00 AM');
  const [gracePeriod, setGracePeriod] = useState(systemSettings.gracePeriodMinutes || 15);
  const [toastMessage, setToastMessage] = useState('');

  const handleSaveTiming = (e) => {
    e.preventDefault();
    updateSystemSettings({
      officeStartTime,
      gracePeriodMinutes: parseInt(gracePeriod, 10),
    });
    setToastMessage('Office start time & attendance rules updated successfully!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <Shell>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-slate-700" />
            <span>System & Profile Settings</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage your user profile, multi-language copy & translations, configurable shift start times, and administrative activity logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Navigation */}
        <div className="lg:col-span-1 space-y-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs h-fit text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${
              activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          {currentRole === 'ADMIN' && (
            <>
              <button
                onClick={() => setActiveTab('translations')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${
                  activeTab === 'translations' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Languages className="w-4 h-4" />
                <span>Translations & Copy</span>
              </button>

              <button
                onClick={() => setActiveTab('timing')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${
                  activeTab === 'timing' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Office Shift Timing</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${
                  activeTab === 'audit' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Audit / Activity History</span>
              </button>
            </>
          )}
        </div>

        {/* Right Content Panels */}
        <div className="lg:col-span-3">
          {/* TAB 0: TRANSLATIONS & COPY (Admin Only) */}
          {activeTab === 'translations' && currentRole === 'ADMIN' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <TranslationGrid />
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
                Personal Profile Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Login User ID</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.userId}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-blue-700 font-mono font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.mobile}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.department}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.designation}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMING CONFIGURATION (Admin Only) */}
          {activeTab === 'timing' && currentRole === 'ADMIN' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">
                  Configurable Working Hours & Late Arrival Settings
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Team members checking in after the configured start time are automatically flagged as Late and their late minutes calculated.
                </p>
              </div>

              <form onSubmit={handleSaveTiming} className="space-y-4 max-w-md">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Start Time *</label>
                  <input
                    type="text"
                    required
                    value={officeStartTime}
                    onChange={(e) => setOfficeStartTime(e.target.value)}
                    placeholder="e.g. 10:00 AM or 09:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Example: 10:00 AM, 09:30 AM, 09:00 AM</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Buffer before late flag triggers (Default: 15 mins)</p>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm shadow-blue-600/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Timing Configuration</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: AUDIT / ACTIVITY HISTORY (Admin Only) */}
          {activeTab === 'audit' && currentRole === 'ADMIN' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">
                  Administrative Action & Activity Audit Trail
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Immutable logs of critical admin actions such as member deactivations, permission adjustments, leave approvals, and datasheet replacements.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{log.action}</div>
                      <div className="text-slate-500 text-[11px]">{log.target}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-700">By: {log.performedBy}</div>
                      <div className="text-[10px] text-slate-400">{log.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
