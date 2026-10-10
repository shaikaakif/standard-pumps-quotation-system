/**
 * Client-Side Quotation Generation Engine
 * 100% Serverless, high-precision calculation engine for borehole pump installations.
 * Exact mathematical and business parity with Standard Pumps & Borewells pricing rules.
 */

// Configuration Data
export const CONFIG = {
  business: {
    feet_to_meter_ratio: 3.28,
    cable_extra_meters: 10,
    default_discount_percentage: 2.5,
    modes: {
      STANDARD: {
        label: "STANDARD (Premium)",
        description: "Strictly branded materials (Sudhakar pipes/cables) & premium motors",
      },
      REGULAR: {
        label: "REGULAR (Budget)",
        description: "Economical retail selection using dynamic local cable thresholds",
      },
    },
  },

  pipes: {
    rates: [
      { type: "10 KG", min_feet: 0, max_feet: 200, price_per_meter: 60 },
      { type: "12.5 KG", min_feet: 200, max_feet: 450, price_per_meter: 70 },
      { type: "16 KG", min_feet: 450, max_feet: 2000, price_per_meter: 95 },
    ],
    durability_notice: "12.5 KG pipes are preferred for better durability and customer trust.",
  },

  cables: {
    cutoff_feet: 350,
    local_rates: [
      { spec: "1.5 SQMM", min_feet: 0, max_feet: 150, price_per_meter: 60 },
      { spec: "2.5 SQMM", min_feet: 150, max_feet: 350, price_per_meter: 90 },
      { spec: "4 SQMM", min_feet: 350, max_feet: 500, price_per_meter: 125 },
    ],
    sudhakar_rates: [
      { spec: "2.5 SQMM", min_feet: 0, max_feet: 650, price_per_meter: 125 },
      { spec: "4 SQMM", min_feet: 650, max_feet: 2000, price_per_meter: 175 },
    ],
  },

  starters: {
    three_phase: {
      timer: { brand: "Standard 3-Phase Timer", price: 3000 },
    },
    single_phase: {
      manual: {
        brands: ["Venus Gold", "Sunshine"],
        rates: [
          { hp: 1.0, price: 2000 },
          { hp: 1.5, price: 2200 },
          { hp: 2.0, price: 2300 },
          { hp: 3.0, price: 2400 },
        ],
      },
      auto: {
        brands: ["Sunshine"],
        rates: [
          { hp: 1.0, price: 2500 },
          { hp: 2.0, price: 2700 },
          { hp: 3.0, price: 2800 },
        ],
      },
    },
  },

  accessories: {
    name: "Standard Accessories Set",
    price: 1200,
  },

  fitting_charges: {
    ranges: [
      { min_feet: 0, max_feet: 500, charge: 1500, method: "manual", label: "Manual Fitting Charge" },
      { min_feet: 500, max_feet: 700, charge: 2000, method: "manual", label: "Deep Manual Fitting Charge" },
      { min_feet: 700, max_feet: 5000, charge: 3000, method: "lifting_machine", label: "Lifting Machine Fitting Charge" },
    ],
  },

  motors: {
    budget: {
      brands: ["Jai Kissan", "Orient", "Godavari"],
      models: [
        { spec: "1 HP / 10 Stage V3", min_feet: 0, max_feet: 200, price: 8500, hp: 1.0, stage: 10, phase_compatibility: ["single"] },
        { spec: "1 HP / 15 Stage V3", min_feet: 0, max_feet: 200, price: 9500, hp: 1.0, stage: 15, phase_compatibility: ["single"] },
        { spec: "1.5 HP / 25 Stage V3", min_feet: 200, max_feet: 360, price: 13500, hp: 1.5, stage: 25, phase_compatibility: ["single", "three"] },
        { spec: "1.5 HP / 20 Stage V4", min_feet: 200, max_feet: 400, price: 14500, hp: 1.5, stage: 20, phase_compatibility: ["single", "three"] },
        { spec: "2 HP / 30 Stage V4", min_feet: 360, max_feet: 550, price: 19500, hp: 2.0, stage: 30, phase_compatibility: ["single", "three"] },
        { spec: "3 HP / 35 Stage V4", min_feet: 550, max_feet: 700, price: 25500, hp: 3.0, stage: 35, phase_compatibility: ["single", "three"] },
      ],
    },
    crompton: {
      brand: "Crompton",
      models: [
        { spec: "1 HP / 12 Stage V3", min_feet: 0, max_feet: 200, price: 12500, hp: 1.0, stage: 12, phase_compatibility: ["single"] },
        { spec: "1.5 HP / 18 Stage V4", min_feet: 200, max_feet: 360, price: 16500, hp: 1.5, stage: 18, phase_compatibility: ["single", "three"] },
        { spec: "2.5 Stage Override", spec_display: "2 HP / 20 Stage V4", min_feet: 360, max_feet: 450, price: 19500, hp: 2.0, stage: 20, phase_compatibility: ["single", "three"] },
        { spec: "2 HP / 25 Stage V4", min_feet: 450, max_feet: 550, price: 22500, hp: 2.0, stage: 25, phase_compatibility: ["single", "three"] },
        { spec: "2 HP / 30 Stage V4", min_feet: 550, max_feet: 650, price: 25800, hp: 2.0, stage: 30, phase_compatibility: ["single", "three"] },
        { spec: "3 HP / 30 Stage V4", min_feet: 650, max_feet: 700, price: 33800, hp: 3.0, stage: 30, phase_compatibility: ["single", "three"] },
        { spec: "3 HP / 40 Stage V4", min_feet: 700, max_feet: 850, price: 36800, hp: 3.0, stage: 40, phase_compatibility: ["single", "three"] },
        { spec: "5 HP / 50 Stage V4", min_feet: 850, max_feet: 1100, price: 45000, hp: 5.0, stage: 50, phase_compatibility: ["three"] },
        { spec: "6 HP / 60 Stage V4", min_feet: 1100, max_feet: 1300, price: 56000, hp: 6.0, stage: 60, phase_compatibility: ["three"] },
        { spec: "7.5 HP / 75 Stage V4", min_feet: 1300, max_feet: 1600, price: 68000, hp: 7.5, stage: 75, phase_compatibility: ["three"] },
      ],
    },
    aqua_texmo: {
      brand: "Aqua Texmo",
      models: [
        { spec: "1.0 HP / 15 Stage V4", spec_display: "1 HP / 15 Stage V4", min_feet: 0, max_feet: 250, price: 14800, hp: 1.0, stage: 15, phase_compatibility: ["single"] },
        { spec: "1.5 HP / 20 Stage V4", min_feet: 250, max_feet: 360, price: 18500, hp: 1.5, stage: 20, phase_compatibility: ["single", "three"] },
        { spec: "2.0 HP / 20 Stage V4", spec_display: "2 HP / 20 Stage V4", min_feet: 360, max_feet: 450, price: 19500, hp: 2.0, stage: 20, phase_compatibility: ["single", "three"] },
        { spec: "2.0 HP / 30 Stage V4", spec_display: "2 HP / 30 Stage V4", min_feet: 450, max_feet: 550, price: 22500, hp: 2.0, stage: 30, phase_compatibility: ["single", "three"] },
        { spec: "3.0 HP / 30 Stage V4", spec_display: "3 HP / 30 Stage V4", min_feet: 550, max_feet: 700, price: 33800, hp: 3.0, stage: 30, phase_compatibility: ["single", "three"] },
        { spec: "3.0 HP / 40 Stage V4", spec_display: "3 HP / 40 Stage V4", min_feet: 700, max_feet: 850, price: 36800, hp: 3.0, stage: 40, phase_compatibility: ["single", "three"] },
        { spec: "5.0 HP / 50 Stage V4", spec_display: "5 HP / 50 Stage V4", min_feet: 850, max_feet: 1100, price: 45000, hp: 5.0, stage: 50, phase_compatibility: ["three"] },
        { spec: "6.0 HP / 60 Stage V4", spec_display: "6 HP / 60 Stage V4", min_feet: 1100, max_feet: 1300, price: 56000, hp: 6.0, stage: 60, phase_compatibility: ["three"] },
        { spec: "7.5 HP / 75 Stage V4", spec_display: "7.5 HP / 75 Stage V4", min_feet: 1300, max_feet: 1600, price: 68000, hp: 7.5, stage: 75, phase_compatibility: ["three"] },
      ],
    },
    cri: {
      brand: "CRI Pumps",
      models: [
        { spec: "1 HP / 12 Stage V3", min_feet: 0, max_feet: 200, price: 13500, hp: 1.0, stage: 12, phase_compatibility: ["single"] },
        { spec: "1.5 HP / 18 Stage V4", min_feet: 200, max_feet: 360, price: 16500, hp: 1.5, stage: 18, phase_compatibility: ["single", "three"] },
        { spec: "2 HP / 20 Stage V4", min_feet: 360, max_feet: 450, price: 19500, hp: 2.0, stage: 20, phase_compatibility: ["single", "three"] },
        { spec: "2 HP / 25 Stage V4", min_feet: 450, max_feet: 550, price: 22500, hp: 2.0, stage: 25, phase_compatibility: ["single", "three"] },
        { spec: "2 HP / 30 Stage V4", min_feet: 550, max_feet: 650, price: 25800, hp: 2.0, stage: 30, phase_compatibility: ["single", "three"] },
        { spec: "3 HP / 30 Stage V4", min_feet: 650, max_feet: 700, price: 33800, hp: 3.0, stage: 30, phase_compatibility: ["single", "three"] },
        { spec: "3 HP / 40 Stage V4", min_feet: 700, max_feet: 850, price: 36800, hp: 3.0, stage: 40, phase_compatibility: ["single", "three"] },
        { spec: "5 HP / 50 Stage V4", min_feet: 850, max_feet: 1100, price: 45000, hp: 5.0, stage: 50, phase_compatibility: ["three"] },
        { spec: "6 HP / 60 Stage V4", min_feet: 1100, max_feet: 1300, price: 56000, hp: 6.0, stage: 60, phase_compatibility: ["three"] },
        { spec: "7.5 HP / 75 Stage V4", min_feet: 1300, max_feet: 1600, price: 68000, hp: 7.5, stage: 75, phase_compatibility: ["three"] },
      ],
    },
  },
};

