'use client';

import React, { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function LeadModal({ isOpen, onClose, onSave }) {
  const { employees } = useCrm();

  const [customerCompany, setCustomerCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [productInterested, setProductInterested] = useState('Waterproofing Systems');
  const [requirement, setRequirement] = useState('');
  const [source, setSource] = useState('Website Enquiry');
  const [assignedTo, setAssignedTo] = useState(employees[0]?.name || 'Rajesh Sharma');
  const [estimatedValue, setEstimatedValue] = useState('2500000');
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerCompany || !contactPerson) return;

    const assignedEmp = employees.find((e) => e.name === assignedTo);

    onSave({
      customerCompany,
      contactPerson,
      phone,
      email,
      productInterested,
      requirement,
      source,
      assignedTo,
      assignedToId: assignedEmp ? assignedEmp.id : 'EMP-102',
      estimatedValue: parseFloat(estimatedValue) || 0,
      followUpDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span>Add New Lead / Commercial Enquiry</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Customer *</label>
              <input
                type="text"
                required
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                placeholder="e.g. Shapoorji Pallonji Real Estate"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Vikramaditya Shah (GM Procurements)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98220 11223"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="v.shah@shapoorji.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Product Interested In</label>
              <select
                value={productInterested}
                onChange={(e) => setProductInterested(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
              >
                <option value="Waterproofing Systems">Waterproofing Systems</option>
                <option value="Concrete Admixtures">Concrete Admixtures</option>
                <option value="Epoxy Flooring HD">Epoxy Flooring HD</option>
                <option value="Structural Repair">Structural Repair</option>
                <option value="Grouts & Anchors">Grouts & Anchors</option>
                <option value="Industrial Solutions">Industrial Solutions</option>
                <option value="Specialized Coatings">Specialized Coatings</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Website Enquiry">Website Enquiry</option>
                <option value="Direct Referral">Direct Referral</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Tender / Enterprise">Tender / Enterprise</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Requirement Details</label>
            <textarea
              rows="2"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Describe square footage, project location, technical specs..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Sales Executive</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Est. Value (INR)</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="2500000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Next Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
