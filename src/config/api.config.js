// API Configuration
// Update these values for your production deployment

export const API_CONFIG = {
  // Development URL (local server)
  DEV_URL: 'http://localhost:3000/api',
  
  // Production URL (update this with your production server)
  PROD_URL: 'https://your-production-server.com/api',
  
  // Cache duration in milliseconds
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Request timeout
  TIMEOUT: 30000, // 30 seconds
};

// Get the appropriate API URL based on environment
export function getAPIBaseURL() {
  return __DEV__ ? API_CONFIG.DEV_URL : API_CONFIG.PROD_URL;
}

export default API_CONFIG;

