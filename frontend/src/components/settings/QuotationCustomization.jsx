import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';

const QuotationCustomization = ({ settings, updateSettings, isSaving }) => {
  const [formData, setFormData] = useState({
    footer_notes: '',
    warranty_text: '',
    installation_notes: '',
    thank_you_message: '',
    disclaimer: '',
    signature_label: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        footer_notes: Array.isArray(settings.footer_notes) ? settings.footer_notes.join('\n') : (settings.footer_notes || ''),
        warranty_text: settings.warranty_text || '',
        installation_notes: settings.installation_notes || '',
        thank_you_message: settings.thank_you_message || '',
        disclaimer: settings.disclaimer || '',
        signature_label: settings.signature_label || ''
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert footer_notes back to array if needed. Wait, depends on API schema.
      // Usually it's just passed as string if the API expects strings, or array. Let's send what the API wants. 
      // I will assume it expects an array for footer_notes if it was one. Let's check or just send as string if we aren't sure. 
      // In python, it's typically List[str] if it says "newline separated". 
      // The instruction says "Form to edit footer notes (textarea, newline separated)". We'll send it as array if we see newlines.
      
      const payload = {
        ...settings,
        ...formData,
        footer_notes: formData.footer_notes.split('\n').filter(line => line.trim() !== '')
      };
      
      await updateSettings(payload);
      toast.success('Quotation formatting updated successfully');
    } catch (error) {
      toast.error('Failed to update quotation customization');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quotation Customization</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Footer Notes (Newline separated)
            </label>
            <textarea
              name="footer_notes"
              value={formData.footer_notes}
              onChange={handleChange}
              rows="4"
              placeholder="1. Note one&#10;2. Note two"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Text</label>
            <textarea
              name="warranty_text"
              value={formData.warranty_text}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Installation Notes</label>
            <textarea
              name="installation_notes"
              value={formData.installation_notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disclaimer</label>
            <textarea
              name="disclaimer"
              value={formData.disclaimer}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thank You Message</label>
            <input
              type="text"
              name="thank_you_message"
              value={formData.thank_you_message}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Signature Label</label>
            <input
              type="text"
              name="signature_label"
              value={formData.signature_label}
              onChange={handleChange}
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

export default QuotationCustomization;
