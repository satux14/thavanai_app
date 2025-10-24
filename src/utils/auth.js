import { getDatabase, getAllUsers, saveAllUsers, getNextUserId } from './database';
import CryptoJS from 'crypto-js';

/**
 * Hash a password using SHA-256
 */
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

/**
 * Register a new user
 */
export const registerUser = async (username, password, fullName, preferredLanguage = 'en') => {
  try {
    console.log('Attempting to register user:', username, 'with language:', preferredLanguage);
    getDatabase(); // Check if initialized
    
    const users = await getAllUsers();
    const hashedPassword = hashPassword(password);
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
    
    const hashedPassword = hashPassword(password);

    const user = users.find(u => u.username === username && u.password === hashedPassword);

    if (!user) {
      console.log('Invalid credentials for user:', username);
      return {
        success: false,
        error: 'Invalid username or password',
      };
    }

    console.log('User logged in successfully:', user);
    
    // Store current user in memory
    global.currentUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      preferredLanguage: user.preferredLanguage || 'en',
      createdAt: user.createdAt,
    };

    return {
      success: true,
      user: global.currentUser,
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
  global.currentUser = null;
};

/**
 * Get the current logged-in user
 */
export const getCurrentUser = async () => {
  return global.currentUser || null;
};

/**
 * Verify a password against a hash
 */
export const verifyPassword = (password, hashedPassword) => {
  return hashPassword(password) === hashedPassword;
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
