import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * Subtle offline indicator - just shows a small badge when offline
 * Main data loading/refresh is handled by pull-to-refresh
 */
const OfflineIndicator = () => {
  const { isOnline } = useNetworkStatus();

  // Don't show anything if online
  if (isOnline) {
    return null;
  }

  // Show minimal offline badge
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>📴 Offline</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  badge: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default OfflineIndicator;

