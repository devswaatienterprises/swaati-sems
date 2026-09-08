'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import EndOfDayTaskModal from './EndOfDayTaskModal';
import { useCrm } from '@/context/CrmContext';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function Shell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentRole,
    hasPermission,
    isAuthenticated,
    isLoadingAuth,
    isEndOfDayModalOpen,
    endOfDayTasks,
    closeEndOfDayModal,
    submitEndOfDayCheckOut,
    t,
  } = useCrm();

  React.useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  // Map route to permission key
  const routePermissionMap = {
    '/dashboard': 'dashboard',
    '/employees': 'adminOnly',
    '/attendance': 'attendance',
    '/leave': 'leave',
    '/tasks': 'tasks',
    '/leads': 'leads',
    '/products': 'products',
    '/reports': 'reports',
    '/notifications': 'notifications',
    '/messages': 'messaging',
    '/settings': null, // allowed for all (my profile)
  };

  const getRoutePermissionKey = () => {
    for (const [route, perm] of Object.entries(routePermissionMap)) {
      if (pathname === route || pathname.startsWith(route + '/')) {
        return perm;
      }
    }
    return null;
  };

  const requiredPerm = getRoutePermissionKey();
  const isAuthorized =
    currentRole === 'ADMIN' ||
    !requiredPerm ||
    (requiredPerm !== 'adminOnly' && hasPermission(requiredPerm));

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-slate-50">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 w-full">
          <div className="max-w-7xl w-full mx-auto">
            {!isAuthorized ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center shadow-xs max-w-xl mx-auto my-12">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
                  Access Restricted
                </h2>
                <p className="text-sm text-slate-600 font-medium mb-6">
                  {t('permission_denied')} {t('access_restricted')}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/dashboard"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Return to Dashboard</span>
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {/* End-of-Day Task Check Modal on Check Out */}
      <EndOfDayTaskModal
        isOpen={isEndOfDayModalOpen}
        tasks={endOfDayTasks}
        onClose={closeEndOfDayModal}
        onSubmit={submitEndOfDayCheckOut}
      />
    </div>
  );
}
