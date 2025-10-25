import { getDatabase, getAllUsers, saveAllUsers, getNextUserId } from './database';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_USER_KEY = '@current_user';

/**
 * Hash a password using SHA-256
 * Using expo-crypto which is React Native native (no encoding issues)
 */
export const hashPassword = async (password) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hash;
};

/**
 * Register a new user
 */
export const registerUser = async (username, password, fullName, preferredLanguage = 'en') => {
  try {
    console.log('Attempting to register user:', username, 'with language:', preferredLanguage);
    getDatabase(); // Check if initialized
    
    const users = await getAllUsers();
    const hashedPassword = await hashPassword(password);
    const createdAt = new Date().toISOString();

    // Check if username already exists
    if (users.find(u => u.username === username)) {
      return {
        success: false,
        error: 'Username already exists',
      };
    }

    const userId = await getNextUserId();
    const newUser = {
      id: userId,
      username,
      password: hashedPassword,
      fullName,
      preferredLanguage,
      createdAt,
    };

    users.push(newUser);
    await saveAllUsers(users);

    console.log('User registered successfully:', { username, id: userId, preferredLanguage });
    return {
      success: true,
      user: {
        id: userId,
        username,
        fullName,
        preferredLanguage,
        createdAt,
      },
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      error: error.message || 'Registration failed',
    };
  }
};

/**
 * Login a user
 */
export const loginUser = async (username, password) => {
  try {
    console.log('Attempting to login user:', username);
    getDatabase(); // Check if initialized
    
    const users = await getAllUsers();
    console.log('Total users in database:', users.length);
    
    const hashedPassword = await hashPassword(password);

    const user = users.find(u => u.username === username && u.password === hashedPassword);

    if (!user) {
      console.log('Invalid credentials for user:', username);
      return {
        success: false,
        error: 'Invalid username or password',
      };
    }

    console.log('User logged in successfully:', user);
    
    // Store current user in AsyncStorage
    const currentUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      preferredLanguage: user.preferredLanguage || 'en',
      createdAt: user.createdAt,
    };
    
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

    return {
      success: true,
      user: currentUser,
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      success: false,
      error: error.message || 'Login failed',
    };
  }
};

/**
 * Logout the current user
 */
export const logoutUser = async () => {
  console.log('Logging out user');
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * Get the current logged-in user
 */
export const getCurrentUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Verify a password against a hash
 */
export const verifyPassword = async (password, hashedPassword) => {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
};

/**
 * Find a user by username
 */
export const findUserByUsername = async (username) => {
  try {
    getDatabase(); // Check if initialized
    const users = await getAllUsers();
    const user = users.find(u => u.username === username);
    
    if (user) {
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        createdAt: user.createdAt,
      };
    }
    return null;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
};

/**
 * Find a user by ID
 */
export const findUserById = async (userId) => {
  try {
    getDatabase(); // Check if initialized
    const users = await getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        createdAt: user.createdAt,
      };
    }
    return null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  }
};

/**
 * Get all users (for signature display)
 */
export const getAllUsersForDisplay = async () => {
  try {
    getDatabase(); // Check if initialized
    const users = await getAllUsers();
    return users.map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};