export class QuotationCalculationService {
  static convertFeetToMeters(feet) {
    return Math.round((feet / CONFIG.business.feet_to_meter_ratio) * 100) / 100;
  }

  static calculateCableLength(meters) {
    return Math.round((meters + CONFIG.business.cable_extra_meters) * 100) / 100;
  }

  static selectPipe(feet, mode = "REGULAR") {
    let pipeType = "12.5 KG";
    let pricePerMeter = 70.0;

    for (const rate of CONFIG.pipes.rates) {
      if (feet >= rate.min_feet && feet < rate.max_feet) {
        pipeType = rate.type;
        pricePerMeter = rate.price_per_meter;
        break;
      }
    }

    const meters = this.convertFeetToMeters(feet);
    const totalCost = Math.round(meters * pricePerMeter * 100) / 100;
    const reasoning = feet < 200 ? CONFIG.pipes.durability_notice : null;

    return {
      brand: {
        internal_brand: "Sudhakar Pipes",
        display_brand: "Sudhakar Pipes",
      },
      type: pipeType,
      length_meters: meters,
      price_per_meter: pricePerMeter,
      total_cost: totalCost,
      reasoning,
    };
  }

  static selectCable(feet, mode = "REGULAR") {
    const meters = this.convertFeetToMeters(feet);
    const cableLen = this.calculateCableLength(meters);

    let internalBrand = "";
    let displayBrand = "";
    let cableSpec = "2.5 SQMM";
    let pricePerMeter = 90.0;
    let reasoning = "";

    const isStandard = String(mode).toUpperCase() === "STANDARD";

    if (isStandard) {
      internalBrand = "Sudhakar Company";
      displayBrand = "Sudhakar Company Cable";
      reasoning = "Standard mode: Enforces premium branded company cable.";

      for (const rate of CONFIG.cables.sudhakar_rates) {
        if (feet >= rate.min_feet && feet < rate.max_feet) {
          cableSpec = rate.spec;
          pricePerMeter = rate.price_per_meter;
          break;
        }
      }
    } else {
      // REGULAR MODE
      if (feet <= CONFIG.cables.cutoff_feet) {
        internalBrand = "Local / Normal";
        displayBrand = "Cable WIRE"; // Preserve retail customer trust
        reasoning = "Regular mode: Enforces standard cable for <= 350 FT.";

        for (const rate of CONFIG.cables.local_rates) {
          if (rate.spec === "2.5 SQMM") {
            cableSpec = "2.5 SQMM";
            pricePerMeter = rate.price_per_meter;
            break;
          }
        }
      } else {
        internalBrand = "Sudhakar Company";
        displayBrand = "Sudhakar Company Cable";
        reasoning = "Borewell depth exceeds 350 feet cutoff. Branded company cable recommended for safety.";

        for (const rate of CONFIG.cables.sudhakar_rates) {
          if (feet >= rate.min_feet && feet < rate.max_feet) {
            cableSpec = rate.spec;
            pricePerMeter = rate.price_per_meter;
            break;
          }
        }
      }
    }

    const totalCost = Math.round(cableLen * pricePerMeter * 100) / 100;

    return {
      brand: {
        internal_brand: internalBrand,
        display_brand: displayBrand,
      },
      spec: cableSpec,
      length_meters: cableLen,
      price_per_meter: pricePerMeter,
      total_cost: totalCost,
      reasoning,
    };
  }

