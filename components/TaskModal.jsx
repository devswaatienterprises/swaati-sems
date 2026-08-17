'use client';

import React, { useState } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function TaskModal({ isOpen, onClose, onSave }) {
  const { employees } = useCrm();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(employees[0]?.name || '');
  const [priority, setPriority] = useState('High');
  const [category, setCategory] = useState('Site Survey');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    const assignedEmp = employees.find((e) => e.name === assignedTo);

    onSave({
      title,
      description,
      assignedTo,
      assignedToId: assignedEmp ? assignedEmp.id : 'EMP-104',
      priority,
      category,
      dueDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <span>Create New Task</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Inspect Terrace Waterproofing at Hinjewadi Site"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide technical steps or client requirements..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Employee</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-bold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Site Survey">Site Survey</option>
                <option value="Documentation">Documentation</option>
                <option value="Field Demo">Field Demo</option>
                <option value="Client Call">Client Call</option>
                <option value="Inventory">Inventory</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
