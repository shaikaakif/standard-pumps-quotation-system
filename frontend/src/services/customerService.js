import apiClient from "./api";
import { supabaseService } from "./supabaseClient";

/**
 * Normalizes phone numbers to standard 10-digit Indian mobile format
 * @param {string} phone 
 * @returns {string} 10-digit phone or original digits
 */
export function normalizePhone(phone) {
  if (!phone) return "";
  const cleaned = String(phone).replace(/\D/g, "");
  return cleaned.length > 10 ? cleaned.slice(-10) : cleaned;
}

/**
 * Formats 10-digit phone number as "+91 XXXXX XXXXX"
 * @param {string} phone 
 * @returns {string}
 */
export function formatPhone(phone) {
  const norm = normalizePhone(phone);
  if (norm.length === 10) {
    return `+91 ${norm.slice(0, 5)} ${norm.slice(5)}`;
  }
  return phone || "No Phone";
}

/**
 * Customer CRM Aggregator Service
 * Merges data across LocalStorage Invoices, Backend History API, and Supabase.
 */
class CustomerService {
  /**
   * Fetches and compiles all customers with their purchase items and quotations.
   * @returns {Promise<Array>} List of aggregated customer profiles
   */
  async getAllCustomers() {
    const customerMap = new Map();

    const getOrCreateCustomer = (phoneRaw, nameFallback) => {
      const cleanPhone = normalizePhone(phoneRaw) || `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      if (!customerMap.has(cleanPhone)) {
        customerMap.set(cleanPhone, {
          id: cleanPhone,
          phone: cleanPhone.startsWith("anon_") ? "" : cleanPhone,
          displayPhone: cleanPhone.startsWith("anon_") ? "Not Provided" : formatPhone(cleanPhone),
          name: (nameFallback || "Customer").trim(),
          invoices: [],
          quotations: [],
          itemsBought: [],
          totalSpend: 0,
          totalQuotedValue: 0,
          lastActive: null,
          firstSeen: null,
          tier: "Lead", // 'VIP' | 'Buyer' | 'Lead'
        });
      }
      const existing = customerMap.get(cleanPhone);
      if (nameFallback && (existing.name === "Customer" || existing.name.length < nameFallback.trim().length)) {
        existing.name = nameFallback.trim();
      }
      return existing;
    };

    // 1. Ingest LocalStorage Invoices
    try {
      const localInvoicesRaw = localStorage.getItem("spqs_invoices");
      if (localInvoicesRaw) {
        const localInvoices = JSON.parse(localInvoicesRaw);
        localInvoices.forEach((inv) => {
          this.processInvoice(inv, getOrCreateCustomer);
        });
      }
    } catch (e) {
      console.warn("Error reading local invoices:", e);
    }

    // 2. Ingest Backend Quotation History
    try {
      const response = await apiClient.get("/history", { params: { limit: 100 } });
      if (response.data && response.data.items) {
        response.data.items.forEach((item) => {
          this.processQuotation(item, getOrCreateCustomer);
        });
      }
    } catch (e) {
      console.warn("Backend quotation history unavailable (using offline data):", e?.message);
    }

    // 3. Ingest Supabase Records if configured
    if (supabaseService.isConfigured()) {
      try {
        const supaCustomers = await supabaseService.fetchCustomers(150);
        supaCustomers.forEach((sc) => {
          const client = getOrCreateCustomer(sc.phone, sc.name);
          if (sc.last_activity && (!client.lastActive || new Date(sc.last_activity) > new Date(client.lastActive))) {
            client.lastActive = sc.last_activity;
          }
        });

        // Supabase invoices
        const supaInvoices = await supabaseService.fetchInvoices(100);
        supaInvoices.forEach((inv) => {
          this.processInvoice(inv, getOrCreateCustomer);
        });

        // Supabase quotations
        const supaQuotations = await supabaseService.fetchQuotations(100);
        supaQuotations.forEach((q) => {
          this.processQuotation(q, getOrCreateCustomer);
        });
      } catch (e) {
        console.warn("Error fetching Supabase records for CRM:", e);
      }
    }

    // 4. Calculate Customer Tiers and finalize stats
    const customerList = Array.from(customerMap.values()).map((customer) => {
      // Determine Tier
      if (customer.totalSpend >= 25000 || customer.invoices.length >= 3) {
        customer.tier = "VIP";
      } else if (customer.invoices.length > 0) {
        customer.tier = "Buyer";
      } else {
        customer.tier = "Lead";
      }

      // De-duplicate items bought preview
      const uniqueItemsMap = new Map();
      customer.itemsBought.forEach((it) => {
        const key = it.name.trim().toLowerCase();
        if (!uniqueItemsMap.has(key)) {
          uniqueItemsMap.set(key, { ...it });
        } else {
          const existing = uniqueItemsMap.get(key);
          existing.qty = (parseFloat(existing.qty) || 1) + (parseFloat(it.qty) || 1);
          existing.total = (parseFloat(existing.total) || 0) + (parseFloat(it.total) || 0);
        }
      });
      customer.uniqueBoughtSummary = Array.from(uniqueItemsMap.values());

      return customer;
    });

    // Sort descending by most recent activity or highest spend
    customerList.sort((a, b) => {
      const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return dateB - dateA;
    });

    return customerList;
  }

  processInvoice(inv, getOrCreateCustomer) {
    if (!inv) return;
    const customer = getOrCreateCustomer(inv.phone, inv.customer_name);
    
    // Check if already in customer.invoices
    const exists = customer.invoices.some(
      (existing) => existing.invoice_number === inv.invoice_number || existing.invoice_id === inv.invoice_id
    );
    if (!exists) {
      customer.invoices.push(inv);
      const invoiceTotal = parseFloat(inv.grand_total) || 0;
      customer.totalSpend += invoiceTotal;

      // Ingest line items
      if (Array.isArray(inv.items)) {
        inv.items.forEach((item) => {
          if (item && item.name) {
            customer.itemsBought.push({
              name: item.name,
              qty: item.qty || 1,
              price: item.price || item.rate || 0,
              total: item.amount || (item.qty * item.price) || 0,
              invoiceNumber: inv.invoice_number,
              date: inv.date || inv.generated_at,
            });
          }
        });
      }

      // Track dates
      const invDate = inv.date || inv.generated_at || inv.created_at;
      if (invDate) {
        if (!customer.lastActive || new Date(invDate) > new Date(customer.lastActive)) {
          customer.lastActive = invDate;
        }
        if (!customer.firstSeen || new Date(invDate) < new Date(customer.firstSeen)) {
          customer.firstSeen = invDate;
        }
      }
    }
  }

  processQuotation(item, getOrCreateCustomer) {
    if (!item) return;
    const customer = getOrCreateCustomer(item.phone, item.customer_name);
    
    const exists = customer.quotations.some(
      (existing) => existing.quotation_id === item.quotation_id
    );
    if (!exists) {
      customer.quotations.push(item);
      const quoteTotal = item.totals?.grand_total || item.grand_total || 0;
      customer.totalQuotedValue += parseFloat(quoteTotal) || 0;

      const qDate = item.generated_at || item.created_at;
      if (qDate) {
        if (!customer.lastActive || new Date(qDate) > new Date(customer.lastActive)) {
          customer.lastActive = qDate;
        }
        if (!customer.firstSeen || new Date(qDate) < new Date(customer.firstSeen)) {
          customer.firstSeen = qDate;
        }
      }
    }
  }

  /**
   * Export all customer records to a structured CSV file
   */
  exportToCSV(customers) {
    if (!customers || customers.length === 0) return;

    const headers = [
      "Customer Name",
      "Phone Number",
      "Customer Tier",
      "Total Spend (INR)",
      "Invoices Count",
      "Quotations Count",
      "Items Purchased",
      "Last Interaction Date",
    ];

    const rows = customers.map((c) => {
      const itemsPurchasedStr = c.itemsBought
        .map((it) => `${it.name} (x${it.qty})`)
        .join("; ");
      
      const cleanSpend = Math.round(c.totalSpend);
      const lastDate = c.lastActive ? new Date(c.lastActive).toLocaleDateString("en-IN") : "N/A";

      return [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.phone}"`,
        `"${c.tier}"`,
        cleanSpend,
        c.invoices.length,
        c.quotations.length,
        `"${itemsPurchasedStr.replace(/"/g, '""')}"`,
        `"${lastDate}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Standard_Pumps_Customers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const customerService = new CustomerService();
export default customerService;
