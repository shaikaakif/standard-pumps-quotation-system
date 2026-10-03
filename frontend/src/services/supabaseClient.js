import { createClient } from "@supabase/supabase-js";

const CONFIG_STORAGE_KEY = "spqs_supabase_config";

export const DEFAULT_SUPABASE_SCHEMA_SQL = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'SPQS PWA',
  total_documents INT DEFAULT 1,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  feet INT NOT NULL,
  mode TEXT NOT NULL,
  grand_total NUMERIC NOT NULL,
  quotation_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date TEXT NOT NULL,
  payment_mode TEXT,
  is_gst BOOLEAN DEFAULT FALSE,
  grand_total NUMERIC NOT NULL,
  invoice_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) or public read/write for shop app
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they already exist (prevents ERROR 42710)
DROP POLICY IF EXISTS "Allow public read-write for anon key" ON customers;
DROP POLICY IF EXISTS "Allow public read-write for anon key" ON quotations;
DROP POLICY IF EXISTS "Allow public read-write for anon key" ON invoices;

-- Create policies cleanly
CREATE POLICY "Allow public read-write for anon key" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for anon key" ON quotations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for anon key" ON invoices FOR ALL USING (true) WITH CHECK (true);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_quotations_phone ON quotations(phone);
CREATE INDEX IF NOT EXISTS idx_invoices_phone ON invoices(phone);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
`;

class SupabaseService {
  constructor() {
    this.client = null;
    this.initClient();
  }

  getConfig() {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read stored Supabase config:", e);
    }

    return {
      url: import.meta.env.VITE_SUPABASE_URL || "",
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
      autoSync: true,
    };
  }

  saveConfig({ url, anonKey, autoSync = true }) {
    const config = {
      url: (url || "").trim(),
      anonKey: (anonKey || "").trim(),
      autoSync: Boolean(autoSync),
    };
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn("Could not save Supabase config:", e);
    }
    this.initClient();
    return config;
  }

  initClient() {
    const { url, anonKey } = this.getConfig();
    if (url && anonKey) {
      try {
        this.client = createClient(url, anonKey, {
          auth: { persistSession: false },
        });
      } catch (e) {
        console.error("Failed to initialize Supabase client:", e);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  isConfigured() {
    const { url, anonKey } = this.getConfig();
    return Boolean(url && anonKey && this.client);
  }

  async testConnection(customUrl = null, customKey = null) {
    let clientToTest = this.client;
    if (customUrl && customKey) {
      try {
        clientToTest = createClient(customUrl.trim(), customKey.trim(), {
          auth: { persistSession: false },
        });
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    if (!clientToTest) {
      return { success: false, error: "Supabase credentials are not set." };
    }

    try {
      // Test querying the customers table (limit 1)
      const { data, error } = await clientToTest
        .from("customers")
        .select("id")
        .limit(1);

      if (error) {
        // If table doesn't exist, provide clear guidance
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          return {
            success: false,
            tableMissing: true,
            error: "Connected to Supabase, but tables are missing. Please run the setup SQL in your Supabase dashboard.",
          };
        }
        return { success: false, error: error.message };
      }

      return { success: true, count: data?.length ?? 0 };
    } catch (e) {
      return { success: false, error: e.message || "Connection failed." };
    }
  }

  /**
   * Sync customer details to Supabase 'customers' table.
   * Upserts based on phone number to prevent duplicates.
   */
  async syncCustomer({ name, phone, lastActivity = "Quotation" }) {
    if (!this.isConfigured()) return null;
    const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);
    if (!cleanPhone) return null;

    try {
      const { data: existing } = await this.client
        .from("customers")
        .select("id, total_documents")
        .eq("phone", cleanPhone)
        .maybeSingle();

      const totalDocs = existing ? (existing.total_documents || 1) + 1 : 1;

      const { data, error } = await this.client
        .from("customers")
        .upsert(
          {
            name: name || "Valued Customer",
            phone: cleanPhone,
            source: "SPQS PWA",
            total_documents: totalDocs,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "phone" }
        )
        .select();

      if (error) {
        console.warn("Supabase customer sync failed:", error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn("Supabase customer sync error:", e);
      return null;
    }
  }

  /**
   * Sync quotation document and associated customer to Supabase.
   */
  async syncQuotation(quotation) {
    if (!this.isConfigured()) return null;
    if (!quotation) return null;

    try {
      // 1. Sync customer record
      await this.syncCustomer({
        name: quotation.customer_name,
        phone: quotation.phone,
        lastActivity: `Quotation (${quotation.feet}FT)`,
      });

      // 2. Insert quotation record
      const id = quotation.quotation_id || `QUO-${Date.now()}`;
      const payload = {
        id,
        customer_name: quotation.customer_name || "Customer",
        phone: (quotation.phone || "").replace(/\D/g, "").slice(-10),
        feet: parseInt(quotation.feet, 10) || 0,
        mode: quotation.mode || "REGULAR",
        grand_total: quotation.totals?.grand_total || 0,
        quotation_data: quotation,
        created_at: quotation.generated_at || new Date().toISOString(),
      };

      const { data, error } = await this.client
        .from("quotations")
        .upsert(payload, { onConflict: "id" })
        .select();

      if (error) {
        console.warn("Supabase quotation sync failed:", error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn("Supabase quotation sync error:", e);
      return null;
    }
  }

  /**
   * Sync invoice document and associated customer to Supabase.
   */
  async syncInvoice(invoice) {
    if (!this.isConfigured()) return null;
    if (!invoice) return null;

    try {
      // 1. Sync customer record
      await this.syncCustomer({
        name: invoice.customer_name,
        phone: invoice.phone,
        lastActivity: `Invoice #${invoice.invoice_number}`,
      });

      // 2. Insert invoice record
      const id = invoice.invoice_id || invoice.invoice_number || `INV-${Date.now()}`;
      const payload = {
        id,
        invoice_number: invoice.invoice_number || `INV-${Date.now()}`,
        customer_name: invoice.customer_name || "Customer",
        phone: (invoice.phone || "").replace(/\D/g, "").slice(-10),
        date: invoice.date || new Date().toISOString().split("T")[0],
        payment_mode: invoice.payment_mode || "Cash",
        is_gst: Boolean(invoice.is_gst),
        grand_total: parseFloat(invoice.grand_total) || 0,
        invoice_data: invoice,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await this.client
        .from("invoices")
        .upsert(payload, { onConflict: "id" })
        .select();

      if (error) {
        console.warn("Supabase invoice sync failed:", error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn("Supabase invoice sync error:", e);
      return null;
    }
  }

  /**
   * Fetch customer directory from Supabase.
   */
  async fetchCustomers(limit = 100) {
    if (!this.isConfigured()) return [];
    try {
      const { data, error } = await this.client
        .from("customers")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn("Failed to fetch customers from Supabase:", e);
      return [];
    }
  }

  /**
   * Fetch invoices from Supabase.
   */
  async fetchInvoices(limit = 100) {
    if (!this.isConfigured()) return [];
    try {
      const { data, error } = await this.client
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data?.map((row) => row.invoice_data || row) || [];
    } catch (e) {
      console.warn("Failed to fetch invoices from Supabase:", e);
      return [];
    }
  }

  /**
   * Fetch quotations from Supabase.
   */
  async fetchQuotations(limit = 100) {
    if (!this.isConfigured()) return [];
    try {
      const { data, error } = await this.client
        .from("quotations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data?.map((row) => row.quotation_data || row) || [];
    } catch (e) {
      console.warn("Failed to fetch quotations from Supabase:", e);
      return [];
    }
  }

  /**
   * Delete customer and their records from Supabase by phone
   */
  async deleteCustomer(phone) {
    if (!this.isConfigured() || !phone) return false;
    const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
    try {
      await this.client.from("customers").delete().eq("phone", cleanPhone);
      await this.client.from("quotations").delete().eq("phone", cleanPhone);
      await this.client.from("invoices").delete().eq("phone", cleanPhone);
      return true;
    } catch (e) {
      console.warn("Failed to delete customer from Supabase:", e);
      return false;
    }
  }

  /**
   * Delete specific invoice from Supabase
   */
  async deleteInvoice(invoiceNumberOrId) {
    if (!this.isConfigured() || !invoiceNumberOrId) return false;
    try {
      await this.client
        .from("invoices")
        .delete()
        .or(`id.eq.${invoiceNumberOrId},invoice_number.eq.${invoiceNumberOrId}`);
      return true;
    } catch (e) {
      console.warn("Failed to delete invoice from Supabase:", e);
      return false;
    }
  }

  /**
   * Delete specific quotation from Supabase
   */
  async deleteQuotation(quotationId) {
    if (!this.isConfigured() || !quotationId) return false;
    try {
      await this.client.from("quotations").delete().eq("id", quotationId);
      return true;
    } catch (e) {
      console.warn("Failed to delete quotation from Supabase:", e);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;
