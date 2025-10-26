import { useState, useEffect } from 'react';
import { checkOnlineStatus } from '../utils/offlineCache';

/**
 * Hook to monitor network connection status
 * Uses simple fetch-based approach that works on all platforms (Web, iOS, Android)
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Initial check
    checkConnection();

    // Periodic check every 30 seconds
    const interval = setInterval(() => {
      checkConnection();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Simple server reachability check (works on all platforms)
      const online = await checkOnlineStatus();
      setIsOnline(online);
    } catch (error) {
      console.log('Error checking network status:', error);
      setIsOnline(false);
    }
    setIsChecking(false);
  };

  return { isOnline, isChecking, recheckConnection: checkConnection };
};

