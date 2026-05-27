import React, { useState, useEffect } from 'react';
import { FiInfo, FiServer, FiHardDrive, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import apiClient from '../../services/api';
import { APP_VERSION } from '../../utils/cacheHelpers';

const SystemInfoCard = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [isOnline, setIsOnline] = useState(false);
  const [storageUsage, setStorageUsage] = useState('0 KB');

  useEffect(() => {
    // Check backend status
    const checkBackend = async () => {
      try {
        await apiClient.get('/settings'); // Or '/health' if it exists
        setBackendStatus('Online');
        setIsOnline(true);
      } catch (error) {
        setBackendStatus('Offline / Unreachable');
        setIsOnline(false);
      }
    };
    
    checkBackend();

    // Estimate storage usage (localStorage)
    let totalLength = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      if (value) {
        totalLength += key.length + value.length;
      }
    }
    // Multiply by 2 for roughly bytes (JS uses UTF-16 strings, 2 bytes per char)
    const totalBytes = totalLength * 2;
    if (totalBytes < 1024) {
      setStorageUsage(`${totalBytes} B`);
    } else if (totalBytes < 1024 * 1024) {
      setStorageUsage(`${(totalBytes / 1024).toFixed(2)} KB`);
    } else {
      setStorageUsage(`${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FiInfo className="text-blue-500" />
        System Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <FiInfo size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">App Version</p>
            <p className="font-semibold text-gray-800">v{APP_VERSION}</p>
          </div>
        </div>
        
        <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex items-center gap-3">
          <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isOnline ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
          </div>
          <div>
            <p className="text-sm text-gray-500">API Status</p>
            <p className={`font-semibold ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
              {backendStatus}
            </p>
          </div>
        </div>

        <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-full text-purple-600">
            <FiHardDrive size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Local Storage Used</p>
            <p className="font-semibold text-gray-800">{storageUsage}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfoCard;
