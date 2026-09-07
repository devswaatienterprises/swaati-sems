'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Upload, ShieldCheck, Check, CreditCard, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_PERMISSIONS } from '@/context/mockData';

export default function EmployeeModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    password: '',
    email: '',
    mobile: '',
    department: 'Technical & Operations',
    designation: 'Site Engineer',
    joiningDate: new Date().toISOString().split('T')[0],
    reportingManager: 'Shailendra Patil',
    employmentStatus: 'Active',
    idCardType: 'Aadhaar Card',
    idCardNumber: '',
    idCardFrontUrl: '',
    idCardBackUrl: '',
    permissions: { ...DEFAULT_PERMISSIONS, reports: false },
  });

  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'documents' | 'permissions'

  useEffect(() => {
    setFrontFile(null);
    setBackFile(null);
    if (initialData) {
      setFormData({
        ...initialData,
        permissions: initialData.permissions || { ...DEFAULT_PERMISSIONS, reports: false },
      });
    } else {
      setFormData({
        name: '',
        userId: '',
        password: '',
        email: '',
        mobile: '',
        department: 'Technical & Operations',
        designation: 'Site Engineer',
        joiningDate: new Date().toISOString().split('T')[0],
        reportingManager: 'Shailendra Patil',
        employmentStatus: 'Active',
        idCardType: 'Aadhaar Card',
        idCardNumber: '',
        idCardFrontUrl: '',
        idCardBackUrl: '',
        permissions: { ...DEFAULT_PERMISSIONS, reports: false },
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, frontFile, backFile);
    onClose();
  };

  const togglePermission = (key) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const featureList = [
    { key: 'dashboard', label: 'Dashboard', desc: 'Overview of work and metrics' },
    { key: 'attendance', label: 'Daily Attendance', desc: 'Check in / check out and daily shift logs' },
    { key: 'leave', label: 'Leave Management', desc: 'Apply for leave and view leave history' },
    { key: 'tasks', label: 'Tasks', desc: 'View and update assigned operational tasks' },
    { key: 'leads', label: 'Leads & Enquiries', desc: 'Access client pipeline and inquiries' },
    { key: 'products', label: 'Product Datasheets', desc: 'View technical datasheets & documents' },
    { key: 'notifications', label: 'Notifications', desc: 'Receive system alerts and updates' },
    { key: 'messaging', label: 'Internal Messaging', desc: 'Direct 1-on-1 team communication' },
    { key: 'reports', label: 'Reports & Analytics', desc: 'Payroll, task, and lead reports' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {initialData ? 'Edit Team Member Profile' : 'Add New Team Member'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Enter team member details, identity documents, and assign feature permissions.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-slate-50/30 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'basic' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            1. Basic Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>2. Identity Documents</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'permissions' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Feature Permissions</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Patil"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">User ID (Login ID) *</label>
                  <input
                    type="text"
                    required
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="e.g. rahul.p or EMP-107"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul.patil@swaatienterprises.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {!initialData && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Provide temporary login password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Technical & Operations">Technical & Operations</option>
                    <option value="Sales & Business Dev">Sales & Business Dev</option>
                    <option value="Site Execution">Site Execution</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Executive Management">Executive Management</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Site Engineer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reporting Manager</label>
                  <input
                    type="text"
                    value={formData.reportingManager}
                    onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                    placeholder="e.g. Shailendra Patil"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITY DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/80 text-blue-800 text-[11px] leading-relaxed">
                <strong>Secure Identity Storage:</strong> Identity document images are stored securely and accessible only to authorized administrators.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ID Card Type *</label>
                  <select
                    value={formData.idCardType}
                    onChange={(e) => setFormData({ ...formData, idCardType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ID Card Number *</label>
                  <input
                    type="text"
                    value={formData.idCardNumber}
                    onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                    placeholder="e.g. XXXX-XXXX-4589"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Front Image Upload */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-slate-700 mb-0.5">ID Card Front Image</div>
                  <div className="text-[10px] text-slate-500 mb-2">PNG, JPG, PDF up to 10MB</div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]">
                    <Upload className="w-3 h-3" />
                    <span>{frontFile || formData.idCardFrontUrl ? 'Change Image' : 'Upload Front'}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFrontFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {(frontFile || formData.idCardFrontUrl) && (
                    <div className="mt-2 text-[10px] text-emerald-600 font-bold">
                      ✓ {frontFile ? frontFile.name : 'Front image attached'}
                    </div>
                  )}
                </div>

                {/* Back Image Upload */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-slate-700 mb-0.5">ID Card Back Image</div>
                  <div className="text-[10px] text-slate-500 mb-2">PNG, JPG, PDF up to 10MB</div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]">
                    <Upload className="w-3 h-3" />
                    <span>{backFile || formData.idCardBackUrl ? 'Change Image' : 'Upload Back'}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setBackFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {(backFile || formData.idCardBackUrl) && (
                    <div className="mt-2 text-[10px] text-emerald-600 font-bold">
                      ✓ {backFile ? backFile.name : 'Back image attached'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURE PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-700 text-[11px] font-medium leading-relaxed">
                Activate or deactivate individual SEMS features for this team member. Inactive features will be removed from their navigation and direct URL access will be blocked.
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {featureList.map((feat) => {
                  const isActive = !!formData.permissions?.[feat.key];
                  return (
                    <div
                      key={feat.key}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{feat.label}</div>
                        <div className="text-[11px] text-slate-500">{feat.desc}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePermission(feat.key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isActive ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 font-medium">
              * All required fields must be completed.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm shadow-blue-600/20"
              >
                {initialData ? 'Save Changes' : 'Add Team Member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
