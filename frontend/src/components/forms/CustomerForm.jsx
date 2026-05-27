import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuotation } from "../../context/QuotationContext";
import apiClient from "../../services/api";
import toast from "react-hot-toast";
import { 
  FiUser, FiPhone, FiCompass, FiZap, FiToggleRight, FiCpu, 
  FiFileText, FiStar, FiAward, FiActivity 
} from "react-icons/fi";
import { useLoadingSteps } from "../../hooks/useLoadingSteps";
import LoadingOverlay from "../system/LoadingOverlay";

function CustomerForm() {
  const navigate = useNavigate();
  const { formData, setFormData, saveQuotation, isLoading, setIsLoading, error, setError } = useQuotation();
  
  const [validationErrors, setValidationErrors] = useState({});
  const loader = useLoadingSteps("quotation", 2500);

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
      // If STANDARD mode, restrict motor brand preference to Crompton if "budget" was selected
      preferred_brand: mode === "STANDARD" && prev.preferred_brand === "budget" ? "Crompton" : prev.preferred_brand
    }));
  };

  const handlePhaseChange = (phase) => {
    setFormData((prev) => ({
      ...prev,
      phase,
      // If three phase, starter must be timer
      starter_type: phase === "three" ? "timer" : "manual"
    }));
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
      const response = await apiClient.post("/quotation/generate", {
        customer_name: formData.customer_name,
        phone: formData.phone.replace(/\D/g, ""),
        feet: parseInt(formData.feet, 10),
        phase: formData.phase,
        starter_type: formData.starter_type,
        preferred_brand: formData.preferred_brand || null,
        mode: formData.mode,
      });

      // Validate response structure
      if (response.data && response.data.quotation_id) {
        loader.completeLoading();
        
        // Artificial short lag for high-fidelity experience completion animation
        setTimeout(() => {
          saveQuotation(response.data);
          toast.success("Professional Estimate Generated!");
          setIsLoading(false);
          navigate("/preview");
        }, 500);
      } else {
        throw new Error("Invalid API response format.");
      }
    } catch (err) {
      loader.stopLoading();
      setIsLoading(false);
      const errMsg = err.message || "An unexpected error occurred.";
      setError(errMsg);
      
      // Parse Pydantic validation errors from Axios response
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      }
      
      toast.error(errMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name and Phone Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="customer_name" className="block text-xs font-bold uppercase tracking-wider text-brand-navy-900 mb-1.5 flex items-center">
            <FiUser className="mr-1 text-brand-navy-500" /> Customer Name
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
              className={`w-full text-sm pl-3 pr-3 py-2.5 bg-white border rounded-md shadow-sm outline-none transition-all ${
                validationErrors.customer_name
                  ? "border-red-500 bg-red-50/10 focus:border-red-600"
                  : "border-brand-gray-300 focus:border-brand-navy-800"
              }`}
            />
          </div>
          {validationErrors.customer_name && (
            <p className="text-red-500 text-xs mt-1 font-semibold">{validationErrors.customer_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-brand-navy-900 mb-1.5 flex items-center">
            <FiPhone className="mr-1 text-brand-navy-500" /> Phone Number
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
              className={`w-full text-sm pl-3 pr-3 py-2.5 bg-white border rounded-md shadow-sm outline-none transition-all ${
                validationErrors.phone
                  ? "border-red-500 bg-red-50/10 focus:border-red-600"
                  : "border-brand-gray-300 focus:border-brand-navy-800"
              }`}
            />
          </div>
          {validationErrors.phone && (
            <p className="text-red-500 text-xs mt-1 font-semibold">{validationErrors.phone}</p>
          )}
        </div>
      </div>

      {/* Depth Input & Brand Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="feet" className="block text-xs font-bold uppercase tracking-wider text-brand-navy-900 mb-1.5 flex items-center">
            <FiCompass className="mr-1 text-brand-navy-500" /> Borewell Depth (Feet)
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
              className={`w-full text-sm pl-3 pr-3 py-2.5 bg-white border rounded-md shadow-sm outline-none transition-all ${
                validationErrors.feet
                  ? "border-red-500 bg-red-50/10 focus:border-red-600"
                  : "border-brand-gray-300 focus:border-brand-navy-800"
              }`}
            />
          </div>
          {validationErrors.feet && (
            <p className="text-red-500 text-xs mt-1 font-semibold">{validationErrors.feet}</p>
          )}
        </div>

        <div>
          <label htmlFor="preferred_brand" className="block text-xs font-bold uppercase tracking-wider text-brand-navy-900 mb-1.5 flex items-center">
            <FiAward className="mr-1 text-brand-navy-500" /> Preferred Motor Brand
          </label>
          <select
            id="preferred_brand"
            name="preferred_brand"
            value={formData.preferred_brand}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full text-sm px-3 py-2.5 bg-white border border-brand-gray-300 rounded-md shadow-sm outline-none focus:border-brand-navy-800 transition-all cursor-pointer"
          >
            <option value="">Any Premium Brand (Crompton / Aqua Texmo / CRI)</option>
            <option value="Crompton">Crompton Pumps</option>
            <option value="Aqua Texmo">Aqua Texmo</option>
            <option value="CRI Pumps">CRI Pumps</option>
            {formData.mode !== "STANDARD" && (
              <option value="budget">Economy / Budget Brands (Jai Kissan / Orient)</option>
            )}
          </select>
        </div>
      </div>

      {/* Segmented Mode Selector */}
      <div className="border border-brand-gray-200 rounded-lg p-5 bg-brand-gray-50/50">
        <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy-900 mb-3 flex items-center">
          <FiToggleRight className="mr-1 text-brand-navy-500" /> Quotation Material Mode
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleModeChange("REGULAR")}
            disabled={isLoading}
            className={`px-4 py-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
              formData.mode === "REGULAR"
                ? "bg-white border-brand-navy-800 ring-2 ring-brand-navy-100 shadow-sm"
                : "bg-white border-brand-gray-200 hover:border-brand-gray-300"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-sm font-bold ${formData.mode === "REGULAR" ? "text-brand-navy-800" : "text-brand-gray-550"}`}>
                REGULAR (Budget)
              </span>
              {formData.mode === "REGULAR" && <div className="w-2.5 h-2.5 rounded-full bg-brand-navy-800" />}
            </div>
            <span className="text-[10px] text-brand-gray-550 mt-1">Economical cable cutoff boundaries enabled</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("STANDARD")}
            disabled={isLoading}
            className={`px-4 py-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
              formData.mode === "STANDARD"
                ? "bg-brand-navy-900 border-brand-navy-900 shadow-md text-white"
                : "bg-white border-brand-gray-200 hover:border-brand-gray-300"
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

        {/* Subtle UX messaging */}
        <div className="mt-3 text-[11px] text-brand-gray-550 leading-relaxed font-medium bg-white p-2.5 rounded border border-brand-gray-200">
          {formData.mode === "STANDARD" ? (
            <p className="flex items-start">
              <span className="text-brand-yellow mr-1 font-bold">🌟 Standard Mode:</span>
              Enforces 100% premium branded materials. No budget local cables will be used, and Crompton / Aqua Texmo / CRI premium motor specs are recommended.
            </p>
          ) : (
            <p className="flex items-start">
              <span className="text-brand-navy-800 mr-1 font-bold">💡 Regular Mode:</span>
              Uses local cables dynamically under 350 FT cutoff to save customer costs, and opens options for affordable Economy series motor recommendations.
            </p>
          )}
        </div>
      </div>

      {/* Phase and Starter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Phase Selector */}
        <div className="border border-brand-gray-200 rounded-lg p-4 bg-white">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy-900 mb-3.5 flex items-center">
            <FiZap className="mr-1 text-brand-navy-500" /> Electrical Phase
          </label>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => handlePhaseChange("single")}
              disabled={isLoading}
              className={`flex-1 py-2 text-sm font-bold rounded border transition-all ${
                formData.phase === "single"
                  ? "bg-brand-navy-100 border-brand-navy-800 text-brand-navy-800 shadow-sm"
                  : "bg-white border-brand-gray-200 text-brand-gray-550 hover:bg-brand-gray-50"
              }`}
            >
              Single Phase
            </button>
            <button
              type="button"
              onClick={() => handlePhaseChange("three")}
              disabled={isLoading}
              className={`flex-1 py-2 text-sm font-bold rounded border transition-all ${
                formData.phase === "three"
                  ? "bg-brand-navy-100 border-brand-navy-800 text-brand-navy-800 shadow-sm"
                  : "bg-white border-brand-gray-200 text-brand-gray-550 hover:bg-brand-gray-50"
              }`}
            >
              Three Phase
            </button>
          </div>
        </div>

        {/* Starter Selector */}
        <div className="border border-brand-gray-200 rounded-lg p-4 bg-white">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy-900 mb-3.5 flex items-center">
            <FiCpu className="mr-1 text-brand-navy-500" /> Starter cut-off selection
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
                className={`flex-1 py-2 text-sm font-bold rounded border transition-all ${
                  formData.starter_type === "manual"
                    ? "bg-brand-navy-100 border-brand-navy-800 text-brand-navy-800 shadow-sm"
                    : "bg-white border-brand-gray-200 text-brand-gray-550 hover:bg-brand-gray-50"
                }`}
              >
                Normal Manual
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, starter_type: "auto" }))}
                disabled={isLoading}
                className={`flex-1 py-2 text-sm font-bold rounded border transition-all ${
                  formData.starter_type === "auto"
                    ? "bg-brand-navy-100 border-brand-navy-800 text-brand-navy-800 shadow-sm"
                    : "bg-white border-brand-gray-200 text-brand-gray-550 hover:bg-brand-gray-50"
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex items-center justify-center space-x-2 bg-brand-navy-800 text-white py-3.5 rounded-lg font-bold hover:bg-brand-navy-900 transition-colors shadow shadow-brand-navy-900/10 focus:outline-none ${
          isLoading ? "opacity-75 cursor-not-allowed bg-brand-navy-900" : ""
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span className="uppercase tracking-wider">Processing Sizing Ratios...</span>
          </>
        ) : (
          <>
            <FiFileText className="w-5 h-5" />
            <span className="uppercase tracking-wider">Generate Professional Estimate</span>
          </>
        )}
      </button>
      
      {loader.isActive && (
        <LoadingOverlay 
          progress={loader.progress} 
          message={loader.currentMessage} 
          type="quotation" 
        />
      )}
    </form>
  );
}

export default CustomerForm;
