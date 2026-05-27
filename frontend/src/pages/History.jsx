import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiDatabase, FiAlertCircle, FiPlusCircle, FiFileText } from "react-icons/fi";
import toast from "react-hot-toast";

import { useQuotation } from "../context/QuotationContext";
import apiClient from "../services/api";
import SearchBar from "../components/history/SearchBar";
import HistoryCard from "../components/history/HistoryCard";

function History() {
  const navigate = useNavigate();
  const { saveQuotation, setIsNewQuotation } = useQuotation();

  const [historyItems, setHistoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);

  // Core API Fetch routine
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
          setHistoryItems(items);
        } else {
          setHistoryItems((prev) => [...prev, ...items]);
        }
        setTotalCount(total);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to retrieve history logs:", err);
      setError(err.message || "Could not retrieve estimate logs.");
      toast.error(err.message || "Could not connect to database history.");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [searchTerm, limit]);

  // Debounced search trigger (300ms) to ensure lightweight database search loads
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

  const handleReopen = async (quotationId) => {
    try {
      const response = await apiClient.get(`/history/${quotationId}`);
      if (response.data && response.data.quotation_id) {
        // Load stored context
        saveQuotation(response.data);
        
        // Strict restriction: Disable confetti since we are reopening an old estimate
        setIsNewQuotation(false);
        
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

  const handleDelete = async (quotationId) => {
    try {
      await apiClient.delete(`/history/${quotationId}`);
      // Instant snappiness: filter item out of local state immediately
      setHistoryItems((prev) => prev.filter((item) => item.quotation_id !== quotationId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast.success("Estimate deleted successfully!");
    } catch (err) {
      console.error("Soft delete failure:", err);
      toast.error(err.message || "Failed to delete estimate.");
    }
  };

  // Rendering shimmering loader bars
  const renderShimmers = () => (
    <div className="space-y-4 w-full">
      {[1, 2, 3].map((n) => (
        <div key={n} className="border border-brand-gray-200 bg-white rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-brand-navy-800 uppercase tracking-wide flex items-center Poppins">
            <FiClock className="w-5 h-5 mr-2 text-brand-navy-500" />
            <span>Quotation History</span>
          </h2>
          <p className="text-brand-gray-550 text-xs mt-1">
            Browse, search, and reopen persistent borewell estimates and motor shop configs.
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-1.5 bg-brand-navy-800 text-white text-xs font-bold uppercase tracking-wider py-2 px-3.5 rounded hover:bg-brand-navy-900 transition-all shadow-sm shrink-0"
        >
          <FiPlusCircle className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Reactive Search Bar */}
      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        onClear={handleClearSearch} 
      />

      {/* Primary Display Area */}
      {isLoading ? (
        renderShimmers()
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-700 text-xs font-semibold">
          <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p>Error loading quotation logs: {error}</p>
          <button 
            onClick={() => fetchHistory(true)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-[10px] font-bold uppercase tracking-wider transition-colors"
          >
            Retry Fetch
          </button>
        </div>
      ) : historyItems.length === 0 ? (
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 text-center shadow-sm">
          <div className="bg-brand-navy-50 text-brand-navy-800 p-4 rounded-full inline-block mb-4">
            <FiDatabase className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-brand-navy-800 uppercase tracking-wider">
            {searchTerm ? "No Matching Records" : "Estimate Database Empty"}
          </h3>
          <p className="text-brand-gray-550 text-xs mt-2 max-w-sm mx-auto leading-relaxed font-medium">
            {searchTerm 
              ? `We couldn't find any saved quotations matching "${searchTerm}". Try checking the spelling or phone digits.`
              : "There are no persistent quotations recorded in the database. Generate a new estimate to automatically record it."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center space-x-2 bg-brand-navy-800 text-white py-2.5 px-5 rounded font-bold hover:bg-brand-navy-900 transition-colors shadow-sm text-xs uppercase tracking-wider"
            >
              <FiPlusCircle className="w-4 h-4" />
              <span>Launch Estimator</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Total Counter and Loader indicator */}
          <div className="flex justify-between items-center px-1 text-[11px] text-brand-gray-550 font-bold">
            <span className="flex items-center">
              <FiFileText className="mr-1 w-3.5 h-3.5 text-brand-navy-500" />
              <span>Showing {historyItems.length} of {totalCount} records</span>
            </span>
            {isSearching && (
              <span className="text-brand-navy-850 animate-pulse">Syncing...</span>
            )}
          </div>

          {/* List of cards */}
          <div className="space-y-3">
            {historyItems.map((item) => (
              <HistoryCard
                key={item.quotation_id}
                item={item}
                onReopen={handleReopen}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination Load More Button */}
          {historyItems.length < totalCount && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isSearching}
                className="inline-flex items-center justify-center space-x-2 bg-white border border-brand-gray-300 text-brand-navy-900 text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg hover:bg-brand-gray-550/5 transition-all shadow-sm disabled:opacity-50"
              >
                {isSearching && (
                  <div className="w-3.5 h-3.5 border-2 border-brand-navy-900 border-t-transparent rounded-full animate-spin mr-1.5" />
                )}
                <span>Load More Estimates</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default History;
