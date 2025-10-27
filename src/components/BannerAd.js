import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { getAdUnitId, shouldShowAds } from '../config/admob';

// Conditionally import AdMob components only for native platforms
let BannerAd = null;
let BannerAdSize = null;

if (Platform.OS !== 'web') {
  const admobModule = require('react-native-google-mobile-ads');
  BannerAd = admobModule.BannerAd;
  BannerAdSize = admobModule.BannerAdSize;
}

const BannerAdComponent = ({ user, style }) => {
  const [showAd, setShowAd] = useState(false);
  const [adUnitId, setAdUnitId] = useState(null);

  useEffect(() => {
    // Check if ads should be shown
    const canShowAds = shouldShowAds(user);
    setShowAd(canShowAds);
    
    if (canShowAds) {
      // Get ad unit ID
      const unitId = getAdUnitId('banner');
      setAdUnitId(unitId);
    }
  }, [user]);

  // Don't show ads on web or if not available
  if (Platform.OS === 'web' || !BannerAd || !showAd || !adUnitId) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('✅ Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.log('❌ Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default BannerAdComponent;

