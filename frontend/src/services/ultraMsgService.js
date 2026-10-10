/**
 * UltraMsg WhatsApp Cloud Gateway Service
 * 
 * Provides automated, background WhatsApp sending for invoices, quotations,
 * and VIP cashback passes directly from the shop's linked number (+91 9110704747).
 * 
 * Documentation: https://docs.ultramsg.com/
 */

const STORAGE_KEY = "spqs_ultramsg_config";

class UltraMsgService {
  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load configuration prioritizing localStorage, with fallback to environment variables.
   */
  loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.instanceId && parsed.token) {
          return {
            instanceId: parsed.instanceId.trim(),
            token: parsed.token.trim(),
            senderPhone: parsed.senderPhone || "9110704747",
            autoSendEnabled: parsed.autoSendEnabled ?? true,
          };
        }
      }
    } catch (e) {
      console.warn("Could not load stored UltraMsg configuration:", e);
    }

    // Fallback to Vite environment variables
    const envInstance = import.meta.env.VITE_ULTRAMSG_INSTANCE_ID || "";
    const envToken = import.meta.env.VITE_ULTRAMSG_TOKEN || "";

    return {
      instanceId: envInstance.trim(),
      token: envToken.trim(),
      senderPhone: "9110704747",
      autoSendEnabled: true,
    };
  }

  getConfig() {
    this.config = this.loadConfig();
    return this.config;
  }

  saveConfig({ instanceId, token, senderPhone = "9110704747", autoSendEnabled = true }) {
    const newConfig = {
      instanceId: (instanceId || "").trim(),
      token: (token || "").trim(),
      senderPhone: (senderPhone || "9110704747").trim(),
      autoSendEnabled: Boolean(autoSendEnabled),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      this.config = newConfig;
      return newConfig;
    } catch (e) {
      console.error("Failed to save UltraMsg config:", e);
      return newConfig;
    }
  }

  clearConfig() {
    localStorage.removeItem(STORAGE_KEY);
    this.config = this.loadConfig();
  }

  isConfigured() {
    const { instanceId, token } = this.getConfig();
    return Boolean(instanceId && token);
  }

  /**
   * Normalize any Indian phone number to international E.164 without leading plus.
   * e.g. "9110704747", "09110704747", "+91 91107 04747" -> "919110704747"
   */
  normalizePhone(phone) {
    if (!phone) return "";
    let clean = String(phone).replace(/\D/g, "");
    if (clean.length === 10) {
      return `91${clean}`;
    }
    if (clean.length === 11 && clean.startsWith("0")) {
      return `91${clean.slice(1)}`;
    }
    if (clean.length === 12 && clean.startsWith("91")) {
      return clean;
    }
    return clean;
  }

  /**
   * Convert a Blob or File to a Base64 Data URI string.
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Check connection status of the instance with UltraMsg.
   */
  async testConnection(customInstanceId = null, customToken = null) {
    const instanceId = customInstanceId || this.getConfig().instanceId;
    const token = customToken || this.getConfig().token;

    if (!instanceId || !token) {
      return {
        success: false,
        error: "Instance ID and Token are required to test connection.",
      };
    }

    try {
      // 1. Fetch connected WhatsApp profile (SHAIK ASIF / 919110704747)
      let meProfile = null;
      try {
        const meRes = await fetch(
          `https://api.ultramsg.com/${encodeURIComponent(instanceId)}/instance/me?token=${encodeURIComponent(token)}`
        );
        if (meRes.ok) {
          meProfile = await meRes.json();
        }
      } catch (err) {
        console.warn("Could not fetch instance profile:", err);
      }

      // 2. Fetch instance status
      const url = `https://api.ultramsg.com/${encodeURIComponent(instanceId)}/instance/status?token=${encodeURIComponent(token)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `UltraMsg API returned status ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();

      // UltraMsg returns nested: { status: { accountStatus: { status: "authenticated", substatus: "connected" } } }
      const statusStr =
        typeof data.status === "string"
          ? data.status
          : data?.status?.accountStatus?.status ||
            data?.accountStatus?.status ||
            "";

      const substatusStr =
        data?.status?.accountStatus?.substatus ||
        data?.accountStatus?.substatus ||
        "";

      const isAuth =
        statusStr === "authenticated" ||
        substatusStr === "connected" ||
        Boolean(meProfile?.id);

      return {
        success: true,
        authenticated: isAuth,
        status: statusStr || (isAuth ? "authenticated" : "pending"),
        substatus: substatusStr,
        profile: meProfile,
        data,
      };
    } catch (e) {
      return {
        success: false,
        error: e.message || "Failed to reach UltraMsg servers. Check your network connection.",
      };
    }
  }

  /**
   * Send a direct plain-text message.
   */
  async sendTextMessage(toPhone, message) {
    const { instanceId, token } = this.getConfig();
    if (!instanceId || !token) {
      throw new Error("UltraMsg is not configured with an Instance ID and Token.");
    }

    const formattedTo = this.normalizePhone(toPhone);
    if (!formattedTo) {
      throw new Error("Invalid destination phone number.");
    }

    const params = new URLSearchParams();
    params.append("token", token);
    params.append("to", formattedTo);
    params.append("body", message);

    const url = `https://api.ultramsg.com/${encodeURIComponent(instanceId)}/messages/chat`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  }

  /**
   * Send a Document (PDF) with an accompanying caption.
   * @param {Object} options
   * @param {string} options.toPhone - Target customer mobile
   * @param {string} options.filename - e.g. "Standard_Pumps_Invoice_0042.pdf"
   * @param {Blob|File|string} options.document - Blob/File object OR base64 data URI string
   * @param {string} options.caption - Formatted caption text
   */
  async sendDocument({ toPhone, filename, document, caption = "" }) {
    const { instanceId, token } = this.getConfig();
    if (!instanceId || !token) {
      throw new Error("UltraMsg is not configured. Please add your Instance ID and Token in Settings.");
    }

    const formattedTo = this.normalizePhone(toPhone);
    if (!formattedTo) {
      throw new Error("Invalid customer mobile number.");
    }

    // Convert document Blob to base64 if needed
    let documentPayload = document;
    if (document instanceof Blob || document instanceof File) {
      documentPayload = await this.blobToBase64(document);
    }

    const params = new URLSearchParams();
    params.append("token", token);
    params.append("to", formattedTo);
    params.append("filename", filename || "document.pdf");
    params.append("document", documentPayload);
    if (caption) {
      params.append("caption", caption);
    }

    const url = `https://api.ultramsg.com/${encodeURIComponent(instanceId)}/messages/document`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`UltraMsg Document Error (${response.status}): ${errText}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  }

  /**
   * Send an Image (PNG/JPEG) with an accompanying caption.
   */
  async sendImage({ toPhone, image, caption = "" }) {
    const { instanceId, token } = this.getConfig();
    if (!instanceId || !token) {
      throw new Error("UltraMsg is not configured.");
    }

    const formattedTo = this.normalizePhone(toPhone);
    if (!formattedTo) {
      throw new Error("Invalid customer mobile number.");
    }

    let imagePayload = image;
    if (image instanceof Blob || image instanceof File) {
      imagePayload = await this.blobToBase64(image);
    }

    const params = new URLSearchParams();
    params.append("token", token);
    params.append("to", formattedTo);
    params.append("image", imagePayload);
    if (caption) {
      params.append("caption", caption);
    }

    const url = `https://api.ultramsg.com/${encodeURIComponent(instanceId)}/messages/image`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  }
}

export const ultraMsgService = new UltraMsgService();
export default ultraMsgService;
