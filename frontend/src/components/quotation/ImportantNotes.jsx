import React from "react";
import { FiFileText } from "react-icons/fi";
import { useSettings } from "../../hooks/useSettings";

function ImportantNotes({ notes }) {
  const { settings } = useSettings();
  const defaultNotes = [
    "Motor warranty is subject to manufacturer terms and conditions.",
    "Calculations are based on dynamic price parameters and standard depth thresholds.",
    "Installation charges include standard manual or machine lifting labor.",
    "Accessories include high-strength bore caps, clamps, and connections."
  ];

  // Prefer specific quotation notes (from history/config) or fallback to global settings
  const notesList = notes && notes.length > 0 
    ? notes 
    : (settings?.quotation?.footer_notes || defaultNotes);

  return (
    <div className="mt-6 border-t border-brand-gray-200 pt-5 quotation-card-group">
      <h3 className="text-[10px] font-bold text-brand-navy-800 uppercase tracking-widest flex items-center mb-3">
        <FiFileText className="w-3.5 h-3.5 mr-1" /> Terms & Important Information
      </h3>
      
      <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-brand-gray-550 leading-relaxed font-medium">
        {notesList.map((note, idx) => (
          <li key={idx}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

export default ImportantNotes;
