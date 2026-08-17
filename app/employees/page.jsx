'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import EmployeeModal from '@/components/EmployeeModal';
import { useCrm } from '@/context/CrmContext';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
} from 'lucide-react';

export default function EmployeesPage() {
  const { currentRole, employees, addEmployee, updateEmployeeStatus } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <Shell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Employee Directory Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage organization staff profiles, roles, departments, and system access.
          </p>
        </div>

        {currentRole === 'ADMIN' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee name, ID, department..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Role:
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Roles ({employees.length})</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Department & Designation</th>
                <th className="py-3.5 px-4">System Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No employees matching search parameters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                          {emp.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {emp.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {emp.mobile}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{emp.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{emp.department}</div>
                      <div className="text-[11px] text-slate-500">{emp.designation}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        emp.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : emp.role === 'MANAGER'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{emp.joiningDate}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                        {currentRole === 'ADMIN' && (
                          <button
                            onClick={() =>
                              updateEmployeeStatus(
                                emp.id,
                                emp.status === 'Active' ? 'Inactive' : 'Active'
                              )
                            }
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                            title="Toggle Status"
                          >
                            {emp.status === 'Active' ? (
                              <ToggleRight className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addEmployee}
      />
    </Shell>
  );
}