  static recommendMotors(feet, phase = "single", preferredBrand = null, mode = "REGULAR", options = {}) {
    const { localBrandName = null, customMotors = [], selectedMotor = null } = options;
    const recommendations = [];
    const isStandard = String(mode).toUpperCase() === "STANDARD";
    const normBrand = preferredBrand ? preferredBrand.toLowerCase().trim() : null;

    let recommendBudget = false;
    if (!isStandard) {
      if (normBrand === "budget" || (localBrandName && normBrand === localBrandName.toLowerCase().trim()) || ["jai kissan", "orient", "godavari"].includes(normBrand) || !normBrand) {
        recommendBudget = true;
      }
    }

    // 1. Budget / Local Options
    if (recommendBudget) {
      const budgetCfg = CONFIG.motors.budget;
      const defaultBrand = localBrandName?.trim() || (preferredBrand && budgetCfg.brands.includes(preferredBrand) ? preferredBrand : "Jai Kissan");

      for (const m of budgetCfg.models) {
        if (feet >= m.min_feet && feet < m.max_feet) {
          if (m.phase_compatibility.includes(phase.toLowerCase())) {
            recommendations.push({
              brand: defaultBrand,
              spec: m.spec,
              price: m.price,
              hp: m.hp,
              stage: m.stage,
              is_premium: false,
              is_custom: false,
              is_primary_recommendation: normBrand === "budget" || !normBrand || (localBrandName && normBrand === localBrandName.toLowerCase().trim()) || ["jai kissan", "orient", "godavari"].includes(normBrand),
              reasoning: `Regular Mode with Local / Economy preference. Recommends affordable ${defaultBrand} ${m.spec} up to ${m.max_feet} FT.`,
            });
            break;
          }
        }
      }
    }

    // 2. Premium Options
    const premiumKeys = ["crompton", "aqua_texmo", "cri"];
    let primaryPremiumBrand = "Crompton";
    if (normBrand === "aqua_texmo") primaryPremiumBrand = "Aqua Texmo";
    if (normBrand === "cri") primaryPremiumBrand = "CRI Pumps";

    for (const pk of premiumKeys) {
      const brandCfg = CONFIG.motors[pk];
      const brandName = brandCfg.brand;

      for (const m of brandCfg.models) {
        if (feet >= m.min_feet && feet < m.max_feet) {
          if (m.phase_compatibility.includes(phase.toLowerCase())) {
            let isPrimary = false;
            if (isStandard) {
              isPrimary = brandName === primaryPremiumBrand;
            } else {
              isPrimary = normBrand === pk || (premiumKeys.includes(normBrand) && brandName === primaryPremiumBrand);
            }

            const specDisplay = m.spec_display || m.spec;
            recommendations.push({
              brand: brandName,
              spec: specDisplay,
              price: m.price,
              hp: m.hp,
              stage: m.stage,
              is_premium: true,
              is_custom: false,
              is_primary_recommendation: isPrimary,
              reasoning: `Premium ${brandName} ${specDisplay} recommended. Robust stages optimized for longevity at ${feet} FT.`,
            });
            break;
          }
        }
      }
    }

    // 3. User-added Custom Motors
    if (Array.isArray(customMotors) && customMotors.length > 0) {
      for (const cm of customMotors) {
        if (cm.brand && cm.price) {
          const isSelectedCustom = selectedMotor && selectedMotor.brand === cm.brand && selectedMotor.price === cm.price;
          recommendations.push({
            brand: cm.brand,
            spec: cm.spec || `${cm.hp || 2} HP / ${cm.stage || 25} Stage`,
            price: Number(cm.price),
            hp: Number(cm.hp || 2.0),
            stage: Number(cm.stage || 25),
            is_premium: false,
            is_custom: true,
            is_primary_recommendation: isSelectedCustom || false,
            reasoning: `Custom Motor Configuration: ${cm.brand} specified with custom shop price.`,
          });
        }
      }
    }

    // 4. If selectedMotor explicitly provided, ensure it becomes the primary recommendation
    if (selectedMotor) {
      recommendations.forEach((r) => {
        const matchesBrand = r.brand.toLowerCase() === selectedMotor.brand.toLowerCase();
        const matchesPrice = !selectedMotor.price || r.price === Number(selectedMotor.price);
        r.is_primary_recommendation = matchesBrand && matchesPrice;
      });
    }

    if (recommendations.length > 0 && !recommendations.some((r) => r.is_primary_recommendation)) {
      recommendations[0].is_primary_recommendation = true;
    }

    return recommendations;
  }

