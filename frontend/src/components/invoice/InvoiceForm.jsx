import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUser, FiPhone, FiCalendar, FiHash, FiPlus, FiTrash2, 
  FiFileText, FiPercent, FiCreditCard, FiTag, FiCheckCircle
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useQuotation } from "../../context/QuotationContext";
import { numberToIndianWords } from "../../utils/numberToWords";
import { useLoadingSteps } from "../../hooks/useLoadingSteps";
import LoadingOverlay from "../system/LoadingOverlay";
import apiClient from "../../services/api";

// Quick-add presets tailored specifically for Standard Pumps & Borewell hardware operations
const QUICK_PRESETS = [
  { name: "1.5 HP Submersible Motor V4", price: 16500, qty: 1 },
  { name: "2.0 HP Submersible Motor V4", price: 19500, qty: 1 },
  { name: "3.0 HP Submersible Motor V4", price: 33800, qty: 1 },
  { name: "1.25\" Sudhakar Column Pipe (3m)", price: 420, qty: 10 },
  { name: "2.5 sqmm Flat Submersible Cable (m)", price: 125, qty: 50 },
  { name: "Auto Cut-off Starter Panel", price: 2800, qty: 1 },
  { name: "Standard Accessories & Fittings", price: 1500, qty: 1 },
  { name: "Borewell Installation / Labour Charges", price: 1500, qty: 1 }
];

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${randomNum}`;
}

function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { saveInvoice, isLoading, setIsLoading } = useQuotation();
  const loader = useLoadingSteps("quotation", 1500);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(getTodayString());
  const [paymentMode, setPaymentMode] = useState("Cash");
  
  // GST Toggle: true = With GST (18%: CGST 9% + SGST 9%), false = Without GST
  const [isGst, setIsGst] = useState(false);
  const [discount, setDiscount] = useState("");

  // Line items
  const [items, setItems] = useState([
    { id: 1, name: "", qty: 1, price: "" }
  ]);

  const [validationErrors, setValidationErrors] = useState({});

  // Line item manipulation
  const handleAddItem = (preset = null) => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: preset ? preset.name : "",
        qty: preset ? preset.qty : 1,
        price: preset ? preset.price : ""
      }
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) {
      toast.error("Invoice must have at least one line item.");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Live Calculations
  const calculatedItems = items.map((it) => {
    const qty = parseFloat(it.qty) || 0;
    const price = parseFloat(it.price) || 0;
    const amount = Math.round(qty * price * 100) / 100;
    return { ...it, amount };
  });

  const subtotal = calculatedItems.reduce((acc, it) => acc + it.amount, 0);

  const cgst = isGst ? Math.round(subtotal * 0.09 * 100) / 100 : 0;
  const sgst = isGst ? Math.round(subtotal * 0.09 * 100) / 100 : 0;
  const totalTax = isGst ? Math.round((cgst + sgst) * 100) / 100 : 0;

  const discountAmount = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, Math.round((subtotal + totalTax - discountAmount) * 100) / 100);

  const amountInWords = numberToIndianWords(grandTotal);

  // Validation
  const validate = () => {
    const errors = {};
    if (!customerName.trim()) {
      errors.customerName = "Customer name is required.";
    }
    if (!phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      errors.phone = "Enter a valid 10-digit phone number.";
    }

    const validItems = items.filter(
      (it) => it.name.trim() !== "" && parseFloat(it.price) > 0 && parseFloat(it.qty) > 0
    );

    if (validItems.length === 0) {
      errors.items = "Please enter at least one valid item with name, quantity, and price.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required invoice details.");
      return;
    }

    setIsLoading(true);
    loader.startLoading();

    const formattedInvoice = {
      invoice_id: `inv_${Date.now()}`,
      invoice_number: invoiceNumber.trim() || generateInvoiceNumber(),
      generated_at: new Date().toISOString(),
      date: invoiceDate,
      customer_name: customerName.trim(),
      phone: phone.replace(/\D/g, ""),
      payment_mode: paymentMode,
      is_gst: isGst,
      gst_rates: isGst ? { total_rate: 18, cgst_rate: 9, sgst_rate: 9 } : null,
      items: calculatedItems.filter((it) => it.name.trim() !== ""),
      subtotal,
      cgst,
      sgst,
      total_tax: totalTax,
      discount: discountAmount,
      grand_total: grandTotal,
      amount_in_words: amountInWords,
      doc_type: "INVOICE"
    };

    // Background sync to backend SQLite database (silent fallback if offline)
    apiClient.post("/history/invoice", formattedInvoice).catch((err) => {
      console.warn("Backend invoice history sync skipped (offline mode):", err?.message);
    });

    setTimeout(() => {
      saveInvoice(formattedInvoice);
      loader.completeLoading();
      setIsLoading(false);
      toast.success("Single-Page Invoice Generated!");
      navigate("/preview");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Invoice Meta Header Card */}
      <div className="border border-brand-gray-200 rounded-2xl p-5 bg-brand-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-gray-200 pb-3 mb-4">
          <div className="flex items-center space-x-2 text-brand-primary font-bold text-xs uppercase tracking-wider">
            <FiHash className="w-4 h-4 text-brand-secondary" />
            <span>Invoice Details</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
            One-Page Format
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center">
              <FiUser className="mr-1 text-brand-secondary" /> Customer Name *
            </label>
            <input
              type="text"
              placeholder="e.g. K. V. Rao"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={`w-full text-sm px-3 py-2.5 bg-brand-surface border rounded-xl shadow-sm outline-none transition-all ${
                validationErrors.customerName
                  ? "border-brand-danger bg-red-50/10 focus:border-brand-danger"
                  : "border-brand-gray-300 focus:border-brand-primary"
              }`}
            />
            {validationErrors.customerName && (
              <p className="text-brand-danger text-[11px] mt-1 font-semibold">{validationErrors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center">
              <FiPhone className="mr-1 text-brand-secondary" /> Phone Number *
            </label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full text-sm px-3 py-2.5 bg-brand-surface border rounded-xl shadow-sm outline-none transition-all ${
                validationErrors.phone
                  ? "border-brand-danger bg-red-50/10 focus:border-brand-danger"
                  : "border-brand-gray-300 focus:border-brand-primary"
              }`}
            />
            {validationErrors.phone && (
              <p className="text-brand-danger text-[11px] mt-1 font-semibold">{validationErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center">
              <FiHash className="mr-1 text-brand-secondary" /> Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full text-sm font-mono px-3 py-2.5 bg-brand-surface border border-brand-gray-300 rounded-xl shadow-sm outline-none focus:border-brand-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center">
                <FiCalendar className="mr-1 text-brand-secondary" /> Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full text-xs px-2.5 py-2.5 bg-brand-surface border border-brand-gray-300 rounded-xl shadow-sm outline-none focus:border-brand-primary transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center">
                <FiCreditCard className="mr-1 text-brand-secondary" /> Payment
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full text-xs px-2 py-2.5 bg-brand-surface border border-brand-gray-300 rounded-xl shadow-sm outline-none focus:border-brand-primary transition-all cursor-pointer font-medium"
              >
                <option value="Cash">Cash</option>
                <option value="UPI / GPay">UPI / GPay</option>
                <option value="NetBanking">NetBanking</option>
                <option value="Credit / Due">Credit / Due</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GST Mode Toggle (Without GST vs 18% GST) */}
      <div className="border border-brand-gray-200 rounded-2xl p-4 bg-brand-surface shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center justify-between">
          <span className="flex items-center">
            <FiPercent className="mr-1.5 text-brand-secondary" /> Tax Mode Selection
          </span>
          <span className="text-[10px] text-brand-muted font-normal">
            *GSTIN number omitted from invoice
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsGst(false)}
            className={`px-4 py-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
              !isGst
                ? "bg-brand-surface border-brand-primary ring-2 ring-brand-primary/20 shadow-sm"
                : "bg-brand-surface border-brand-gray-200 hover:border-brand-gray-300"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-sm font-bold ${!isGst ? "text-brand-primary" : "text-brand-muted"}`}>
                Without GST
              </span>
              {!isGst && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
            </div>
            <span className="text-[10px] text-brand-muted mt-1">Standard Cash Bill / Retail Memo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGst(true)}
            className={`px-4 py-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
              isGst
                ? "bg-brand-primary border-brand-primary shadow-md text-white"
                : "bg-brand-surface border-brand-gray-200 hover:border-brand-gray-300"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-sm font-bold flex items-center ${isGst ? "text-brand-accent" : "text-brand-muted"}`}>
                <FiCheckCircle className="mr-1 text-xs" /> GST Invoice (18%)
              </span>
              {isGst && <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />}
            </div>
            <span className={`text-[10px] mt-1 ${isGst ? "text-brand-navy-200" : "text-brand-muted"}`}>
              CGST 9% + SGST 9% (18% Total)
            </span>
          </button>
        </div>

        {isGst && (
          <div className="mt-3 p-2.5 bg-brand-primary/5 rounded-xl border border-brand-primary/20 text-[11px] text-brand-primary font-medium flex items-center justify-between">
            <span>GST Rates: <strong>CGST 9%</strong> + <strong>SGST 9%</strong> (Total 18%)</span>
            <span className="text-[10px] text-brand-muted bg-white px-2 py-0.5 rounded border border-brand-gray-200">
              Tax Breakdown Active
            </span>
          </div>
        )}
      </div>

      {/* 3. Quick Preset Chips (Swipeable Horizontal Carousel) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center">
            <FiTag className="mr-1 text-brand-secondary" /> Quick-Add Hardware Items
          </span>
          <span className="text-[10px] text-brand-muted">Swipe & tap to append</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x -mx-1 px-1">
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddItem(preset)}
              className="text-[11px] font-medium bg-white hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary text-brand-text border border-brand-gray-300 px-3 py-2 rounded-xl shadow-2xs transition-all flex items-center space-x-1.5 shrink-0 snap-start active:scale-95"
            >
              <FiPlus className="w-3 h-3 text-brand-secondary shrink-0" />
              <span className="whitespace-nowrap">{preset.name}</span>
              <span className="font-mono text-brand-muted text-[10px] shrink-0">(₹{preset.price})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Line Items Table */}
      <div className="border border-brand-gray-200 rounded-2xl p-4 sm:p-5 bg-brand-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-gray-200 pb-3 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center">
            <FiFileText className="mr-1.5 text-brand-secondary" /> Purchased Items ({items.length})
          </h3>
          <button
            type="button"
            onClick={() => handleAddItem()}
            className="flex items-center space-x-1 text-xs font-bold text-brand-primary hover:text-brand-secondary bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {validationErrors.items && (
          <div className="mb-3 p-2.5 bg-red-50 border border-brand-danger/30 text-brand-danger text-xs rounded-xl font-medium">
            ⚠️ {validationErrors.items}
          </div>
        )}

        {/* Dynamic Items List */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const rowTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0);
            return (
              <div 
                key={item.id} 
                className="bg-brand-gray-50/70 border border-brand-gray-200 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 transition-all hover:border-brand-gray-300"
              >
                {/* Mobile Top Row: Number badge + Description Input + Delete */}
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="Item Description (e.g. 2 HP Submersible Motor)"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-brand-gray-300 rounded-lg outline-none focus:border-brand-primary transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="sm:hidden p-2 text-brand-muted hover:text-brand-danger hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Remove Item"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Row on Mobile / Inline on Desktop: Qty & Price & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pl-8 sm:pl-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-brand-muted uppercase font-bold sm:hidden">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => handleItemChange(item.id, "qty", e.target.value)}
                      className="w-16 sm:w-20 text-xs sm:text-sm text-center px-2 py-2 bg-white border border-brand-gray-300 rounded-lg outline-none focus:border-brand-primary transition-all font-mono"
                      title="Quantity"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-brand-muted uppercase font-bold sm:hidden">Rate:</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Price (₹)"
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                      className="w-24 sm:w-28 text-xs sm:text-sm text-right px-2 py-2 bg-white border border-brand-gray-300 rounded-lg outline-none focus:border-brand-primary transition-all font-mono"
                      title="Unit Price in ₹"
                    />
                  </div>

                  {/* Calculated row total */}
                  <div className="w-24 sm:w-28 text-right font-mono font-bold text-xs text-brand-primary px-1">
                    ₹{rowTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  {/* Delete Button (Desktop) */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="hidden sm:block p-2 text-brand-muted hover:text-brand-danger hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Remove Item"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleAddItem()}
          className="mt-3 w-full py-2.5 border border-dashed border-brand-gray-300 rounded-xl text-xs font-bold text-brand-primary hover:bg-brand-gray-50 flex items-center justify-center space-x-1.5 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>+ Add Another Item</span>
        </button>
      </div>

      {/* 5. Pricing Breakdown & Grand Total Card */}
      <div className="border border-brand-gray-200 rounded-2xl p-5 bg-brand-surface shadow-sm">
        <div className="max-w-md ml-auto space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-brand-muted font-medium">
            <span>Subtotal (Taxable Value):</span>
            <span className="font-mono font-semibold text-brand-text">
              ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {isGst && (
            <>
              <div className="flex justify-between items-center text-brand-muted font-medium">
                <span>CGST (9%):</span>
                <span className="font-mono font-semibold text-brand-text">
                  ₹{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-brand-muted font-medium">
                <span>SGST (9%):</span>
                <span className="font-mono font-semibold text-brand-text">
                  ₹{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-brand-secondary font-semibold border-t border-dashed border-brand-gray-200 pt-1.5">
                <span>Total GST (18%):</span>
                <span className="font-mono">
                  + ₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-brand-gray-200">
            <span className="text-brand-muted font-medium">Discount (₹):</span>
            <div className="w-28">
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full text-right text-xs px-2 py-1 bg-white border border-brand-gray-300 rounded-lg outline-none focus:border-brand-primary font-mono"
              />
            </div>
          </div>

          {/* Grand Total Highlight */}
          <div className="bg-brand-primary text-white p-3.5 rounded-xl flex justify-between items-center shadow-md border-b-4 border-brand-accent mt-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-navy-200 block">
                Total Payable Amount
              </span>
              <span className="text-xs font-semibold text-brand-accent">
                {isGst ? "Includes 18% GST" : "Net Cash Total"}
              </span>
            </div>
            <span className="text-xl font-extrabold font-mono text-white tracking-tight">
              ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* In Words */}
          <p className="text-[11px] text-brand-muted italic text-right pt-1 font-medium">
            {amountInWords}
          </p>
        </div>
      </div>

      {/* 6. Form Submit Button (Clean in-flow layout, zero screen overlap) */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center space-x-2 bg-brand-primary text-white py-3.5 sm:py-4 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 active:scale-[0.99] focus:outline-none ${
            isLoading ? "opacity-75 cursor-not-allowed bg-brand-primary/80" : ""
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span className="uppercase tracking-wider">Generating One-Page Invoice...</span>
            </>
          ) : (
            <>
              <FiFileText className="w-5 h-5 text-brand-accent" />
              <span className="uppercase tracking-wider">Generate Virtual Invoice (1-Page)</span>
            </>
          )}
        </button>
      </div>

      {loader.isActive && (
        <LoadingOverlay 
          progress={loader.progress} 
          message={loader.currentMessage} 
          type="quotation" 
        />
      )}
    </form>
  );
}
