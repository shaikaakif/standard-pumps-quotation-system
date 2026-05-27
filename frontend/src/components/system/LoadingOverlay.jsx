import React from "react";
import { FiCpu, FiFileText } from "react-icons/fi";

function LoadingOverlay({ progress, message, type = "quotation" }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-navy-900 bg-opacity-95 backdrop-blur-sm px-6 text-center select-none animate-fadeIn transition-opacity duration-300">
      <div className="max-w-md w-full bg-white bg-opacity-5 p-8 rounded-xl border border-white border-opacity-10 shadow-2xl backdrop-filter">
        {/* Animated Icon Circle */}
        <div className="relative flex justify-center mb-6">
          <div className="absolute inset-0 bg-brand-yellow rounded-full filter blur opacity-20 animate-pulse w-16 h-16 mx-auto" />
          <div className="relative bg-brand-navy-800 border border-brand-yellow/30 text-brand-yellow p-4 rounded-full flex items-center justify-center w-16 h-16">
            {type === "pdf" ? (
              <FiFileText className="w-8 h-8 animate-pulse" />
            ) : (
              <FiCpu className="w-8 h-8 animate-spin" style={{ animationDuration: "3s" }} />
            )}
          </div>
        </div>

        {/* Action Header */}
        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2 Poppins">
          {type === "pdf" ? "PDF Generation Engine" : "Quotation Engine"}
        </h3>
        
        {/* Transitioning Message */}
        <p className="text-xs text-brand-navy-200 min-h-[32px] max-w-xs mx-auto leading-relaxed mb-6 font-medium animate-pulse">
          {message}
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-brand-navy-950 rounded-full h-2.5 overflow-hidden border border-white border-opacity-5 p-0.5 mb-2.5">
          <div 
            className="bg-brand-yellow h-1.5 rounded-full transition-all duration-150 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] uppercase font-bold text-brand-navy-200 tracking-wider">
            {type === "pdf" ? "Compiling Layout" : "Sizing Hardware"}
          </span>
          <span className="text-xs font-black text-brand-yellow tracking-wider">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
