import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage configuration
const MAX_CACHE_SIZE_MB = 50; // Maximum cache size in MB (will be adjusted based on device limits)
const MAX_BOOKS_TO_CACHE = 50; // Maximum number of books to cache offline
const CACHE_VERSION = '1.0';

// Cache keys
const CACHE_KEYS = {
  BOOKS: '@offline_books',
  ENTRIES_PREFIX: '@offline_entries_',
  METADATA: '@offline_metadata',
  VERSION: '@offline_version',
};

/**
 * Get available storage space
 * Note: AsyncStorage doesn't provide direct API for storage limits
 * We'll use a reasonable default and handle errors gracefully
 */
const getStorageInfo = async () => {
  try {
    // Estimate total storage (conservative defaults)
    // iOS: ~10MB for AsyncStorage by default
    // Android: ~6MB for AsyncStorage by default
    const estimatedTotalMB = 10; // Conservative estimate
    const maxUsableMB = Math.floor(estimatedTotalMB * 0.5); // Use 50% max
    
    return {
      totalMB: estimatedTotalMB,
      maxUsableMB: Math.min(maxUsableMB, MAX_CACHE_SIZE_MB),
      availableMB: maxUsableMB,
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      totalMB: 10,
      maxUsableMB: 5,
      availableMB: 5,
    };
  }
};

/**
 * Calculate size of data in MB
 */
const calculateSizeMB = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;
    return bytes / (1024 * 1024);
  } catch (error) {
    console.error('Error calculating size:', error);
    return 0;
  }
};

/**
 * Get cache metadata
 */
export const getCacheMetadata = async () => {
  try {
    const metadata = await AsyncStorage.getItem(CACHE_KEYS.METADATA);
    return metadata ? JSON.parse(metadata) : {
      lastUpdated: null,
      totalSizeMB: 0,
      bookCount: 0,
      cachedBookIds: [],
    };
  } catch (error) {
    console.error('Error getting cache metadata:', error);
    return {
      lastUpdated: null,
      totalSizeMB: 0,
      bookCount: 0,
      cachedBookIds: [],
    };
  }
};

/**
 * Update cache metadata
 */
const updateCacheMetadata = async (updates) => {
  try {
    const current = await getCacheMetadata();
    const updated = { ...current, ...updates, lastUpdated: new Date().toISOString() };
    await AsyncStorage.setItem(CACHE_KEYS.METADATA, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating cache metadata:', error);
  }
};

/**
 * Cache books for offline use
 */
export const cacheBooks = async (books) => {
  try {
    const storageInfo = await getStorageInfo();
    
    // Limit number of books
    const booksToCache = books.slice(0, MAX_BOOKS_TO_CACHE);
    
    // Calculate size
    const sizeMB = calculateSizeMB(booksToCache);
    
    if (sizeMB > storageInfo.maxUsableMB) {
      console.warn(`⚠️ Books exceed storage limit. Reducing cache size...`);
      // Cache fewer books if size exceeds limit
      const reducedBooks = booksToCache.slice(0, Math.floor(booksToCache.length / 2));
      await AsyncStorage.setItem(CACHE_KEYS.BOOKS, JSON.stringify(reducedBooks));
      
      await updateCacheMetadata({
        totalSizeMB: calculateSizeMB(reducedBooks),
        bookCount: reducedBooks.length,
        cachedBookIds: reducedBooks.map(b => b.id),
      });
    } else {
      await AsyncStorage.setItem(CACHE_KEYS.BOOKS, JSON.stringify(booksToCache));
      
      await updateCacheMetadata({
        totalSizeMB: sizeMB,
        bookCount: booksToCache.length,
        cachedBookIds: booksToCache.map(b => b.id),
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error caching books:', error);
    return false;
  }
};

/**
 * Get cached books
 */
export const getCachedBooks = async () => {
  try {
    const books = await AsyncStorage.getItem(CACHE_KEYS.BOOKS);
    return books ? JSON.parse(books) : [];
  } catch (error) {
    console.error('Error getting cached books:', error);
    return [];
  }
};

/**
 * Cache entries for a specific book
 */
export const cacheBookEntries = async (bookId, entries) => {
  try {
    const key = `${CACHE_KEYS.ENTRIES_PREFIX}${bookId}`;
    await AsyncStorage.setItem(key, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Error caching book entries:', error);
    return false;
  }
};

/**
 * Get cached entries for a specific book
 */
export const getCachedBookEntries = async (bookId) => {
  try {
    const key = `${CACHE_KEYS.ENTRIES_PREFIX}${bookId}`;
    const entries = await AsyncStorage.getItem(key);
    return entries ? JSON.parse(entries) : [];
  } catch (error) {
    console.error('Error getting cached book entries:', error);
    return [];
  }
};

/**
 * Clear all offline cache
 */
export const clearOfflineCache = async () => {
  try {
    const metadata = await getCacheMetadata();
    
    // Remove books
    await AsyncStorage.removeItem(CACHE_KEYS.BOOKS);
    
    // Remove all entries
    for (const bookId of metadata.cachedBookIds) {
      await AsyncStorage.removeItem(`${CACHE_KEYS.ENTRIES_PREFIX}${bookId}`);
    }
    
    // Remove metadata
    await AsyncStorage.removeItem(CACHE_KEYS.METADATA);
    
    return true;
  } catch (error) {
    console.error('Error clearing offline cache:', error);
    return false;
  }
};

/**
 * Check if app is online
 */
export const checkOnlineStatus = async () => {
  try {
    // Try to make a lightweight request to the server
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    // Use production server for health check
    const response = await fetch('https://tapi.thesrsconsulting.in/health', {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('📴 Server not reachable:', error.message);
    return false;
  }
};

