import React, { useState, useEffect } from "react";
import { 
  FiX, FiSave, FiRotateCcw, FiPlus, FiTrash2, FiEdit2, 
  FiZap, FiPackage, FiTool, FiCheck, FiSearch, FiSliders,
  FiChevronDown, FiChevronUp, FiDollarSign, FiInfo
} from "react-icons/fi";
import { FaWhatsapp, FaCrown } from "react-icons/fa";
import toast from "react-hot-toast";
import { quotationService, DEFAULT_CONFIG } from "../../services/quotationService";

export default function PricingConfigModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("motors"); // "motors" | "pipes" | "cables" | "starters" | "fitting"
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isModified, setIsModified] = useState(false);
  
  // Motor tab filters
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("all");
  const [selectedHpFilter, setSelectedHpFilter] = useState("all");
  const [motorSearchQuery, setMotorSearchQuery] = useState("");
  
  // Add Motor Drawer/Form State
  const [isAddMotorOpen, setIsAddMotorOpen] = useState(false);
  const [newMotor, setNewMotor] = useState({
    brandCategory: "crompton", // "budget" | "crompton" | "aqua_texmo" | "cri" | "new_brand"
    customBrandName: "",
    hp: "1.5",
    stage: "18",
    spec: "1.5 HP / 18 Stage V4",
    min_feet: 200,
    max_feet: 360,
    price: 16500,
    phase: "single", // "single" | "three" | "both"
  });

  useEffect(() => {
    if (isOpen) {
      const liveConfig = quotationService.getPricingConfig();
      setConfig(JSON.parse(JSON.stringify(liveConfig)));
      setIsModified(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle saving the full config
  const handleSave = () => {
    const success = quotationService.savePricingConfig(config);
    if (success) {
      toast.success("Pricing rates updated! All new estimates will use these rates.");
      setIsModified(false);
      if (onClose) onClose();
    } else {
      toast.error("Failed to save pricing configuration.");
    }
  };

  // Reset to Factory Defaults
  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore all original factory default rates & prices? This will overwrite your custom modifications.")) {
      quotationService.resetPricingConfig();
      setConfig(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
      setIsModified(false);
      toast.success("Pricing restored to factory default rules.");
    }
  };

  // Helper to update deeply nested fields
  const updateField = (path, value) => {
    setConfig((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return updated;
    });
    setIsModified(true);
  };

  // Handle editing a specific motor model
  const handleUpdateMotor = (brandKey, modelIndex, field, value) => {
    setConfig((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const model = updated.motors[brandKey].models[modelIndex];
      if (field === "price" || field === "hp" || field === "stage" || field === "min_feet" || field === "max_feet") {
        model[field] = value === "" ? "" : Number(value);
      } else {
        model[field] = value;
      }
      return updated;
    });
    setIsModified(true);
  };

  // Handle deleting a motor model
  const handleDeleteMotor = (brandKey, modelIndex) => {
    if (window.confirm("Remove this motor model from quotation options?")) {
      setConfig((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        updated.motors[brandKey].models.splice(modelIndex, 1);
        return updated;
      });
      setIsModified(true);
      toast.success("Motor model removed.");
    }
  };

  // Handle adding a brand-new motor model
  const handleCreateMotor = (e) => {
    e.preventDefault();
    const hpNum = parseFloat(newMotor.hp) || 1.5;
    const stageNum = parseInt(newMotor.stage, 10) || 18;
    const priceNum = parseFloat(newMotor.price);
    const minFeetNum = parseInt(newMotor.min_feet, 10) || 0;
    const maxFeetNum = parseInt(newMotor.max_feet, 10) || 400;

    if (!priceNum || priceNum <= 0) {
      toast.error("Please enter a valid motor selling price.");
      return;
    }

    let targetKey = newMotor.brandCategory;
    let targetBrandName = "";

    if (newMotor.brandCategory === "new_brand") {
      if (!newMotor.customBrandName.trim()) {
        toast.error("Please enter the new brand company name.");
        return;
      }
      targetBrandName = newMotor.customBrandName.trim();
      targetKey = targetBrandName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    }

    const phases = newMotor.phase === "both" ? ["single", "three"] : [newMotor.phase];
    const generatedSpec = newMotor.spec.trim() || `${hpNum} HP / ${stageNum} Stage V4`;

    setConfig((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated.motors[targetKey]) {
        updated.motors[targetKey] = {
          brand: targetBrandName || newMotor.brandCategory,
          models: [],
        };
      }

      updated.motors[targetKey].models.push({
        spec: generatedSpec,
        min_feet: minFeetNum,
        max_feet: maxFeetNum,
        price: priceNum,
        hp: hpNum,
        stage: stageNum,
        phase_compatibility: phases,
      });

      return updated;
    });

    setIsModified(true);
    setIsAddMotorOpen(false);
    setNewMotor({
      brandCategory: "crompton",
      customBrandName: "",
      hp: "1.5",
      stage: "18",
      spec: "1.5 HP / 18 Stage V4",
      min_feet: 200,
      max_feet: 360,
      price: 16500,
      phase: "single",
    });
    toast.success("New motor model added to Price Master!");
  };

  // Compile all motor models for tabular rendering
  const motorList = [];
  if (config.motors) {
    Object.entries(config.motors).forEach(([bKey, bData]) => {
      const brandDisplayName = bKey === "budget" ? "Budget / Local (Jai Kissan)" : (bData.brand || bKey);
      (bData.models || []).forEach((m, idx) => {
        motorList.push({
          brandKey: bKey,
          brandName: brandDisplayName,
          modelIndex: idx,
          ...m,
        });
      });
    });
  }

  // Filter motors
  const filteredMotors = motorList.filter((m) => {
    if (selectedBrandFilter !== "all" && m.brandKey !== selectedBrandFilter) return false;
    if (selectedHpFilter !== "all" && String(m.hp) !== selectedHpFilter) return false;
    if (motorSearchQuery.trim()) {
      const q = motorSearchQuery.toLowerCase();
      const matchBrand = m.brandName.toLowerCase().includes(q);
      const matchSpec = (m.spec || "").toLowerCase().includes(q);
      if (!matchBrand && !matchSpec) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-brand-navy-900/70 backdrop-blur-sm animate-fade-in no-print overflow-hidden">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[92vh] max-h-[850px] flex flex-col border border-brand-gray-300 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-navy-950 via-brand-primary to-brand-navy-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-brand-accent/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent text-brand-navy-950 flex items-center justify-center font-black shadow-sm shrink-0">
              <FiDollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  Quotation Rates & Price Master
                </h3>
                {isModified && (
                  <span className="text-[10px] bg-amber-400 text-brand-navy-950 font-black px-2 py-0.5 rounded-full uppercase">
                    Unsaved Edits
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-navy-100 font-medium">
                Live pricing for Motors, Pipes, Cables, Starters, Accessories & Fitting
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-brand-navy-200 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
              title="Reset all prices to factory defaults"
            >
              <FiRotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close window"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-brand-gray-50 border-b border-brand-gray-200 px-3 sm:px-6 flex space-x-1 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: "motors", label: "Submersible Motors", icon: FiZap, count: motorList.length },
            { id: "pipes", label: "Pipes (Per Meter)", icon: FiPackage, count: config.pipes?.rates?.length || 3 },
            { id: "cables", label: "Cables (Per Meter)", icon: FiSliders, count: (config.cables?.local_rates?.length || 0) + (config.cables?.sudhakar_rates?.length || 0) },
            { id: "starters", label: "Starters & Accessories", icon: FiTool },
            { id: "fitting", label: "Fitting Charges", icon: FiPackage },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? "border-brand-primary text-brand-primary bg-white font-black"
                    : "border-transparent text-brand-muted hover:text-brand-navy-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-primary" : "text-brand-muted"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-brand-primary/10 text-brand-primary" : "bg-brand-gray-200 text-brand-muted"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-brand-gray-50/50 space-y-5">
          {/* ========================================================= */}
          {/* TAB 1: SUBMERSIBLE MOTORS                                 */}
          {/* ========================================================= */}
          {activeTab === "motors" && (
            <div className="space-y-4">
              {/* Toolbar: Brand Pills, HP Chips, Search & Add Motor Button */}
              <div className="bg-white p-3.5 rounded-xl border border-brand-gray-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="relative flex-1 max-w-xs">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted w-3.5 h-3.5" />
                      <input
                        type="text"
                        value={motorSearchQuery}
                        onChange={(e) => setMotorSearchQuery(e.target.value)}
                        placeholder="Search model or brand..."
                        className="w-full text-xs pl-8 pr-3 py-1.5 bg-brand-gray-50 border border-brand-gray-300 rounded-lg outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddMotorOpen(!isAddMotorOpen)}
                    className="flex items-center space-x-1.5 bg-brand-primary hover:bg-brand-navy-900 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-xs shrink-0 active:scale-95"
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    <span>{isAddMotorOpen ? "Close Add Form" : "+ Add New Motor Model"}</span>
                  </button>
                </div>

                {/* HP Filter Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
                  <span className="text-[10px] uppercase font-bold text-brand-muted mr-1 shrink-0">Power (HP):</span>
                  {["all", "1", "1.5", "2", "3", "5", "6", "7.5"].map((hpVal) => (
                    <button
                      key={hpVal}
                      type="button"
                      onClick={() => setSelectedHpFilter(hpVal)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 transition-all ${
                        selectedHpFilter === hpVal
                          ? "bg-brand-primary text-white shadow-2xs"
                          : "bg-brand-gray-100 text-brand-muted hover:bg-brand-gray-200"
                      }`}
                    >
                      {hpVal === "all" ? "All HP" : `${hpVal} HP`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Motor Drawer / Form */}
              {isAddMotorOpen && (
                <form onSubmit={handleCreateMotor} className="bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/50 p-4 rounded-xl border border-emerald-300 shadow-xs space-y-3 animate-scale-in">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center space-x-1.5">
                      <FiPlus className="w-4 h-4 text-emerald-600" />
                      <span>Add New Motor Specification & Rate</span>
                    </h4>
                    <span className="text-[10px] text-emerald-800 font-bold">Instantly available in quotation</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1">Company / Brand</label>
                      <select
                        value={newMotor.brandCategory}
                        onChange={(e) => setNewMotor({ ...newMotor, brandCategory: e.target.value })}
                        className="w-full px-2.5 py-2 bg-white border border-brand-gray-300 rounded-lg text-xs font-bold"
                      >
                        <option value="crompton">Crompton</option>
                        <option value="cri">CRI Pumps</option>
                        <option value="aqua_texmo">Aqua Texmo</option>
                        <option value="budget">Budget / Local Economy</option>
                        <option value="new_brand">+ New Custom Brand...</option>
                      </select>
                    </div>

                    {newMotor.brandCategory === "new_brand" && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1">New Brand Name</label>
                        <input
                          type="text"
                          value={newMotor.customBrandName}
                          onChange={(e) => setNewMotor({ ...newMotor, customBrandName: e.target.value })}
                          placeholder="e.g. Kirloskar / Lubi"
                          className="w-full px-2.5 py-2 bg-white border border-brand-gray-300 rounded-lg text-xs font-bold"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1">Horsepower (HP)</label>
                      <select
                        value={newMotor.hp}
                        onChange={(e) => setNewMotor({ 
                          ...newMotor, 
                          hp: e.target.value,
                          spec: `${e.target.value} HP / ${newMotor.stage} Stage V4`
                        })}
                        className="w-full px-2.5 py-2 bg-white border border-brand-gray-300 rounded-lg text-xs font-bold"
                      >
                        <option value="1">1.0 HP</option>
                        <option value="1.5">1.5 HP</option>
                        <option value="2">2.0 HP</option>
                        <option value="3">3.0 HP</option>
                        <option value="5">5.0 HP</option>
                        <option value="6">6.0 HP</option>
                        <option value="7.5">7.5 HP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1">Stages (Pumps)</label>
                      <input
                        type="number"
                        value={newMotor.stage}
                        onChange={(e) => setNewMotor({ 
                          ...newMotor, 
                          stage: e.target.value,
                          spec: `${newMotor.hp} HP / ${e.target.value} Stage V4`
                        })}
                        className="w-full px-2.5 py-2 bg-white border border-brand-gray-300 rounded-lg text-xs font-bold"
                        placeholder="18"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        value={newMotor.price}
                        onChange={(e) => setNewMotor({ ...newMotor, price: e.target.value })}
                        className="w-full px-2.5 py-2 bg-white border border-emerald-400 font-mono font-black text-emerald-800 rounded-lg text-xs"
                        placeholder="16500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1">Min Depth (Feet)</label>
                      <input
                        type="number"
                        value={newMotor.min_feet}
                        onChange={(e) => setNewMotor({ ...newMotor, min_feet: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-brand-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1">Max Depth (Feet)</label>
                      <input
                        type="number"
                        value={newMotor.max_feet}
                        onChange={(e) => setNewMotor({ ...newMotor, max_feet: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-brand-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1">Phase Compatibility</label>
                      <select
                        value={newMotor.phase}
                        onChange={(e) => setNewMotor({ ...newMotor, phase: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-brand-gray-300 rounded-lg text-xs"
                      >
                        <option value="single">Single Phase Only</option>
                        <option value="three">Three Phase Only</option>
                        <option value="both">Both (Single & Three Phase)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddMotorOpen(false)}
                      className="px-3 py-1.5 bg-white border border-brand-gray-300 hover:bg-brand-gray-100 rounded-lg text-xs font-bold text-brand-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-xs"
                    >
                      Add to Price Master
                    </button>
                  </div>
                </form>
              )}

              {/* Motor Cards / Table */}
              <div className="bg-white rounded-xl border border-brand-gray-200 overflow-hidden shadow-2xs">
                <div className="p-3 bg-brand-gray-50 border-b border-brand-gray-200 flex items-center justify-between text-xs font-bold text-brand-navy-900">
                  <span>Configured Models ({filteredMotors.length})</span>
                  <span className="text-[10px] text-brand-muted">Click any price in ₹ or depth to edit directly</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-brand-gray-100/60 text-brand-muted text-[10px] uppercase font-black border-b border-brand-gray-200">
                        <th className="py-2.5 px-3">Brand & Category</th>
                        <th className="py-2.5 px-3">HP</th>
                        <th className="py-2.5 px-3">Model Spec</th>
                        <th className="py-2.5 px-3">Depth Range (FT)</th>
                        <th className="py-2.5 px-3">Phase</th>
                        <th className="py-2.5 px-3">Price (₹)</th>
                        <th className="py-2.5 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray-100">
                      {filteredMotors.map((m, idx) => (
                        <tr key={`${m.brandKey}-${m.modelIndex}-${idx}`} className="hover:bg-brand-gray-50 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-brand-navy-900 whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase mr-1.5 bg-brand-primary/10 text-brand-primary">
                              {m.brandName}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-brand-navy-800 whitespace-nowrap">
                            {m.hp} HP
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <input
                              type="text"
                              value={m.spec_display || m.spec}
                              onChange={(e) => handleUpdateMotor(m.brandKey, m.modelIndex, "spec", e.target.value)}
                              className="w-44 px-2 py-1 bg-brand-gray-50 border border-transparent hover:border-brand-gray-300 focus:border-brand-primary rounded text-xs font-medium"
                            />
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center space-x-1 font-mono text-[11px]">
                              <input
                                type="number"
                                value={m.min_feet}
                                onChange={(e) => handleUpdateMotor(m.brandKey, m.modelIndex, "min_feet", e.target.value)}
                                className="w-14 px-1.5 py-0.5 bg-brand-gray-50 border border-brand-gray-200 rounded text-center text-xs"
                              />
                              <span>-</span>
                              <input
                                type="number"
                                value={m.max_feet}
                                onChange={(e) => handleUpdateMotor(m.brandKey, m.modelIndex, "max_feet", e.target.value)}
                                className="w-14 px-1.5 py-0.5 bg-brand-gray-50 border border-brand-gray-200 rounded text-center text-xs"
                              />
                              <span className="text-brand-muted text-[10px]">FT</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-gray-100 text-brand-muted">
                              {m.phase_compatibility?.join("/") || "all"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <span className="text-xs font-bold text-brand-primary">₹</span>
                              <input
                                type="number"
                                value={m.price}
                                onChange={(e) => handleUpdateMotor(m.brandKey, m.modelIndex, "price", e.target.value)}
                                className="w-24 px-2 py-1 bg-emerald-50 border border-emerald-300 focus:border-emerald-500 font-mono font-black text-emerald-800 rounded text-xs"
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteMotor(m.brandKey, m.modelIndex)}
                              className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete model"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PIPES (PER METER & DEPTH RANGES)                   */}
          {/* ========================================================= */}
          {activeTab === "pipes" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-brand-gray-200 shadow-2xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-brand-navy-950 flex items-center space-x-1.5">
                      <FiPackage className="text-brand-secondary" />
                      <span>Borewell Column Pipe Rates (Sudhakar Branded)</span>
                    </h4>
                    <p className="text-[11px] text-brand-muted mt-0.5">
                      Pipes are auto-selected based on depth ranges and priced strictly per meter.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(config.pipes?.rates || []).map((pipe, idx) => (
                    <div key={idx} className="p-3 bg-brand-gray-50 rounded-xl border border-brand-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <input
                            type="text"
                            value={pipe.type}
                            onChange={(e) => {
                              const updated = [...config.pipes.rates];
                              updated[idx].type = e.target.value;
                              updateField(["pipes", "rates"], updated);
                            }}
                            className="text-xs font-black text-brand-navy-900 bg-white px-2 py-1 border border-brand-gray-300 rounded"
                          />
                          <span className="text-[10px] text-brand-muted block mt-0.5">Heavy Duty Rigid PVC Column</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-brand-muted uppercase font-bold">Range:</span>
                          <input
                            type="number"
                            value={pipe.min_feet}
                            onChange={(e) => {
                              const updated = [...config.pipes.rates];
                              updated[idx].min_feet = Number(e.target.value);
                              updateField(["pipes", "rates"], updated);
                            }}
                            className="w-16 px-2 py-1 bg-white border border-brand-gray-300 rounded text-center text-xs font-mono"
                          />
                          <span>to</span>
                          <input
                            type="number"
                            value={pipe.max_feet}
                            onChange={(e) => {
                              const updated = [...config.pipes.rates];
                              updated[idx].max_feet = Number(e.target.value);
                              updateField(["pipes", "rates"], updated);
                            }}
                            className="w-16 px-2 py-1 bg-white border border-brand-gray-300 rounded text-center text-xs font-mono"
                          />
                          <span className="text-brand-muted text-[10px]">FT</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-brand-muted uppercase font-bold">Rate/Meter:</span>
                          <div className="flex items-center">
                            <span className="text-xs font-bold text-brand-primary mr-0.5">₹</span>
                            <input
                              type="number"
                              value={pipe.price_per_meter}
                              onChange={(e) => {
                                const updated = [...config.pipes.rates];
                                updated[idx].price_per_meter = Number(e.target.value);
                                updateField(["pipes", "rates"], updated);
                              }}
                              className="w-20 px-2 py-1 bg-white border border-emerald-300 font-mono font-black text-emerald-800 rounded text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CABLES (LOCAL & SUDHAKAR RATES)                    */}
          {/* ========================================================= */}
          {activeTab === "cables" && (
            <div className="space-y-4">
              {/* Cable General Rules */}
              <div className="bg-white p-4 rounded-xl border border-brand-gray-200 shadow-2xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy-950 mb-3 flex items-center space-x-1.5">
                  <FiSliders className="text-brand-secondary" />
                  <span>Submersible Cable General Rules</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1">
                      Cutoff Depth for Branded Sudhakar Cable (FT)
                    </label>
                    <input
                      type="number"
                      value={config.cables?.cutoff_feet || 350}
                      onChange={(e) => updateField(["cables", "cutoff_feet"], Number(e.target.value))}
                      className="w-full px-3 py-2 bg-brand-gray-50 border border-brand-gray-300 rounded-lg text-xs font-bold font-mono"
                    />
                    <span className="text-[10px] text-brand-muted mt-1 block">
                      In Regular mode, depths beyond this will automatically upgrade to Sudhakar Company cable.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-brand-muted mb-1">
                      Extra Cable Buffer Length (Meters)
                    </label>
                    <input
                      type="number"
                      value={config.business?.cable_extra_meters || 10}
                      onChange={(e) => updateField(["business", "cable_extra_meters"], Number(e.target.value))}
                      className="w-full px-3 py-2 bg-brand-gray-50 border border-brand-gray-300 rounded-lg text-xs font-bold font-mono"
                    />
                    <span className="text-[10px] text-brand-muted mt-1 block">
                      Added on top of borewell depth for connection from borehead to starter panel.
                    </span>
                  </div>
                </div>
              </div>

              {/* Local Cable Rates */}
              <div className="bg-white p-4 rounded-xl border border-brand-gray-200 shadow-2xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy-950 mb-2">
                  Regular / Local Wire Rates (Under Cutoff Depth)
                </h4>
                <div className="space-y-2.5">
                  {(config.cables?.local_rates || []).map((cable, idx) => (
                    <div key={idx} className="p-2.5 bg-brand-gray-50 rounded-lg border border-brand-gray-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-navy-900">{cable.spec}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-[11px] text-brand-muted">
                          {cable.min_feet} - {cable.max_feet} FT
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-bold text-brand-primary">₹</span>
                          <input
                            type="number"
                            value={cable.price_per_meter}
                            onChange={(e) => {
                              const updated = [...config.cables.local_rates];
                              updated[idx].price_per_meter = Number(e.target.value);
                              updateField(["cables", "local_rates"], updated);
                            }}
                            className="w-20 px-2 py-1 bg-white border border-emerald-300 font-mono font-black text-emerald-800 rounded text-xs"
                          />
                          <span className="text-[10px] text-brand-muted">/meter</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sudhakar Cable Rates */}
              <div className="bg-white p-4 rounded-xl border border-brand-gray-200 shadow-2xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy-950 mb-2">
                  Sudhakar Company Branded Cable Rates
                </h4>
                <div className="space-y-2.5">
                  {(config.cables?.sudhakar_rates || []).map((cable, idx) => (
                    <div key={idx} className="p-2.5 bg-brand-gray-50 rounded-lg border border-brand-gray-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-navy-900">{cable.spec}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-[11px] text-brand-muted">
                          {cable.min_feet} - {cable.max_feet} FT
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-bold text-brand-primary">₹</span>
                          <input
                            type="number"
                            value={cable.price_per_meter}
                            onChange={(e) => {
                              const updated = [...config.cables.sudhakar_rates];
                              updated[idx].price_per_meter = Number(e.target.value);
                              updateField(["cables", "sudhakar_rates"], updated);
                            }}
                            className="w-20 px-2 py-1 bg-white border border-emerald-300 font-mono font-black text-emerald-800 rounded text-xs"
                          />
                          <span className="text-[10px] text-brand-muted">/meter</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: STARTERS & ACCESSORIES                             */}
          {/* ========================================================= */}
          {activeTab === "starters" && (
            <div className="space-y-4">
              {/* Single Phase Manual Starters */}
              <div className="bg-white p-4 rounded-xl border border-brand-gray-200 shadow-2xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy-950 mb-2">
                  Single Phase Manual Starters (By Horsepower)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(config.starters?.single_phase?.manual?.rates || []).map((st, idx) => (
                    <div key={idx} className="p-2.5 bg-brand-gray-50 rounded-lg border border-brand-gray-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-navy-900">{st.hp} HP Manual Starter</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-bold text-brand-primary">₹</span>
                        <input
                          type="number"
                          value={st.price}
                          onChange={(e) => {
                            const updated = [...config.starters.single_phase.manual.rates];
                            updated[idx].price = Number(e.target.value);
                            updateField(["starters", "single_phase", "manual", "rates"], updated);
                          }}
                          className="w-24 px-2 py-1 bg-white border border-emerald-300 font-mono font-black text-emerald-800 rounded text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Three Phase Timer Starter */}
              <div className="bg-white p-4 rounded-xl border border-brand-gray-200 shadow-2xs flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy-950">
                    Three Phase Timer Starter Panel
                  </h4>
                  <span className="text-[10px] text-brand-muted">Standard 3-Phase digital timer control panel</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-brand-primary">₹</span>
                  <input
                    type="number"
                    value={config.starters?.three_phase?.timer?.price || 3000}
                    onChange={(e) => updateField(["starters", "three_phase", "timer", "price"], Number(e.target.value))}
                    className="w-24 px-2 py-1 bg-white border border-emerald-300 font-mono font-black text-emerald-800 rounded text-xs"
                  />
                </div>
              </div>

              {/* Standard Accessories Base Price */}
              <div className="bg-white p-4 rounded-xl border border-brand-gray-200 shadow-2xs flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy-950">
                    Standard Accessories Set (Base Cost)
                  </h4>
                  <span className="text-[10px] text-brand-muted">Clamps, nipple, casing cap, bends & hardware pack</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-brand-primary">₹</span>
                  <input
                    type="number"
                    value={config.accessories?.price || 1200}
                    onChange={(e) => updateField(["accessories", "price"], Number(e.target.value))}
                    className="w-24 px-2 py-1 bg-white border border-emerald-300 font-mono font-black text-emerald-800 rounded text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: FITTING CHARGES                                    */}
          {/* ========================================================= */}
          {activeTab === "fitting" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-brand-gray-200 shadow-2xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy-950 mb-3">
                  Labor & Installation Charges by Depth
                </h4>
                <div className="space-y-3">
                  {(config.fitting_charges?.ranges || []).map((fit, idx) => (
                    <div key={idx} className="p-3 bg-brand-gray-50 rounded-xl border border-brand-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <input
                          type="text"
                          value={fit.label}
                          onChange={(e) => {
                            const updated = [...config.fitting_charges.ranges];
                            updated[idx].label = e.target.value;
                            updateField(["fitting_charges", "ranges"], updated);
                          }}
                          className="font-bold text-brand-navy-900 bg-white px-2 py-1 border border-brand-gray-300 rounded text-xs"
                        />
                        <span className="text-[10px] text-brand-muted block mt-0.5">Method: {fit.method}</span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-brand-muted uppercase font-bold">Range:</span>
                          <input
                            type="number"
                            value={fit.min_feet}
                            onChange={(e) => {
                              const updated = [...config.fitting_charges.ranges];
                              updated[idx].min_feet = Number(e.target.value);
                              updateField(["fitting_charges", "ranges"], updated);
                            }}
                            className="w-16 px-1.5 py-0.5 bg-white border border-brand-gray-300 rounded text-center text-xs font-mono"
                          />
                          <span>to</span>
                          <input
                            type="number"
                            value={fit.max_feet}
                            onChange={(e) => {
                              const updated = [...config.fitting_charges.ranges];
                              updated[idx].max_feet = Number(e.target.value);
                              updateField(["fitting_charges", "ranges"], updated);
                            }}
                            className="w-16 px-1.5 py-0.5 bg-white border border-brand-gray-300 rounded text-center text-xs font-mono"
                          />
                          <span className="text-brand-muted text-[10px]">FT</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-bold text-brand-primary">₹</span>
                          <input
                            type="number"
                            value={fit.charge}
                            onChange={(e) => {
                              const updated = [...config.fitting_charges.ranges];
                              updated[idx].charge = Number(e.target.value);
                              updateField(["fitting_charges", "ranges"], updated);
                            }}
                            className="w-24 px-2 py-1 bg-white border border-emerald-300 font-mono font-black text-emerald-800 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-brand-gray-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-brand-muted hover:text-red-600 font-bold flex items-center space-x-1 px-2 py-1 rounded"
          >
            <FiRotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-navy-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <FiSave className="w-3.5 h-3.5" />
              <span>Save All Pricing Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
