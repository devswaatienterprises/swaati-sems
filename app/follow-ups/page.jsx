'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';

export default function FollowUpsPage() {
  const { followUps, updateFollowUpStatus } = useCrm();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFollowUps = followUps.filter((f) => {
    const matchesSearch =
      f.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            <span>Follow-up Schedule & Client Calls</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Commercial touchpoint schedule, follow-up logs, and site visit appointments.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer, product, contact..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Follow-ups</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Missed">Missed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer & Contact</th>
                <th className="py-3.5 px-4">Product System</th>
                <th className="py-3.5 px-4">Follow-up Date</th>
                <th className="py-3.5 px-4">Assigned Executive</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {filteredFollowUps.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{item.customer}</div>
                    <div className="text-[11px] text-slate-500">{item.contactPerson} • {item.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.product}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold">{item.followUpDate}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.assignedTo}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{item.notes}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      item.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={item.status}
                      onChange={(e) => updateFollowUpStatus(item.id, e.target.value)}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-xs"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Missed">Missed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
