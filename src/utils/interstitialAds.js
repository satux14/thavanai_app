import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAdUnitId, AD_LIMITS, shouldShowAds } from '../config/admob';

// Conditionally import AdMob only for native platforms
let InterstitialAd = null;
let AdEventType = null;

if (Platform.OS !== 'web') {
  const admobModule = require('react-native-google-mobile-ads');
  InterstitialAd = admobModule.InterstitialAd;
  AdEventType = admobModule.AdEventType;
}

const AD_STORAGE_KEYS = {
  INTERSTITIAL_COUNT: 'interstitial_ad_count',
  LAST_INTERSTITIAL: 'last_interstitial_shown',
  LAST_INTERSTITIAL_DATE: 'last_interstitial_date',
};

class InterstitialAdManager {
  constructor() {
    this.interstitialAd = null;
    this.isAdLoaded = false;
    this.isAdShowing = false;
  }

  // Initialize and load interstitial ad
  async init() {
    // Skip on web
    if (Platform.OS === 'web' || !InterstitialAd) {
      console.log('⚠️ Interstitial ads not available on web platform');
      return false;
    }
    
    try {
      const adUnitId = getAdUnitId('interstitial');
      
      if (!adUnitId) {
        console.warn('⚠️ Interstitial Ad Unit ID not configured');
        return false;
      }

      this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // Add event listeners
      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('✅ Interstitial ad loaded');
        this.isAdLoaded = true;
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('❌ Interstitial ad error:', error);
        this.isAdLoaded = false;
      });

      this.interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
        console.log('📺 Interstitial ad opened');
        this.isAdShowing = true;
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('✅ Interstitial ad closed');
        this.isAdShowing = false;
        this.isAdLoaded = false;
        
        // Record that ad was shown
        this.recordAdShown();
        
        // Preload next ad
        setTimeout(() => {
          this.loadAd();
        }, 1000);
      });

      // Load the ad
      await this.loadAd();
      return true;
    } catch (error) {
      console.error('❌ Interstitial ad initialization error:', error);
      return false;
    }
  }

  // Load the ad
  async loadAd() {
    if (this.interstitialAd && !this.isAdLoaded && !this.isAdShowing) {
      try {
        await this.interstitialAd.load();
      } catch (error) {
        console.error('❌ Error loading interstitial ad:', error);
      }
    }
  }

  // Check if ad can be shown
  async canShowAd(user) {
    // Check if user is premium
    if (!shouldShowAds(user)) {
      console.log('ℹ️ User is premium, skipping ad');
      return false;
    }

    // Check if ad is loaded
    if (!this.isAdLoaded) {
      console.log('ℹ️ Interstitial ad not loaded yet');
      return false;
    }

    // Check frequency limits
    const canShow = await this.checkFrequencyLimits();
    return canShow;
  }

  // Check frequency limits
  async checkFrequencyLimits() {
    try {
      const now = Date.now();
      
      // Check last shown time
      const lastShownStr = await AsyncStorage.getItem(AD_STORAGE_KEYS.LAST_INTERSTITIAL);
      if (lastShownStr) {
        const lastShown = parseInt(lastShownStr, 10);
        const timeSinceLastAd = (now - lastShown) / 1000; // in seconds
        
        if (timeSinceLastAd < AD_LIMITS.INTERSTITIAL_MIN_INTERVAL) {
          console.log(`ℹ️ Too soon to show another ad (${Math.floor(timeSinceLastAd)}s since last)`);
          return false;
        }
      }

      // Check daily count
      const today = new Date().toDateString();
      const lastDateStr = await AsyncStorage.getItem(AD_STORAGE_KEYS.LAST_INTERSTITIAL_DATE);
      const countStr = await AsyncStorage.getItem(AD_STORAGE_KEYS.INTERSTITIAL_COUNT);
      
      let count = 0;
      if (lastDateStr === today && countStr) {
        count = parseInt(countStr, 10);
      }
      
      if (count >= AD_LIMITS.INTERSTITIAL_MAX_PER_DAY) {
        console.log(`ℹ️ Daily ad limit reached (${count}/${AD_LIMITS.INTERSTITIAL_MAX_PER_DAY})`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error checking frequency limits:', error);
      return false;
    }
  }

  // Record that ad was shown
  async recordAdShown() {
    try {
      const now = Date.now();
      const today = new Date().toDateString();
      
      // Update last shown time
      await AsyncStorage.setItem(AD_STORAGE_KEYS.LAST_INTERSTITIAL, now.toString());
      
      // Update count
      const lastDateStr = await AsyncStorage.getItem(AD_STORAGE_KEYS.LAST_INTERSTITIAL_DATE);
      const countStr = await AsyncStorage.getItem(AD_STORAGE_KEYS.INTERSTITIAL_COUNT);
      
      let count = 0;
      if (lastDateStr === today && countStr) {
        count = parseInt(countStr, 10);
      }
      
      count += 1;
      
      await AsyncStorage.setItem(AD_STORAGE_KEYS.INTERSTITIAL_COUNT, count.toString());
      await AsyncStorage.setItem(AD_STORAGE_KEYS.LAST_INTERSTITIAL_DATE, today);
      
      console.log(`✅ Ad shown recorded (${count}/${AD_LIMITS.INTERSTITIAL_MAX_PER_DAY} today)`);
    } catch (error) {
      console.error('❌ Error recording ad shown:', error);
    }
  }

  // Show the ad
  async show(user) {
    try {
      const canShow = await this.canShowAd(user);
      
      if (!canShow) {
        return false;
      }

      if (this.interstitialAd && this.isAdLoaded && !this.isAdShowing) {
        await this.interstitialAd.show();
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error showing interstitial ad:', error);
      return false;
    }
  }
}

// Create singleton instance
const interstitialAdManager = new InterstitialAdManager();

// Export functions
export const initInterstitialAd = () => interstitialAdManager.init();
export const showInterstitialAd = (user) => interstitialAdManager.show(user);
export const canShowInterstitialAd = (user) => interstitialAdManager.canShowAd(user);

export default interstitialAdManager;

