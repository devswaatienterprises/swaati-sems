'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import {
  Building2,
  Search,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  X,
} from 'lucide-react';

export default function CustomersPage() {
  const { customers } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Enterprise Customer Directory</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Accounts database, project history, key contacts, and corporate relationship history.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, contact person, city..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Customer Grid Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">{cust.id}</span>
                <h3 className="font-bold text-slate-900 text-base">{cust.companyName}</h3>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{cust.city}</div>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                cust.status === 'Key Enterprise'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {cust.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Key Contact:</span>
                <span className="font-bold text-slate-800">{cust.contactPerson}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Phone:</span>
                <span className="font-mono">{cust.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Email:</span>
                <span>{cust.email}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-medium">Assigned Executive: </span>
                <strong className="text-slate-800">{cust.assignedEmployee}</strong>
              </div>
              <button
                onClick={() => setSelectedCustomer(cust)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800"
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="font-bold text-base">{selectedCustomer.companyName}</div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-blue-50 rounded-xl text-blue-900 space-y-1">
                <div className="font-bold">{selectedCustomer.contactPerson}</div>
                <div>{selectedCustomer.email} • {selectedCustomer.phone}</div>
                <div className="text-[11px] text-blue-700">Account Manager: {selectedCustomer.assignedEmployee}</div>
              </div>

              <div>
                <div className="font-bold text-slate-800 mb-2">Project & Contract History</div>
                <div className="space-y-2">
                  <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Waterproofing & Grouting Contract</div>
                      <div className="text-slate-500 text-[11px]">Completed • 2026</div>
                    </div>
                    <span className="font-mono font-bold text-slate-700">₹45.0 Lakhs</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
