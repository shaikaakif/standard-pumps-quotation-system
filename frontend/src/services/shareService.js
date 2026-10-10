import toast from "react-hot-toast";

/**
 * Retrieves the configured shop branding from localStorage or fallback defaults.
 */
function getShopConfig() {
  try {
    const raw = localStorage.getItem("spqs_settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        shop_name: parsed.shop_name || parsed.business?.shop_name || "STANDARD PUMPS & BOREWELL",
        phone: parsed.phone || parsed.business?.phone || "+91 9110704747",
        secondary_phone: parsed.secondary_phone || parsed.business?.secondary_phone || "+91 9581472786",
        address: parsed.address || parsed.business?.address || "Pillar No 101, Attapur, Ring Road, Hyderabad - 500048",
      };
    }
  } catch (e) {}
  return {
    shop_name: "STANDARD PUMPS & BOREWELL",
    phone: "+91 9110704747",
    secondary_phone: "+91 9581472786",
    address: "Pillar No 101, Attapur, Ring Road, Hyderabad - 500048",
  };
}

/**
 * Service to manage professional quotation, invoice, and cashback sharing behaviors,
 * optimizing for mobile (Web Share API / Native) and desktop (WhatsApp Desktop App / Web).
 */
export const shareService = {
  // ==========================================
  // QUOTATION TEXT FORMATTERS
  // ==========================================

  /**
   * Builds the premium pre-filled WhatsApp text when a quotation PDF is attached.
   */
  formatAttachmentText(quotation) {
    const shop = getShopConfig();
    const cust = quotation?.customer_name ? ` for ${quotation.customer_name}` : "";
    const phoneStr = shop.secondary_phone ? `${shop.phone} / ${shop.secondary_phone}` : shop.phone;
    return `Assalamu Alaikum / Greetings.\n\nPlease find your quotation${cust} from ${shop.shop_name} attached.\n\nFor any assistance please contact us.\n\n*${shop.shop_name}*\n📞 ${phoneStr}\n📍 ${shop.address}`;
  },

  /**
   * Builds a professional, structured plain-text quotation summary
   * perfect for business communication over chat apps when NO PDF is available.
   */
  formatShareText(quotation) {
    if (!quotation) return "";

    const shop = getShopConfig();
    const {
      customer_name,
      phone,
      feet,
      summary,
      totals,
      pipe,
      cable,
      starter,
      motors,
    } = quotation;

    const grandTotal = summary?.formatted_grand_total || `₹${totals?.grand_total?.toLocaleString("en-IN") || "0"}`;
    const modeLabel = summary?.mode_label || quotation.mode;
    
    // Find primary motor spec
    const primaryMotor = motors?.find(m => m.is_primary_recommendation) || motors?.[0];
    const motorName = primaryMotor ? `${primaryMotor.brand} ${primaryMotor.spec}` : "Submersible Motor";
    const phoneStr = shop.secondary_phone ? `${shop.phone} , ${shop.secondary_phone}` : shop.phone;

    return `📋 *${shop.shop_name.toUpperCase()}*
----------------------------------------
*Quotation Estimate*

👤 *Customer:* ${customer_name}
📞 *Phone:* ${phone}
📍 *Bore Depth:* ${feet} FT
⚙️ *Material Mode:* ${modeLabel}

*ESTIMATE DETAILS:*
• *Pipe:* ${pipe?.brand?.display_brand || "Sudhakar"} (${pipe?.type || ""}) - ${pipe?.length_meters || 0}m
• *Cable:* ${cable?.brand?.display_brand || "Cable Wire"} (${cable?.spec || ""}) - ${cable?.length_meters || 0}m
• *Motor:* ${motorName}
• *Starter:* ${starter?.starter_type || "Starter"} (${starter?.hp || ""} HP)
• *Fittings & Installation:* Included

----------------------------------------
💰 *Grand Total: ${grandTotal}*
----------------------------------------
_Thank you for your business!_
📞 *Contact Shop:* ${phoneStr}
📍 *Address:* ${shop.address}`;
  },

  // ==========================================
  // INVOICE TEXT FORMATTERS
  // ==========================================

  /**
   * Builds the premium pre-filled WhatsApp text when an invoice PDF is attached.
   */
  formatInvoiceAttachmentText(invoice) {
    const shop = getShopConfig();
    const invNo = invoice?.invoice_number || "Invoice";
    const phoneStr = shop.secondary_phone ? `${shop.phone} / ${shop.secondary_phone}` : shop.phone;
    return `Assalamu Alaikum / Greetings.\n\nPlease find your Bill/Invoice (${invNo}) from ${shop.shop_name} attached.\n\nFor any query or assistance, please contact us.\n\n*${shop.shop_name}*\n📞 ${phoneStr}\n📍 ${shop.address}`;
  },

  /**
   * Builds a structured plain-text invoice summary for chat apps when NO PDF is attached.
   */
  formatInvoiceShareText(invoice) {
    if (!invoice) return "";
    const shop = getShopConfig();
    const {
      invoice_number,
      customer_name,
      phone,
      date,
      is_gst,
      items = [],
      subtotal = 0,
      total_tax = 0,
      grand_total = 0,
      payment_mode = "Cash"
    } = invoice;

    const itemsSummary = items
      .map((it) => `• ${it.name} (${it.qty} x ₹${parseFloat(it.price).toLocaleString("en-IN")}) = ₹${parseFloat(it.amount).toLocaleString("en-IN")}`)
      .join("\n");

    const taxLine = is_gst ? `\n• *GST (18%):* ₹${total_tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "";
    const phoneStr = shop.secondary_phone ? `${shop.phone} , ${shop.secondary_phone}` : shop.phone;

    return `🧾 *${shop.shop_name.toUpperCase()}*
----------------------------------------
*${is_gst ? "TAX INVOICE" : "RETAIL INVOICE"}: #${invoice_number}*

👤 *Customer:* ${customer_name}
📞 *Phone:* ${phone}
📅 *Date:* ${date}
💳 *Payment Mode:* ${payment_mode}

*PURCHASED ITEMS:*
${itemsSummary}
----------------------------------------
• *Subtotal:* ₹${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}${taxLine}
💰 *Grand Total: ₹${grand_total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}*
----------------------------------------
_Thank you for your business!_
📞 *Contact Shop:* ${phoneStr}
📍 *Address:* ${shop.address}`;
  },

  // ==========================================
  // CASHBACK VIP PASS FORMATTERS
  // ==========================================

  /**
   * Builds the VIP Cashback Card WhatsApp text.
   */
  formatCashbackShareText(cashback) {
    if (!cashback) return "";
    const shop = getShopConfig();
    const {
      voucher_code,
      customer_name,
      phone,
      cashback_amount,
      expiry_date,
      linked_invoice
    } = cashback;

    const amountFormatted = Number(cashback_amount || 0).toLocaleString("en-IN");
    const phoneStr = shop.secondary_phone ? `${shop.phone} , ${shop.secondary_phone}` : shop.phone;

    return `🎁 *${shop.shop_name.toUpperCase()}*
----------------------------------------
*EXCLUSIVE VIP CASHBACK & SERVICE PRIVILEGE PASS*

👤 *Customer:* ${customer_name}
📞 *Registered Mobile:* ${phone}
🎟️ *Voucher Serial:* ${voucher_code}
💰 *Cashback Amount:* ₹${amountFormatted}
📅 *Valid Until:* ${expiry_date}
🧾 *Linked Invoice:* #${linked_invoice}

⭐ *EXCLUSIVE VIP BENEFIT INCLUDED:*
• *1-Year Free On-Ground Service Guarantee*
  (Free 1-time on-site inspection & minor troubleshooting check for your borewell pump)

🛡️ *Anti-Fraud & Redemption Terms:*
1. Valid for single one-time redemption on your next purchase or repair service at ${shop.shop_name}.
2. Strictly locked to your registered mobile number (+91 ${phone}).
3. Present this digital card / voucher code at the shop counter to redeem.
4. Non-transferable and non-convertible to physical cash.

----------------------------------------
_Thank you for choosing ${shop.shop_name}!_
📞 *Shop Contact:* ${phoneStr}
📍 *Address:* ${shop.address}`;
  },

  // ==========================================
  // SHARING HANDLERS
  // ==========================================

  /**
   * Shares a quotation estimate dynamically.
   */
  async shareQuotation(quotation, { mode = "all", pdfFile = null } = {}) {
    const fallbackText = this.formatShareText(quotation);
    const attachmentText = this.formatAttachmentText(quotation);
    const textToShare = pdfFile ? attachmentText : fallbackText;

    await this._dispatchShare({
      title: "Standard Pumps Quotation",
      textToShare,
      phone: quotation?.phone,
      mode,
      pdfFile,
      successMsg: "Quotation shared successfully!"
    });
  },

  /**
   * Shares a virtual invoice dynamically.
   */
  async shareInvoice(invoice, { mode = "all", pdfFile = null } = {}) {
    const fallbackText = this.formatInvoiceShareText(invoice);
    const attachmentText = this.formatInvoiceAttachmentText(invoice);
    const textToShare = pdfFile ? attachmentText : fallbackText;

    await this._dispatchShare({
      title: `Standard Pumps Invoice #${invoice?.invoice_number || ""}`,
      textToShare,
      phone: invoice?.phone,
      mode,
      pdfFile,
      successMsg: "Invoice shared successfully!"
    });
  },

  /**
   * Shares a cashback card dynamically.
   */
  async shareCashbackCard(cashback, { mode = "all", pdfFile = null } = {}) {
    const textToShare = this.formatCashbackShareText(cashback);

    await this._dispatchShare({
      title: `Standard Pumps Cashback Pass - ${cashback?.voucher_code || ""}`,
      textToShare,
      phone: cashback?.phone,
      mode,
      pdfFile,
      successMsg: "Cashback card shared successfully!"
    });
  },

  /**
   * Normalizes an Indian phone number to 10 digits or E.164.
   */
  cleanPhoneNumber(rawPhone) {
    if (!rawPhone) return "";
    const digits = String(rawPhone).replace(/\D/g, "");
    return digits.length > 10 ? digits.slice(-10) : digits;
  },

  /**
   * Internal common dispatch logic for Web Share & WhatsApp deep-linking.
   * Supports both Windows Laptop WhatsApp application and mobile intent.
   * @private
   */
  async _dispatchShare({ title, textToShare, phone, mode = "all", pdfFile = null, successMsg }) {
    if (!textToShare) {
      toast.error("Invalid document context for sharing.");
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    const cleanPhone = this.cleanPhoneNumber(phone);
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    // 1. Mobile Native Web Share API (with or without File)
    if (isMobile && mode === "all" && navigator.share) {
      try {
        const shareData = {
          title,
          text: textToShare,
        };

        if (pdfFile && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          shareData.files = [pdfFile];
        }

        await navigator.share(shareData);
        toast.success(successMsg || "Shared successfully!");
        return;
      } catch (err) {
        if (err.name === "AbortError") {
          return; // User cancelled the share sheet
        }
        console.warn("Native Web Share failed, falling back to WhatsApp:", err);
      }
    }

    // 2. WhatsApp Direct Sharing (Explicit click or Mobile native fallback)
    if (mode === "whatsapp" || isMobile) {
      const encodedText = encodeURIComponent(textToShare);
      
      // Auto-copy the caption to clipboard so the user has it ready regardless
      this.copyToClipboard(textToShare, false);

      // If we have a PDF, trigger a forced physical download so it's in the device's "Recent Downloads".
      if (pdfFile) {
        try {
          const url = URL.createObjectURL(pdfFile);
          const a = document.createElement("a");
          a.href = url;
          a.download = pdfFile.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast("PDF downloaded. Tap 📎 in WhatsApp to attach it.", { duration: 6000, icon: "📎" });
        } catch (downloadErr) {
          console.warn("Failed to auto-download PDF fallback:", downloadErr);
        }
      }

      // Universal WhatsApp Deep-Link:
      // On Windows/Mac Desktop, api.whatsapp.com prompts "Open WhatsApp?" app dialog if installed,
      // and opens directly to the customer's phone number!
      let whatsappUrl = "";
      if (phoneParam) {
        // Direct link to customer's chat with prefilled text
        whatsappUrl = isMobile
          ? `whatsapp://send?phone=${phoneParam}&text=${encodedText}`
          : `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodedText}`;
      } else {
        // Fallback without phone number
        whatsappUrl = isMobile
          ? `whatsapp://send?text=${encodedText}`
          : `https://api.whatsapp.com/send?text=${encodedText}`;
      }

      try {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      } catch (err) {
        console.error("Could not launch WhatsApp:", err);
        this.copyToClipboard(textToShare, true);
      }
      return;
    }

    // 3. Fallback: Copy to Clipboard
    this.copyToClipboard(textToShare, true);
  },

  /**
   * Copies formatted text to clipboard with optional toast.
   */
  copyToClipboard(text, showToast = true) {
    if (!navigator.clipboard) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        if (showToast) toast.success("WhatsApp Caption copied to clipboard! 📋");
      } catch (err) {
        if (showToast) toast.error("Failed to copy caption text.");
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (showToast) toast.success("WhatsApp Caption copied to clipboard! 📋");
      })
      .catch((err) => {
        console.error("Clipboard write failure:", err);
        if (showToast) toast.error("Failed to copy caption text.");
      });
  },

  /**
   * Dedicated helper to copy customer's phone number to clipboard.
   */
  copyPhoneNumber(rawPhone) {
    const clean = this.cleanPhoneNumber(rawPhone);
    if (!clean) {
      toast.error("No phone number found.");
      return;
    }

    const formatted = clean.length === 10 ? clean : rawPhone;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(formatted).then(() => {
        toast.success(`Copied Phone: ${formatted} 📞`);
      });
    } else {
      this.copyToClipboard(formatted, false);
      toast.success(`Copied Phone: ${formatted} 📞`);
    }
  }
};

export default shareService;
