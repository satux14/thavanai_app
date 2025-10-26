import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  cacheBooks, 
  getCachedBooks, 
  cacheBookEntries, 
  getCachedBookEntries,
  checkOnlineStatus 
} from '../utils/offlineCache';

// API Configuration
// Production server
const API_BASE_URL = 'https://tapi.thesrsconsulting.in/api';

// For local development, use:
// const API_BASE_URL = 'http://192.168.1.17:3000/api';

// Local cache for performance
const cache = {
  books: null,
  entries: {},
  users: null,
  lastFetch: {}
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Track online status
let isOnline = true;

// Check and update online status
async function updateOnlineStatus() {
  isOnline = await checkOnlineStatus();
  return isOnline;
}

// Get auth token from storage
async function getAuthToken() {
  try {
    return await AsyncStorage.getItem('@auth_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Save auth token
async function saveAuthToken(token) {
  try {
    await AsyncStorage.setItem('@auth_token', token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
}

// Remove auth token
async function removeAuthToken() {
  try {
    await AsyncStorage.removeItem('@auth_token');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
}

// Make API request
async function apiRequest(endpoint, options = {}) {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🌐 API Request:', options.method || 'GET', url);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📡 API Response:', response.status, endpoint);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', data.error || 'Request failed');
      throw new Error(data.error || 'Request failed');
    }

    console.log('✅ API Success:', endpoint);
    return data;
  } catch (error) {
    console.error('🔥 API request error:', endpoint, error.message);
    throw error;
  }
}

// Check if cache is valid
function isCacheValid(key) {
  if (!cache.lastFetch[key]) return false;
  return Date.now() - cache.lastFetch[key] < CACHE_DURATION;
}

// Authentication API
export const authAPI = {
  async register(username, password, fullName, preferredLanguage = 'en') {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, fullName, preferredLanguage }),
    });

    if (data.token) {
      await saveAuthToken(data.token);
      await AsyncStorage.setItem('@current_user', JSON.stringify(data.user));
    }

    return data;
  },

  async login(username, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data.token) {
      await saveAuthToken(data.token);
      await AsyncStorage.setItem('@current_user', JSON.stringify(data.user));
    }

    return data;
  },

  async logout() {
    await removeAuthToken();
    await AsyncStorage.removeItem('@current_user');
    cache.books = null;
    cache.entries = {};
    cache.users = null;
    cache.lastFetch = {};
  },

  async getCurrentUser() {
    // Try local storage first
    try {
      const cached = await AsyncStorage.getItem('@current_user');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error reading cached user:', error);
    }

    // Fetch from server
    const user = await apiRequest('/auth/me');
    await AsyncStorage.setItem('@current_user', JSON.stringify(user));
    return user;
  },

  async getAllUsers(forceRefresh = false) {
    if (!forceRefresh && cache.users && isCacheValid('users')) {
      return cache.users;
    }

    const users = await apiRequest('/auth/users');
    cache.users = users;
    cache.lastFetch['users'] = Date.now();
    return users;
  },
};