  static selectStarter(phase = "single", starterType = "manual", motorHp = 1.5) {
    if (phase.toLowerCase() === "three") {
      const timerCfg = CONFIG.starters.three_phase.timer;
      return {
        brand: timerCfg.brand,
        type: "timer",
        price: timerCfg.price,
      };
    }

    // Single phase
    const isAuto = starterType.toLowerCase() === "auto" || starterType.toLowerCase() === "timer";
    const typeKey = isAuto ? "auto" : "manual";
    const typeCfg = CONFIG.starters.single_phase[typeKey];

    let brandName = typeCfg.brands[0];
    if (typeKey === "manual" && typeCfg.brands.length > 1) {
      brandName = `${typeCfg.brands[0]} / ${typeCfg.brands[1]}`;
    }

    let price = 2000;
    for (const rate of typeCfg.rates) {
      if (rate.hp === motorHp) {
        price = rate.price;
        break;
      }
    }

    return {
      brand: brandName,
      type: typeKey,
      price: price,
    };
  }

  static selectFittingCharges(feet) {
    for (const r of CONFIG.fitting_charges.ranges) {
      if (feet >= r.min_feet && feet < r.max_feet) {
        return {
          label: r.label,
          price: r.charge,
          method: r.method,
        };
      }
    }
    return { label: "Fitting Charge", price: 1500, method: "manual" };
  }

