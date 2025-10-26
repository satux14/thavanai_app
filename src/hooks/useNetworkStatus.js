import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { checkOnlineStatus } from '../utils/offlineCache';

/**
 * Hook to monitor network connection status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Initial check
    checkConnection();

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network state changed:', state.isConnected);
      if (state.isConnected) {
        checkConnection();
      } else {
        setIsOnline(false);
        setIsChecking(false);
      }
    });

    // Periodic check every 30 seconds
    const interval = setInterval(() => {
      checkConnection();
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    const online = await checkOnlineStatus();
    setIsOnline(online);
    setIsChecking(false);
  };

  return { isOnline, isChecking, recheckConnection: checkConnection };
};

