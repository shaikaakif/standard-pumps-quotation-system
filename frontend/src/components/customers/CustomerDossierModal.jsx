import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiX,
  FiPhone,
  FiCopy,
  FiShoppingBag,
  FiFileText,
  FiAward,
  FiCalendar,
  FiArrowRight,
  FiExternalLink,
  FiTrash2
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import { useQuotation } from "../../context/QuotationContext";
import customerService from "../../services/customerService";

export default function CustomerDossierModal({
  customer: initialCustomer,
  isOpen,
  onClose,
  onCustomerDeleted,
  onCustomerUpdated,
}) {
  const navigate = useNavigate();
  const { saveInvoice, saveQuotation, setIsNewQuotation, setActiveDocType } = useQuotation();
  const [activeTab, setActiveTab] = useState("items"); // 'items' | 'invoices' | 'quotations'
  const [customer, setCustomer] = useState(initialCustomer);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null); // { type: 'customer' | 'invoice' | 'quotation', data: ... }

  useEffect(() => {
    setCustomer(initialCustomer);
  }, [initialCustomer]);

  if (!isOpen || !customer) return null;

  const handleCopyPhone = () => {
    if (!customer.phone) return;
    navigator.clipboard.writeText(customer.phone);
    toast.success(`Copied: ${customer.phone}`);
  };

  const handleWhatsApp = () => {
    if (!customer.phone) {
      toast.error("No phone number found for this customer.");
      return;
    }
    const cleanPhone = customer.phone.replace(/\D/g, "");
    const formattedTarget = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(
      `Hello ${customer.name || "Customer"}, this is Shaik Asif from Standard Pumps & Borewells, Hyderabad. Thank you for your business! Please let us know if you need any pump maintenance, spare parts, or water testing assistance.`
    );
    window.open(`https://wa.me/${formattedTarget}?text=${message}`, "_blank");
  };

  const handleCall = () => {
    if (!customer.phone) return;
    window.open(`tel:${customer.phone}`, "_self");
  };

  const handleReopenInvoice = (inv) => {
    saveInvoice(inv);
    setIsNewQuotation(false);
    setActiveDocType("INVOICE");
    toast.success(`Opened Invoice #${inv.invoice_number}`);
    onClose();
    navigate("/preview");
  };

  const handleReopenQuotation = (q) => {
    saveQuotation(q);
    setIsNewQuotation(false);
    setActiveDocType("QUOTATION");
    toast.success("Opened Quotation");
    onClose();
    navigate("/preview");
  };

  const handleDeleteProfile = async () => {
    if (!customer) return;
    setIsDeleting(true);
    try {
      await customerService.deleteCustomer(customer);
      toast.success(`Deleted customer profile: ${customer.name}`);
      onCustomerDeleted?.(customer);
      onClose();
    } catch (e) {
      console.error("Delete customer profile error:", e);
      toast.error("Failed to delete customer profile.");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteTarget(null);
    }
  };

  const handleDeleteInvoice = async (inv) => {
    setIsDeleting(true);
    try {
      const invId = inv.invoice_number || inv.invoice_id || inv.id;
      await customerService.deleteInvoice(invId);
      toast.success(`Deleted Invoice #${inv.invoice_number || invId}`);

      // Update local state in modal
      setCustomer((prev) => {
        if (!prev) return prev;
        const newInvoices = (prev.invoices || []).filter(
          (i) => i.invoice_number !== inv.invoice_number && i.invoice_id !== inv.invoice_id
        );
        const invTotal = parseFloat(inv.grand_total) || 0;
        const newSpend = Math.max(0, (prev.totalSpend || 0) - invTotal);
        const newItems = (prev.itemsBought || []).filter(
          (item) => item.invoiceNumber !== inv.invoice_number
        );
        return {
          ...prev,
          invoices: newInvoices,
          totalSpend: newSpend,
          itemsBought: newItems,
          tier: newInvoices.length > 0 ? prev.tier : (prev.quotations?.length > 0 ? "Lead" : "Lead"),
        };
      });

      onCustomerUpdated?.();
    } catch (e) {
      console.error("Delete invoice error:", e);
      toast.error("Failed to delete invoice.");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteTarget(null);
    }
  };

  const handleDeleteQuotation = async (q) => {
    setIsDeleting(true);
    try {
      const qId = q.quotation_id || q.id;
      await customerService.deleteQuotation(qId);
      toast.success(`Deleted Quotation (${q.feet} FT)`);

      // Update local state in modal
      setCustomer((prev) => {
        if (!prev) return prev;
        const newQuotes = (prev.quotations || []).filter(
          (item) => item.quotation_id !== q.quotation_id && item.id !== q.id
        );
        return {
          ...prev,
          quotations: newQuotes,
        };
      });

      onCustomerUpdated?.();
    } catch (e) {
      console.error("Delete quotation error:", e);
      toast.error("Failed to delete quotation.");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteTarget(null);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "SP";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const getTierBadge = (tier) => {
    if (tier === "VIP") {
      return (
        <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <FiAward className="w-3.5 h-3.5 text-amber-600" />
          <span>VIP Client</span>
        </span>
      );
    }
    if (tier === "Buyer") {
      return (
        <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 border border-green-300 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <FiShoppingBag className="w-3.5 h-3.5 text-green-600" />
          <span>Verified Buyer</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
        <FiFileText className="w-3.5 h-3.5 text-blue-600" />
        <span>Inquiry / Lead</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-navy-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-brand-gray-300 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-brand-navy-900 via-brand-primary to-brand-navy-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Dossier"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-accent text-brand-navy-900 flex items-center justify-center font-black text-xl shadow-md border-2 border-white/20 flex-shrink-0">
              {getInitials(customer.name)}
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
                  {customer.name}
                </h2>
                {getTierBadge(customer.tier)}
              </div>
              <p className="text-sm font-mono text-brand-navy-200 mt-1 flex items-center space-x-2">
                <span>{customer.displayPhone}</span>
              </p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-3.5 flex-wrap gap-y-2">
                <button
                  onClick={handleWhatsApp}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-transform active:scale-95 shadow-sm"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleCall}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-navy-700 hover:bg-brand-navy-600 text-white text-xs font-bold transition-transform active:scale-95 shadow-sm"
                >
                  <FiPhone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </button>

                <button
                  onClick={handleCopyPhone}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
                >
                  <FiCopy className="w-3.5 h-3.5" />
                  <span>Copy No.</span>
                </button>

                <button
                  onClick={() => setConfirmDeleteTarget({ type: "customer", data: customer })}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-600 text-red-200 hover:text-white text-xs font-bold transition-colors border border-red-500/30"
                  title="Delete Customer Profile"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  <span>Delete Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
            <div className="bg-white/10 rounded-xl p-2.5">
              <span className="block text-[10px] uppercase font-bold text-brand-navy-200 tracking-wider">
                Lifetime Spend
              </span>
              <span className="text-sm sm:text-base font-black text-brand-accent">
                {formatCurrency(customer.totalSpend)}
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5">
              <span className="block text-[10px] uppercase font-bold text-brand-navy-200 tracking-wider">
                Invoices
              </span>
              <span className="text-sm sm:text-base font-black text-white">
                {customer.invoices?.length || 0} Orders
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5">
              <span className="block text-[10px] uppercase font-bold text-brand-navy-200 tracking-wider">
                Quotations
              </span>
              <span className="text-sm sm:text-base font-black text-white">
                {customer.quotations?.length || 0} Estimates
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-brand-gray-200 bg-brand-gray-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab("items")}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors ${
              activeTab === "items"
                ? "border-brand-primary text-brand-primary bg-white rounded-t-lg shadow-sm"
                : "border-transparent text-brand-muted hover:text-brand-primary"
            }`}
          >
            <FiShoppingBag className="w-4 h-4" />
            <span>Items Bought ({customer.itemsBought?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors ${
              activeTab === "invoices"
                ? "border-brand-primary text-brand-primary bg-white rounded-t-lg shadow-sm"
                : "border-transparent text-brand-muted hover:text-brand-primary"
            }`}
          >
            <FiFileText className="w-4 h-4" />
            <span>Invoices ({customer.invoices?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("quotations")}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors ${
              activeTab === "quotations"
                ? "border-brand-primary text-brand-primary bg-white rounded-t-lg shadow-sm"
                : "border-transparent text-brand-muted hover:text-brand-primary"
            }`}
          >
            <FiCalendar className="w-4 h-4" />
            <span>Quotes ({customer.quotations?.length || 0})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-brand-gray-50/50 space-y-4">
          {/* TAB 1: ITEMS BOUGHT */}
          {activeTab === "items" && (
            <div>
              {!customer.itemsBought || customer.itemsBought.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-brand-gray-200 p-6">
                  <FiShoppingBag className="w-10 h-10 mx-auto text-brand-muted/40 mb-2" />
                  <h4 className="font-bold text-brand-navy-800 text-sm">No Invoiced Purchases Yet</h4>
                  <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
                    This client currently has quotation estimates. When an invoice is generated, the purchased equipment (motors, pipes, cables, panels) will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-muted uppercase tracking-wider px-1">
                    <span>Item / Equipment</span>
                    <span>Qty & Total</span>
                  </div>
                  {customer.itemsBought.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-brand-gray-200 p-3.5 flex items-center justify-between shadow-sm hover:border-brand-primary/40 transition-all"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-navy-50 text-brand-primary flex items-center justify-center font-bold text-xs flex-shrink-0 border border-brand-navy-100">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-navy-900 text-sm">{item.name}</h4>
                          <div className="flex items-center space-x-3 text-xs text-brand-muted mt-0.5">
                            <span>From Inv #{item.invoiceNumber || "N/A"}</span>
                            {item.date && <span>• {new Date(item.date).toLocaleDateString("en-IN")}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-brand-navy-900">
                          {formatCurrency(item.total)}
                        </div>
                        <div className="text-xs text-brand-muted font-medium">
                          Qty: {item.qty} {item.price ? `@ ₹${item.price}` : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVOICES HISTORY */}
          {activeTab === "invoices" && (
            <div className="space-y-3">
              {!customer.invoices || customer.invoices.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-brand-gray-200 p-6">
                  <FiFileText className="w-10 h-10 mx-auto text-brand-muted/40 mb-2" />
                  <p className="text-xs text-brand-muted">No invoices generated for this client yet.</p>
                </div>
              ) : (
                customer.invoices.map((inv, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-brand-gray-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-brand-navy-900 text-sm">
                          Invoice #{inv.invoice_number}
                        </span>
                        {inv.is_gst && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            GST 18%
                          </span>
                        )}
                        {inv.payment_mode && (
                          <span className="bg-gray-100 text-gray-700 text-[10px] font-medium px-1.5 py-0.5 rounded">
                            {inv.payment_mode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-muted mt-1">
                        Date: {inv.date || (inv.generated_at ? new Date(inv.generated_at).toLocaleDateString("en-IN") : "Recent")} • {inv.items?.length || 0} line items
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-gray-100">
                      <div className="text-left sm:text-right mr-2">
                        <span className="text-[10px] uppercase font-bold text-brand-muted block">Total Paid</span>
                        <span className="text-base font-black text-brand-primary">
                          {formatCurrency(inv.grand_total)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleReopenInvoice(inv)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-bold hover:bg-brand-navy-800 transition-colors shadow-sm"
                      >
                        <span>Reopen</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteTarget({ type: "invoice", data: inv })}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors border border-red-200"
                        title={`Delete Invoice #${inv.invoice_number}`}
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: QUOTATIONS HISTORY */}
          {activeTab === "quotations" && (
            <div className="space-y-3">
              {!customer.quotations || customer.quotations.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-brand-gray-200 p-6">
                  <FiCalendar className="w-10 h-10 mx-auto text-brand-muted/40 mb-2" />
                  <p className="text-xs text-brand-muted">No quotations recorded for this client.</p>
                </div>
              ) : (
                customer.quotations.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-brand-gray-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-brand-navy-900 text-sm">
                          Estimate: {q.feet} FT Depth
                        </span>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {q.mode || "REGULAR"}
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted mt-1">
                        Dated: {q.generated_at ? new Date(q.generated_at).toLocaleDateString("en-IN") : "Recent"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-gray-100">
                      <div className="text-left sm:text-right mr-2">
                        <span className="text-[10px] uppercase font-bold text-brand-muted block">Quoted Price</span>
                        <span className="text-base font-black text-brand-primary">
                          {formatCurrency(q.totals?.grand_total || q.grand_total)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleReopenQuotation(q)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-bold hover:bg-brand-navy-800 transition-colors shadow-sm"
                      >
                        <span>Reopen</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteTarget({ type: "quotation", data: q })}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors border border-red-200"
                        title={`Delete Quotation for ${q.feet} FT`}
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-brand-gray-200 flex justify-between items-center text-xs text-brand-muted">
          <button
            type="button"
            onClick={() => setConfirmDeleteTarget({ type: "customer", data: customer })}
            className="inline-flex items-center space-x-1.5 text-red-600 hover:text-red-700 font-bold transition-colors"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            <span>Delete Customer Profile</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-navy-900 font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

        {/* Inline Confirmation Dialog for Modal */}
        {confirmDeleteTarget && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-brand-gray-200">
              <div className="flex items-center space-x-3 text-red-600 mb-3">
                <div className="p-2.5 bg-red-100 rounded-xl">
                  <FiTrash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-brand-navy-900">
                    {confirmDeleteTarget.type === "customer" && "Delete Customer Profile?"}
                    {confirmDeleteTarget.type === "invoice" && `Delete Invoice #${confirmDeleteTarget.data.invoice_number}?`}
                    {confirmDeleteTarget.type === "quotation" && `Delete Quotation (${confirmDeleteTarget.data.feet} FT)?`}
                  </h4>
                  <p className="text-[11px] text-brand-muted">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-brand-navy-700 mb-4 bg-brand-gray-50 p-3 rounded-xl border border-brand-gray-200">
                {confirmDeleteTarget.type === "customer" && `Are you sure you want to permanently delete ${customer.name} and all associated records?`}
                {confirmDeleteTarget.type === "invoice" && `Are you sure you want to delete Invoice #${confirmDeleteTarget.data.invoice_number} (₹${confirmDeleteTarget.data.grand_total})?`}
                {confirmDeleteTarget.type === "quotation" && `Are you sure you want to delete the quotation estimate for ${confirmDeleteTarget.data.feet} FT?`}
              </p>

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-navy-800 text-xs font-bold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDeleteTarget.type === "customer") handleDeleteProfile();
                    if (confirmDeleteTarget.type === "invoice") handleDeleteInvoice(confirmDeleteTarget.data);
                    if (confirmDeleteTarget.type === "quotation") handleDeleteQuotation(confirmDeleteTarget.data);
                  }}
                  disabled={isDeleting}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
