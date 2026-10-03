import React from "react";
import { FiPhone, FiMapPin, FiCalendar, FiHash, FiCreditCard, FiCopy } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useSettings } from "../../hooks/useSettings";
import { shareService } from "../../services/shareService";
import WatermarkBackground from "../quotation/WatermarkBackground";

/**
 * InvoiceDocument: A strictly one-page, print-safe, A4-proportioned
 * retail and tax invoice document with sleek anti-AI design.
 * 
 * In accordance with explicit user instructions:
 * - GSTIN / GST Number is strictly OMITTED.
 * - Calligraphic signature "SHAIK ASIF" in Alex Brush font.
 * - Tax breakdown for 18% (CGST 9% + SGST 9%) when GST mode is active.
 */
export default function InvoiceDocument({ invoice }) {
  const { settings, logos } = useSettings();

  if (!invoice) return null;

  const {
    invoice_number,
    date,
    customer_name,
    phone,
    payment_mode,
    is_gst,
    items = [],
    subtotal = 0,
    cgst = 0,
    sgst = 0,
    total_tax = 0,
    discount = 0,
    grand_total = 0,
    amount_in_words = ""
  } = invoice;

  return (
    <div className="quotation-container bg-white border border-brand-gray-200 shadow-sm rounded-xl p-3.5 sm:p-7 relative overflow-hidden text-brand-text">
      {/* Background Watermark */}
      <WatermarkBackground text={settings?.business?.shop_name || "STANDARD PUMPS & BOREWELL"} visible={true} />

      {/* 1. Header: Shop Identity & Invoice Number */}
      <div className="border-b-2 border-brand-primary pb-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Shop Meta */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img 
              src={logos?.quotationLogo || "/logo/quotation-logo.png"} 
              alt="Standard Pumps Logo" 
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 rounded-full shadow-sm border border-brand-gray-200" 
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-brand-primary tracking-tight uppercase leading-tight">
                {settings?.business?.shop_name || "STANDARD PUMPS & BOREWELLS"}
              </h1>
              <p className="text-[10px] text-brand-muted uppercase tracking-widest font-semibold mt-0.5">
                {settings?.business?.tagline || "Dealers in Submersible Motors, Pumps, Pipes, Cables & Fittings"}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-brand-muted">
                <span className="flex items-center space-x-1 font-semibold text-brand-navy-900">
                  <FiPhone className="w-3 h-3 text-brand-primary" />
                  <span>+91 9110704747</span>
                  <span>•</span>
                  <span>+91 9581472786</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
                  <FaWhatsapp className="w-3 h-3 text-brand-green" />
                  <span>+91 9110704747</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <FiMapPin className="w-3 h-3 text-brand-primary" />
                  <span>Pillar No 101, Attapur, Ring Road, Hyderabad, TS - 500048</span>
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Badge & Meta */}
          <div className="text-left sm:text-right shrink-0">
            <div className="inline-block bg-brand-primary text-white text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded">
              {is_gst ? "TAX INVOICE" : "RETAIL INVOICE"}
            </div>
            <div className="mt-1 text-xs font-mono font-bold text-brand-primary">
              #{invoice_number}
            </div>
            <div className="text-[11px] text-brand-muted font-medium flex items-center sm:justify-end space-x-1 mt-0.5">
              <FiCalendar className="w-3 h-3 text-brand-secondary" />
              <span>Date: {date}</span>
            </div>
            {payment_mode && (
              <div className="text-[10px] text-brand-muted font-semibold mt-0.5 uppercase tracking-wide">
                Mode: <span className="text-brand-primary font-bold">{payment_mode}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Customer Billed-To Block */}
      <div className="bg-brand-gray-50/80 border border-brand-gray-200 rounded-lg p-3 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
        <div>
          <span className="text-[9px] uppercase tracking-widest font-bold text-brand-muted block">
            Billed To / Customer Details
          </span>
          <span className="text-sm font-bold text-brand-text">
            {customer_name}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-brand-muted">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-bold block">Contact</span>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono font-semibold text-brand-text">+91 {phone}</span>
              <button
                type="button"
                onClick={() => shareService.copyPhoneNumber(phone)}
                className="text-[10px] text-brand-primary hover:text-brand-secondary p-0.5 rounded hover:bg-brand-gray-200 transition-colors no-print"
                title="Copy mobile number"
              >
                <FiCopy className="w-3 h-3 inline text-brand-secondary" />
              </button>
            </div>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest font-bold block">Place of Supply</span>
            <span className="font-semibold text-brand-text">Telangana (36)</span>
          </div>
        </div>
      </div>

      {/* 3. Items Table (Compact Single Page Layout) */}
      <div className="border border-brand-gray-200 rounded-lg overflow-x-auto mb-4">
        <table className="w-full min-w-[420px] sm:min-w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-brand-primary text-white text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-3 w-16 text-center">Qty</th>
              <th className="py-2.5 px-3 w-28 text-right">Rate (₹)</th>
              <th className="py-2.5 px-3 w-32 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-200">
            {items.map((item, idx) => (
              <tr 
                key={item.id || idx} 
                className={idx % 2 === 0 ? "bg-white" : "bg-brand-gray-50/50"}
              >
                <td className="py-2 px-3 text-center text-brand-muted font-mono text-[11px]">
                  {idx + 1}
                </td>
                <td className="py-2 px-3 font-medium text-brand-text">
                  {item.name}
                </td>
                <td className="py-2 px-3 text-center font-mono text-brand-text">
                  {item.qty}
                </td>
                <td className="py-2 px-3 text-right font-mono text-brand-muted">
                  {parseFloat(item.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-brand-primary">
                  {parseFloat(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Calculations & Tax Breakdown Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-4">
        {/* Left Side: Amount in Words & Terms */}
        <div className="space-y-3">
          <div className="bg-brand-gray-50/70 border border-brand-gray-200 rounded-lg p-2.5">
            <span className="text-[9px] uppercase tracking-widest font-bold text-brand-muted block mb-0.5">
              Invoice Amount in Words
            </span>
            <p className="text-xs font-semibold text-brand-primary italic">
              {amount_in_words}
            </p>
          </div>

          <div className="text-[10px] text-brand-muted leading-relaxed space-y-0.5">
            <span className="font-bold uppercase tracking-wider text-[9px] text-brand-text block">Terms & Conditions:</span>
            <p>1. Goods once sold will not be taken back or exchanged.</p>
            <p>2. Warranty as per manufacturer terms. Physical / dry run damage not covered.</p>
            <p>3. Subject to Hyderabad jurisdiction.</p>
          </div>
        </div>

        {/* Right Side: Calculation Totals Box */}
        <div className="bg-brand-gray-50/80 border border-brand-gray-200 rounded-lg p-3 space-y-2 text-xs">
          <div className="flex justify-between items-center text-brand-muted font-medium">
            <span>Subtotal (Taxable Value):</span>
            <span className="font-mono text-brand-text font-semibold">
              ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {is_gst && (
            <>
              <div className="flex justify-between items-center text-brand-muted">
                <span>CGST @ 9%:</span>
                <span className="font-mono text-brand-text font-semibold">
                  + ₹{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-brand-muted">
                <span>SGST @ 9%:</span>
                <span className="font-mono text-brand-text font-semibold">
                  + ₹{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-brand-secondary font-semibold border-t border-dashed border-brand-gray-200 pt-1 text-[11px]">
                <span>Total Tax (18% GST):</span>
                <span className="font-mono">
                  + ₹{total_tax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </>
          )}

          {discount > 0 && (
            <div className="flex justify-between items-center text-brand-danger font-medium border-t border-dashed border-brand-gray-200 pt-1">
              <span>Discount:</span>
              <span className="font-mono">
                - ₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Grand Total */}
          <div className="bg-brand-primary text-white p-2.5 rounded-lg flex justify-between items-center shadow-sm border-b-2 border-brand-accent mt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy-200">
              Grand Total:
            </span>
            <span className="text-base font-extrabold font-mono text-white tracking-tight">
              ₹{(grand_total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Signatures & Footer (Anti-AI Signature Block) */}
      <div className="border-t border-brand-gray-200 pt-3 flex justify-between items-end text-xs">
        {/* Customer Sign */}
        <div className="text-center w-40">
          <div className="h-10 border-b border-dashed border-brand-gray-300"></div>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-brand-muted block mt-1">
            Customer's Signature
          </span>
        </div>

        {/* Authorized Signatory (Golden Signature Calligraphy) */}
        <div className="text-center w-52">
          <span className="text-[9px] font-bold uppercase tracking-wider text-brand-navy-900 block mb-0.5">
            For STANDARD PUMPS & BOREWELLS
          </span>
          <div className="h-10 flex items-center justify-center text-3xl text-brand-primary font-signature font-normal select-none tracking-wide pt-1">
            Shaik Asif
          </div>
          <div className="border-t border-brand-gray-300 pt-0.5 text-[9px] font-bold uppercase tracking-widest text-brand-muted">
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
}
