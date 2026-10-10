import React, { useState, useEffect } from "react";
import { 
  FiCheck, 
  FiAlertTriangle, 
  FiRefreshCw, 
  FiExternalLink, 
  FiPhone, 
  FiKey, 
  FiEye, 
  FiEyeOff, 
  FiSend,
  FiZap,
  FiHelpCircle
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import ultraMsgService from "../../services/ultraMsgService";

export default function UltraMsgGatewayForm() {
  const [config, setConfig] = useState(() => ultraMsgService.getConfig());
  const [instanceId, setInstanceId] = useState(config.instanceId || "");
  const [token, setToken] = useState(config.token || "");
  const [senderPhone, setSenderPhone] = useState(config.senderPhone || "9110704747");
  const [showToken, setShowToken] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSendingTestMsg, setIsSendingTestMsg] = useState(false);

  useEffect(() => {
    const current = ultraMsgService.getConfig();
    setInstanceId(current.instanceId || "");
    setToken(current.token || "");
    setSenderPhone(current.senderPhone || "9110704747");
    
    if (ultraMsgService.isConfigured()) {
      handleTest(current.instanceId, current.token);
    }
  }, []);

  const handleSave = () => {
    const saved = ultraMsgService.saveConfig({
      instanceId,
      token,
      senderPhone,
    });
    setConfig(saved);
    toast.success("UltraMsg settings saved successfully!");
    handleTest(instanceId, token);
  };

  const handleTest = async (testInstance = instanceId, testToken = token) => {
    if (!testInstance || !testToken) {
      setTestResult({
        success: false,
        error: "Please enter both Instance ID and Token to test connection.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await ultraMsgService.testConnection(testInstance, testToken);
      setTestResult(res);
      if (res.success && res.authenticated) {
        toast.success("UltraMsg WhatsApp Gateway is Connected & Authenticated!");
      } else if (res.success && !res.authenticated) {
        toast("UltraMsg instance ready, but QR code scan is pending in WhatsApp.", {
          icon: "📱",
        });
      } else {
        toast.error(res.error || "Could not reach UltraMsg.");
      }
    } catch (e) {
      setTestResult({ success: false, error: e.message });
      toast.error("Failed to connect to UltraMsg.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!ultraMsgService.isConfigured()) {
      toast.error("Please configure and save your Instance ID and Token first.");
      return;
    }

    setIsSendingTestMsg(true);
    const toastId = toast.loading(`Sending test WhatsApp message to +91 ${senderPhone}...`);

    try {
      const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const testMsg = `⚡ *Standard Pumps WhatsApp Bot Connected!*\n\nThis is an automated test confirmation message sent from your UltraMsg Cloud Gateway at ${now}.\n\n✅ Linked Phone: +91 9110704747\n✅ Ready to auto-deliver Invoices & Quotations with PDF attachments!`;
      
      await ultraMsgService.sendTextMessage(senderPhone, testMsg);
      toast.success("Test message delivered to your WhatsApp!", { id: toastId });
    } catch (e) {
      console.error("Test send error:", e);
      toast.error(`Send failed: ${e.message}`, { id: toastId });
    } finally {
      setIsSendingTestMsg(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-green-100 text-green-600 rounded-xl shadow-xs">
            <FaWhatsapp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>WhatsApp Cloud Gateway (UltraMsg)</span>
              {testResult?.authenticated ? (
                <span className="text-[11px] font-bold bg-green-100 text-green-800 border border-green-300 px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1">
                  <FiCheck className="w-3 h-3 text-green-600" />
                  <span>Online & Linked</span>
                </span>
              ) : ultraMsgService.isConfigured() ? (
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1">
                  <FiRefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                  <span>Checking...</span>
                </span>
              ) : (
                <span className="text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-300 px-2.5 py-0.5 rounded-full">
                  Not Configured
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Automates background invoice & quotation delivery directly from your linked phone (<strong className="text-brand-navy-900">+91 9110704747</strong>).
            </p>
          </div>
        </div>

        <a
          href="https://ultramsg.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1 text-xs font-bold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 transition-colors self-start sm:self-center"
        >
          <span>UltraMsg Dashboard</span>
          <FiExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Instance ID */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            UltraMsg Instance ID *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. instance104829"
              value={instanceId}
              onChange={(e) => setInstanceId(e.target.value)}
              className="w-full text-sm font-mono px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-green-600 transition-all"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Found on your UltraMsg dashboard (or set in <code className="bg-gray-100 px-1 rounded">VITE_ULTRAMSG_INSTANCE_ID</code>).
          </p>
        </div>

        {/* Token */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            UltraMsg Token *
          </label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              placeholder="e.g. a7bc992x48q10..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full text-sm font-mono px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-green-600 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              {showToken ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Found on your UltraMsg instance credentials card.
          </p>
        </div>

        {/* Sender Mobile Number */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FiPhone className="text-green-600" />
            <span>Shop Sender Number (Must match scanned WhatsApp)</span>
          </label>
          <input
            type="text"
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
            className="w-full sm:w-80 text-sm font-mono px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-green-600 transition-all font-semibold"
            placeholder="9110704747"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Standard Pumps primary mobile: <strong className="text-gray-700">+91 9110704747</strong>. Test messages will be delivered to this number.
          </p>
        </div>
      </div>

      {/* Test Result Feedback Box */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-1.5 animate-fade-in ${
            testResult.success && testResult.authenticated
              ? "bg-green-50 border-green-200 text-green-900"
              : testResult.success && !testResult.authenticated
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center space-x-2 font-bold">
            {testResult.success && testResult.authenticated ? (
              <>
                <FiCheck className="w-4 h-4 text-green-600" />
                <span>Connected & Ready: WhatsApp session is authenticated!</span>
              </>
            ) : testResult.success && !testResult.authenticated ? (
              <>
                <FiAlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Instance connected, but WhatsApp QR code scan is pending!</span>
              </>
            ) : (
              <>
                <FiAlertTriangle className="w-4 h-4 text-red-600" />
                <span>Connection Check Failed</span>
              </>
            )}
          </div>
          <p className="text-[11px] opacity-90">
            {testResult.error ||
              (testResult.authenticated
                ? "Your app can now send PDF invoices, quotations, and loyalty cards directly to customers in 1 click."
                : "Open WhatsApp on your phone (+91 9110704747) > Linked Devices, and scan the QR code in your UltraMsg dashboard.")}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleTest()}
            disabled={isTesting}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
            <span>{isTesting ? "Checking..." : "Test Status"}</span>
          </button>

          <button
            type="button"
            onClick={handleSendTestMessage}
            disabled={isSendingTestMsg || !ultraMsgService.isConfigured()}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
            title="Send an instant WhatsApp message to +91 9110704747"
          >
            <FiZap className="w-3.5 h-3.5 text-green-600" />
            <span>{isSendingTestMsg ? "Sending..." : "Send Test Ping"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-green-600/30 active:scale-95"
        >
          <FiCheck className="w-4 h-4" />
          <span>Save WhatsApp Settings</span>
        </button>
      </div>

      {/* Step-by-Step Setup Guide Box */}
      <div className="bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl p-4 border border-gray-200/80 space-y-2">
        <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
          <FiHelpCircle className="w-4 h-4 text-green-600" />
          <span>How to Link Your WhatsApp (+91 9110704747) in 2 Minutes:</span>
        </h4>
        <ol className="text-xs text-gray-600 list-decimal list-inside space-y-1 pl-1">
          <li>Create an account at <a href="https://ultramsg.com" target="_blank" rel="noreferrer" className="text-green-700 underline font-semibold">ultramsg.com</a> and click <strong>"Add Instance"</strong>.</li>
          <li>On your phone with SIM <strong>+91 9110704747</strong>, open WhatsApp ➡️ <strong>Linked Devices</strong> ➡️ scan the QR code.</li>
          <li>Copy your <strong>Instance ID</strong> and <strong>Token</strong> from the UltraMsg dashboard and paste them here or into your <code className="bg-white px-1.5 py-0.5 rounded border text-[11px]">.env</code> file.</li>
        </ol>
      </div>
    </div>
  );
}
