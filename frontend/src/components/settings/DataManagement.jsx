import React from 'react';
import toast from 'react-hot-toast';
import { FiDownload, FiUpload, FiDatabase } from 'react-icons/fi';

const DataManagement = ({ settings }) => {
  
  const handleExportSettings = () => {
    try {
      if (!settings) {
        toast.error('No settings data to export');
        return;
      }
      
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `spqs_settings_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Settings exported successfully');
    } catch (error) {
      toast.error('Failed to export settings');
    }
  };

  const handleImportPlaceholder = () => {
    toast('Import functionality coming soon!', { icon: '🚧' });
  };
  
  const handleExportDBPlaceholder = () => {
    toast('Database export coming soon!', { icon: '🚧' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FiDatabase className="text-blue-500" />
        Data Management
      </h3>
      
      <p className="text-sm text-gray-600 mb-6">
        Export your settings for backup purposes or migrate data between different installations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleExportSettings}
          className="flex flex-col items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          <FiDownload size={24} className="text-blue-500" />
          <span className="font-medium">Export Settings</span>
          <span className="text-xs text-gray-500 text-center">Download settings as JSON</span>
        </button>

        <button
          onClick={handleImportPlaceholder}
          className="flex flex-col items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          <FiUpload size={24} className="text-purple-500" />
          <span className="font-medium">Import Settings</span>
          <span className="text-xs text-gray-500 text-center">Restore from JSON file</span>
        </button>

        <button
          onClick={handleExportDBPlaceholder}
          className="flex flex-col items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          <FiDatabase size={24} className="text-green-500" />
          <span className="font-medium">Export Database</span>
          <span className="text-xs text-gray-500 text-center">Full system backup</span>
        </button>
      </div>
    </div>
  );
};

export default DataManagement;
