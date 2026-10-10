import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuotation } from "../../context/QuotationContext";
import quotationService from "../../services/quotationService";
import toast from "react-hot-toast";
import { 
  FiUser, FiPhone, FiCompass, FiZap, FiToggleRight, FiCpu, 
  FiFileText, FiStar, FiAward, FiPlus, FiCheck, FiX, FiLayers, FiHelpCircle
} from "react-icons/fi";
import { useLoadingSteps } from "../../hooks/useLoadingSteps";
import LoadingOverlay from "../system/LoadingOverlay";

function CustomerForm() {
  const navigate = useNavigate();
  const { formData, setFormData, saveQuotation, isLoading, setIsLoading, error, setError } = useQuotation();
  
  const [validationErrors, setValidationErrors] = useState({});
  const loader = useLoadingSteps("quotation", 2500);

  // Motor Customization States
  const [localBrandName, setLocalBrandName] = useState("Jai Kissan");
  const [customMotors, setCustomMotors] = useState([]);
  const [selectedMotorBrand, setSelectedMotorBrand] = useState("");
  const [showMotorOptions, setShowMotorOptions] = useState(true);
  const [compareBrands, setCompareBrands] = useState([]);
  
  // Custom Motor Popup Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [newMotor, setNewMotor] = useState({
    brand: "",
    hp: "2.0",
    stage: "25",
    price: "",
  });

  // Reset form errors on load
  useEffect(() => {
    setError(null);
    setValidationErrors({});
  }, [setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when editing field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleModeChange = (mode) => {
    setFormData((prev) => ({
      ...prev,
      mode,
      preferred_brand: mode === "STANDARD" && prev.preferred_brand === "budget" ? "Crompton" : prev.preferred_brand
    }));
  };

  const handlePhaseChange = (phase) => {
    setFormData((prev) => ({
      ...prev,
      phase,
      starter_type: phase === "three" ? "timer" : "manual"
    }));
  };

  // Dynamically compute available motors auto-sized for current depth & phase
  const availableMotors = useMemo(() => {
    const feetNum = parseInt(formData.feet, 10);
    if (!feetNum || feetNum <= 0) return [];
    return quotationService.getCompatibleMotors(feetNum, formData.phase, formData.mode, {
      localBrandName,
      customMotors,
    });
  }, [formData.feet, formData.phase, formData.mode, localBrandName, customMotors]);

  // Keep selectedMotorBrand synchronized with availableMotors
  useEffect(() => {
    if (availableMotors.length > 0) {
      const exists = availableMotors.some((m) => m.brand === selectedMotorBrand);
      if (!exists || !selectedMotorBrand) {
        const primary = availableMotors.find((m) => m.is_primary_recommendation) || availableMotors[0];
        setSelectedMotorBrand(primary.brand);
      }
    }
  }, [availableMotors, selectedMotorBrand]);

  // Handle adding a custom motor brand from popup modal
  const handleAddCustomMotor = (e) => {
    e.preventDefault();
    if (!newMotor.brand.trim()) {
      toast.error("Please enter motor company / brand name.");
      return;
    }
    const priceNum = parseFloat(newMotor.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid motor price in ₹.");
      return;
    }

    const added = {
      brand: newMotor.brand.trim(),
      spec: `${newMotor.hp || 2} HP / ${newMotor.stage || 25} Stage V4`,
      price: priceNum,
      hp: parseFloat(newMotor.hp) || 2.0,
      stage: parseInt(newMotor.stage, 10) || 25,
      is_custom: true,
    };

    setCustomMotors((prev) => [...prev, added]);
    setSelectedMotorBrand(added.brand);
    setIsCustomModalOpen(false);
    setNewMotor({ brand: "", hp: "2.0", stage: "25", price: "" });
    toast.success(`Custom motor "${added.brand}" added and selected!`);
  };

  // Toggle brand inclusion in the comparison table
  const toggleCompareBrand = (brandName) => {
    setCompareBrands((prev) => {
      // If prev is empty, it means all are currently included by default
      if (prev.length === 0) {
        const allBrands = availableMotors.map((m) => m.brand);
        return allBrands.filter((b) => b !== brandName);
      }
      if (prev.includes(brandName)) {
        return prev.filter((b) => b !== brandName);
      } else {
        return [...prev, brandName];
      }
    });
  };

  // Perform client-side validation
  const validateForm = () => {
    const errors = {};
    if (!formData.customer_name.trim()) {
      errors.customer_name = "Customer name is required.";
    }
    if (!formData.phone) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      errors.phone = "Must be a valid 10-digit phone number.";
    }
    if (!formData.feet) {
      errors.feet = "Borewell depth is required.";
    } else {
      const feetNum = parseInt(formData.feet, 10);
      if (isNaN(feetNum) || feetNum <= 0) {
        errors.feet = "Depth must be a positive number of feet.";
      } else if (feetNum > 4000) {
        errors.feet = "Depth exceeds maximum limits (4000 FT).";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      toast.error("Please resolve the validation errors.");
      return;
    }

    setIsLoading(true);
    loader.startLoading();

    try {
      const selectedMotorObj = availableMotors.find((m) => m.brand === selectedMotorBrand) || null;

      // Generate quotation client-side via 100% serverless calculation engine
      const quotationData = quotationService.generateQuotation({
        customer_name: formData.customer_name,
        phone: formData.phone.replace(/\D/g, ""),
        feet: parseInt(formData.feet, 10),
        phase: formData.phase,
        starter_type: formData.starter_type,
        preferred_brand: selectedMotorBrand || formData.preferred_brand || null,
        local_brand_name: localBrandName,
        custom_motors: customMotors,
        selected_motor: selectedMotorObj,
        show_motor_options: showMotorOptions,
        compare_brands: compareBrands.length > 0 ? compareBrands : null,
        mode: formData.mode,
      });

      loader.completeLoading();

      setTimeout(() => {
        saveQuotation(quotationData);
        toast.success("Professional Estimate Generated!");
        setIsLoading(false);
        navigate("/preview");
      }, 500);
    } catch (err) {
      loader.stopLoading();
      setIsLoading(false);
      const errMsg = err.message || "An unexpected error occurred.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Name and Phone Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="customer_name" className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center">
            <FiUser className="mr-1 text-brand-secondary" /> Customer Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              placeholder="e.g. Ramesh Reddy"
              value={formData.customer_name}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full text-sm pl-3 pr-3 py-3 bg-brand-surface border rounded-xl shadow-sm outline-none transition-all ${
                validationErrors.customer_name
                  ? "border-brand-danger bg-red-50/10 focus:border-red-600"
                  : "border-brand-gray-300 focus:border-brand-primary"
              }`}
            />
          </div>
          {validationErrors.customer_name && (
            <p className="text-red-500 text-xs mt-1 font-semibold">{validationErrors.customer_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center">
            <FiPhone className="mr-1 text-brand-secondary" /> Phone Number
          </label>
          <div className="relative">
            <input
              type="text"
              id="phone"
              name="phone"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full text-sm pl-3 pr-3 py-3 bg-brand-surface border rounded-xl shadow-sm outline-none transition-all ${
                validationErrors.phone
                  ? "border-brand-danger bg-red-50/10 focus:border-red-600"
                  : "border-brand-gray-300 focus:border-brand-primary"
              }`}
            />
          </div>
          {validationErrors.phone && (
            <p className="text-red-500 text-xs mt-1 font-semibold">{validationErrors.phone}</p>
          )}
        </div>
      </div>

      {/* 2. Borewell Depth Input */}
      <div>
        <label htmlFor="feet" className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center">
          <FiCompass className="mr-1 text-brand-secondary" /> Borewell Depth (Feet)
        </label>
        <div className="relative">
          <input
            type="number"
            id="feet"
            name="feet"
            placeholder="e.g. 500"
            value={formData.feet}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full text-sm pl-3 pr-3 py-3 bg-brand-surface border rounded-xl shadow-sm outline-none transition-all ${
              validationErrors.feet
                ? "border-brand-danger bg-red-50/10 focus:border-red-600"
                : "border-brand-gray-300 focus:border-brand-primary"
            }`}
          />
        </div>
        {validationErrors.feet && (
          <p className="text-red-500 text-xs mt-1 font-semibold">{validationErrors.feet}</p>
        )}
      </div>

      {/* 3. Motor Sizing, Selection & Multi-Brand Comparison Setup */}
      <div className="border border-brand-gray-200 rounded-2xl p-4 sm:p-5 bg-brand-surface shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-brand-gray-200 gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center">
              <FiAward className="mr-1.5 text-brand-secondary w-4 h-4" />
              Submersible Motor Selection & Comparison
            </h3>
            <p className="text-[10px] text-brand-muted mt-0.5">
              Select primary motor for this estimate & configure multi-brand customer options.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="self-start sm:self-auto flex items-center space-x-1.5 text-xs font-bold bg-brand-primary text-white hover:bg-brand-navy-900 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>+ Add Custom Motor</span>
          </button>
        </div>

        {availableMotors.length === 0 ? (
          <div className="p-4 bg-brand-gray-50 border border-brand-gray-200 rounded-xl text-center text-xs text-brand-muted">
            Enter borewell depth in feet above to automatically size compatible motors (Crompton, CRI, Aqua Texmo, Local & Custom).
          </div>
        ) : (
          <div className="space-y-4">
            {/* Motor Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableMotors.map((motor, idx) => {
                const isSelected = selectedMotorBrand === motor.brand;
                const isCompared = compareBrands.length === 0 || compareBrands.includes(motor.brand);

                return (
                  <div
                    key={`${motor.brand}-${idx}`}
                    onClick={() => setSelectedMotorBrand(motor.brand)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative ${
                      isSelected
                        ? "bg-brand-primary/5 border-brand-primary ring-2 ring-brand-primary/20 shadow-xs"
                        : "bg-white border-brand-gray-200 hover:border-brand-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-brand-navy-900">
                            {motor.brand}
                          </span>
                          {motor.is_custom && (
                            <span className="text-[9px] uppercase font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">
                              Custom
                            </span>
                          )}
                          {motor.is_premium ? (
                            <span className="text-[9px] uppercase font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                              Premium
                            </span>
                          ) : (
                            <span className="text-[9px] uppercase font-bold bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded">
                              Economy
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-brand-muted font-medium mt-0.5">
                          {motor.spec}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-brand-primary block">
                          ₹{Number(motor.price).toLocaleString("en-IN")}
                        </span>
                        {isSelected ? (
                          <span className="inline-flex items-center space-x-1 text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
                            <FiCheck className="w-2.5 h-2.5" />
                            <span>Primary</span>
                          </span>
                        ) : (
                          <span className="text-[9px] text-brand-muted hover:text-brand-primary block mt-1">
                            Select as Primary
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Inclusion toggle in comparison table */}
                    <div className="mt-2 pt-2 border-t border-brand-gray-100 flex items-center justify-between text-[10px]">
                      <span className="text-brand-muted">Include in PDF comparison:</span>
                      <label 
                        onClick={(e) => e.stopPropagation()} 
                        className="flex items-center space-x-1 cursor-pointer font-semibold text-brand-text"
                      >
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompareBrand(motor.brand)}
                          className="rounded text-brand-primary focus:ring-brand-primary"
                        />
                        <span>Compare</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Local Brand Display Name Field (if not Standard mode) */}
            {formData.mode !== "STANDARD" && (
              <div className="bg-white p-3 rounded-xl border border-brand-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-brand-navy-900 block">
                    Local / Economy Brand Display Name
                  </span>
                  <span className="text-[10px] text-brand-muted block">
                    Set what company name prints on the bill (e.g. Jai Kissan, Orient, Champion, Local Assembled).
                  </span>
                </div>
                <div className="w-full sm:w-48">
                  <input
                    type="text"
                    value={localBrandName}
                    onChange={(e) => setLocalBrandName(e.target.value)}
                    placeholder="Jai Kissan"
                    className="w-full text-xs px-2.5 py-1.5 bg-brand-gray-50 border border-brand-gray-300 rounded-lg outline-none focus:border-brand-primary font-medium"
                  />
                </div>
              </div>
            )}

            {/* Multi-Brand Comparison Table Toggle for the PDF */}
            <div className="bg-gradient-to-r from-brand-navy-50 to-white p-3 rounded-xl border border-brand-navy-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-brand-navy-900 flex items-center space-x-1.5">
                  <FiLayers className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Show Multi-Brand Price Options on PDF Estimate</span>
                </span>
                <span className="text-[10px] text-brand-muted block mt-0.5">
                  Prints a turnkey comparison table (Crompton, CRI, Local, etc.) on page 1 of the customer's PDF bill.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={showMotorOptions}
                  onChange={(e) => setShowMotorOptions(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary" />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 4. Segmented Mode Selector */}
      <div className="border border-brand-gray-200 rounded-2xl p-5 bg-brand-surface shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center">
            <FiToggleRight className="mr-1 text-brand-secondary" /> Quotation Material Mode
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleModeChange("REGULAR")}
            disabled={isLoading}
            className={`px-4 py-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
              formData.mode === "REGULAR"
                ? "bg-brand-surface border-brand-primary ring-2 ring-brand-primary/20 shadow-sm"
                : "bg-brand-surface border-brand-gray-200 hover:border-brand-gray-300"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-sm font-bold ${formData.mode === "REGULAR" ? "text-brand-primary" : "text-brand-muted"}`}>
                REGULAR (Budget)
              </span>
              {formData.mode === "REGULAR" && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
            </div>
            <span className="text-[10px] text-brand-gray-550 mt-1">Economical cable cutoff boundaries enabled</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("STANDARD")}
            disabled={isLoading}
            className={`px-4 py-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
              formData.mode === "STANDARD"
                ? "bg-brand-primary border-brand-primary shadow-md text-white"
                : "bg-brand-surface border-brand-gray-200 hover:border-brand-gray-300"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-sm font-bold flex items-center ${formData.mode === "STANDARD" ? "text-brand-yellow" : "text-brand-gray-550"}`}>
                <FiStar className="mr-1 fill-brand-yellow text-brand-yellow" /> STANDARD (Premium)
              </span>
              {formData.mode === "STANDARD" && <div className="w-2.5 h-2.5 rounded-full bg-brand-yellow" />}
            </div>
            <span className={`text-[10px] mt-1 ${formData.mode === "STANDARD" ? "text-brand-navy-200" : "text-brand-gray-550"}`}>
              Forces branded Sudhakar pipes & cables
            </span>
          </button>
        </div>
      </div>

      {/* 5. Phase and Starter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Phase Selector */}
        <div className="border border-brand-gray-200 rounded-2xl p-4 bg-brand-surface shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-3.5 flex items-center">
            <FiZap className="mr-1 text-brand-secondary" /> Electrical Phase
          </label>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => handlePhaseChange("single")}
              disabled={isLoading}
              className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-all ${
                formData.phase === "single"
                  ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm"
                  : "bg-brand-surface border-brand-gray-200 text-brand-muted hover:bg-brand-gray-50"
              }`}
            >
              Single Phase
            </button>
            <button
              type="button"
              onClick={() => handlePhaseChange("three")}
              disabled={isLoading}
              className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-all ${
                formData.phase === "three"
                  ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm"
                  : "bg-brand-surface border-brand-gray-200 text-brand-muted hover:bg-brand-gray-50"
              }`}
            >
              Three Phase
            </button>
          </div>
        </div>

        {/* Starter Selector */}
        <div className="border border-brand-gray-200 rounded-2xl p-4 bg-brand-surface shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-3.5 flex items-center">
            <FiCpu className="mr-1 text-brand-secondary" /> Starter cut-off selection
          </label>
          {formData.phase === "three" ? (
            <div className="py-2 px-3 bg-brand-gray-100 rounded text-xs text-brand-gray-550 font-semibold border border-brand-gray-200">
              ⚡ Locked: Three Phase requires mechanical Timer Starter cut-off.
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, starter_type: "manual" }))}
                disabled={isLoading}
                className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-all ${
                  formData.starter_type === "manual"
                    ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm"
                    : "bg-brand-surface border-brand-gray-200 text-brand-muted hover:bg-brand-gray-50"
                }`}
              >
                Normal Manual
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, starter_type: "auto" }))}
                disabled={isLoading}
                className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-all ${
                  formData.starter_type === "auto"
                    ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm"
                    : "bg-brand-surface border-brand-gray-200 text-brand-muted hover:bg-brand-gray-50"
                }`}
              >
                Auto cut-off (Dry run)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message Box */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-semibold leading-relaxed">
          ⚠️ Connection failure: {error}
        </div>
      )}

      {/* 6. Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center space-x-2 bg-brand-primary text-white py-3.5 sm:py-4 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 active:scale-[0.99] focus:outline-none ${
            isLoading ? "opacity-75 cursor-not-allowed bg-brand-primary/80" : ""
          }`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span className="uppercase tracking-wider">Processing Sizing Ratios...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <FiFileText className="w-5 h-5 text-brand-accent" />
              <span className="uppercase tracking-wider">Generate Professional Estimate</span>
            </div>
          )}
        </button>
      </div>
      
      {loader.isActive && (
        <LoadingOverlay 
          progress={loader.progress} 
          message={loader.currentMessage} 
          type="quotation" 
        />
      )}

      {/* 7. Pop-up Modal: Add Custom Motor Brand & Price */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-gray-200 relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                  <FiPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-navy-900 uppercase tracking-wide">
                    Add Custom Motor Company
                  </h3>
                  <p className="text-[10px] text-brand-muted">
                    Enter your custom brand name and unit price.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 text-brand-muted hover:text-brand-navy-900 rounded-lg hover:bg-brand-gray-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-brand-navy-900 uppercase mb-1">
                  Company / Brand Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Falcon, Kirloskar, Varuna"
                  value={newMotor.brand}
                  onChange={(e) => setNewMotor({ ...newMotor, brand: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 border border-brand-gray-300 rounded-xl outline-none focus:border-brand-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-brand-navy-900 uppercase mb-1">
                    Motor Power (HP)
                  </label>
                  <select
                    value={newMotor.hp}
                    onChange={(e) => setNewMotor({ ...newMotor, hp: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 border border-brand-gray-300 rounded-xl outline-none focus:border-brand-primary font-medium"
                  >
                    <option value="1.0">1.0 HP</option>
                    <option value="1.5">1.5 HP</option>
                    <option value="2.0">2.0 HP</option>
                    <option value="3.0">3.0 HP</option>
                    <option value="5.0">5.0 HP</option>
                    <option value="6.0">6.0 HP</option>
                    <option value="7.5">7.5 HP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-navy-900 uppercase mb-1">
                    Stages (Impellers)
                  </label>
                  <input
                    type="number"
                    placeholder="25"
                    value={newMotor.stage}
                    onChange={(e) => setNewMotor({ ...newMotor, stage: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 border border-brand-gray-300 rounded-xl outline-none focus:border-brand-primary font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-navy-900 uppercase mb-1">
                  Motor Price in ₹ (Standalone) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 21000"
                  value={newMotor.price}
                  onChange={(e) => setNewMotor({ ...newMotor, price: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 border border-brand-gray-300 rounded-xl outline-none focus:border-brand-primary font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-brand-gray-200 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-brand-muted hover:bg-brand-gray-100 transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomMotor}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white hover:bg-brand-navy-900 transition-colors uppercase tracking-wider shadow-sm"
                >
                  Add Motor to Estimate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default CustomerForm;
