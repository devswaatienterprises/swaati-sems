'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, Send, CheckSquare, MessageSquare } from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function EndOfDayTaskModal({
  isOpen,
  tasks = [],
  onClose,
  onSubmit,
}) {
  const { t } = useCrm();
  // State for each task: { [taskId]: { status: string, note: string } }
  const [taskUpdates, setTaskUpdates] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && tasks.length > 0) {
      const initial = {};
      tasks.forEach((t) => {
        initial[t.id] = {
          taskId: t.id,
          title: t.title,
          taskCode: t.taskCode,
          assignedById: t.assignedById || t.assignedByEmployeeId,
          assignedBy: t.assignedBy,
          status: t.status === 'Completed' ? 'Completed' : t.status || 'In Progress',
          note: '',
        };
      });
      setTaskUpdates(initial);
      setErrorMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen, tasks]);

  if (!isOpen || !tasks || tasks.length === 0) return null;

  const handleStatusChange = (taskId, newStatus) => {
    setTaskUpdates((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        status: newStatus,
      },
    }));
  };

  const handleNoteChange = (taskId, note) => {
    setTaskUpdates((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        note,
      },
    }));
  };

  // Validation: Every task that is NOT Completed must have a non-empty note
  const allTasksValid = tasks.every((t) => {
    const update = taskUpdates[t.id];
    if (!update) return false;
    if (update.status === 'Completed') return true;
    return update.note && update.note.trim().length > 0;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Double check validation
    for (const t of tasks) {
      const update = taskUpdates[t.id];
      if (update?.status !== 'Completed' && (!update?.note || !update.note.trim())) {
        setErrorMessage(`Please provide an update note for: "${t.title}"`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const updatesList = Object.values(taskUpdates).map((u) => ({
        taskId: u.taskId,
        status: u.status,
        updateNote: u.note?.trim() || '',
      }));

      await onSubmit(updatesList);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to complete check out. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {t('tasks.eod.title', 'You have tasks due today')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {t('tasks.eod.subtitle', 'End-of-Day check: Please review your pending tasks before checking out')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Prompt */}
        <div className="px-6 pt-4">
          <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
            <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {t('tasks.eod.prompt', 'For tasks you have finished today, mark them as Completed. For any task that remains in progress, provide a short Update / Reason which will be sent directly to the task assigner.')}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Task List Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {tasks.map((task) => {
            const update = taskUpdates[task.id] || { status: task.status, note: '' };
            const isCompleted = update.status === 'Completed';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50 border-slate-200 shadow-2xs'
                }`}
              >
                {/* Task Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <span>{task.title}</span>
                      {task.taskCode && (
                        <span className="font-mono text-[10px] text-slate-500 font-semibold">
                          ({task.taskCode})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t('tasks.eod.assigned_by', 'Assigned by:')} <strong className="text-slate-700">{task.assignedBy || 'Admin'}</strong> • {t('tasks.eod.priority', 'Priority:')} <span className="font-semibold text-slate-700">{task.priority}</span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <label className="text-[11px] font-bold text-slate-600">{t('tasks.eod.status', 'Status:')}</label>
                    <select
                      value={update.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="To Do">{t('tasks.status.todo', 'To Do')}</option>
                      <option value="In Progress">{t('tasks.status.in_progress', 'In Progress')}</option>
                      <option value="Completed">{t('tasks.status.completed', 'Completed')}</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Note or Completed State */}
                {isCompleted ? (
                  <div className="p-2.5 bg-emerald-100/60 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('tasks.eod.completed_note', 'Marked as Completed — No update note required.')}</span>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {t('tasks.eod.update_label', 'Update / Reason for Task Assigner *')}
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={update.note || ''}
                      onChange={(e) => handleNoteChange(task.id, e.target.value)}
                      placeholder={t('tasks.eod.update_placeholder', 'Provide quick progress update or reason why task is pending...')}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-medium"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>This update will be sent directly to {task.assignedBy || 'the task assigner'} as a message.</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg text-xs transition-colors"
            >
              {t('common.buttons.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={!allTasksValid || isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? t('tasks.eod.submitting_btn', 'Submitting Updates...') : t('tasks.eod.submit_btn', 'Submit Updates & Complete Check Out')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
