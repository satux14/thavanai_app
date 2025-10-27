# AdMob Integration Guide - eThavanai Book

Complete implementation of AdMob monetization with banner, interstitial, and app open ads.

---

## 📱 **AdMob Account Details**

- **App ID:** `ca-app-pub-2582947091237108~3955174028`
- **Banner Ad Unit ID:** `ca-app-pub-2582947091237108/2175188493`
- **Interstitial Ad Unit ID:** `ca-app-pub-2582947091237108/4309670898`
- **App Open Ad Unit ID:** `ca-app-pub-2582947091237108/9992957005`

---

## ✅ **What's Implemented**

### **1. AdMob Configuration**
- ✅ `src/config/admob.js` - Main configuration file
- ✅ App ID configured in `app.json` for both Android and iOS
- ✅ Test ad units for development
- ✅ Production ad units for release

### **2. Banner Ads**
- ✅ `src/components/BannerAd.js` - Reusable banner component
- ✅ Adaptive banner size
- ✅ Respect premium users (no ads)
- 📍 **To be added:** Dashboard bottom & Daily Entries bottom

### **3. Interstitial Ads (Full Screen)**
- ✅ `src/utils/interstitialAds.js` - Interstitial manager
- ✅ Frequency limits (3 min interval, 5/day max)
- ✅ Smart timing logic
- 📍 **To be added:** Show after 5th book creation

### **4. App Open Ads**
- ✅ `src/utils/appOpenAds.js` - App open manager
- ✅ Show on app launch (once per hour)
- ✅ AppState listener in App.js

### **5. Premium User Support**
- ✅ Database schema updated
- ✅ `is_premium` field added to users table
- ✅ `premium_transactions` table
- ✅ `ad_impressions` table (analytics)
- 📍 **To be added:** Server API endpoints & in-app purchase

---

## 🎯 **Ad Placement Strategy**

### **Banner Ads**

| Location | Reasoning | Status |
|----------|-----------|--------|
| Dashboard Bottom | High visibility, non-intrusive | ⏳ To add |
| Daily Entries Bottom | Users spend most time here | ⏳ To add |
| Settings Screen | Good for upsell | 💡 Optional |

### **Interstitial Ads**

| Trigger | Frequency | Status |
|---------|-----------|--------|
| After 5th book created | Once | ⏳ To add |
| After PDF export | Max 1/day | 💡 Optional |
| App launch | Max 1/day | ⏳ Via App Open |

### **Ad Limits**

```javascript
AD_LIMITS = {
  BANNER_REFRESH_INTERVAL: 60, // 60 seconds
  INTERSTITIAL_MIN_INTERVAL: 180, // 3 minutes
  INTERSTITIAL_MAX_PER_DAY: 5, // 5 per day
  BOOKS_THRESHOLD_FOR_AD: 5, // After 5th book
  APP_OPEN_MIN_INTERVAL: 3600, // 1 hour
}
```

---

## 📝 **Next Steps to Complete**

### **Step 1: Add Banner Ad to Dashboard**

Update `src/screens/DashboardScreen.js`:

```javascript
import BannerAd from '../components/BannerAd';

// In render, at the bottom:
return (
  <View style={{ flex: 1 }}>
    <ScrollView>
      {/* ... existing dashboard content ... */}
    </ScrollView>
    
    {/* Add banner at bottom */}
    <BannerAd user={user} />
  </View>
);
```

### **Step 2: Add Banner Ad to Daily Entries**

Update `src/screens/EntriesScreen.js`:

```javascript
import BannerAd from '../components/BannerAd';

// In render, at the bottom:
return (
  <View style={{ flex: 1 }}>
    <ScrollView>
      {/* ... existing entries content ... */}
    </ScrollView>
    
    {/* Add banner at bottom */}
    <BannerAd user={user} />
  </View>
);
```

### **Step 3: Add Interstitial After 5th Book**

Update `src/screens/BookInfoScreen.js` in the save/create function:

```javascript
import { showInterstitialAd } from '../utils/interstitialAds';
import AsyncStorage from '@react-native-async-storage/async-storage';

// After successfully creating a book:
const handleSaveBook = async () => {
  try {
    // ... save book logic ...
    
    // Increment books created count
    const currentCount = await AsyncStorage.getItem('books_created_count');
    const count = currentCount ? parseInt(currentCount, 10) + 1 : 1;
    await AsyncStorage.setItem('books_created_count', count.toString());
    
    // Show interstitial after 5th book
    if (count === 5) {
      setTimeout(() => {
        showInterstitialAd(user);
      }, 1500); // 1.5 second delay
    }
    
    // Navigate away
    navigation.goBack();
  } catch (error) {
    console.error('Error saving book:', error);
  }
};
```

### **Step 4: Add Premium Upgrade UI**

Create `src/screens/PremiumScreen.js`:

```javascript
// Premium upgrade screen with pricing options:
// - Monthly: ₹99/month
// - Yearly: ₹999/year (save 17%)
// 
// Benefits:
// - No Ads
// - Unlimited Books
// - Priority Support
// - Custom Branding
```

### **Step 5: Add Premium API Endpoints**

Update `server/src/routes/auth.js`:

