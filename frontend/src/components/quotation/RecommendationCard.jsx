import React from "react";
import { FiAward, FiInfo } from "react-icons/fi";

function RecommendationCard({ motors }) {
  // Find the primary recommended motor
  const primaryMotor = motors.find((m) => m.is_primary_recommendation) || motors[0];

  if (!primaryMotor) return null;

  return (
    <div className="bg-white rounded-lg border-2 border-brand-navy-800 overflow-hidden mb-5 quotation-card-group shadow-sm">
      {/* Accent Header */}
      <div className="bg-brand-navy-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiAward className="w-5 h-5 text-brand-yellow fill-brand-yellow/10" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Primary Recommended Submersible Motor
          </h3>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm ${
          primaryMotor.is_premium
            ? "bg-brand-yellow text-brand-navy-900 font-extrabold"
            : "bg-brand-navy-100 text-brand-navy-800"
        }`}>
          {primaryMotor.is_premium ? "Premium Grade" : "Affordable Series"}
        </span>
      </div>

      <div className="p-4 bg-brand-navy-50/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h4 className="text-lg font-bold text-brand-navy-900 leading-tight">
              {primaryMotor.brand}
            </h4>
            <p className="text-xs text-brand-navy-600 font-semibold mt-1">
              Specification: {primaryMotor.spec}
            </p>
          </div>
          
          {/* Quick Specs badges */}
          <div className="flex space-x-2 text-xs font-semibold">
            <div className="bg-white border border-brand-gray-200 rounded px-2.5 py-1 text-center min-w-16">
              <div className="text-[9px] text-brand-gray-400 font-bold uppercase tracking-wide">Capacity</div>
              <div className="text-brand-navy-900 font-bold mt-0.5">{primaryMotor.hp} HP</div>
            </div>
            <div className="bg-white border border-brand-gray-200 rounded px-2.5 py-1 text-center min-w-16">
              <div className="text-[9px] text-brand-gray-400 font-bold uppercase tracking-wide">Impellers</div>
              <div className="text-brand-navy-900 font-bold mt-0.5">{primaryMotor.stage} Stage</div>
            </div>
          </div>
        </div>

        {/* Reasoning Rationale Metadata */}
        <div className="mt-4 pt-3.5 border-t border-brand-gray-200 flex items-start space-x-2 text-xs text-brand-navy-700 leading-relaxed font-medium">
          <FiInfo className="w-4 h-4 text-brand-navy-800 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-brand-navy-900 uppercase tracking-wide mr-1">Rationale:</span>
            {primaryMotor.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecommendationCard;
