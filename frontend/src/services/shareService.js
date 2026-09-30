import toast from "react-hot-toast";

/**
 * Service to manage professional quotation and invoice sharing behaviors,
 * optimizing separately for mobile (Web Share API / Native) and
 * desktop (WhatsApp Web / Clipboard Copy fallbacks).
 */
export const shareService = {
  // ==========================================
  // QUOTATION TEXT FORMATTERS
  // ==========================================

  /**
   * Builds the premium pre-filled WhatsApp text when a quotation PDF is attached.
   */
  formatAttachmentText() {
    return `Assalamu Alaikum.\n\nPlease find your quotation from Standard Pumps & Borewell attached.\n\nFor any assistance please contact us.\n\nStandard Pumps & Borewell\n📞 9110704747`;
  },

  /**
   * Builds a professional, structured plain-text quotation summary
   * perfect for business communication over chat apps when NO PDF is available.
   */
  formatShareText(quotation) {
    if (!quotation) return "";

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

    return `📋 *STANDARD PUMPS & BOREWELL*
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
📞 *Contact Shop:* +91 9110704747 , +91 9581472786
📍 *Address:* PILLAR NO 101,ATTAPUR, RINGROAD ,HYDERABAD,TELANGANA 500048`;
  },

  // ==========================================
  // INVOICE TEXT FORMATTERS
  // ==========================================

  /**
   * Builds the premium pre-filled WhatsApp text when an invoice PDF is attached.
   */
  formatInvoiceAttachmentText(invoice) {
    const invNo = invoice?.invoice_number || "Invoice";
    return `Assalamu Alaikum.\n\nPlease find your Bill/Invoice (${invNo}) from Standard Pumps & Borewell attached.\n\nFor any query or assistance, please contact us.\n\nStandard Pumps & Borewell\n📞 9110704747`;
  },

  /**
   * Builds a structured plain-text invoice summary for chat apps when NO PDF is attached.
   */
  formatInvoiceShareText(invoice) {
    if (!invoice) return "";
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

    return `🧾 *STANDARD PUMPS & BOREWELL*
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
📞 *Contact Shop:* +91 9110704747 , +91 9581472786
📍 *Address:* Pillar No 101, Attapur, Ring Road, Hyderabad - 500048`;
  },

  // ==========================================
  // SHARING HANDLERS
  // ==========================================

  /**
   * Shares a quotation estimate dynamically.
   */
  async shareQuotation(quotation, { mode = "all", pdfFile = null } = {}) {
    const fallbackText = this.formatShareText(quotation);
    const attachmentText = this.formatAttachmentText();
    const textToShare = pdfFile ? attachmentText : fallbackText;

    await this._dispatchShare({
      title: "Standard Pumps Quotation",
      textToShare,
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
      mode,
      pdfFile,
      successMsg: "Invoice shared successfully!"
    });
  },

  /**
   * Internal common dispatch logic for Web Share & WhatsApp deep-linking.
   * @private
   */
  async _dispatchShare({ title, textToShare, mode = "all", pdfFile = null, successMsg }) {
    if (!textToShare) {
      toast.error("Invalid document context for sharing.");
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // 1. Mobile Native Web Share API (with or without File)
    if (isMobile && navigator.share) {
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

      const whatsappUrl = isMobile
        ? `whatsapp://send?text=${encodedText}`
        : `https://web.whatsapp.com/send?text=${encodedText}`;

      try {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      } catch (err) {
        console.error("Could not launch WhatsApp:", err);
        this.copyToClipboard(textToShare);
      }
      return;
    }

    // 3. Fallback: Copy to Clipboard
    this.copyToClipboard(textToShare);
  },

  /**
   * Copies the formatted quotation text directly to the clipboard
   * and displays a beautiful success toast.
   */
  copyToClipboard(text) {
    if (!navigator.clipboard) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Document text copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy document text.");
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Document text copied to clipboard!");
      })
      .catch((err) => {
        console.error("Clipboard write failure:", err);
        toast.error("Failed to copy document text.");
      });
  }
};

export default shareService;
