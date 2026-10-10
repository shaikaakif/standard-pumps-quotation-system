import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { CacheManager } from '../utils/cacheHelpers';

const CACHE_KEY = 'spqs_settings';

const DEFAULT_SETTINGS = {
  shop_name: 'STANDARD PUMPS & BOREWELLS',
  tagline: 'Dealers in Submersible Motors, Pumps, Pipes, Cables & Fittings',
  phone: '+91 9110704747',
  secondary_phone: '+91 9581472786',
  whatsapp: '+91 9110704747',
  address: 'Pillar No 101, Attapur, Ring Road, Hyderabad, TS - 500048',
  owner_name: 'Shaik Asif',
  email: '',
  gst_number: '',
  website: '',
  default_mode: 'REGULAR',
  default_discount_percentage: 2.5
};

export const useSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize logos from localStorage
  const [logos, setLogos] = useState({
    appLogo: localStorage.getItem('spqs_app_logo') || null,
    quotationLogo: localStorage.getItem('spqs_quotation_logo') || null,
  });

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Check local storage / cache first
      let localData = null;
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) localData = JSON.parse(raw);
      } catch (e) {}

      if (!localData) {
        localData = CacheManager.get(CACHE_KEY);
      }

      const initialSettings = localData ? { ...DEFAULT_SETTINGS, ...localData } : DEFAULT_SETTINGS;
      setSettings(initialSettings);

      // 2. Try fetching from backend API if available (silent fallback if offline/serverless)
      try {
        const response = await apiClient.get('/settings');
        if (response?.data) {
          const merged = { ...initialSettings, ...response.data };
          setSettings(merged);
          localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
          CacheManager.set(CACHE_KEY, merged, 24 * 60 * 60 * 1000);
        }
      } catch (apiErr) {
        // Backend optional in serverless/offline mode
      }
    } catch (error) {
      console.warn('Using local settings configuration:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings) => {
    setIsSaving(true);
    try {
      const merged = { ...DEFAULT_SETTINGS, ...settings, ...newSettings };
      setSettings(merged);
      localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      CacheManager.set(CACHE_KEY, merged, 24 * 60 * 60 * 1000);

      // Background sync to backend if online
      try {
        await apiClient.put('/settings', merged);
      } catch (apiErr) {
        console.info('Settings saved locally (serverless/offline mode)');
      }
      return merged;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateLogos = (appLogo, quotationLogo) => {
    if (appLogo !== undefined) {
      if (appLogo) {
        localStorage.setItem('spqs_app_logo', appLogo);
      } else {
        localStorage.removeItem('spqs_app_logo');
      }
    }
    
    if (quotationLogo !== undefined) {
      if (quotationLogo) {
        localStorage.setItem('spqs_quotation_logo', quotationLogo);
      } else {
        localStorage.removeItem('spqs_quotation_logo');
      }
    }

    setLogos({
      appLogo: localStorage.getItem('spqs_app_logo') || null,
      quotationLogo: localStorage.getItem('spqs_quotation_logo') || null,
    });
  };

  return {
    settings,
    updateSettings,
    isLoading,
    isSaving,
    logos,
    updateLogos,
    refresh: fetchSettings
  };
};
