import React from "react";
import CustomerForm from "../components/forms/CustomerForm";
import InvoiceForm from "../components/invoice/InvoiceForm";
import { useQuotation } from "../context/QuotationContext";
import { FiPlusCircle, FiFileText, FiCheck } from "react-icons/fi";
import { FaReceipt } from "react-icons/fa";

function Home() {
  const { activeTab, setActiveTab } = useQuotation();

  return (
    <div className="max-w-2xl mx-auto my-4 sm:my-6 px-4">
      {/* 1. Sleek Modern Tab Switcher: Quotation vs Virtual Invoice */}
      <div className="bg-white/80 backdrop-blur p-1.5 rounded-2xl mb-5 shadow-sm border border-brand-gray-200 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("quotation")}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            activeTab === "quotation"
              ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
              : "text-brand-muted hover:text-brand-primary hover:bg-brand-gray-50"
          }`}
        >
          <FiFileText className="w-4 h-4" />
          <span>Borewell Quotation</span>
          {activeTab === "quotation" && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent ml-1" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("invoice")}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            activeTab === "invoice"
              ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
              : "text-brand-muted hover:text-brand-primary hover:bg-brand-gray-50"
          }`}
        >
          <FaReceipt className="w-4 h-4" />
          <span>Virtual Invoice</span>
          {activeTab === "invoice" && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent ml-1" />
          )}
        </button>
      </div>

      {/* 2. Main Workspace Card */}
      <div className="bg-white rounded-2xl border border-brand-gray-200 shadow-sm overflow-hidden transition-all duration-200">
        {/* Dynamic Workspace banner */}
        <div className="bg-brand-primary text-white px-6 py-4 flex items-center justify-between border-b border-brand-primary/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-accent">
              {activeTab === "quotation" ? (
                <FiPlusCircle className="w-5 h-5 text-brand-accent" />
              ) : (
                <FaReceipt className="w-4 h-4 text-brand-accent" />
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider">
                {activeTab === "quotation" ? "New Quotation Estimate" : "New Virtual Invoice"}
              </h2>
              <p className="text-[10px] text-brand-navy-200 uppercase tracking-widest font-semibold mt-0.5">
                {activeTab === "quotation"
                  ? "Input Customer & Borewell Details"
                  : "Manual Sold Items & 1-Page Retail Bill"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-brand-accent font-mono font-bold bg-white/10 px-2.5 py-1 rounded-lg">
            <FiFileText className="w-3.5 h-3.5" />
            <span>{activeTab === "quotation" ? "EST-2026" : "INV-2026"}</span>
          </div>
        </div>

        {/* Input form wrapper */}
        <div className="p-4 sm:p-6">
          {activeTab === "quotation" ? <CustomerForm /> : <InvoiceForm />}
        </div>
      </div>
    </div>
  );
}

export default Home;
