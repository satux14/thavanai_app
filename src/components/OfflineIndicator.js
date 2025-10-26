import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { translate } from '../utils/i18n';

const OfflineIndicator = ({ language = 'en' }) => {
  const { isOnline, isChecking, recheckConnection } = useNetworkStatus();

  // Don't show anything if online
  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.icon}>📴</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {translate('offline_mode', language)}
          </Text>
          <Text style={styles.subtitle}>
            {translate('offline_viewing_cached', language)}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={recheckConnection}
          disabled={isChecking}
        >
          <Text style={styles.retryText}>
            {isChecking ? '⏳' : '🔄'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFF3CD',
    borderBottomWidth: 1,
    borderBottomColor: '#FFC107',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#856404',
  },
  retryButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#FFC107',
  },
  retryText: {
    fontSize: 16,
  },
});

export default OfflineIndicator;

