import React from "react";
import { FiPhone, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useSettings } from "../../hooks/useSettings";

function QuotationHeader({ quotationId, generatedAt }) {
  const { settings, logos } = useSettings();
  // Deterministic timestamp helper to prevent browser locale randomness
  const formatDeterministicDate = (isoString) => {
    try {
      if (!isoString) return "";
      const date = new Date(isoString);
      const yyyy = date.getUTCFullYear();
      const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(date.getUTCDate()).padStart(2, "0");
      const hh = String(date.getUTCHours()).padStart(2, "0");
      const min = String(date.getUTCMinutes()).padStart(2, "0");
      
      return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
    } catch (e) {
      return isoString || "";
    }
  };

  return (
    <div className="border-b border-brand-gray-200 pb-5 mb-5 quotation-card-group">
      {/* Grid wrapper for responsive shop meta vs invoice number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Shop Branding Meta */}
        <div>
          {logos?.quotationLogo ? (
            <img src={logos.quotationLogo} alt="Company Logo" className="h-16 object-contain mb-3" />
          ) : (
            <>
              <h2 className="text-xl font-bold tracking-tight text-brand-navy-800 leading-none">
                {settings?.business?.shop_name || "STANDARD PUMPS & BOREWELL"}
              </h2>
              <p className="text-[10px] text-brand-gray-550 uppercase tracking-widest font-semibold mt-1">
                {settings?.business?.tagline || "Dealers in Submersible Motors, Pipes, Cables & Fittings"}
              </p>
            </>
          )}
          
          {/* Reserved shop contact section placeholders */}
          <div className="mt-3.5 space-y-1.5 text-xs text-brand-gray-550">
            <div className="flex items-center space-x-1.5">
              <FiPhone className="w-3.5 h-3.5 text-brand-navy-800" />
              <span>{settings?.business?.phone || "+91 9876543210"}</span>
              <span className="text-brand-gray-200">|</span>
              <FaWhatsapp className="w-3.5 h-3.5 text-brand-green" />
              <span>WhatsApp: {settings?.business?.whatsapp || "+91 9876543210"}</span>
            </div>
            <div className="flex items-start space-x-1.5">
              <FiMapPin className="w-3.5 h-3.5 text-brand-navy-800 mt-0.5 shrink-0" />
              <span>{settings?.business?.address || "Borewell Shop Road, Main Bazar, Guntur, AP - 522003"}</span>
            </div>
          </div>
        </div>

        {/* Invoice ID & Deterministic dates */}
        <div className="md:text-right flex flex-col md:items-end justify-between h-full space-y-2 md:space-y-0">
          <div className="inline-block bg-brand-navy-50 border border-brand-navy-100 rounded px-3 py-1 text-left">
            <h3 className="text-[10px] font-bold text-brand-navy-800 uppercase tracking-wider">
              ESTIMATE / QUOTATION
            </h3>
            <div className="text-xs font-mono font-bold text-brand-navy-900 mt-0.5 break-all">
              ID: {quotationId}
            </div>
          </div>
          
          <div className="text-xs text-brand-gray-550">
            <div>
              <span className="font-semibold text-brand-navy-800">Date:</span>{" "}
              <span className="font-mono text-xs">{formatDeterministicDate(generatedAt)}</span>
            </div>
            <div className="mt-1">
              <span className="font-semibold text-brand-navy-800">GSTIN:</span>{" "}
              <span className="font-mono text-[10px] bg-brand-gray-100 px-1.5 py-0.5 rounded text-brand-gray-550">
                {settings?.business?.gst_number || "PENDING (Estimate Only)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotationHeader;
