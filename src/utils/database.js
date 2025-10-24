import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  USERS: 'thavanai_users',
  BOOKS: 'thavanai_books',
  ENTRIES: 'thavanai_entries',
  BOOK_SHARES: 'thavanai_book_shares',
  USER_ID_COUNTER: 'thavanai_user_id_counter',
};

let initialized = false;

/**
 * Initialize the database (in-memory structure using AsyncStorage)
 */
export const initDatabase = async () => {
  try {
    console.log('Initializing AsyncStorage-based database...');
    
    // Initialize storage keys if they don't exist
    const users = await AsyncStorage.getItem(KEYS.USERS);
    if (!users) {
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify([]));
    }
    
    const books = await AsyncStorage.getItem(KEYS.BOOKS);
    if (!books) {
      await AsyncStorage.setItem(KEYS.BOOKS, JSON.stringify([]));
    }
    
    const entries = await AsyncStorage.getItem(KEYS.ENTRIES);
    if (!entries) {
      await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify([]));
    }
    
    const bookShares = await AsyncStorage.getItem(KEYS.BOOK_SHARES);
    if (!bookShares) {
      await AsyncStorage.setItem(KEYS.BOOK_SHARES, JSON.stringify([]));
    }
    
    const userIdCounter = await AsyncStorage.getItem(KEYS.USER_ID_COUNTER);
    if (!userIdCounter) {
      await AsyncStorage.setItem(KEYS.USER_ID_COUNTER, '0');
    }
    
    initialized = true;
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Get the database instance (check if initialized)
 */
export const getDatabase = () => {
  if (!initialized) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return true;
};

/**
 * Helper: Get next user ID
 */
export const getNextUserId = async () => {
  const counter = await AsyncStorage.getItem(KEYS.USER_ID_COUNTER);
  const nextId = parseInt(counter || '0', 10) + 1;
  await AsyncStorage.setItem(KEYS.USER_ID_COUNTER, nextId.toString());
  return nextId;
};

/**
 * Helper: Get all users
 */
export const getAllUsers = async () => {
  const usersJson = await AsyncStorage.getItem(KEYS.USERS);
  return usersJson ? JSON.parse(usersJson) : [];
};

/**
 * Helper: Save all users
 */
export const saveAllUsers = async (users) => {
  await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

/**
 * Helper: Get all books
 */
export const getAllBooksData = async () => {
  const booksJson = await AsyncStorage.getItem(KEYS.BOOKS);
  return booksJson ? JSON.parse(booksJson) : [];
};

/**
 * Helper: Save all books
 */
export const saveAllBooksData = async (books) => {
  await AsyncStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
};

/**
 * Helper: Get all entries
 */
export const getAllEntriesData = async () => {
  const entriesJson = await AsyncStorage.getItem(KEYS.ENTRIES);
  return entriesJson ? JSON.parse(entriesJson) : [];
};

/**
 * Helper: Save all entries
 */
export const saveAllEntriesData = async (entries) => {
  await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
};

/**
 * Helper: Get all book shares
 */
export const getAllBookSharesData = async () => {
  const sharesJson = await AsyncStorage.getItem(KEYS.BOOK_SHARES);
  return sharesJson ? JSON.parse(sharesJson) : [];
};

/**
 * Helper: Save all book shares
 */
export const saveAllBookSharesData = async (shares) => {
  await AsyncStorage.setItem(KEYS.BOOK_SHARES, JSON.stringify(shares));
};

/**
 * Close the database connection (no-op for AsyncStorage)
 */
export const closeDatabase = async () => {
  initialized = false;
  console.log('Database closed');
};

/**
 * Clear all data (for testing purposes)
 */
export const clearAllData = async () => {
  await AsyncStorage.multiRemove([
    KEYS.USERS,
    KEYS.BOOKS,
    KEYS.ENTRIES,
    KEYS.BOOK_SHARES,
    KEYS.USER_ID_COUNTER,
  ]);
  
  // Re-initialize empty arrays
  await AsyncStorage.setItem(KEYS.USERS, JSON.stringify([]));
  await AsyncStorage.setItem(KEYS.BOOKS, JSON.stringify([]));
  await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify([]));
  await AsyncStorage.setItem(KEYS.BOOK_SHARES, JSON.stringify([]));
  await AsyncStorage.setItem(KEYS.USER_ID_COUNTER, '0');
  
  console.log('All data cleared');
};

