'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Activity,
  Calendar,
  User,
  Shield,
  Loader2,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function EmployeeActivityModal({ isOpen, onClose, employee }) {
  const { getEmployeeActivityLogs, t } = useCrm();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employee?.id) {
      setLoading(true);
      getEmployeeActivityLogs(employee.id)
        .then((data) => {
          setLogs(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error('Failed to fetch activity logs:', err);
          setLogs([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLogs([]);
    }
  }, [isOpen, employee?.id]);

  if (!isOpen || !employee) return null;

  const getActionBadgeColor = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('REGISTER')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('DEACTIVATE')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MODIFY') || act.includes('PATCH')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    if (act.includes('CHECK_IN') || act.includes('CHECK_OUT') || act.includes('ATTENDANCE')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base">{t('employees.activity.title', 'Activity History')}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                  {t('employees.activity.admin_only', 'Admin Only')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t('employees.activity.subtitle', 'Audit and activity trail for')} <span className="font-semibold text-slate-700">{employee.name}</span> ({employee.id || employee.employeeCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee Mini Card */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">{t('employees.activity.dept', 'Department:')}</span>
            <span className="font-semibold text-slate-700">{employee.department || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">{t('employees.activity.designation', 'Designation:')}</span>
            <span className="font-semibold text-slate-700">{employee.designation || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">{t('employees.activity.role', 'Role:')}</span>
            <span className="font-semibold text-slate-700 font-mono">{employee.role || 'STAFF'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-medium text-slate-500">{t('employees.activity.loading', 'Loading activity records...')}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Activity className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-700 text-sm">{t('employees.activity.no_records', 'No activity records found')}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {t('employees.activity.no_records_desc', 'There are no recorded system actions or audit logs for this team member yet.')}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                {t('employees.activity.timeline', 'Timeline')} ({logs.length} record{logs.length === 1 ? '' : 's'})
              </div>
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                {logs.map((log) => {
                  let metaString = '';
                  if (log.metadata) {
                    if (typeof log.metadata === 'string') {
                      metaString = log.metadata;
                    } else if (typeof log.metadata === 'object') {
                      try {
                        metaString = JSON.stringify(log.metadata, null, 2);
                      } catch {
                        metaString = String(log.metadata);
                      }
                    }
                  }

                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-500 ring-4 ring-white" />

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {log.time}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          {log.entityType && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <span className="font-medium text-slate-400">{t('employees.activity.target', 'Target:')}</span>
                              <span className="font-mono font-semibold text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="font-medium text-slate-400">{t('employees.activity.performed_by', 'Performed by:')}</span>
                            <span className="font-medium text-slate-700">{log.performedBy}</span>
                          </div>

                          {metaString && (
                            <div className="mt-2 pt-2 border-t border-slate-200/60">
                              <pre className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 overflow-x-auto whitespace-pre-wrap">
                                {metaString}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            {t('common.buttons.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}
