import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { CacheManager } from '../utils/cacheHelpers';

const CACHE_KEY = 'spqs_settings';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
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
      // Check cache first
      const cached = CacheManager.get(CACHE_KEY);
      if (cached) {
        setSettings(cached);
      }

      // Fetch from API
      const response = await apiClient.get('/settings');
      const data = response.data;
      
      setSettings(data);
      // Cache for 24 hours
      CacheManager.set(CACHE_KEY, data, 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
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
      const response = await apiClient.put('/settings', newSettings);
      const data = response.data;
      
      setSettings(data);
      CacheManager.set(CACHE_KEY, data, 24 * 60 * 60 * 1000);
      return data;
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
