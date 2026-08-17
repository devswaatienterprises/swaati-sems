'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import {
  Settings as SettingsIcon,
  Building2,
  ShieldCheck,
  User,
  Bell,
  Lock,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const { currentRole, currentUser } = useCrm();

  const [companyName, setCompanyName] = useState('Swaati Enterprises');
  const [address, setAddress] = useState('Shraddha Garden, Gawade Park, Opp Tata Motors, Chinchwad, Pune – 411033');
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <Shell>
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold">
          Settings successfully updated!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-slate-700" />
            <span>System & Profile Settings</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account preferences, system roles, and corporate information.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Navigation */}
        <div className="lg:col-span-1 space-y-2 text-xs font-bold">
          <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-1 shadow-xs">
            <button className="w-full text-left px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-2 font-bold">
              <User className="w-4 h-4" /> My Profile Settings
            </button>

            {currentRole === 'ADMIN' && (
              <>
                <button className="w-full text-left px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" /> Company Profile
                </button>
                <button className="w-full text-left px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" /> Roles & RBAC Matrix
                </button>
              </>
            )}

            <button className="w-full text-left px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" /> Notification Preferences
            </button>
            <button className="w-full text-left px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" /> Password & Security
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-4 pb-2 border-b border-slate-100">
              Personal Account Information
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={currentUser.name}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    defaultValue={currentUser.mobile}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Role</label>
                  <input
                    type="text"
                    value={currentUser.role}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-bold text-blue-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {currentRole === 'ADMIN' && (
                <>
                  <h3 className="font-bold text-slate-800 text-sm mt-6 mb-4 pb-2 border-b border-slate-100">
                    Company Information (Admin Only)
                  </h3>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Headquarters Address</label>
                    <textarea
                      rows="2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    ></textarea>
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Shell>
  );
}
