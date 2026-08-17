'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import {
  Package,
  Search,
  Upload,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export default function ProductsPage() {
  const { products } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadDatasheet = (productName) => {
    setToastMessage(`Datasheet upload placeholder triggered for ${productName}`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <Shell>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span>Product Catalog & Technical Datasheets</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Construction chemical product lines, manufacturer brands, and technical datasheets.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search product, brand, category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Datasheet File</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{prod.name}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{prod.category}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded bg-slate-100 font-bold text-slate-800">
                      {prod.brand}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {prod.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> {prod.datasheet}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{prod.updatedDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleUploadDatasheet(prod.name)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-[11px] flex items-center gap-1 ml-auto"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Datasheet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
