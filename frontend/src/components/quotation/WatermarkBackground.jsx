import React from "react";

/**
 * WatermarkBackground component to prepare the layout architecture for
 * professional, secure document watermarking (e.g. "OFFICIAL ESTIMATE").
 * By default, it is hidden but fully responsive and structured for future use.
 */
function WatermarkBackground({ text = "STANDARD PUMPS & BOREWELL", visible = false }) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.03] no-print-watermark">
      <div className="text-brand-navy-900 font-extrabold text-5xl sm:text-7xl tracking-widest uppercase transform -rotate-30 whitespace-nowrap">
        {text}
      </div>
    </div>
  );
}

export default WatermarkBackground;
