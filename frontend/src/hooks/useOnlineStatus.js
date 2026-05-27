import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const HEALTH_ENDPOINT = `${API_BASE_URL}/health`;
const HEALTH_CHECK_INTERVAL_MS = 30_000;
const HEALTH_CHECK_TIMEOUT_MS = 5_000;

/**
 * Custom hook that tracks two separate connectivity states:
 * 1. `isOnline` — browser internet connectivity via navigator.onLine + online/offline events
 * 2. `isBackendAvailable` — backend server reachability via periodic lightweight health checks
 *
 * @returns {{ isOnline: boolean, isBackendAvailable: boolean }}
 */
export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => window.navigator.onLine);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const intervalRef = useRef(null);

  /**
   * Performs a lightweight health check against the backend.
   * Uses AbortController to enforce a 5-second timeout.
   * Silently sets isBackendAvailable to false on any error.
   */
  const checkBackendHealth = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

    try {
      const response = await fetch(HEALTH_ENDPOINT, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      setIsBackendAvailable(response.ok);
    } catch {
      // Network error, timeout, or aborted — silently mark as unavailable
      setIsBackendAvailable(false);
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  /**
   * Starts periodic health checks every HEALTH_CHECK_INTERVAL_MS.
   * Runs an immediate check first, then sets up the interval.
   */
  const startHealthChecks = useCallback(() => {
    // Clear any existing interval before starting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Immediate check
    checkBackendHealth();

    // Periodic checks
    intervalRef.current = setInterval(checkBackendHealth, HEALTH_CHECK_INTERVAL_MS);
  }, [checkBackendHealth]);

  /**
   * Stops periodic health checks and marks backend as unavailable.
   */
  const stopHealthChecks = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsBackendAvailable(false);
  }, []);

  useEffect(() => {
    /** @param {Event} _event */
    const handleOnline = () => {
      setIsOnline(true);
    };

    /** @param {Event} _event */
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Start/stop health checks based on online status
  useEffect(() => {
    if (isOnline) {
      startHealthChecks();
    } else {
      stopHealthChecks();
    }

    return () => {
      stopHealthChecks();
    };
  }, [isOnline, startHealthChecks, stopHealthChecks]);

  return { isOnline, isBackendAvailable };
}
