'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import TaskModal from '@/components/TaskModal';
import { useCrm } from '@/context/CrmContext';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  Calendar,
  AlertTriangle,
  User,
  CheckCircle2,
} from 'lucide-react';

export default function TasksPage() {
  const { currentRole, tasks, addTask, updateTaskStatus } = useCrm();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const kanbanColumns = ['To Do', 'In Progress', 'Completed', 'Overdue'];

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-600" />
            <span>Task Allocation & Site Operations</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track site surveys, technical documentation, trial applications, and client calls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table List
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
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
            placeholder="Search task title, assigned employee, ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Priority:
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kanbanColumns.map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);

            return (
              <div
                key={colStatus}
                className="bg-slate-200/50 rounded-2xl p-4 border border-slate-200 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-300">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wider">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      colStatus === 'Completed'
                        ? 'bg-emerald-500'
                        : colStatus === 'In Progress'
                        ? 'bg-blue-500'
                        : colStatus === 'Overdue'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}></span>
                    <span>{colStatus}</span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 text-[11px] font-bold flex items-center justify-center">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-xs font-medium">
                      No tasks in {colStatus}
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-slate-400">{t.id}</span>
                          <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] uppercase ${
                            t.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-700'
                              : t.priority === 'High'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        <div className="font-bold text-slate-800 text-xs leading-snug">{t.title}</div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <User className="w-3 h-3 text-slate-400" /> {t.assignedTo}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-slate-400" /> {t.dueDate}
                          </span>
                        </div>

                        {/* Interactive Status Switcher */}
                        <div className="pt-2 flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Move:</span>
                          {kanbanColumns
                            .filter((c) => c !== colStatus)
                            .map((targetCol) => (
                              <button
                                key={targetCol}
                                onClick={() => updateTaskStatus(t.id, targetCol)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                              >
                                {targetCol === 'In Progress' ? 'Progress' : targetCol}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Task</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{t.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{t.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{t.category}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{t.assignedTo}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        t.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : t.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{t.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        t.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : t.status === 'Overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={t.status}
                        onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-xs"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addTask}
      />
    </Shell>
  );
}
