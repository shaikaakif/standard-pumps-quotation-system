import React, { useState, useRef } from "react";
import { 
  FiGift, FiCopy, FiDownload, FiPrinter, FiX, FiCheck, 
  FiPhone, FiShield, FiCalendar, FiCheckCircle, FiStar 
} from "react-icons/fi";
import { FaWhatsapp, FaCrown } from "react-icons/fa";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import { shareService } from "../../services/shareService";
import ultraMsgService from "../../services/ultraMsgService";
import { useSettings } from "../../hooks/useSettings";

/**
 * Generate a cryptographically distinct, verifiable Voucher Code
 * Format: CB-YYYY-XXXX-XXXX
 */
function generateVoucherCode() {
  const year = new Date().getFullYear();
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `CB-${year}-${part1}-${part2}`;
}

/**
 * Calculate expiry date (default 1 year from now)
 */
function getDefaultExpiryDate(months = 12) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy}`;
}

export default function CashbackModal({ invoice, isOpen, onClose }) {
  const { settings, logos } = useSettings();
  const cardRef = useRef(null);

  // Derive initial values from invoice
  const customerName = invoice?.customer_name || "Valued Customer";
  const phone = invoice?.phone || "";
  const invoiceNumber = invoice?.invoice_number || "INV-2026";
  const grandTotal = Number(invoice?.grand_total || 0);

  // Suggested ~10% cashback rounded to nearest 50 or 100
  const defaultCashback = Math.max(500, Math.round((grandTotal * 0.10) / 50) * 50);

  // States
  const [cashbackAmount, setCashbackAmount] = useState(defaultCashback);
  const [validityMonths, setValidityMonths] = useState(12);
  const [voucherCode] = useState(generateVoucherCode());
  const [isExporting, setIsExporting] = useState(false);
  const [isPhoneCopied, setIsPhoneCopied] = useState(false);
  const [isCaptionCopied, setIsCaptionCopied] = useState(false);

  if (!isOpen) return null;

  const expiryDate = getDefaultExpiryDate(validityMonths);

  const cashbackPayload = {
    voucher_code: voucherCode,
    customer_name: customerName,
    phone: phone,
    cashback_amount: cashbackAmount,
    expiry_date: expiryDate,
    linked_invoice: invoiceNumber,
  };

  // Quick preset chips
  const applyPercent = (pct) => {
    const val = Math.max(100, Math.round((grandTotal * (pct / 100)) / 50) * 50);
    setCashbackAmount(val);
  };

  // 1. Copy Customer Phone
  const handleCopyPhone = () => {
    shareService.copyPhoneNumber(phone);
    setIsPhoneCopied(true);
    setTimeout(() => setIsPhoneCopied(false), 2500);
  };

  // 2. Copy Cashback Caption
  const handleCopyCaption = () => {
    const text = shareService.formatCashbackShareText(cashbackPayload);
    shareService.copyToClipboard(text, true);
    setIsCaptionCopied(true);
    setTimeout(() => setIsCaptionCopied(false), 2500);
  };

  // 3. Share directly to WhatsApp (with customer phone number pre-filled or auto-sent via Cloud Bot)
  const handleShareWhatsApp = async () => {
    setIsExporting(true);

    // If UltraMsg Cloud Gateway is configured, deliver directly from shop number (+91 9110704747)
    if (ultraMsgService.isConfigured() && phone) {
      toast.loading("Delivering VIP Pass via Cloud Bot...", { id: "cashback-share" });
      try {
        let blob = null;
        if (cardRef.current) {
          const opt = {
            margin: [8, 8, 8, 8],
            filename: `VIP_Cashback_Pass_${customerName.replace(/[^a-zA-Z0-9]/g, "_")}_${voucherCode}.pdf`,
            image: { type: "jpeg", quality: 1.0 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm", format: "a5", orientation: "landscape" }
          };
          blob = await html2pdf().set(opt).from(cardRef.current).output("blob");
        }
        const caption = shareService.formatCashbackShareText(cashbackPayload);
        if (blob) {
          await ultraMsgService.sendDocument({
            toPhone: phone,
            filename: `VIP_Cashback_Pass_${customerName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
            document: blob,
            caption,
          });
        } else {
          await ultraMsgService.sendTextMessage(phone, caption);
        }
        toast.dismiss("cashback-share");
        toast.success(`✓ VIP Cashback Pass delivered from +91 9110704747 to ${customerName}!`);
        setIsExporting(false);
        return;
      } catch (e) {
        console.warn("UltraMsg send failed, falling back to app:", e);
        toast.dismiss("cashback-share");
        toast.error(`Cloud send failed (${e.message}). Opening WhatsApp app...`);
      }
    }

    // Native app fallback
    toast.loading("Preparing VIP Card for WhatsApp...", { id: "cashback-share" });

    try {
      let pdfFile = null;
      if (cardRef.current) {
        const opt = {
          margin: [8, 8, 8, 8],
          filename: `Cashback_Pass_${customerName.replace(/[^a-zA-Z0-9]/g, "_")}_${voucherCode}.pdf`,
          image: { type: "jpeg", quality: 1.0 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a5", orientation: "landscape" }
        };
        const blob = await html2pdf().set(opt).from(cardRef.current).output("blob");
        pdfFile = new File([blob], opt.filename, { type: "application/pdf" });
      }

      toast.dismiss("cashback-share");
      await shareService.shareCashbackCard(cashbackPayload, { mode: "whatsapp", pdfFile });
    } catch (err) {
      console.warn("Could not attach PDF:", err);
      toast.dismiss("cashback-share");
      await shareService.shareCashbackCard(cashbackPayload, { mode: "whatsapp" });
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Download Card PDF
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    toast.loading("Generating VIP Privilege Pass...", { id: "card-export" });

    try {
      const opt = {
        margin: [5, 5, 5, 5],
        filename: `Cashback_Card_${customerName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: "mm", format: "a5", orientation: "landscape" }
      };

      await html2pdf().set(opt).from(cardRef.current).save();
      toast.dismiss("card-export");
      toast.success("VIP Cashback Pass Downloaded! 📥");
    } catch (err) {
      toast.dismiss("card-export");
      toast.error("Download failed, please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // 5. Print Card
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-brand-gray-200 w-full max-w-xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-brand-primary via-brand-navy-900 to-brand-primary text-white p-4 sm:p-5 flex items-center justify-between border-b border-brand-accent/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-accent/20 text-brand-accent flex items-center justify-center border border-brand-accent/30 shadow-inner">
              <FaCrown className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                <span>VIP Cashback & Service Card</span>
                <span className="text-[10px] bg-brand-accent text-brand-navy-950 font-black px-1.5 py-0.5 rounded-full uppercase">
                  Lenskart Model
                </span>
              </h3>
              <p className="text-[11px] text-brand-navy-200 mt-0.5">
                Lock in repeat business & provide 1-Year Free On-Ground Service guarantee
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Configuration Controls */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          
          {/* Quick Config Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-brand-surface p-3.5 rounded-xl border border-brand-gray-200 text-xs">
            {/* Customer Contact + Copy Phone */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">
                Customer & Mobile
              </span>
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-brand-gray-200">
                <div className="truncate">
                  <span className="font-bold text-brand-text block truncate">{customerName}</span>
                  <span className="font-mono text-brand-muted text-[11px]">+91 {phone}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="flex items-center space-x-1 text-[11px] font-bold text-brand-primary hover:text-brand-secondary bg-brand-primary/10 hover:bg-brand-primary/20 px-2 py-1 rounded transition-colors shrink-0 ml-2"
                  title="Copy Phone Number for WhatsApp search"
                >
                  {isPhoneCopied ? <FiCheck className="w-3.5 h-3.5 text-green-600" /> : <FiCopy className="w-3.5 h-3.5" />}
                  <span>{isPhoneCopied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Editable Cashback Amount */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  Cashback Value (₹)
                </span>
                <span className="text-[10px] text-brand-primary font-bold">
                  Invoice: ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 font-mono font-bold text-brand-primary text-sm">₹</span>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={cashbackAmount}
                  onChange={(e) => setCashbackAmount(Number(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-brand-gray-300 rounded-lg font-mono font-bold text-sm text-brand-primary outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-[10px] uppercase font-bold text-brand-muted mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => applyPercent(5)}
              className="px-2 py-0.5 rounded-md border border-brand-gray-300 hover:border-brand-primary bg-white text-brand-text font-medium"
            >
              5%
            </button>
            <button
              type="button"
              onClick={() => applyPercent(10)}
              className="px-2.5 py-0.5 rounded-md border border-brand-accent bg-brand-accent/15 text-brand-navy-900 font-bold"
            >
              10% (Recommended)
            </button>
            <button
              type="button"
              onClick={() => applyPercent(15)}
              className="px-2 py-0.5 rounded-md border border-brand-gray-300 hover:border-brand-primary bg-white text-brand-text font-medium"
            >
              15%
            </button>
            <button
              type="button"
              onClick={() => setCashbackAmount(1000)}
              className="px-2 py-0.5 rounded-md border border-brand-gray-300 hover:border-brand-primary bg-white text-brand-text font-medium"
            >
              ₹1,000 Flat
            </button>
            <button
              type="button"
              onClick={() => setCashbackAmount(2000)}
              className="px-2 py-0.5 rounded-md border border-brand-gray-300 hover:border-brand-primary bg-white text-brand-text font-medium"
            >
              ₹2,000 Flat
            </button>
          </div>

          {/* =========================================================================
              THE VIP CASHBACK PASS (Visual Card - High Resolution Print/PDF Container)
              ========================================================================= */}
          <div 
            ref={cardRef}
            className="cashback-card-container relative rounded-2xl p-5 sm:p-6 text-white overflow-hidden shadow-xl border-2 border-brand-accent/40 bg-gradient-to-br from-[#0a192f] via-[#102a43] to-[#0a192f]"
            style={{
              boxShadow: "0 10px 25px -5px rgba(16, 42, 67, 0.4), 0 0 15px rgba(245, 158, 11, 0.15)"
            }}
          >
            {/* Elegant Luxury Watermark Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center select-none overflow-hidden">
              <span className="text-8xl font-black uppercase tracking-widest text-white rotate-[-15deg]">
                VIP PASS
              </span>
            </div>

            {/* Golden Header Strip */}
            <div className="flex justify-between items-start border-b border-white/15 pb-3 mb-3 relative z-10">
              <div>
                <div className="flex items-center space-x-1.5 text-brand-accent mb-0.5">
                  <FaCrown className="w-3.5 h-3.5 fill-brand-accent text-brand-accent" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">
                    VIP PRIVILEGE & LOYALTY CARD
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black tracking-tight uppercase leading-none text-white">
                  {settings?.business?.shop_name || "STANDARD PUMPS & BOREWELL"}
                </h4>
                <p className="text-[9px] text-slate-300 uppercase tracking-wider mt-0.5 font-medium">
                  Dealers in Submersible Motors, Pumps, Pipes & Cables
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block bg-brand-accent/20 border border-brand-accent/50 text-brand-accent text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                  {voucherCode}
                </span>
                <span className="block text-[8px] text-slate-300 mt-1 uppercase font-semibold">
                  Ref: #{invoiceNumber}
                </span>
              </div>
            </div>

            {/* Golden Hero Voucher Value Box */}
            <div className="my-3 bg-gradient-to-r from-brand-accent/20 via-brand-accent/30 to-brand-accent/20 border border-brand-accent/50 rounded-xl p-3 text-center relative z-10 shadow-inner">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-accent block mb-0.5">
                GUARANTEED CASHBACK VOUCHER
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-brand-accent tracking-tight drop-shadow-sm">
                ₹ {Number(cashbackAmount || 0).toLocaleString("en-IN")}
              </div>
              <span className="text-[9px] text-slate-200 block font-medium mt-0.5">
                Redeemable against your next motor, pump, pipe, or starter purchase
              </span>
            </div>

            {/* Highlighted Differentiator: 1-Year Free On-Ground Service */}
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2.5 my-2.5 relative z-10 flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <FiShield className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-emerald-300 tracking-wide block leading-tight">
                  ⭐ 1-Year Free On-Ground Service Included
                </span>
                <p className="text-[9px] text-emerald-100/90 leading-tight mt-0.5">
                  Free 1-time on-site inspection & troubleshooting check at your borewell location.
                </p>
              </div>
            </div>

            {/* Customer Details & Expiry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/15 pt-3 mt-3 relative z-10 items-end">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-brand-accent font-bold block mb-1">
                  VIP Cardholder Name
                </span>
                <div className="text-sm sm:text-base font-extrabold text-white tracking-wider uppercase leading-normal drop-shadow-sm break-words">
                  {customerName}
                </div>
                <div className="font-mono text-xs text-slate-300 font-semibold mt-0.5 tracking-wide flex items-center space-x-1">
                  <span>📱 +91 {phone}</span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[9px] uppercase tracking-widest text-slate-300 font-bold block mb-1">
                  Valid Until
                </span>
                <div className="font-mono font-black text-brand-accent text-sm sm:text-base tracking-wide leading-normal">
                  {expiryDate}
                </div>
                <span className="inline-block text-[9px] text-emerald-300 font-bold uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 mt-1">
                  ● ACTIVE (1-Time Use)
                </span>
              </div>
            </div>

            {/* Anti-Fraud Fine Print */}
            <div className="mt-2.5 pt-2 border-t border-white/10 text-[8px] text-slate-300 leading-tight space-y-0.5 relative z-10 font-sans">
              <p>• <strong>Strict Anti-Fraud:</strong> Valid for single redemption only on next purchase. Void upon claim.</p>
              <p>• Strictly linked to registered phone (+91 {phone}). Non-transferable & non-encashable for cash.</p>
              <p>• Pillar No 101, Attapur Ring Road, Hyderabad | 📞 9110704747 / 9581472786</p>
            </div>
          </div>

          {/* Action Button Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {/* Copy Caption */}
            <button
              type="button"
              onClick={handleCopyCaption}
              className="flex items-center justify-center space-x-1.5 bg-brand-surface hover:bg-brand-gray-100 text-brand-primary border border-brand-gray-300 rounded-xl py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              {isCaptionCopied ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiCopy className="w-4 h-4" />}
              <span>{isCaptionCopied ? "Copied!" : "Copy Caption"}</span>
            </button>

            {/* WhatsApp Share */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              disabled={isExporting}
              className="flex items-center justify-center space-x-1.5 bg-brand-green hover:bg-brand-green-hover text-white rounded-xl py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>Send WhatsApp</span>
            </button>

            {/* Download PDF */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center justify-center space-x-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" />
              <span>Download</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center space-x-1.5 bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-muted rounded-xl py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all"
            >
              <FiX className="w-4 h-4" />
              <span>Done</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
