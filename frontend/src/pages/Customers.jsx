import React, { useState, useEffect, useMemo } from "react";
import {
  FiUsers,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiShoppingBag,
  FiDollarSign,
  FiFileText,
  FiPhone,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiArrowRight,
  FiFilter,
  FiTrash2
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import customerService, { formatPhone } from "../services/customerService";
import CustomerDossierModal from "../components/customers/CustomerDossierModal";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'buyers' | 'leads' | 'vip'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (e) {
      console.error("Failed to load customer directory:", e);
      toast.error("Could not load customer profiles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute KPI stats
  const kpis = useMemo(() => {
    const totalClients = customers.length;
    const totalSpend = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
    const totalInvoices = customers.reduce((sum, c) => sum + (c.invoices?.length || 0), 0);
    const totalQuotes = customers.reduce((sum, c) => sum + (c.quotations?.length || 0), 0);
    const vipCount = customers.filter((c) => c.tier === "VIP").length;

    return { totalClients, totalSpend, totalInvoices, totalQuotes, vipCount };
  }, [customers]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return customers.filter((c) => {
      // 1. Text Search across Name, Phone, and Purchased Items
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.itemsBought.some((it) => it.name.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // 2. Tab Filter
      if (activeFilter === "buyers") {
        return c.invoices.length > 0;
      }
      if (activeFilter === "leads") {
        return c.invoices.length === 0 && c.quotations.length > 0;
      }
      if (activeFilter === "vip") {
        return c.tier === "VIP";
      }

      return true;
    });
  }, [customers, searchQuery, activeFilter]);

  const handleOpenDossier = (cust) => {
    setSelectedCustomer(cust);
    setIsDossierOpen(true);
  };

  const handleExportCSV = () => {
    if (customers.length === 0) {
      toast.error("No customer records to export.");
      return;
    }
    customerService.exportToCSV(customers);
    toast.success("Client directory exported to CSV!");
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await customerService.deleteCustomer(customerToDelete);
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
      if (selectedCustomer?.id === customerToDelete.id) {
        setIsDossierOpen(false);
        setSelectedCustomer(null);
      }
      toast.success(`Deleted record for ${customerToDelete.name}`);
      setCustomerToDelete(null);
    } catch (err) {
      console.error("Failed to delete customer:", err);
      toast.error("Failed to delete customer record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-primary via-brand-navy-800 to-brand-navy-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-brand-navy-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-brand-accent/20 text-brand-accent rounded-lg">
                <FiUsers className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Client CRM & Customer Directory
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-brand-navy-200 mt-1 max-w-xl">
              Centralized record of all clients, phone contacts, equipment bought, and quotation histories.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
              title="Export to CSV Spreadsheet"
            >
              <FiDownload className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-accent text-brand-primary hover:bg-yellow-400 text-xs font-bold transition-all shadow active:scale-95 disabled:opacity-50"
              title="Refresh Directory"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-brand-navy-200 tracking-wider block">
              Total Clients
            </span>
            <span className="text-lg sm:text-2xl font-black text-white mt-0.5 block">
              {kpis.totalClients}
            </span>
            <span className="text-[10px] text-brand-accent font-medium mt-0.5 block">
              {kpis.vipCount} VIP Portfolios
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-brand-navy-200 tracking-wider block">
              Lifetime Revenue
            </span>
            <span className="text-lg sm:text-2xl font-black text-brand-accent mt-0.5 block">
              {formatCurrency(kpis.totalSpend)}
            </span>
            <span className="text-[10px] text-green-300 font-medium mt-0.5 block">
              From {kpis.totalInvoices} Invoiced Orders
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-brand-navy-200 tracking-wider block">
              Invoiced Orders
            </span>
            <span className="text-lg sm:text-2xl font-black text-white mt-0.5 block">
              {kpis.totalInvoices}
            </span>
            <span className="text-[10px] text-brand-navy-200 font-medium mt-0.5 block">
              Purchases Finalized
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-brand-navy-200 tracking-wider block">
              Quotations Sent
            </span>
            <span className="text-lg sm:text-2xl font-black text-white mt-0.5 block">
              {kpis.totalQuotes}
            </span>
            <span className="text-[10px] text-blue-300 font-medium mt-0.5 block">
              Active Estimates
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-brand-gray-200 space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone number, or purchased item (e.g. 'Submersible', 'Cable')..."
            className="w-full pl-10 pr-4 py-2.5 bg-brand-gray-50 border border-brand-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all placeholder:text-brand-muted/70"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-muted hover:text-brand-navy-900 font-bold bg-brand-gray-200 px-2 py-0.5 rounded-full"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider flex items-center space-x-1 pl-1">
            <FiFilter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === "all"
                ? "bg-brand-primary text-white shadow-sm"
                : "bg-brand-gray-100 text-brand-navy-700 hover:bg-brand-gray-200"
            }`}
          >
            All Clients ({customers.length})
          </button>

          <button
            onClick={() => setActiveFilter("buyers")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === "buyers"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-brand-gray-100 text-brand-navy-700 hover:bg-brand-gray-200"
            }`}
          >
            Verified Buyers ({customers.filter((c) => c.invoices.length > 0).length})
          </button>

          <button
            onClick={() => setActiveFilter("vip")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === "vip"
                ? "bg-amber-500 text-brand-primary shadow-sm"
                : "bg-brand-gray-100 text-brand-navy-700 hover:bg-brand-gray-200"
            }`}
          >
            VIP Clients ({kpis.vipCount})
          </button>

          <button
            onClick={() => setActiveFilter("leads")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === "leads"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-brand-gray-100 text-brand-navy-700 hover:bg-brand-gray-200"
            }`}
          >
            Leads / Quotes Only ({customers.filter((c) => c.invoices.length === 0 && c.quotations.length > 0).length})
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-brand-gray-200 shadow-sm">
          <FiRefreshCw className="w-8 h-8 mx-auto text-brand-primary animate-spin mb-3" />
          <h3 className="text-sm font-bold text-brand-navy-900">Loading Customer Intelligence...</h3>
          <p className="text-xs text-brand-muted mt-1">Aggregating invoices, quotations, and equipment lists</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-brand-gray-200 shadow-sm p-6">
          <FiUsers className="w-12 h-12 mx-auto text-brand-muted/40 mb-3" />
          <h3 className="text-base font-bold text-brand-navy-900">No Customers Found</h3>
          <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No client matching "${searchQuery}". Try searching with a different name, phone, or equipment item.`
              : "Generate an invoice or quotation on the Estimator page to automatically register customer profiles."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.map((cust) => {
            const hasPhone = Boolean(cust.phone);
            const cleanPhone = cust.phone.replace(/\D/g, "");
            const whatsappTarget = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
            const prefilledMsg = encodeURIComponent(
              `Hello ${cust.name || "Customer"}, Shaik Asif here from Standard Pumps & Borewells, Hyderabad. We hope your water pump equipment is performing excellently!`
            );

            return (
              <div
                key={cust.id}
                className="bg-white rounded-2xl border border-brand-gray-200 hover:border-brand-primary/50 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-brand-navy-50 text-brand-primary border border-brand-navy-100 flex items-center justify-center font-black text-sm flex-shrink-0">
                        {cust.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-brand-navy-900 text-base truncate">
                          {cust.name}
                        </h3>
                        <p className="text-xs font-mono text-brand-muted mt-0.5">
                          {cust.displayPhone}
                        </p>
                      </div>
                    </div>

                    {/* Tier badge */}
                    <div>
                      {cust.tier === "VIP" && (
                        <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <FiAward className="w-3 h-3 text-amber-600" />
                          <span>VIP</span>
                        </span>
                      )}
                      {cust.tier === "Buyer" && (
                        <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <FiShoppingBag className="w-3 h-3 text-green-600" />
                          <span>Buyer</span>
                        </span>
                      )}
                      {cust.tier === "Lead" && (
                        <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <FiFileText className="w-3 h-3 text-blue-600" />
                          <span>Lead</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial & Activity Stats */}
                  <div className="grid grid-cols-3 gap-2 my-3.5 bg-brand-gray-50 rounded-xl p-2.5 border border-brand-gray-100 text-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-brand-muted block">Spend</span>
                      <span className="text-xs sm:text-sm font-black text-brand-primary block truncate">
                        {formatCurrency(cust.totalSpend)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-brand-muted block">Orders</span>
                      <span className="text-xs sm:text-sm font-bold text-brand-navy-800 block">
                        {cust.invoices.length} Inv
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-brand-muted block">Quotes</span>
                      <span className="text-xs sm:text-sm font-bold text-brand-navy-800 block">
                        {cust.quotations.length} Est
                      </span>
                    </div>
                  </div>

                  {/* Items Bought Pills Preview */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-brand-muted tracking-wider block">
                      Equipment Purchased / Inquired:
                    </span>
                    {cust.itemsBought.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {cust.uniqueBoughtSummary?.slice(0, 3).map((it, idx) => (
                          <span
                            key={idx}
                            className="bg-brand-navy-50 text-brand-navy-800 border border-brand-navy-100 px-2 py-0.5 rounded-md text-[11px] font-medium max-w-[200px] truncate"
                          >
                            {it.name} <strong className="text-brand-primary">(x{it.qty})</strong>
                          </span>
                        ))}
                        {cust.uniqueBoughtSummary?.length > 3 && (
                          <span className="bg-brand-gray-100 text-brand-muted px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                            +{cust.uniqueBoughtSummary.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-brand-muted italic">
                        {cust.quotations.length > 0
                          ? `Quoted for ${cust.quotations[0]?.feet || 0} FT borehole system`
                          : "No item breakdown recorded"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-brand-gray-100">
                  {/* WhatsApp, Call & Delete Quick Buttons */}
                  <div className="flex items-center space-x-1.5">
                    {hasPhone && (
                      <>
                        <a
                          href={`https://wa.me/${whatsappTarget}?text=${prefilledMsg}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                          title="Open WhatsApp Chat"
                        >
                          <FaWhatsapp className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${cust.phone}`}
                          className="p-2 rounded-lg bg-brand-navy-100 hover:bg-brand-navy-200 text-brand-primary transition-colors"
                          title="Call Customer"
                        >
                          <FiPhone className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomerToDelete(cust);
                      }}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors border border-red-200"
                      title={`Delete profile for ${cust.name}`}
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenDossier(cust)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-navy-900 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <span>View Dossier</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Profile Dossier Modal */}
      <CustomerDossierModal
        customer={selectedCustomer}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onCustomerDeleted={(deletedCust) => {
          setCustomers((prev) => prev.filter((c) => c.id !== deletedCust.id));
          setIsDossierOpen(false);
          setSelectedCustomer(null);
        }}
        onCustomerUpdated={() => {
          loadData();
        }}
      />

      {/* Delete Customer Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-brand-gray-200">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <FiTrash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-brand-navy-900">Delete Customer Record?</h3>
                <p className="text-xs text-brand-muted">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="bg-brand-gray-50 rounded-xl p-3.5 border border-brand-gray-200 text-xs space-y-1.5 mb-5">
              <div className="flex justify-between">
                <span className="text-brand-muted font-bold">Client Name:</span>
                <span className="font-extrabold text-brand-navy-900">{customerToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted font-bold">Phone:</span>
                <span className="font-mono text-brand-navy-800">{customerToDelete.displayPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted font-bold">Invoices:</span>
                <span className="font-bold text-brand-navy-900">{customerToDelete.invoices?.length || 0} order(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted font-bold">Quotations:</span>
                <span className="font-bold text-brand-navy-900">{customerToDelete.quotations?.length || 0} estimate(s)</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-navy-800 text-xs font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCustomer}
                disabled={isDeleting}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
