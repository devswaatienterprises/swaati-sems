import './globals.css';
import { CrmProvider } from '@/context/CrmContext';

export const metadata = {
  title: 'SEMS - Swaati Enterprises Management System',
  description: 'SEMS (Swaati Enterprises Management System) - Task Management & CRM Operating System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-100">
      <body className="h-full antialiased text-slate-800 font-sans">
        <CrmProvider>{children}</CrmProvider>
      </body>
    </html>
  );
}