// Books API
export const booksAPI = {
  async getAllBooks(forceRefresh = false) {
    // Check online status
    await updateOnlineStatus();
    
    // If offline, return cached books
    if (!isOnline) {
      console.log('📴 Offline mode: Loading books from cache');
      const cachedBooks = await getCachedBooks();
      return cachedBooks;
    }
    
    // If online and cache is valid, use cache
    if (!forceRefresh && cache.books && isCacheValid('books')) {
      return cache.books;
    }

    try {
      const books = await apiRequest('/books');
      cache.books = books;
      cache.lastFetch['books'] = Date.now();
      
      // Cache for offline access
      await cacheBooks(books);

      return books;
    } catch (error) {
      // If API fails, try to load from cache
      console.log('⚠️ API failed, loading from cache:', error.message);
      const cachedBooks = await getCachedBooks();
      if (cachedBooks.length > 0) {
        return cachedBooks;
      }
      throw error;
    }
  },

  async getBook(bookId) {
    const book = await apiRequest(`/books/${bookId}`);
    return book;
  },

  async createBook(bookData) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot create book while offline. Please connect to the internet.');
    }
    
    const book = await apiRequest('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });

    // Invalidate cache
    cache.books = null;
    return book;
  },

  async updateBook(bookId, bookData) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot update book while offline. Please connect to the internet.');
    }
    
    await apiRequest(`/books/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });

    // Invalidate cache
    cache.books = null;
  },

  async deleteBook(bookId) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot delete book while offline. Please connect to the internet.');
    }
    
    await apiRequest(`/books/${bookId}`, {
      method: 'DELETE',
    });

    // Invalidate cache
    cache.books = null;
    delete cache.entries[bookId];
  },

  async closeBook(bookId) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot close book while offline. Please connect to the internet.');
    }
    
    await apiRequest(`/books/${bookId}/close`, {
      method: 'PATCH',
    });

    // Invalidate cache
    cache.books = null;
  },

  async reopenBook(bookId) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot reopen book while offline. Please connect to the internet.');
    }
    
    await apiRequest(`/books/${bookId}/reopen`, {
      method: 'PATCH',
    });

    // Invalidate cache
    cache.books = null;
  },
};

// Entries API
export const entriesAPI = {
  async getEntries(bookId, forceRefresh = false) {
    // Check online status
    await updateOnlineStatus();
    
    // If offline, return cached entries
    if (!isOnline) {
      console.log(`📴 Offline mode: Loading entries for book ${bookId} from cache`);
      const cachedEntries = await getCachedBookEntries(bookId);
      return cachedEntries;
    }
    
    // If online and cache is valid, use cache
    if (!forceRefresh && cache.entries[bookId] && isCacheValid(`entries_${bookId}`)) {
      return cache.entries[bookId];
    }

    try {
      const entries = await apiRequest(`/entries/book/${bookId}`);
      cache.entries[bookId] = entries;
      cache.lastFetch[`entries_${bookId}`] = Date.now();
      
      // Cache for offline access
      await cacheBookEntries(bookId, entries);

      return entries;
    } catch (error) {
      // If API fails, try to load from cache
      console.log(`⚠️ API failed, loading entries for book ${bookId} from cache:`, error.message);
      const cachedEntries = await getCachedBookEntries(bookId);
      if (cachedEntries.length > 0) {
        return cachedEntries;
      }
      throw error;
    }
  },

  async saveEntry(entryData) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot save entry while offline. Please connect to the internet.');
    }
    
    await apiRequest('/entries', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });

    // Invalidate cache for this book
    delete cache.entries[entryData.bookId];
    cache.books = null;
  },

  async bulkSaveEntries(bookId, entries) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot bulk save entries while offline. Please connect to the internet.');
    }
    
    console.log(`🚀 Bulk saving ${entries.length} entries for book ${bookId}`);
    await apiRequest('/entries/bulk', {
      method: 'POST',
      body: JSON.stringify({ bookId, entries }),
    });

    // Invalidate cache for this book
    delete cache.entries[bookId];
    cache.books = null;
    console.log(`✅ Bulk save complete for ${entries.length} entries`);
  },

  async requestSignature(entryId) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot request signature while offline. Please connect to the internet.');
    }
    
    console.log('🔔 Requesting signature for entry:', entryId);
    const result = await apiRequest(`/entries/${entryId}/request-signature`, {
      method: 'POST',
    });

    // Invalidate entries cache
    cache.entries = {};
    cache.books = null;
    
    console.log('✅ Signature request successful');
    return result;
  },

  async approveSignature(entryId) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot approve signature while offline. Please connect to the internet.');
    }
    
    await apiRequest(`/entries/${entryId}/approve-signature`, {
      method: 'POST',
    });

    // Invalidate entries cache
    cache.entries = {};
  },

  async rejectSignature(entryId) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot reject signature while offline. Please connect to the internet.');
    }
    
    await apiRequest(`/entries/${entryId}/reject-signature`, {
      method: 'POST',
    });

    // Invalidate entries cache
    cache.entries = {};
  },
};

// Sharing API
export const sharingAPI = {
  async shareBook(bookId, username) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot share book while offline. Please connect to the internet.');
    }
    
    await apiRequest('/sharing', {
      method: 'POST',
      body: JSON.stringify({ bookId, username }),
    });

    // Invalidate cache
    cache.books = null;
  },

  async getBookShares(bookId) {
    const shares = await apiRequest(`/sharing/${bookId}`);
    return shares;
  },

  async unshareBook(bookId, userId) {
    // Check online status before write operation
    await updateOnlineStatus();
    if (!isOnline) {
      throw new Error('Cannot unshare book while offline. Please connect to the internet.');
    }
    
    await apiRequest(`/sharing/${bookId}/${userId}`, {
      method: 'DELETE',
    });

    // Invalidate cache
    cache.books = null;
  },
};

// Export convenience function to clear all caches
export function clearAllCaches() {
  cache.books = null;
  cache.entries = {};
  cache.users = null;
  cache.lastFetch = {};
}

// Export online status check
export { updateOnlineStatus, checkOnlineStatus };

export default {
  authAPI,
  booksAPI,
  entriesAPI,
  sharingAPI,
  clearAllCaches,
  updateOnlineStatus,
};