```javascript
// GET /api/auth/premium-status
router.get('/premium-status', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const isPremium = user.is_premium === 1;
    const expiresAt = user.premium_expires_at;
    
    res.json({
      is_premium: isPremium,
      expires_at: expiresAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check premium status' });
  }
});

// POST /api/auth/activate-premium
router.post('/activate-premium', authenticateToken, async (req, res) => {
  try {
    const { transaction_id, plan_type } = req.body;
    const userId = req.user.id;
    
    // Calculate expiry date
    const now = new Date();
    const expiresAt = new Date(now);
    if (plan_type === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan_type === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }
    
    // Update user to premium
    await db.run(
      'UPDATE users SET is_premium = 1, premium_expires_at = ? WHERE id = ?',
      [expiresAt.toISOString(), userId]
    );
    
    // Record transaction
    await db.run(
      `INSERT INTO premium_transactions 
       (user_id, transaction_id, plan_type, status, expires_at) 
       VALUES (?, ?, ?, 'completed', ?)`,
      [userId, transaction_id, plan_type, expiresAt.toISOString()]
    );
    
    res.json({
      success: true,
      is_premium: true,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate premium' });
  }
});
```

---

## 🧪 **Testing**

### **Development Mode (Test Ads)**

In development, test ads are automatically used:

```javascript
// In src/config/admob.js
export const USE_TEST_ADS = __DEV__;
```

**Test Ads:**
- Always load quickly
- Show "Test Ad" label
- No revenue generated
- Safe to click

### **Production Mode (Real Ads)**

For production builds:

```bash
# Build for production
eas build --platform android --profile production
```

Real ads will be shown to non-premium users.

### **Test Premium User**

```sql
-- In your database, make a test user premium:
UPDATE users SET is_premium = 1 WHERE username = 'testuser';

-- Or make them non-premium:
UPDATE users SET is_premium = 0 WHERE username = 'testuser';
```

---

## 📊 **AdMob Best Practices**

### **DO:**
✅ Show ads after user completes an action
✅ Add 1-2 second delay before interstitial
✅ Respect frequency limits
✅ Provide clear value for premium upgrade
✅ Monitor AdMob dashboard for performance
✅ Test thoroughly before release

### **DON'T:**
❌ Show ads during critical workflows
❌ Show too many ads (max 5 interstitials/day)
❌ Block essential features behind ads
❌ Click your own ads (AdMob will ban you!)
❌ Encourage users to click ads
❌ Show ads during signature approval

---

## 💎 **Premium Features Suggestion**

**Free Users:**
- ✅ Up to 10 books
- ✅ Basic features
- ✅ With ads

**Premium Users (₹99/month or ₹999/year):**
- ✅ No ads
- ✅ Unlimited books
- ✅ Priority support (24hr response)
- ✅ Custom branding (remove "Powered by eThavanai")
- ✅ Advanced analytics (monthly reports)
- ✅ Cloud backup priority
- ✅ Early access to new features

---

## 🚀 **Launch Checklist**

### **Before Release:**
- [ ] Test all ad types on real device
- [ ] Verify test ads work in development
- [ ] Test premium user flow (no ads shown)
- [ ] Check frequency limits are working
- [ ] Monitor memory usage (ads use RAM)
- [ ] Test offline mode (ads won't load, app should handle gracefully)
- [ ] Add banner to Dashboard
- [ ] Add banner to Daily Entries
- [ ] Add interstitial after 5th book
- [ ] Create premium upgrade screen
- [ ] Implement in-app purchase (Google Play Billing)
- [ ] Update Privacy Policy (mention ads, third-party)

### **After Release:**
- [ ] Monitor AdMob dashboard daily
- [ ] Check fill rate (ads loading successfully)
- [ ] Monitor user feedback about ads
- [ ] Adjust frequency limits if needed
- [ ] Track premium conversion rate
- [ ] Optimize ad placements based on data

---

## 📈 **Revenue Estimation**

**Assumptions:**
- 1000 daily active users
- 50 banner impressions/user/day
- 1 interstitial/user/day
- $2 CPM (cost per 1000 impressions) India average

**Daily:**
- Banner: 1000 users × 50 impressions = 50,000 impressions
- Interstitial: 1000 users × 1 = 1,000 impressions
- Total: 51,000 impressions/day
- Revenue: 51 × $2 = **$102/day** = **₹8,500/day**

**Monthly:** ₹8,500 × 30 = **₹2,55,000/month**

**Plus Premium Subscriptions:**
- If 5% convert to premium (50 users)
- 50 × ₹99 = **₹4,950/month**

**Total potential:** ₹2,60,000/month with 1000 active users

---

## 🔗 **Useful Links**

- **AdMob Console:** https://apps.admob.com
- **Google Mobile Ads SDK:** https://developers.google.com/admob/react-native
- **AdMob Policies:** https://support.google.com/admob/answer/6128543
- **React Native Google Mobile Ads:** https://docs.page/invertase/react-native-google-mobile-ads

---

## 📞 **Support**

If you encounter issues:
1. Check AdMob console for errors
2. Verify ad unit IDs are correct
3. Check app is approved in AdMob
4. Monitor console logs for error messages
5. Test with test ad units first

---

**Created:** October 26, 2025  
**Last Updated:** October 26, 2025  
**Version:** 1.0.0

