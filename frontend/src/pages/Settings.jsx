import React from 'react';
import { FiSettings, FiLoader } from 'react-icons/fi';
import { useSettings } from '../hooks/useSettings';

import BusinessInfoForm from '../components/settings/BusinessInfoForm';
import LogoUploader from '../components/settings/LogoUploader';
import QuotationCustomization from '../components/settings/QuotationCustomization';
import DefaultsForm from '../components/settings/DefaultsForm';
import SystemInfoCard from '../components/settings/SystemInfoCard';
import DataManagement from '../components/settings/DataManagement';

const Settings = () => {
  const { 
    settings, 
    updateSettings, 
    isLoading, 
    isSaving, 
    logos, 
    updateLogos 
  } = useSettings();

  if (isLoading && !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FiLoader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <FiSettings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500">Manage business info, customization, and system defaults</p>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <BusinessInfoForm 
            settings={settings} 
            updateSettings={updateSettings} 
            isSaving={isSaving} 
          />
        </section>

        <section>
          <LogoUploader 
            logos={logos} 
            updateLogos={updateLogos} 
          />
        </section>

        <section>
          <QuotationCustomization 
            settings={settings} 
            updateSettings={updateSettings} 
            isSaving={isSaving} 
          />
        </section>

        <section>
          <DefaultsForm 
            settings={settings} 
            updateSettings={updateSettings} 
            isSaving={isSaving} 
          />
        </section>

        <section>
          <DataManagement settings={settings} />
        </section>

        <section>
          <SystemInfoCard />
        </section>
      </div>
    </div>
  );
};

export default Settings;
