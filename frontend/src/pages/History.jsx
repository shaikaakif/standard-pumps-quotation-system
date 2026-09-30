import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiDatabase, FiAlertCircle, FiPlusCircle, FiFileText, FiFilter } from "react-icons/fi";
import { FaReceipt } from "react-icons/fa";
import toast from "react-hot-toast";

import { useQuotation } from "../context/QuotationContext";
import apiClient from "../services/api";
import SearchBar from "../components/history/SearchBar";
import HistoryCard from "../components/history/HistoryCard";

function History() {
  const navigate = useNavigate();
  const { saveQuotation, saveInvoice, setIsNewQuotation, setActiveDocType } = useQuotation();

  const [quotationItems, setQuotationItems] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'quotation' | 'invoice'

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);

  // Load cached invoices
  const loadCachedInvoices = useCallback(() => {
    try {
      const stored = localStorage.getItem("spqs_invoices");
      if (stored) {
        const parsed = JSON.parse(stored);
        setInvoiceItems(parsed);
      }
    } catch (e) {
      console.warn("Could not load local invoices:", e);
    }
  }, []);

  // Fetch backend quotation history
  const fetchHistory = useCallback(async (reset = false, currentOffset = 0) => {
    if (reset) {
      setIsLoading(true);
      setOffset(0);
    } else {
      setIsSearching(true);
    }

    try {
      const queryParams = {
        limit: limit,
        offset: reset ? 0 : currentOffset,
      };

      if (searchTerm.trim()) {
        queryParams.q = searchTerm.trim();
      }

      const response = await apiClient.get("/history", { params: queryParams });
      
      if (response.data) {
        const { items, total } = response.data;
        if (reset) {
          setQuotationItems(items);
        } else {
          setQuotationItems((prev) => [...prev, ...items]);
        }
        setTotalCount(total);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to retrieve history logs:", err);
      // Fail softly for offline support: fallback to local quotations if available
      setError(null);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [searchTerm, limit]);

  useEffect(() => {
    loadCachedInvoices();
  }, [loadCachedInvoices]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHistory(true);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchHistory]);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleLoadMore = () => {
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchHistory(false, nextOffset);
  };

  // Reopen either quotation or invoice
  const handleReopen = async (item) => {
    if (item.doc_type === "INVOICE" || Boolean(item.invoice_number)) {
      saveInvoice(item);
      setIsNewQuotation(false);
      setActiveDocType("INVOICE");
      toast.success(`Invoice #${item.invoice_number} Reopened!`);
      navigate("/preview");
      return;
    }

    try {
      const response = await apiClient.get(`/history/${item.quotation_id}`);
      if (response.data && response.data.quotation_id) {
        saveQuotation(response.data);
        setIsNewQuotation(false);
        setActiveDocType("QUOTATION");
        toast.success("Quotation Reopened!");
        navigate("/preview");
      } else {
        throw new Error("Stored estimate is missing critical keys.");
      }
    } catch (err) {
      console.error("Reopen failure:", err);
      toast.error(err.message || "Failed to reopen quotation.");
    }
  };

  const handleDelete = async (id, isInvoice) => {
    if (isInvoice) {
      const updated = invoiceItems.filter((inv) => inv.invoice_id !== id);
      setInvoiceItems(updated);
      try {
        localStorage.setItem("spqs_invoices", JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      toast.success("Invoice deleted from local history.");
      return;
    }

    try {
      await apiClient.delete(`/history/${id}`);
      setQuotationItems((prev) => prev.filter((item) => item.quotation_id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast.success("Estimate deleted successfully!");
    } catch (err) {
      console.error("Soft delete failure:", err);
      toast.error(err.message || "Failed to delete estimate.");
    }
  };

  // Filter invoices based on search term
  const filteredInvoices = invoiceItems.filter((inv) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      inv.customer_name?.toLowerCase().includes(term) ||
      inv.phone?.includes(term) ||
      inv.invoice_number?.toLowerCase().includes(term)
    );
  });

  // Combine items based on activeFilter
  let combinedItems = [];
  if (activeFilter === "all") {
    combinedItems = [...filteredInvoices, ...quotationItems];
  } else if (activeFilter === "quotation") {
    combinedItems = [...quotationItems];
  } else if (activeFilter === "invoice") {
    combinedItems = [...filteredInvoices];
  }

  // Sort descending by date
  combinedItems.sort((a, b) => {
    const dateA = new Date(a.created_at || a.generated_at || a.date).getTime() || 0;
    const dateB = new Date(b.created_at || b.generated_at || b.date).getTime() || 0;
    return dateB - dateA;
  });

  // Shimmer Loader
  const renderShimmers = () => (
    <div className="space-y-4 w-full">
      {[1, 2, 3].map((n) => (
        <div key={n} className="border border-brand-gray-200 bg-white rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
          <div className="space-y-3 w-full sm:w-2/3">
            <div className="h-4 bg-brand-gray-200 rounded w-1/3" />
            <div className="flex gap-4">
              <div className="h-3 bg-brand-gray-200 rounded w-20" />
              <div className="h-3 bg-brand-gray-200 rounded w-16" />
              <div className="h-3 bg-brand-gray-200 rounded w-24" />
            </div>
          </div>
          <div className="h-8 bg-brand-gray-200 rounded w-24 self-end sm:self-center" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto py-4">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-brand-primary uppercase tracking-wide flex items-center">
            <FiClock className="w-5 h-5 mr-2 text-brand-secondary" />
            <span>Document History</span>
          </h2>
          <p className="text-brand-muted text-xs mt-1">
            Browse, search, and reopen past Quotations and Virtual Invoices.
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-1.5 bg-brand-primary text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl hover:bg-brand-primary/90 transition-all shadow-sm shrink-0"
        >
          <FiPlusCircle className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Filter Tabs: All | Quotations | Invoices */}
      <div className="bg-brand-surface p-1 rounded-xl mb-4 border border-brand-gray-200 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
            activeFilter === "all"
              ? "bg-brand-primary text-white shadow-xs"
              : "text-brand-muted hover:text-brand-primary"
          }`}
        >
          All ({filteredInvoices.length + quotationItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("quotation")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-1 ${
            activeFilter === "quotation"
              ? "bg-brand-primary text-white shadow-xs"
              : "text-brand-muted hover:text-brand-primary"
          }`}
        >
          <FiFileText className="w-3.5 h-3.5" />
          <span>Quotations ({quotationItems.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("invoice")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-1 ${
            activeFilter === "invoice"
              ? "bg-brand-primary text-white shadow-xs"
              : "text-brand-muted hover:text-brand-primary"
          }`}
        >
          <FaReceipt className="w-3.5 h-3.5" />
          <span>Invoices ({filteredInvoices.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        onClear={handleClearSearch} 
      />

      {/* Primary Display Area */}
      {isLoading ? (
        renderShimmers()
      ) : combinedItems.length === 0 ? (
        <div className="bg-white border border-brand-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="bg-brand-primary/10 text-brand-primary p-4 rounded-full inline-block mb-4">
            <FiDatabase className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-brand-primary uppercase tracking-wider">
            {searchTerm ? "No Matching Records" : "No Saved Documents"}
          </h3>
          <p className="text-brand-muted text-xs mt-2 max-w-sm mx-auto leading-relaxed font-medium">
            {searchTerm 
              ? `No records found matching "${searchTerm}". Try checking customer name or invoice number.`
              : "Generate a Quotation or Virtual Invoice to automatically record it in history."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center space-x-2 bg-brand-primary text-white py-2.5 px-5 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors shadow-sm text-xs uppercase tracking-wider"
            >
              <FiPlusCircle className="w-4 h-4" />
              <span>Create First Document</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1 text-[11px] text-brand-muted font-bold">
            <span className="flex items-center">
              <FiFileText className="mr-1 w-3.5 h-3.5 text-brand-secondary" />
              <span>Showing {combinedItems.length} records</span>
            </span>
            {isSearching && (
              <span className="text-brand-primary animate-pulse">Syncing...</span>
            )}
          </div>

          {/* List of cards */}
          <div className="space-y-3">
            {combinedItems.map((item, idx) => (
              <HistoryCard
                key={item.invoice_id || item.quotation_id || idx}
                item={item}
                onReopen={handleReopen}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Load More Button for Quotations */}
          {activeFilter !== "invoice" && quotationItems.length < totalCount && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isSearching}
                className="inline-flex items-center justify-center space-x-2 bg-white border border-brand-gray-300 text-brand-primary text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl hover:bg-brand-gray-50 transition-all shadow-sm disabled:opacity-50"
              >
                {isSearching && (
                  <div className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mr-1.5" />
                )}
                <span>Load More Records</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default History;
