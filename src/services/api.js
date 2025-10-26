import AsyncStorage from '@react-native-async-storage/async-storage';

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
    if (!forceRefresh && cache.books && isCacheValid('books')) {
      return cache.books;
    }

    const books = await apiRequest('/books');
    cache.books = books;
    cache.lastFetch['books'] = Date.now();
    
    // Also cache locally for offline access
    try {
      await AsyncStorage.setItem('@books_cache', JSON.stringify(books));
    } catch (error) {
      console.error('Error caching books:', error);
    }

    return books;
  },

  async getBook(bookId) {
    const book = await apiRequest(`/books/${bookId}`);
    return book;
  },

  async createBook(bookData) {
    const book = await apiRequest('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });

    // Invalidate cache
    cache.books = null;
    return book;
  },

  async updateBook(bookId, bookData) {
    await apiRequest(`/books/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });

    // Invalidate cache
    cache.books = null;
  },

  async deleteBook(bookId) {
    await apiRequest(`/books/${bookId}`, {
      method: 'DELETE',
    });

    // Invalidate cache
    cache.books = null;
    delete cache.entries[bookId];
  },

  async closeBook(bookId) {
    await apiRequest(`/books/${bookId}/close`, {
      method: 'PATCH',
    });

    // Invalidate cache
    cache.books = null;
  },

  async reopenBook(bookId) {
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
    if (!forceRefresh && cache.entries[bookId] && isCacheValid(`entries_${bookId}`)) {
      return cache.entries[bookId];
    }

    const entries = await apiRequest(`/entries/book/${bookId}`);
    cache.entries[bookId] = entries;
    cache.lastFetch[`entries_${bookId}`] = Date.now();
    
    // Also cache locally
    try {
      await AsyncStorage.setItem(`@entries_${bookId}`, JSON.stringify(entries));
    } catch (error) {
      console.error('Error caching entries:', error);
    }

    return entries;
  },

  async saveEntry(entryData) {
    await apiRequest('/entries', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });

    // Invalidate cache for this book
    delete cache.entries[entryData.bookId];
    cache.books = null;
  },

  async bulkSaveEntries(bookId, entries) {
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
    await apiRequest(`/entries/${entryId}/approve-signature`, {
      method: 'POST',
    });

    // Invalidate entries cache
    cache.entries = {};
  },

  async rejectSignature(entryId) {
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

export default {
  authAPI,
  booksAPI,
  entriesAPI,
  sharingAPI,
  clearAllCaches,
};

