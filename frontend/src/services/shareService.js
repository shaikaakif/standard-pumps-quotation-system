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
    const cust = quotation?.customer_name ? ` for *${quotation.customer_name}*` : "";
    const feetStr = quotation?.feet ? ` (${quotation.feet} Feet)` : "";
    const totalStr = quotation?.summary?.formatted_grand_total || (quotation?.totals?.grand_total ? `₹${Number(quotation.totals.grand_total).toLocaleString("en-IN")}` : "");
    const totalLine = totalStr ? `\n💰 *Total Estimate: ${totalStr}*` : "";
    const phoneStr = shop.secondary_phone ? `${shop.phone} / ${shop.secondary_phone}` : shop.phone;
    return `Assalamu Alaikum / Greetings.\n\nPlease find your Borewell Quotation${cust}${feetStr} from *${shop.shop_name}* attached in the PDF document above.${totalLine}\n\nFor any query or assistance, please contact us:\n📞 ${phoneStr}\n📍 ${shop.address}`;
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
    let alternativesText = "";
    if (quotation.show_motor_options && Array.isArray(quotation.motor_options) && quotation.motor_options.length > 1) {
      const optionsList = quotation.motor_options
        .map((opt) => `• *${opt.brand}* (${opt.spec}): ₹${Number(opt.package_grand_total || 0).toLocaleString("en-IN")}${opt.is_primary ? " ⭐" : ""}`)
        .join("\n");
      alternativesText = `\n\n*ALTERNATIVE MOTOR CHOICES & COMPLETE PACKAGE TOTALS:*\n${optionsList}`;
    }

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
• *Fittings & Installation:* Included${alternativesText}

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
    const invNo = invoice?.invoice_number ? `#${invoice.invoice_number}` : "Invoice";
    const cust = invoice?.customer_name ? ` for *${invoice.customer_name}*` : "";
    const totalStr = invoice?.grand_total ? `₹${Number(invoice.grand_total).toLocaleString("en-IN")}` : "";
    const totalLine = totalStr ? `\n💰 *Bill Amount: ${totalStr}*` : "";
    const phoneStr = shop.secondary_phone ? `${shop.phone} / ${shop.secondary_phone}` : shop.phone;
    return `Assalamu Alaikum / Greetings.\n\nPlease find your Bill/Invoice (${invNo})${cust} from *${shop.shop_name}* attached in the PDF document above.${totalLine}\n\nFor any query or assistance, please contact us:\n📞 ${phoneStr}\n📍 ${shop.address}`;
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
    ) || (typeof navigator !== "undefined" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const cleanPhone = this.cleanPhoneNumber(phone);
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    // Pre-copy caption text to clipboard as an instant 100% reliable backup
    this.copyToClipboard(textToShare, false);

    // 1. Mobile Native Web Share API with PDF File Attachment
    // On Mobile (Android / iOS / Safari), navigator.share({ files: [pdfFile] }) is the standard
    // way to attach a document directly into WhatsApp. WhatsApp opens with the PDF attached & caption prefilled!
    if (isMobile && pdfFile && typeof navigator !== "undefined" && typeof navigator.share === "function") {
      let canShareWithFile = false;
      try {
        if (typeof navigator.canShare === "function") {
          canShareWithFile = navigator.canShare({ files: [pdfFile] });
        }
      } catch (e) {
        console.warn("navigator.canShare check failed:", e);
      }

      if (canShareWithFile) {
        try {
          const sharePayload = {
            title: title || "Quotation",
            text: textToShare,
            files: [pdfFile],
          };

          let canShareFull = false;
          try {
            canShareFull = navigator.canShare(sharePayload);
          } catch (e) {
            canShareFull = false;
          }

          if (canShareFull) {
            await navigator.share(sharePayload);
          } else {
            // Some iOS/Android versions only support files without text in the share dictionary
            await navigator.share({
              title: title || "Quotation",
              files: [pdfFile],
            });
          }

          toast.success(successMsg || "Shared with PDF attachment!");
          return;
        } catch (err) {
          if (err.name === "AbortError") {
            // User dismissed the OS share sheet - cleanly exit
            return;
          }
          console.warn("Native file share aborted/failed, falling back to direct WhatsApp link:", err);
        }
      }
    }

    // 2. Mobile Native Web Share API without File (Generic mode="all")
    if (isMobile && mode === "all" && typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: title || "Quotation",
          text: textToShare,
        });
        toast.success(successMsg || "Shared successfully!");
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
        console.warn("Native text share failed, falling back:", err);
      }
    }

    // 3. WhatsApp Direct Deep-Link (Desktop PC or Mobile fallback)
    // On Desktop: automatically downloads the PDF and opens WhatsApp Web/Desktop with customer chat & prefilled message.
    if (mode === "whatsapp" || isMobile) {
      const encodedText = encodeURIComponent(textToShare);

      // Auto-download PDF so user has it directly in their downloads folder
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
          
          toast("📄 PDF downloaded! In WhatsApp, click 📎 to attach it.", { duration: 6000, icon: "📎" });
        } catch (downloadErr) {
          console.warn("Failed to auto-download PDF fallback:", downloadErr);
        }
      }

      // Universal WhatsApp Deep-Link:
      let whatsappUrl = "";
      if (phoneParam) {
        whatsappUrl = isMobile
          ? `whatsapp://send?phone=${phoneParam}&text=${encodedText}`
          : `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodedText}`;
      } else {
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

    // 4. Final Fallback: Copy to Clipboard
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
