import toast from "react-hot-toast";

/**
 * Service to manage professional quotation sharing behaviors,
 * optimizing separately for mobile (Web Share API / Native) and
 * desktop (WhatsApp Web / Clipboard Copy fallbacks).
 */
export const shareService = {
  /**
   * Builds a professional, structured plain-text quotation summary
   * perfect for business communication over chat apps.
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

  /**
   * Shares the estimate dynamically.
   * - On Mobile: Attempts navigator.share()
   * - On Desktop: Deep-links to WhatsApp Web
   * - Fallback: Copies text to clipboard
   */
  async shareQuotation(quotation, { mode = "all" } = {}) {
    const text = this.formatShareText(quotation);
    if (!text) {
      toast.error("Invalid quotation context for sharing.");
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // 1. Mobile Sharing Strategy
    if (isMobile && mode === "all" && navigator.share) {
      try {
        await navigator.share({
          title: "Standard Pumps Quotation",
          text: text,
        });
        toast.success("Quotation shared successfully!");
        return;
      } catch (err) {
        // Ignore user-cancelled abort errors
        if (err.name !== "AbortError") {
          console.warn("Native Web Share failed, falling back to WhatsApp:", err);
        } else {
          return; // User cancelled
        }
      }
    }

    // 2. WhatsApp Direct Sharing (Explicit click or Mobile native fallback)
    if (mode === "whatsapp" || isMobile) {
      const encodedText = encodeURIComponent(text);
      // Mobile WhatsApp App link vs Desktop WhatsApp Web link
      const whatsappUrl = isMobile
        ? `whatsapp://send?text=${encodedText}`
        : `https://web.whatsapp.com/send?text=${encodedText}`;

      try {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        toast.success("Opening WhatsApp...");
      } catch (err) {
        console.error("Could not launch WhatsApp:", err);
        this.copyToClipboard(text);
      }
      return;
    }

    // 3. Fallback: Copy to Clipboard
    this.copyToClipboard(text);
  },

  /**
   * Copies the formatted quotation text directly to the clipboard
   * and displays a beautiful success toast.
   */
  copyToClipboard(text) {
    if (!navigator.clipboard) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";  // Avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Quotation text copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy quotation text.");
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Quotation text copied to clipboard!");
      })
      .catch((err) => {
        console.error("Clipboard write failure:", err);
        toast.error("Failed to copy quotation text.");
      });
  }
};
