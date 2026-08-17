import './globals.css';
import { CrmProvider } from '@/context/CrmContext';

export const metadata = {
  title: 'Swaati Enterprises - Internal CRM Operating System',
  description: 'Internal Management System for Swaati Enterprises',
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
