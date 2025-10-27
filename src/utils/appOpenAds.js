import { AppOpenAd, AdEventType } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAdUnitId, AD_LIMITS, shouldShowAds } from '../config/admob';

const AD_STORAGE_KEYS = {
  LAST_APP_OPEN_AD: 'last_app_open_ad_shown',
};

class AppOpenAdManager {
  constructor() {
    this.appOpenAd = null;
    this.isAdLoaded = false;
    this.isAdShowing = false;
    this.isAppInForeground = true;
  }

  // Initialize and load app open ad
  async init() {
    try {
      const adUnitId = getAdUnitId('appOpen');
      
      if (!adUnitId) {
        console.warn('⚠️ App Open Ad Unit ID not configured');
        return false;
      }

      this.appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // Add event listeners
      this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('✅ App Open ad loaded');
        this.isAdLoaded = true;
      });

      this.appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('❌ App Open ad error:', error);
        this.isAdLoaded = false;
        
        // Try to reload after 10 seconds
        setTimeout(() => {
          this.loadAd();
        }, 10000);
      });

      this.appOpenAd.addAdEventListener(AdEventType.OPENED, () => {
        console.log('📺 App Open ad opened');
        this.isAdShowing = true;
      });

      this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('✅ App Open ad closed');
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
      console.error('❌ App Open ad initialization error:', error);
      return false;
    }
  }

  // Load the ad
  async loadAd() {
    if (this.appOpenAd && !this.isAdLoaded && !this.isAdShowing) {
      try {
        await this.appOpenAd.load();
      } catch (error) {
        console.error('❌ Error loading app open ad:', error);
      }
    }
  }

  // Check if ad can be shown
  async canShowAd(user) {
    // Check if user is premium
    if (!shouldShowAds(user)) {
      console.log('ℹ️ User is premium, skipping app open ad');
      return false;
    }

    // Check if ad is loaded
    if (!this.isAdLoaded) {
      console.log('ℹ️ App Open ad not loaded yet');
      return false;
    }

    // Check if app is in foreground
    if (!this.isAppInForeground) {
      console.log('ℹ️ App not in foreground');
      return false;
    }

    // Check frequency limits
    const canShow = await this.checkFrequencyLimits();
    return canShow;
  }

  // Check frequency limits (once per hour)
  async checkFrequencyLimits() {
    try {
      const now = Date.now();
      
      // Check last shown time
      const lastShownStr = await AsyncStorage.getItem(AD_STORAGE_KEYS.LAST_APP_OPEN_AD);
      if (lastShownStr) {
        const lastShown = parseInt(lastShownStr, 10);
        const timeSinceLastAd = (now - lastShown) / 1000; // in seconds
        
        if (timeSinceLastAd < AD_LIMITS.APP_OPEN_MIN_INTERVAL) {
          console.log(`ℹ️ Too soon to show app open ad (${Math.floor(timeSinceLastAd / 60)}min since last)`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error checking app open ad frequency limits:', error);
      return false;
    }
  }

  // Record that ad was shown
  async recordAdShown() {
    try {
      const now = Date.now();
      await AsyncStorage.setItem(AD_STORAGE_KEYS.LAST_APP_OPEN_AD, now.toString());
      console.log('✅ App Open ad shown recorded');
    } catch (error) {
      console.error('❌ Error recording app open ad shown:', error);
    }
  }

  // Show the ad
  async show(user) {
    try {
      const canShow = await this.canShowAd(user);
      
      if (!canShow) {
        return false;
      }

      if (this.appOpenAd && this.isAdLoaded && !this.isAdShowing) {
        await this.appOpenAd.show();
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error showing app open ad:', error);
      return false;
    }
  }

  // Call this when app comes to foreground
  setAppState(isInForeground) {
    this.isAppInForeground = isInForeground;
    
    // If app is coming to foreground, try to show ad
    if (isInForeground && !this.isAdShowing) {
      // Note: You'll need to pass user object from App.js
      // For now, just log
      console.log('ℹ️ App came to foreground');
    }
  }
}

// Create singleton instance
const appOpenAdManager = new AppOpenAdManager();

// Export functions
export const initAppOpenAd = () => appOpenAdManager.init();
export const showAppOpenAd = (user) => appOpenAdManager.show(user);
export const setAppState = (isInForeground) => appOpenAdManager.setAppState(isInForeground);

export default appOpenAdManager;

