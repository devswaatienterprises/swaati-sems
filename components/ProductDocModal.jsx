import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Globe2, RefreshCw } from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function ProductDocModal({
  isOpen,
  onClose,
  product,
  existingDoc = null,
  onSave,
}) {
  const { t } = useCrm();
  const [formData, setFormData] = useState({
    title: '',
    docType: 'Datasheet',
    fileName: '',
    version: 'v1.0',
    fileSize: '',
    fileUrl: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (existingDoc) {
        setFormData({
          title: existingDoc.title || '',
          docType: existingDoc.docType || 'Datasheet',
          fileName: existingDoc.fileName || '',
          version: existingDoc.version
            ? `v${(parseFloat(existingDoc.version.replace('v', '')) + 0.1).toFixed(1)}`
            : 'v1.0',
          fileSize: existingDoc.fileSize || '1.4 MB',
          fileUrl: existingDoc.fileUrl || '/datasheets/sample.pdf',
        });
      } else {
        setFormData({
          title: '',
          docType: 'Datasheet',
          fileName: '',
          version: 'v1.0',
          fileSize: '',
          fileUrl: '',
        });
      }
      setSelectedFile(null);
    }
  }, [isOpen, existingDoc, product]);

  if (!isOpen || !product) return null;

  const isReplacing = !!existingDoc;

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: `${sizeMB} MB`,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      return;
    }
    onSave(product.id, existingDoc?.id, formData, selectedFile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
              isReplacing ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'
            }`}>
              {isReplacing ? <RefreshCw className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {isReplacing ? t('products.modal_replace_title', 'Replace Product Document') : t('products.modal_upload_title', 'Upload Product Document')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[240px]">
                {product.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Website Sync Notification Banner */}
        <div className="px-6 pt-4">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-emerald-800 text-[11px] flex items-start gap-2">
            <Globe2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{t('products.single_source_truth', 'Single Source of Truth: Uploading or replacing this file will instantly update the active download on the public website.')}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">{t('products.doc_title', 'Document Title')} *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('products.doc_title', 'Document Title')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('products.doc_type', 'Document Type')} *</label>
              <select
                value={formData.docType}
                onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Datasheet">{t('products.doc_type_datasheet', 'Datasheet (TDS)')}</option>
                <option value="Brochure">{t('products.doc_type_brochure', 'Brochure')}</option>
                <option value="Method Statement">{t('products.doc_type_method_statement', 'Method Statement')}</option>
                <option value="Test Certificate">{t('products.doc_type_test_certificate', 'Test Certificate')}</option>
                <option value="Other">{t('products.doc_type_other', 'Other')}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('products.version', 'Version')}</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g. v2.1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* File Selector */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-800 text-xs mb-1">
              {formData.fileName || t('common.no_file_selected', 'No file selected')}
            </div>
            <div className="text-[10px] text-slate-400 mb-3">PDF, DOC, WEBP, PNG up to 10MB</div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>{t('products.choose_file', 'Choose Document File')}</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.webp"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 ${
                isReplacing
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isReplacing ? t('products.replace_live', 'Replace & Update Live') : t('products.upload_doc', 'Upload Document')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
