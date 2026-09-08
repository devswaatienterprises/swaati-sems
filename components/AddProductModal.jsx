'use client';

import React, { useState } from 'react';
import { X, PackagePlus, Plus, AlertCircle } from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

const DEFAULT_CATEGORIES = [
  'Waterproofing Systems',
  'Concrete Admixtures',
  'Tile Adhesives & Grouts',
  'Industrial Flooring',
  'Structural Repair & Grouts',
  'Sealants & Joint Fillers',
  'Protective Coatings',
  'Surface Treatments',
];

export default function AddProductModal({ isOpen, onClose, onSave }) {
  const { t } = useCrm();
  const [formData, setFormData] = useState({
    name: '',
    productCode: '',
    brand: 'Swaati Enterprises',
    category: 'Waterproofing Systems',
    productType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Product Name is required.');
      return;
    }

    if (!formData.productCode.trim()) {
      setErrorMsg('Product Code is required.');
      return;
    }

    if (!formData.category.trim()) {
      setErrorMsg('Category is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSave({
        name: formData.name.trim(),
        productCode: formData.productCode.trim().toUpperCase(),
        brand: (formData.brand || 'Swaati Enterprises').trim(),
        category: formData.category.trim(),
        productType: formData.productType ? formData.productType.trim() : '',
      });

      if (result && result.success === false) {
        setErrorMsg(result.message || 'Failed to create product. Product code might already be in use.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setFormData({
        name: '',
        productCode: '',
        brand: 'Swaati Enterprises',
        category: 'Waterproofing Systems',
        productType: '',
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while creating the product.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {t('products.modal.add_product_title', 'Add New Product')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Register a new item in the SEMS Product & Datasheet Library
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Product Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t('products.label.product_name', 'Product Name *')}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setErrorMsg('');
                setFormData({ ...formData, name: e.target.value });
              }}
              placeholder="e.g. MasterSeal 501 / SwaatiProof WP-100"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Code */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('products.label.product_code', 'Product Code *')}
              </label>
              <input
                type="text"
                required
                value={formData.productCode}
                onChange={(e) => {
                  setErrorMsg('');
                  setFormData({ ...formData, productCode: e.target.value.toUpperCase() });
                }}
                placeholder="e.g. PROD-010 / SW-WP501"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs uppercase"
              />
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                Must be unique across the catalog
              </span>
            </div>

            {/* Brand */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('products.label.brand', 'Brand')}
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Swaati Enterprises / Master Builders"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t('products.label.category', 'Category *')}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs cursor-pointer"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description / Product Details */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t('products.label.description', 'Description / Product Details (Optional)')}
            </label>
            <textarea
              rows={3}
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
              placeholder="e.g. Crystalline waterproofing coating for concrete structures and basements..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t('common.buttons.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {isSubmitting ? 'Saving...' : t('products.btn.save_product', 'Save Product')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
