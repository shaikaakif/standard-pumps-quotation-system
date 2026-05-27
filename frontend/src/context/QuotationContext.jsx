import React, { createContext, useContext, useState } from "react";

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

  const saveQuotation = (data) => {
    setQuotationResponse(data);
    setQuotationSummary(data.summary || null);
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
  };

  const clearQuotation = () => {
    setQuotationResponse(null);
    setQuotationSummary(null);
    setQuotationMetadata(null);
    setError(null);
    setIsNewQuotation(false);
  };

  return (
    <QuotationContext.Provider
      value={{
        quotationResponse,
        quotationSummary,
        quotationMetadata,
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
