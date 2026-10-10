import React, { useState, useEffect } from "react";
import { FiDatabase, FiCheck, FiAlertTriangle, FiCopy, FiRefreshCw, FiExternalLink } from "react-icons/fi";
import toast from "react-hot-toast";
import { supabaseService, DEFAULT_SUPABASE_SCHEMA_SQL } from "../../services/supabaseClient";
import apiClient from "../../services/api";

export default function SupabaseSyncForm() {
  const [config, setConfig] = useState(() => supabaseService.getConfig());
  const [url, setUrl] = useState(config.url || "");
  const [anonKey, setAnonKey] = useState(config.anonKey || "");
  const [autoSync, setAutoSync] = useState(config.autoSync ?? true);
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showAdvancedSql, setShowAdvancedSql] = useState(false);

  useEffect(() => {
    const current = supabaseService.getConfig();
    setUrl(current.url || "");
    setAnonKey(current.anonKey || "");
    setAutoSync(current.autoSync ?? true);
    if (supabaseService.isConfigured()) {
      handleTest(current.url, current.anonKey);
    }
  }, []);

  const handleSave = () => {
    const saved = supabaseService.saveConfig({ url, anonKey, autoSync });
    setConfig(saved);
    toast.success("Supabase settings saved!");
    handleTest(url, anonKey);
  };

  const handleTest = async (testUrl = url, testKey = anonKey) => {
    if (!testUrl || !testKey) {
      setTestResult({ success: false, error: "Please enter both Supabase URL and Anon Key." });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await supabaseService.testConnection(testUrl, testKey);
      setTestResult(res);
      if (res.success) {
        toast.success("Connected to Supabase successfully!");
      } else {
        toast.error(res.error || "Connection failed.");
      }
    } catch (e) {
      setTestResult({ success: false, error: e.message });
      toast.error("Failed to connect to Supabase.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(DEFAULT_SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    toast.success("SQL Schema copied! Paste into Supabase SQL Editor.");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSyncAllHistory = async () => {
    if (!supabaseService.isConfigured()) {
      toast.error("Please configure and save Supabase credentials first.");
      return;
    }
    setIsSyncingAll(true);
    const toastId = toast.loading("Syncing all customer records & documents to Supabase...");
    try {
      let count = 0;

      // 1. Fetch backend quotations
      try {
        const res = await apiClient.get("/history?limit=100");
        if (res.data?.items) {
          for (const item of res.data.items) {
            await supabaseService.syncCustomer({
              name: item.customer_name,
              phone: item.phone,
              lastActivity: `Quotation (${item.feet}FT)`,
            });
            count++;
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote quotations for sync:", err);
      }

      // 2. Fetch local invoices
      try {
        const storedInvoices = JSON.parse(localStorage.getItem("spqs_invoices") || "[]");
        for (const inv of storedInvoices) {
          await supabaseService.syncInvoice(inv);
          count++;
        }
      } catch (err) {
        console.warn("Could not sync local invoices:", err);
      }

      toast.success(`Successfully synchronized ${count} records with Supabase!`, { id: toastId });
    } catch (e) {
      toast.error(`Sync failed: ${e.message}`, { id: toastId });
    } finally {
      setIsSyncingAll(false);
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-brand-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-gray-200 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FiDatabase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-brand-primary uppercase tracking-wide">
              Supabase Cloud Database Sync
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Securely store customer records, quotations, and invoices in your cloud database
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div>
          {testResult?.success ? (
            <span className="inline-flex items-center space-x-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Connected & Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 bg-brand-gray-100 text-brand-muted px-3 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span>Not Connected</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Project URL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy-800 mb-1">
            Supabase Project URL
          </label>
          <input
            type="url"
            placeholder="https://your-project-id.supabase.co"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-brand-surface border border-brand-gray-300 rounded-lg outline-none focus:border-brand-primary transition-all font-mono"
          />
          <span className="text-[10px] text-brand-muted mt-1 block">
            Found in Supabase Project Settings → API → Project URL
          </span>
        </div>

        {/* Public Anon Key */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy-800 mb-1">
            Supabase Anon / Public Key
          </label>
          <input
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-brand-surface border border-brand-gray-300 rounded-lg outline-none focus:border-brand-primary transition-all font-mono"
          />
          <span className="text-[10px] text-brand-muted mt-1 block">
            Found in Supabase Project Settings → API → Project API Keys (anon public)
          </span>
        </div>

        {/* Auto Sync Toggle */}
        <div className="flex items-center justify-between p-3 bg-brand-gray-50 rounded-xl border border-brand-gray-200">
          <div>
            <span className="text-xs font-bold text-brand-navy-900 block">
              Auto-Sync Customer Data
            </span>
            <span className="text-[11px] text-brand-muted">
              Automatically backup customer info whenever a quote or invoice is generated
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-brand-primary/90 transition-all shadow-sm"
          >
            Save Configuration
          </button>

          <button
            type="button"
            onClick={() => handleTest(url, anonKey)}
            disabled={isTesting}
            className="bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-navy-900 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all border border-brand-gray-300 flex items-center space-x-1.5"
          >
            {isTesting ? (
              <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FiRefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{isTesting ? "Testing..." : "Test Connection"}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncAllHistory}
            disabled={isSyncingAll}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all shadow-sm flex items-center space-x-1.5"
          >
            <FiDatabase className="w-3.5 h-3.5" />
            <span>{isSyncingAll ? "Syncing..." : "Sync All Existing Data"}</span>
          </button>
        </div>

        {/* Test Result Feedback */}
        {testResult && !testResult.success && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2">
            <FiAlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <span className="font-bold block">Connection Error:</span>
              <span>{testResult.error}</span>
            </div>
          </div>
        )}

        {/* Optional Advanced Developer SQL (Hidden by default for clean client presentation) */}
        <div className="mt-3 pt-3 border-t border-brand-gray-200">
          <button
            type="button"
            onClick={() => setShowAdvancedSql(!showAdvancedSql)}
            className="text-[11px] font-bold text-brand-muted hover:text-brand-primary flex items-center space-x-1 transition-colors"
          >
            <span>{showAdvancedSql ? "▼ Hide Advanced Database Setup" : "▶ Show Advanced Database Setup (Developer Only)"}</span>
          </button>

          {showAdvancedSql && (
            <div className="mt-3 p-4 bg-brand-navy-950 text-brand-navy-100 rounded-xl border border-brand-navy-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-accent flex items-center space-x-1.5">
                  <span>SQL Schema Setup Script</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded flex items-center space-x-1 transition-all"
                >
                  {copiedSql ? (
                    <>
                      <FiCheck className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-3 h-3" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-brand-navy-300 mb-2 leading-relaxed">
                Run this one-time script in your <strong>Supabase SQL Editor</strong> to create the tables (<code>customers</code>, <code>quotations</code>, <code>invoices</code>) and Row Level Security policies.
              </p>
              <pre className="bg-black/40 p-2.5 rounded text-[10px] font-mono overflow-x-auto text-brand-navy-200 max-h-28 border border-white/5">
                {DEFAULT_SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
