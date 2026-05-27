import React from "react";

function PricingTable({ pipe, cable, motors, starter, accessories, fitting }) {
  const primaryMotor = motors.find((m) => m.is_primary_recommendation) || motors[0];

  return (
    <div className="bg-white border border-brand-gray-200 rounded-lg overflow-hidden mb-5 quotation-card-group shadow-sm">
      {/* Scrollable grid frame for mobile screenshot safety */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-navy-900 text-white text-[10px] uppercase tracking-wider">
              <th className="px-4 py-3 font-bold">Item & Description</th>
              <th className="px-4 py-3 font-bold">Specification</th>
              <th className="px-4 py-3 font-bold text-center">Qty / Length</th>
              <th className="px-4 py-3 font-bold text-right">Rate (Rs.)</th>
              <th className="px-4 py-3 font-bold text-right">Total (Rs.)</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            
            {/* PIPE MATERIAL GROUP */}
            <tr className="table-category-row">
              <td colSpan="5" className="px-4 py-2 font-bold">Pipe Material</td>
            </tr>
            <tr className="border-b border-brand-gray-200 hover:bg-brand-gray-50/50">
              <td className="px-4 py-3">
                <div className="font-bold text-brand-navy-900">{pipe.brand.display_brand}</div>
                <div className="text-[10px] text-brand-gray-400 mt-0.5">High-grade PVC column pipes</div>
              </td>
              <td className="px-4 py-3 text-brand-navy-800 font-semibold">{pipe.type}</td>
              <td className="px-4 py-3 text-center font-mono font-semibold">{pipe.length_meters} m</td>
              <td className="px-4 py-3 text-right font-mono text-brand-gray-550">{pipe.price_per_meter.toFixed(2)}</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-brand-navy-900">{pipe.total_cost.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>

            {/* CABLE MATERIAL GROUP */}
            <tr className="table-category-row">
              <td colSpan="5" className="px-4 py-2 font-bold">Cable Material</td>
            </tr>
            <tr className="border-b border-brand-gray-200 hover:bg-brand-gray-50/50">
              <td className="px-4 py-3">
                <div className="font-bold text-brand-navy-900">{cable.brand.display_brand}</div>
                <div className="text-[10px] text-brand-gray-400 mt-0.5">Submersible pump cable wire</div>
              </td>
              <td className="px-4 py-3 text-brand-navy-800 font-semibold">{cable.spec}</td>
              <td className="px-4 py-3 text-center font-mono font-semibold">{cable.length_meters} m</td>
              <td className="px-4 py-3 text-right font-mono text-brand-gray-550">{cable.price_per_meter.toFixed(2)}</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-brand-navy-900">{cable.total_cost.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>

            {/* MOTOR CONFIGURATION GROUP */}
            <tr className="table-category-row">
              <td colSpan="5" className="px-4 py-2 font-bold">Motor Configuration</td>
            </tr>
            <tr className="border-b border-brand-gray-200 hover:bg-brand-gray-50/50">
              <td className="px-4 py-3">
                <div className="font-bold text-brand-navy-900">{primaryMotor.brand} Motor</div>
                <div className="text-[10px] text-brand-gray-400 mt-0.5">Submersible motor pump set</div>
              </td>
              <td className="px-4 py-3 text-brand-navy-800 font-semibold">{primaryMotor.spec}</td>
              <td className="px-4 py-3 text-center font-mono font-semibold">1 Set</td>
              <td className="px-4 py-3 text-right font-mono text-brand-gray-550">{primaryMotor.price.toFixed(2)}</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-brand-navy-900">{primaryMotor.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>

            {/* INSTALLATION & COMMISSIONING GROUP */}
            <tr className="table-category-row">
              <td colSpan="5" className="px-4 py-2 font-bold">Installation & Accessories</td>
            </tr>
            {/* Starter panel */}
            <tr className="border-b border-brand-gray-200 hover:bg-brand-gray-50/50">
              <td className="px-4 py-3">
                <div className="font-bold text-brand-navy-900">Control Panel / Starter</div>
                <div className="text-[10px] text-brand-gray-400 mt-0.5">Borewell safety starter board</div>
              </td>
              <td className="px-4 py-3 text-brand-navy-800 font-semibold capitalize">{starter.brand} ({starter.type})</td>
              <td className="px-4 py-3 text-center font-mono font-semibold">1 Unit</td>
              <td className="px-4 py-3 text-right font-mono text-brand-gray-550">{starter.price.toFixed(2)}</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-brand-navy-900">{starter.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
            {/* Accessories */}
            <tr className="border-b border-brand-gray-200 hover:bg-brand-gray-50/50">
              <td className="px-4 py-3">
                <div className="font-bold text-brand-navy-900">{accessories.name}</div>
                <div className="text-[10px] text-brand-gray-400 mt-0.5">Clamps, Cap, Rope, and fittings</div>
              </td>
              <td className="px-4 py-3 text-brand-navy-800 font-semibold">Standard cap set</td>
              <td className="px-4 py-3 text-center font-mono font-semibold">1 Set</td>
              <td className="px-4 py-3 text-right font-mono text-brand-gray-550">{accessories.price.toFixed(2)}</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-brand-navy-900">{accessories.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
            {/* Fitting Charges */}
            <tr className="border-b border-brand-gray-200 hover:bg-brand-gray-50/50">
              <td className="px-4 py-3">
                <div className="font-bold text-brand-navy-900">{fitting.label}</div>
                <div className="text-[10px] text-brand-gray-400 mt-0.5">Technician and commissioning labor</div>
              </td>
              <td className="px-4 py-3 text-brand-navy-800 font-semibold capitalize">{fitting.method.replace("_", " ")}</td>
              <td className="px-4 py-3 text-center font-mono font-semibold">1 Job</td>
              <td className="px-4 py-3 text-right font-mono text-brand-gray-550">{fitting.price.toFixed(2)}</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-brand-navy-900">{fitting.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PricingTable;
