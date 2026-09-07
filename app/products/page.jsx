'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import ProductDocModal from '@/components/ProductDocModal';
import { useCrm } from '@/context/CrmContext';
import {
  FileSpreadsheet,
  Search,
  Upload,
  FileText,
  CheckCircle2,
  RefreshCw,
  Download,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';

export default function ProductsPage() {
  const {
    currentRole,
    products,
    uploadProductDocument,
    replaceProductDocument,
    getProductDocumentSignedUrl,
    deleteProductDocument,
    t,
  } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [expandedProductIds, setExpandedProductIds] = useState(new Set());

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (productId) => {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleUploadClick = (product, e) => {
    if (e) e.stopPropagation();
    setSelectedProduct(product);
    setSelectedDoc(null);
    setIsModalOpen(true);
  };

  const handleReplaceClick = (product, doc, e) => {
    if (e) e.stopPropagation();
    setSelectedProduct(product);
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  const handleSaveDoc = async (productId, docId, docData, file = null) => {
    if (docId) {
      await replaceProductDocument(productId, docId, docData, file);
      setToastMessage(`Document "${docData.fileName || docData.title}" updated to ${docData.version}!`);
    } else {
      await uploadProductDocument(productId, docData, file);
      setToastMessage(`New document "${docData.fileName || docData.title}" uploaded successfully!`);
    }
    setExpandedProductIds((prev) => new Set(prev).add(productId));
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleDownloadDoc = async (productId, doc, e) => {
    if (e) e.stopPropagation();
    setToastMessage(`Generating secure download link for ${doc.fileName || doc.title}...`);
    try {
      const signedUrl = await getProductDocumentSignedUrl(productId, doc.id);
      if (signedUrl) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
        setToastMessage(`Opened ${doc.fileName || doc.title} in new tab.`);
      } else if (doc.fileUrl) {
        window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
      } else {
        setToastMessage('Download link unavailable.');
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to get download URL.');
    }
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDeleteDoc = (productId, docId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this document?')) {
      deleteProductDocument(productId, docId);
      setToastMessage('Document deleted.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const getDocTypesSummary = (docs) => {
    if (!docs || docs.length === 0) return '0 Documents';
    const types = Array.from(new Set(docs.map((d) => d.docType || 'TDS'))).join(' · ');
    return `${docs.length} Doc${docs.length > 1 ? 's' : ''} (${types})`;
  };

  return (
    <Shell>
      {/* Upload / Replace Document Modal */}
      <ProductDocModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
          setSelectedDoc(null);
        }}
        product={selectedProduct}
        existingDoc={selectedDoc}
        onSave={handleSaveDoc}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>Product Documents & Technical Library</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Single source of truth for technical datasheets, method statements, brochures, and compliance certifications.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products, brands, datasheets, product codes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing <strong className="text-slate-900">{filteredProducts.length}</strong> products • Click any row to view documents
        </div>
      </div>

      {/* Main Product Documents Table (Focused on: Product | Brand | Category | Documents) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 min-w-[260px]">Product</th>
                <th className="py-3.5 px-4 min-w-[130px]">Brand</th>
                <th className="py-3.5 px-4 min-w-[180px]">Category</th>
                <th className="py-3.5 px-4 min-w-[180px]">Documents</th>
                <th className="py-3.5 px-4 w-12 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    No products found matching &quot;{searchTerm}&quot;.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isExpanded = expandedProductIds.has(prod.id);
                  const hasDocs = prod.documents && prod.documents.length > 0;
                  const docCount = prod.documents ? prod.documents.length : 0;

                  return (
                    <React.Fragment key={prod.id}>
                      {/* Interactive Product Row */}
                      <tr
                        onClick={() => toggleExpand(prod.id)}
                        className={`hover:bg-slate-50/90 cursor-pointer transition-colors ${
                          isExpanded ? 'bg-blue-50/40' : ''
                        }`}
                        title="Click to view product technical documents"
                      >
                        {/* Product */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 leading-snug">{prod.name}</div>
                          <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                            {prod.productCode}
                          </div>
                        </td>

                        {/* Brand */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px] border border-slate-200">
                            {prod.brand}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="font-semibold text-slate-800">{prod.category}</div>
                          {prod.productType && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{prod.productType}</div>
                          )}
                        </td>

                        {/* Documents */}
                        <td className="py-3.5 px-4">
                          {hasDocs ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              <span>{getDocTypesSummary(prod.documents)}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">0 documents</span>
                          )}
                        </td>

                        {/* Expand Indicator */}
                        <td className="py-3.5 px-4 text-right text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-blue-600 inline-block" />
                          ) : (
                            <ChevronDown className="w-4 h-4 inline-block" />
                          )}
                        </td>
                      </tr>

                      {/* Detail View Drawer on Row Click */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={5} className="py-4 px-4 sm:px-8">
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                  <FileCheck className="w-4 h-4 text-blue-600" />
                                  <span>Available Technical Documents for {prod.name} ({docCount})</span>
                                </div>

                                {currentRole === 'ADMIN' && (
                                  <button
                                    onClick={(e) => handleUploadClick(prod, e)}
                                    className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-xs inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Upload Document</span>
                                  </button>
                                )}
                              </div>

                              {(!prod.documents || prod.documents.length === 0) ? (
                                <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-400 text-xs font-medium space-y-1">
                                  <div>No documents currently uploaded for this product.</div>
                                  {currentRole === 'ADMIN' && (
                                    <button
                                      onClick={(e) => handleUploadClick(prod, e)}
                                      className="text-blue-600 font-bold text-xs hover:underline inline-block mt-1"
                                    >
                                      Upload Technical Datasheet (TDS)
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {prod.documents.map((doc) => (
                                    <div
                                      key={doc.id}
                                      className="p-3.5 bg-slate-50 hover:bg-slate-100/90 rounded-xl border border-slate-200/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                    >
                                      {/* Document Info */}
                                      <div className="flex items-start sm:items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-xs">
                                          <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                                            <span>{doc.title}</span>
                                            <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">
                                              {doc.version}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-500">
                                              ({doc.docType})
                                            </span>
                                          </div>
                                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                            {doc.fileName} • {doc.fileSize} • Uploaded by {doc.uploadedBy} on {doc.uploadedDate}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Document Action Buttons in Detail View */}
                                      <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <button
                                          onClick={(e) => handleDownloadDoc(prod.id, doc, e)}
                                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                                        >
                                          <Download className="w-3.5 h-3.5 text-blue-600" />
                                          <span>Download</span>
                                        </button>

                                        {currentRole === 'ADMIN' && (
                                          <>
                                            <button
                                              onClick={(e) => handleReplaceClick(prod, doc, e)}
                                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                                              title="Replace with updated version"
                                            >
                                              <RefreshCw className="w-3.5 h-3.5" />
                                              <span>Replace</span>
                                            </button>

                                            <button
                                              onClick={(e) => handleDeleteDoc(prod.id, doc.id, e)}
                                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                              title="Delete Document"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
