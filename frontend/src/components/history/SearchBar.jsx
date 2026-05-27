import React from "react";
import { FiSearch, FiX } from "react-icons/fi";

function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="relative w-full max-w-xl mx-auto mb-6">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <FiSearch className="h-4.5 w-4.5 text-brand-gray-550 transition-colors duration-200" />
      </div>

      {/* Input Field */}
      <input
        type="text"
        placeholder="Search by customer name or phone number..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-10 py-3 text-sm bg-white border border-brand-gray-250 rounded-lg shadow-sm outline-none transition-all duration-200 placeholder-brand-gray-400 focus:border-brand-navy-800 focus:ring-1 focus:ring-brand-navy-100"
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-gray-400 hover:text-brand-navy-800 transition-colors"
          title="Clear search"
        >
          <FiX className="h-4.5 w-4.5" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
