import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useLanguage } from '../utils/i18n';

const OfflineIndicator = () => {
  const { isOnline, isChecking, recheckConnection } = useNetworkStatus();
  const { t } = useLanguage();

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
            {t('offline_mode')}
          </Text>
          <Text style={styles.subtitle}>
            {t('offline_viewing_cached')}
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

