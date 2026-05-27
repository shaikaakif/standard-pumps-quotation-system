import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';

const DefaultsForm = ({ settings, updateSettings, isSaving }) => {
  const [formData, setFormData] = useState({
    default_mode: '',
    default_discount_percentage: 0,
    default_starter_type: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        default_mode: settings.default_mode || 'STANDARD',
        default_discount_percentage: settings.default_discount_percentage || 0,
        default_starter_type: settings.default_starter_type || 'NONE'
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({ ...settings, ...formData });
      toast.success('Defaults updated successfully');
    } catch (error) {
      toast.error('Failed to update defaults');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Operational Defaults</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Mode</label>
            <select
              name="default_mode"
              value={formData.default_mode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="STANDARD">Standard</option>
              <option value="ECONOMY">Economy</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Starter Type</label>
            <select
              name="default_starter_type"
              value={formData.default_starter_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NONE">None</option>
              <option value="DOL">DOL</option>
              <option value="STAR_DELTA">Star Delta</option>
              <option value="VFD">VFD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Discount (%)</label>
            <input
              type="number"
              name="default_discount_percentage"
              value={formData.default_discount_percentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            <FiSave />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DefaultsForm;
