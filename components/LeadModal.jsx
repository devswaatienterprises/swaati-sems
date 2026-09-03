'use client';

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Plus, Edit2 } from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function LeadModal({ isOpen, onClose, onSave, initialData = null }) {
  const { employees, currentUser } = useCrm();

  const [formData, setFormData] = useState({
    leadName: '',
    companyName: '',
    mobileNumber: '',
    email: '',
    location: '',
    productInterested: 'Waterproofing Systems',
    requirement: '',
    source: 'Call',
    assignedTo: employees.find((e) => e.status === 'Active')?.name || '',
    assignedToId: employees.find((e) => e.status === 'Active')?.id || '',
    status: 'New',
    priority: 'Medium',
    followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        leadName: initialData.leadName || '',
        companyName: initialData.companyName || '',
        mobileNumber: initialData.mobileNumber || '',
        email: initialData.email || '',
        location: initialData.location || '',
        productInterested: initialData.productInterested || 'Waterproofing Systems',
        requirement: initialData.requirement || '',
        source: initialData.source || 'Call',
        assignedTo: initialData.assignedTo || employees.find((e) => e.status === 'Active')?.name || '',
        assignedToId: initialData.assignedToId || employees.find((e) => e.status === 'Active')?.id || '',
        status: initialData.status || 'New',
        priority: initialData.priority || 'Medium',
        followUpDate: initialData.followUpDate
          ? new Date(initialData.followUpDate).toISOString().split('T')[0]
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        leadName: '',
        companyName: '',
        mobileNumber: '',
        email: '',
        location: '',
        productInterested: 'Waterproofing Systems',
        requirement: '',
        source: 'Call',
        assignedTo: employees.find((e) => e.status === 'Active')?.name || '',
        assignedToId: employees.find((e) => e.status === 'Active')?.id || '',
        status: 'New',
        priority: 'Medium',
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [initialData, isOpen, employees]);

  if (!isOpen) return null;

  const handleAssigneeChange = (empName) => {
    const emp = employees.find((e) => e.name === empName);
    setFormData({
      ...formData,
      assignedTo: empName,
      assignedToId: emp?.id || '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
              {initialData ? <Edit2 className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {initialData ? 'Edit Lead Details' : 'Add New Lead'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {initialData ? `Editing lead ${initialData.leadCode || initialData.id}` : 'Record new client inquiry with source tracking and assigned team member.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Person Name *</label>
              <input
                type="text"
                required
                value={formData.leadName}
                onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                placeholder="e.g. Anand Kulkarni"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Godrej Properties Ltd"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                placeholder="e.g. +91 98230 44123"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. contact@client.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Project Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Hinjewadi Phase 1, Pune"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lead Received From (Source) *</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="Website">Website</option>
                <option value="Call">Call</option>
                <option value="Walk-in">Walk-in</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Product / Service Interested In *</label>
            <select
              value={formData.productInterested}
              onChange={(e) => setFormData({ ...formData, productInterested: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="Waterproofing Systems">Waterproofing Systems (Terrace, Basement, Podium)</option>
              <option value="Concrete Admixtures">Concrete Admixtures & Plasticizers</option>
              <option value="Epoxy Flooring">Epoxy Flooring (Self-Leveling / Heavy Duty)</option>
              <option value="Structural Repair">Structural Repair & Strengthening</option>
              <option value="Grouts & Anchors">Grouts & Precision Anchoring</option>
              <option value="Building & Joint Sealants">Building & Joint Sealants</option>
              <option value="Specialized Coatings">Specialized Industrial Coatings</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Requirement Details</label>
            <textarea
              rows={2}
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              placeholder="e.g. Approximately 30,000 sq.ft terrace area requiring elastomeric coating..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned To *</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {employees.filter((e) => e.status === 'Active').map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Next Follow-Up Date</label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lead Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Quotation Sent">Quotation Sent</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Notes / Additional Info</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special remarks..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Attribution Box */}
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200/80 text-[11px] text-purple-900 flex items-center justify-between">
            <span>Lead Handled By: <strong>{currentUser.name}</strong></span>
            <span className="text-purple-600 font-semibold">Source: {formData.source}</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm shadow-purple-600/20 flex items-center gap-1.5"
            >
              {initialData ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{initialData ? 'Save Changes' : 'Add Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
