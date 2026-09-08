import './globals.css';
import { CrmProvider } from '@/context/CrmContext';

export const metadata = {
  title: 'SEMS - Swaati Enterprises Management System',
  description: 'SEMS (Swaati Enterprises Management System) - Task Management & CRM Operating System',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/favicon.ico' },
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/images/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-100">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
      </head>
      <body className="h-full antialiased text-slate-800 font-sans">
        <CrmProvider>{children}</CrmProvider>
      </body>
    </html>
  );
}
