'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCrm } from '@/context/CrmContext';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setDemoRole } = useCrm();

  const [email, setEmail] = useState('admin@swaatienterprises.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleLogin = (role) => {
    setDemoRole(role);
    router.push('/dashboard');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleRoleLogin('ADMIN');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Badge */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl shadow-blue-600/30">
            SE
          </div>
        </div>

        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Swaati Enterprises
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          Internal CRM & Business Operating System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          {/* Quick Demo Role Selector */}
          <div className="mb-8 p-4 bg-slate-900/80 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Demo Role Quick Access:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleLogin('ADMIN')}
                className="py-2.5 px-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-semibold transition-all text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleLogin('MANAGER')}
                className="py-2.5 px-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold transition-all text-center"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleRoleLogin('EMPLOYEE')}
                className="py-2.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-all text-center"
              >
                Employee
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-3 text-slate-400 font-medium">Or Sign In Manually</span>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleFormSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 font-medium">Remember me</span>
              </label>

              <a href="#" className="font-semibold text-blue-400 hover:text-blue-300">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-600/30 transition-all text-sm"
            >
              <span>Sign In to CRM Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 font-medium">
          Authorized Swaati Enterprises personnel only • Confidential
        </p>
      </div>
    </div>
  );
}
