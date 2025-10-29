import { Platform } from 'react-native';

// Conditionally import AdMob only for native platforms
let mobileAds = null;
if (Platform.OS !== 'web') {
  mobileAds = require('react-native-google-mobile-ads').default;
}

// AdMob Configuration
export const ADMOB_CONFIG = {
  APP_ID: 'ca-app-pub-2582947091237108~3955174028',
  
  // Banner Ad Units
  BANNER_AD_UNIT_ID: Platform.select({
    ios: 'ca-app-pub-2582947091237108/1196562010',
    android: 'ca-app-pub-2582947091237108/2175188493',
  }),
  
  // Interstitial Ad Units
  INTERSTITIAL_AD_UNIT_ID: Platform.select({
    ios: 'ca-app-pub-2582947091237108/4700692754',
    android: 'ca-app-pub-2582947091237108/4309670898',
  }),
  
  // App Open Ad Units
  APP_OPEN_AD_UNIT_ID: Platform.select({
    ios: 'ca-app-pub-2582947091237108/3283669309',
    android: 'ca-app-pub-2582947091237108/9992957005',
  }),

  // Test Ad Units (for development)
  TEST_BANNER_AD_UNIT_ID: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
  }),
  
  TEST_INTERSTITIAL_AD_UNIT_ID: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
  }),
  
  TEST_APP_OPEN_AD_UNIT_ID: Platform.select({
    ios: 'ca-app-pub-3940256099942544/5662855259',
    android: 'ca-app-pub-3940256099942544/3419835294',
  }),
};

// Ad Frequency Limits
export const AD_LIMITS = {
  BANNER_REFRESH_INTERVAL: 60, // seconds between banner refreshes
  INTERSTITIAL_MIN_INTERVAL: 180, // 3 minutes between interstitials
  INTERSTITIAL_MAX_PER_DAY: 5, // Max 5 full-screen ads per day
  BOOKS_THRESHOLD_FOR_AD: 5, // Show ad after creating 5th book
  ENTRIES_THRESHOLD_FOR_AD: 20, // Show ad after 20 entries (optional)
  APP_OPEN_MIN_INTERVAL: 3600, // 1 hour between app open ads
};

// Check if user is testing (development mode)
export const USE_TEST_ADS = __DEV__;

// Get the appropriate ad unit ID
export const getAdUnitId = (adType, useTest = USE_TEST_ADS) => {
  if (useTest) {
    switch (adType) {
      case 'banner':
        return ADMOB_CONFIG.TEST_BANNER_AD_UNIT_ID;
      case 'interstitial':
        return ADMOB_CONFIG.TEST_INTERSTITIAL_AD_UNIT_ID;
      case 'appOpen':
        return ADMOB_CONFIG.TEST_APP_OPEN_AD_UNIT_ID;
      default:
        return null;
    }
  }
  
  switch (adType) {
    case 'banner':
      return ADMOB_CONFIG.BANNER_AD_UNIT_ID;
    case 'interstitial':
      return ADMOB_CONFIG.INTERSTITIAL_AD_UNIT_ID;
    case 'appOpen':
      return ADMOB_CONFIG.APP_OPEN_AD_UNIT_ID;
    default:
      return null;
  }
};

// Initialize AdMob
export const initializeAdMob = async () => {
  // Skip initialization on web
  if (Platform.OS === 'web' || !mobileAds) {
    console.log('⚠️  AdMob not available on web platform');
    return false;
  }
  
  try {
    await mobileAds().initialize();
    
    // Set request configuration (optional)
    await mobileAds().setRequestConfiguration({
      // Max Ad Content Rating
      maxAdContentRating: 'G', // G, PG, T, MA
      // Tag for child-directed treatment
      tagForChildDirectedTreatment: false,
      // Tag for under age of consent
      tagForUnderAgeOfConsent: false,
    });
    
    console.log('✅ AdMob initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ AdMob initialization error:', error);
    return false;
  }
};

// Check if ads should be shown for user
export const shouldShowAds = (user) => {
  if (!user) return true;
  
  // Don't show ads if user is premium
  if (user.is_premium === 1 || user.is_premium === true) {
    return false;
  }
  
  return true;
};

export default {
  ADMOB_CONFIG,
  AD_LIMITS,
  USE_TEST_ADS,
  getAdUnitId,
  initializeAdMob,
  shouldShowAds,
};

