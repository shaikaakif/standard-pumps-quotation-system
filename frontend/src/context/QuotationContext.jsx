import { supabaseService } from "../services/supabaseClient";

const QuotationContext = createContext();

export const QuotationProvider = ({ children }) => {
  const [quotationResponse, setQuotationResponse] = useState(null);
  const [quotationSummary, setQuotationSummary] = useState(null);
  const [quotationMetadata, setQuotationMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isNewQuotation, setIsNewQuotation] = useState(false);
  
  // Persist form input states between screen navigation
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    feet: "",
    mode: "REGULAR",
    phase: "single",
    starter_type: "manual",
    preferred_brand: "",
  });

  // Document Type & Tab Switcher State: 'quotation' | 'invoice'
  const [activeTab, setActiveTab] = useState("quotation");
  const [activeDocType, setActiveDocType] = useState("QUOTATION");
  const [invoiceData, setInvoiceData] = useState(null);

  const saveQuotation = (data) => {
    setQuotationResponse(data);
    setQuotationSummary(data.summary || null);
    setActiveDocType("QUOTATION");
    setIsNewQuotation(true); // Flag this as a brand new quotation for confetti
    
    // Mapped quotation metadata
    setQuotationMetadata({
      quotation_id: data.quotation_id,
      generated_at: data.generated_at,
      customer_name: data.customer_name,
      phone: data.phone,
      feet: data.feet,
      mode: data.mode,
    });

    // Background sync customer & quotation to Supabase if configured
    try {
      supabaseService.syncQuotation(data);
    } catch (e) {
      console.warn("Background Supabase quotation sync skipped:", e);
    }
  };

  const saveInvoice = (data) => {
    setInvoiceData(data);
    setActiveDocType("INVOICE");
    setIsNewQuotation(true);

    // Save to local invoice cache
    try {
      const existingInvoices = JSON.parse(localStorage.getItem("spqs_invoices") || "[]");
      const filtered = existingInvoices.filter((inv) => inv.invoice_id !== data.invoice_id);
      const updated = [data, ...filtered].slice(0, 100); // keep up to 100 recent invoices
      localStorage.setItem("spqs_invoices", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not cache invoice locally:", e);
    }

    // Background sync customer & invoice to Supabase if configured
    try {
      supabaseService.syncInvoice(data);
    } catch (e) {
      console.warn("Background Supabase invoice sync skipped:", e);
    }
  };

  const clearQuotation = () => {
    setQuotationResponse(null);
    setQuotationSummary(null);
    setQuotationMetadata(null);
    setError(null);
    setIsNewQuotation(false);
  };

  const clearInvoice = () => {
    setInvoiceData(null);
    setError(null);
    setIsNewQuotation(false);
  };

  return (
    <QuotationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeDocType,
        setActiveDocType,
        quotationResponse,
        quotationSummary,
        quotationMetadata,
        invoiceData,
        saveInvoice,
        clearInvoice,
        isLoading,
        setIsLoading,
        error,
        setError,
        formData,
        setFormData,
        saveQuotation,
        clearQuotation,
        isNewQuotation,
        setIsNewQuotation,
      }}
    >
      {children}
    </QuotationContext.Provider>
  );
};

export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error("useQuotation must be used within a QuotationProvider");
  }
  return context;
};
