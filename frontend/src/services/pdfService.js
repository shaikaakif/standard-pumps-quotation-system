import apiClient from "./api";
import html2pdf from "html2pdf.js";

/**
 * Service to handle high-fidelity, print-safe client-side DOM cloning,
 * sanitization, backend transmission with timeout/retry protections,
 * and direct PDF downloads.
 */
export const pdfService = {
  /**
   * Generates a high-quality PDF on the client-side using html2pdf.js.
   * This operates 100% offline and avoids backend memory constraints.
   * 
   * @param {HTMLElement} container - The live DOM node of the quotation container.
   * @param {string} customerName - The customer's name for file naming.
   * @param {number|string} depth - The bore depth in feet.
   * @param {object} options - Options containing state callbacks.
   */
  async generateClientPdf(container, customerName, depth, { onStart, onComplete, onError } = {}) {
    if (!container) {
      if (onError) onError(new Error("Quotation container DOM node not found."));
      return;
    }

    try {
      if (onStart) onStart();

      const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `Quotation_${sanitizedName}_${depth}FT.pdf`;

      // Define html2pdf options for high quality rendering
      const opt = {
        margin:       [10, 10, 10, 10], // Margin in mm
        filename:     filename,
        image:        { type: 'jpeg', quality: 1.0 }, // Maximum quality
        html2canvas:  { 
          scale: 2, // Scale 2 prevents blurry text
          useCORS: true, 
          letterRendering: true 
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // We clone the node strictly for visual safety so we can remove UI buttons
      const clonedNode = container.cloneNode(true);
      const elementsToPrune = clonedNode.querySelectorAll(".no-print, .no-pdf, button");
      elementsToPrune.forEach((el) => el.remove());

      // Trigger client-side generation
      await html2pdf().set(opt).from(clonedNode).save();

      if (onComplete) onComplete();
    } catch (err) {
      console.error("Client-side PDF generation failed, falling back to backend:", err);
      // Fallback to backend generation
      await this.generatePdf(container, customerName, depth, { onStart, onComplete, onError });
    }
  },

  /**
   * Generates a PDF Blob entirely offline for Web Share API native sharing.
   */
  async generatePdfBlob(container, customerName, depth) {
    if (!container) throw new Error("Container not found");

    const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Quotation_${sanitizedName}_${depth}FT.pdf`;

    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     filename,
      image:        { type: 'jpeg', quality: 1.0 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const clonedNode = container.cloneNode(true);
    const elementsToPrune = clonedNode.querySelectorAll(".no-print, .no-pdf, button");
    elementsToPrune.forEach((el) => el.remove());

    const pdfOutput = await html2pdf().set(opt).from(clonedNode).output('blob');
    return { blob: pdfOutput, filename };
  },

  /**
   * Legacy Backend Fallback: Sanitizes and serializes the quotation preview container,
   * then posts to backend to compile a print-safe A4 PDF.
   * 
   * @param {HTMLElement} container - The live DOM node of the quotation container.
   * @param {string} customerName - The customer's name for file naming.
   * @param {number|string} depth - The bore depth in feet.
   * @param {object} options - Options containing retries, timeout, and state callbacks.
   */
  async generatePdf(container, customerName, depth, { onStart, onComplete, onError } = {}) {
    if (!container) {
      if (onError) onError(new Error("Quotation container DOM node not found."));
      return;
    }

    try {
      if (onStart) onStart();

      // 1. Clone printable DOM node to avoid capturing live interactive states (e.g. tooltips, temporary shimmers)
      const clonedNode = container.cloneNode(true);

      // 2. Sanitize: Strictly prune all interactive elements, scripts, button layouts, and non-print items
      const elementsToPrune = clonedNode.querySelectorAll(
        "button, input, select, textarea, script, iframe, .no-print, .no-pdf, [aria-hidden='true']"
      );
      elementsToPrune.forEach((el) => el.remove());

      // Strip potential onclick or inline javascript listeners to avoid raw executable transmissions
      const allClonedElements = clonedNode.querySelectorAll("*");
      allClonedElements.forEach((el) => {
        const attributes = Array.from(el.attributes);
        attributes.forEach((attr) => {
          if (attr.name.startsWith("on") || attr.value.trim().toLowerCase().startsWith("javascript:")) {
            el.removeAttribute(attr.name);
          }
        });
      });

      // 3. Serialize only the sanitized quotation content
      const sanitizedHtml = clonedNode.innerHTML;

      // 4. Set deterministic, professional filename
      const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `Quotation_${sanitizedName}_${depth}FT.pdf`;

      // 5. Call API with built-in retry and timeout (15-second default timeout)
      const pdfBlob = await this._postWithRetry(
        "/quotation/pdf/generate",
        { html_content: sanitizedHtml, filename },
        2, // 2 retries
        15000 // 15s timeout
      );

      // 6. Trigger automatic download of the PDF binary
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Cleanup elements
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadUrl);

      if (onComplete) onComplete();
    } catch (err) {
      console.error("PDF Service error during compilation:", err);
      if (onError) onError(err);
    }
  },

  /**
   * Internal helper executing API POST with responseType blob, timeout, and retry logic.
   */
  async _postWithRetry(url, payload, retries = 2, timeout = 15000) {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const response = await apiClient.post(url, payload, {
          responseType: "blob",
          timeout: timeout,
        });
        
        if (response.data) {
          return response.data;
        }
        throw new Error("Empty response received from PDF engine.");
      } catch (error) {
        // If it was a network abort/timeout, or server 500 error, we attempt retry
        const isLastAttempt = attempt === retries + 1;
        if (isLastAttempt) {
          throw new Error(
            error.message || `PDF compilation timed out after ${attempt} attempts.`
          );
        }
        console.warn(`PDF generation attempt ${attempt} failed. Retrying...`, error);
        // Wait slightly before retry (exponential backoff 500ms * attempt)
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }
};
