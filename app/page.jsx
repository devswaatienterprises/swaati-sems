'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCrm } from '@/context/CrmContext';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, t } = useCrm();

  // Login Mode: 'ADMIN' (Email) | 'EMPLOYEE' (User ID)
  const [loginMode, setLoginMode] = useState('ADMIN');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleModeChange = (mode) => {
    setLoginMode(mode);
    setErrorMessage('');
    setCredential('');
    setPassword('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = await login(credential.trim(), password, loginMode);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setErrorMessage(result.message || t('auth.invalid_credentials', 'Invalid credentials provided. Please check and try again.'));
    }
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
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center p-2.5 shadow-xl shadow-black/20 shrink-0">
            <Image
              src="/images/se-logo.webp"
              alt="Swaati Enterprises Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          {t('auth.portal_title', 'SEMS Portal')}
        </h2>
        <p className="mt-1.5 text-center text-sm font-semibold text-blue-400">
          {t('auth.portal_subtitle', 'Swaati Enterprises Management System')}
        </p>
        <p className="mt-1 text-center text-xs text-slate-400 font-medium">
          {t('auth.portal_description', 'Task Management & Business Operating System')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          {/* Persona Access Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-700/80 mb-6">
            <button
              type="button"
              onClick={() => handleModeChange('ADMIN')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'ADMIN'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('auth.admin_login_tab', 'Admin Login')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('EMPLOYEE')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'EMPLOYEE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('auth.employee_login_tab', 'Team Member Login')}</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4 text-xs" onSubmit={handleFormSubmit}>
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                {loginMode === 'ADMIN' ? t('auth.admin_email_label', 'Admin Email Address') : t('auth.employee_userid_label', 'Team Member User ID')}
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  {loginMode === 'ADMIN' ? <Mail className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <input
                  type={loginMode === 'ADMIN' ? 'email' : 'text'}
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder={loginMode === 'ADMIN' ? 'admin@swaatienterprises.in' : 'e.g. amit.v'}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs font-medium"
                  required
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                {loginMode === 'ADMIN'
                  ? t('auth.admin_email_help', 'Login using registered administrator email')
                  : t('auth.employee_userid_help', 'Enter the User ID provided by your administrator')}
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                {t('auth.password_label', 'Password')}
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder', 'Enter account password')}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs font-medium"
                  required
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 text-white font-bold rounded-lg shadow-lg transition-all text-xs cursor-pointer ${
                loginMode === 'ADMIN'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <span>{loginMode === 'ADMIN' ? t('auth.sign_in_admin', 'Sign In as Admin') : t('auth.sign_in_employee', 'Sign In as Team Member')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 font-medium">
          {t('auth.footer_note', 'Authorized Swaati Enterprises team members only • No public registration')}
        </p>
      </div>
    </div>
  );
}
