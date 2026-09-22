'use client';

import React, { useState, useEffect } from 'react';
import { useCrm } from '@/context/CrmContext';
import {
  X,
  Shield,
  Plus,
  Trash2,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';

export default function RoleModal({ isOpen, onClose, onSave, editingRole = null }) {
  const { departments, t } = useCrm();

  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingRole) {
      setName(editingRole.name || '');
      setDepartmentId(editingRole.departmentId || editingRole.department?.id || '');
      setDescription(editingRole.description || '');
      setActive(editingRole.active !== false);

      const tasks = (editingRole.recurringTasks || []).map((t) => ({
        id: t.id,
        title: t.title || '',
        description: t.description || '',
        priority: t.priority || 'MEDIUM',
        frequency: t.frequency || 'DAILY',
        daysOfWeek: Array.isArray(t.daysOfWeek) ? t.daysOfWeek : [1],
        dayOfMonth: t.dayOfMonth || 1,
        dueTime: t.dueTime || '18:30',
        workingDaysOnly: t.workingDaysOnly !== false,
        active: t.active !== false,
      }));
      setRecurringTasks(tasks);
    } else {
      setName('');
      // Default to first active department
      const firstDept = (departments || []).find((d) => d.active);
      setDepartmentId(firstDept?.id || '');
      setDescription('');
      setActive(true);
      setRecurringTasks([]);
    }
    setErrorMessage('');
  }, [editingRole, departments, isOpen]);

  if (!isOpen) return null;

  const handleAddTask = () => {
    setRecurringTasks((prev) => [
      ...prev,
      {
        id: null,
        title: '',
        description: '',
        priority: 'MEDIUM',
        frequency: 'DAILY',
        daysOfWeek: [1], // Monday default
        dayOfMonth: 1,
        dueTime: '18:30',
        workingDaysOnly: true,
        active: true,
      },
    ]);
  };

  const handleRemoveTask = (index) => {
    setRecurringTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index, field, value) => {
    setRecurringTasks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleToggleDayOfWeek = (taskIndex, dayNum) => {
    setRecurringTasks((prev) => {
      const updated = [...prev];
      const task = updated[taskIndex];
      const currentDays = task.daysOfWeek || [];
      const exists = currentDays.includes(dayNum);
      const newDays = exists ? currentDays.filter((d) => d !== dayNum) : [...currentDays, dayNum].sort();
      updated[taskIndex] = { ...task, daysOfWeek: newDays.length > 0 ? newDays : [dayNum] };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage(t('settings.role_name_required', 'Role name is required'));
      return;
    }

    if (!departmentId) {
      setErrorMessage(t('settings.select_department_required', 'Please select a department'));
      return;
    }

    // Validate recurring tasks
    for (let i = 0; i < recurringTasks.length; i++) {
      if (!recurringTasks[i].title.trim()) {
        setErrorMessage(`Recurring Task #${i + 1} requires a Title.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        departmentId,
        description: description.trim(),
        active,
        recurringTasks,
      };

      const res = await onSave(payload, editingRole?.id);
      if (res?.success) {
        onClose();
      } else {
        setErrorMessage(res?.message || 'Failed to save role configuration');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Server connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekDayNames = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' },
    { num: 7, label: 'Sun' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>{editingRole ? 'Edit Role & Recurring Tasks' : 'Create Role & Recurring Tasks'}</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Basic Role Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Role Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Site Engineer, Operations Manager"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="">Select Department</option>
                {(departments || [])
                  .filter((d) => d.active || d.id === departmentId)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {!d.active ? '(Inactive)' : ''}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description (Optional)</label>
            <input
              type="text"
              placeholder="Responsibilities and key scope of this role..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="roleActive"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <label htmlFor="roleActive" className="font-bold text-slate-700 cursor-pointer">
              Active Role Status
            </label>
          </div>

          {/* Configured Role Recurring Tasks Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-blue-600" />
                  <span>Role-Based Recurring Tasks (Auto-Assigned to Employees)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Employees assigned to this role automatically inherit these tasks on scheduled days.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center gap-1 shrink-0 border border-blue-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {recurringTasks.map((task, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Task #{idx + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                      title="Remove Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Daily Site Inspection & Checklist"
                        value={task.title}
                        onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                        <select
                          value={task.frequency}
                          onChange={(e) => handleTaskChange(idx, 'frequency', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="MONTHLY">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Priority</label>
                        <select
                          value={task.priority}
                          onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Frequency Schedule details */}
                  {task.frequency === 'WEEKLY' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Active Days of Week</label>
                      <div className="flex items-center gap-1.5">
                        {weekDayNames.map((d) => {
                          const isSelected = (task.daysOfWeek || []).includes(d.num);
                          return (
                            <button
                              type="button"
                              key={d.num}
                              onClick={() => handleToggleDayOfWeek(idx, d.num)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {task.frequency === 'MONTHLY' && (
                    <div className="w-36">
                      <label className="block font-bold text-slate-700 mb-1">Day of Month (1-31)</label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={task.dayOfMonth}
                        onChange={(e) => handleTaskChange(idx, 'dayOfMonth', parseInt(e.target.value, 10))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Daily Due Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 18:30 or 06:30 PM"
                        value={task.dueTime}
                        onChange={(e) => handleTaskChange(idx, 'dueTime', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={task.workingDaysOnly}
                          onChange={(e) => handleTaskChange(idx, 'workingDaysOnly', e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>Skip Sundays</span>
                      </label>

                      <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={task.active}
                          onChange={(e) => handleTaskChange(idx, 'active', e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>Active</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {recurringTasks.length === 0 && (
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
                  No recurring task templates configured for this role yet. Click "+ Add Task" to set up auto-assigned recurring SOPs.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm shadow-blue-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
