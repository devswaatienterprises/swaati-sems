'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Plus, Edit2 } from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function TaskModal({ isOpen, onClose, onSave, initialData = null }) {
  const { employees, currentUser } = useCrm();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: employees.find((e) => e.status === 'Active')?.name || '',
    assignedToId: employees.find((e) => e.status === 'Active')?.id || '',
    priority: 'Medium',
    status: 'To Do',
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reminder: '1 day before deadline',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        assignedTo: initialData.assignedTo || employees.find((e) => e.status === 'Active')?.name || '',
        assignedToId: initialData.assignedToId || employees.find((e) => e.status === 'Active')?.id || '',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'To Do',
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        deadline: initialData.deadline
          ? new Date(initialData.deadline).toISOString().split('T')[0]
          : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reminder: initialData.reminder || '1 day before deadline',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignedTo: employees.find((e) => e.status === 'Active')?.name || '',
        assignedToId: employees.find((e) => e.status === 'Active')?.id || '',
        priority: 'Medium',
        status: 'To Do',
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reminder: '1 day before deadline',
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
              {initialData ? <Edit2 className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {initialData ? 'Edit Task Details' : 'Create New Task'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {initialData ? `Editing task ${initialData.taskCode || initialData.id}` : 'Assign operational work, set deadlines, and configure reminders.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Core dampness test on podium slab"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Task Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide clear execution instructions..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned To *</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {employees.filter((e) => e.status === 'Active').map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
              <label className="block font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Deadline *</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Automatic Reminder</label>
              <select
                value={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="On deadline day">On deadline day (09:00 AM)</option>
                <option value="1 day before deadline">1 day before deadline</option>
                <option value="2 days before deadline">2 days before deadline</option>
                <option value="1 hour before deadline">1 hour before deadline</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Assigned By: <strong>{initialData ? (initialData.assignedBy || currentUser.name) : currentUser.name}</strong></span>
            <span className="text-slate-400">System Logged</span>
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-sm shadow-amber-600/20 flex items-center gap-1.5"
            >
              {initialData ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{initialData ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