  static calculateTotals(subtotal, discountOverride = null) {
    const discountPct = discountOverride !== null ? discountOverride : CONFIG.business.default_discount_percentage;
    const discountAmount = Math.round(subtotal * (discountPct / 100) * 100) / 100;
    const grandTotal = Math.round((subtotal - discountAmount) * 100) / 100;

    return {
      subtotal,
      discount_percentage: discountPct,
      discount_amount: discountAmount,
      grand_total: grandTotal,
    };
  }

  /**
   * Main serverless calculation orchestrator
   * @param {Object} params
   * @returns {Object} Complete, production-grade QuotationResponse object
   */
  static generateQuotation({
    customer_name,
    phone,
    feet,
    phase = "single",
    starter_type = "manual",
    preferred_brand = null,
    local_brand_name = null,
    custom_motors = [],
    selected_motor = null,
    show_motor_options = true,
    compare_brands = null,
    mode = "REGULAR",
  }) {
    const depth = parseInt(feet, 10);
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    const cleanMode = String(mode).toUpperCase() === "STANDARD" ? "STANDARD" : "REGULAR";

    // 1. Pipe Selection
    const pipeDetail = this.selectPipe(depth, cleanMode);

    // 2. Cable Selection
    const cableDetail = this.selectCable(depth, cleanMode);

    // 3. Motor Recommendations (with local brand and custom motors support)
    const motors = this.recommendMotors(depth, phase, preferred_brand, cleanMode, {
      localBrandName: local_brand_name,
      customMotors: custom_motors,
      selectedMotor: selected_motor,
    });

    if (!motors || motors.length === 0) {
      throw new Error(`No compatible submersible pump found for depth ${depth} FT and ${phase} phase.`);
    }

    const primaryMotor = motors.find((m) => m.is_primary_recommendation) || motors[0];

    // 4. Starter Panel Selection
    const starterDetail = this.selectStarter(phase, starter_type, primaryMotor.hp);

    // 5. Accessories and Fitting Charges
    const accessoriesDetail = {
      name: CONFIG.accessories.name,
      price: CONFIG.accessories.price,
    };
    const fittingDetail = this.selectFittingCharges(depth);

    // 6. Subtotal and Grand Total for Primary Selection
    const otherCosts = Math.round(
      (pipeDetail.total_cost +
        cableDetail.total_cost +
        starterDetail.price +
        accessoriesDetail.price +
        fittingDetail.price) *
        100
    ) / 100;

    const subtotal = Math.round((otherCosts + primaryMotor.price) * 100) / 100;
    const totalsDetail = this.calculateTotals(subtotal);

    // 7. Calculate Turnkey Package Grand Totals for Every Motor Option
    const motor_options = motors
      .filter((m) => {
        if (!compare_brands || !Array.isArray(compare_brands) || compare_brands.length === 0) {
          return true;
        }
        return compare_brands.includes(m.brand) || m.brand === primaryMotor.brand;
      })
      .map((m) => {
        const subtotalForM = Math.round((otherCosts + m.price) * 100) / 100;
        const totalsForM = this.calculateTotals(subtotalForM);
        return {
          brand: m.brand,
          spec: m.spec,
          price: m.price,
          hp: m.hp,
          stage: m.stage,
          is_premium: m.is_premium,
          is_custom: !!m.is_custom,
          is_primary: m.brand === primaryMotor.brand && m.spec === primaryMotor.spec,
          package_subtotal: totalsForM.subtotal,
          package_discount: totalsForM.discount_amount,
          package_grand_total: totalsForM.grand_total,
          reasoning: m.reasoning,
        };
      });

    // 8. Formatted Summary Metadata
    const modeConfig = CONFIG.business.modes[cleanMode];
    const summary = {
      mode_label: modeConfig.label,
      mode_description: modeConfig.description,
      cable_match_summary: `${cableDetail.brand.display_brand} (${cableDetail.spec}) - ${cableDetail.length_meters} meters`,
      pipe_match_summary: `${pipeDetail.brand.display_brand} (${pipeDetail.type}) - ${pipeDetail.length_meters} meters`,
      motor_match_summary: `${primaryMotor.brand} ${primaryMotor.spec} (₹${primaryMotor.price.toLocaleString("en-IN")})`,
      formatted_subtotal: `₹${totalsDetail.subtotal.toLocaleString("en-IN")}`,
      formatted_discount: `₹${totalsDetail.discount_amount.toLocaleString("en-IN")} (${totalsDetail.discount_percentage}%)`,
      formatted_grand_total: `₹${totalsDetail.grand_total.toLocaleString("en-IN")}`,
    };

    // 9. Generate unique Quotation ID
    const quotationId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `QUO-${Date.now()}`;

    return {
      quotation_id: quotationId,
      generated_at: new Date().toISOString(),
      customer_name: customer_name.trim(),
      phone: cleanPhone,
      feet: depth,
      mode: cleanMode,
      pipe: pipeDetail,
      cable: cableDetail,
      starter: starterDetail,
      accessories: accessoriesDetail,
      fitting: fittingDetail,
      motors,
      motor_options,
      show_motor_options: Boolean(show_motor_options),
      totals: totalsDetail,
      summary,
    };
  }

  /**
   * Helper to query compatible motors for a given depth live in the form
   */
  static getCompatibleMotors(depth, phase = "single", mode = "REGULAR", options = {}) {
    if (!depth || isNaN(depth) || depth <= 0) return [];
    return this.recommendMotors(parseInt(depth, 10), phase, null, mode, options);
  }
}

export const quotationService = QuotationCalculationService;
export default quotationService;
