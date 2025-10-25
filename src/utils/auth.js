import { authAPI } from '../services/api';

/**
 * Register a new user
 */
export const registerUser = async (username, password, fullName, preferredLanguage = 'en') => {
  try {
    console.log('Attempting to register user:', username, 'with language:', preferredLanguage);
    
    const data = await authAPI.register(username, password, fullName, preferredLanguage);
    
    console.log('User registered successfully:', { username, id: data.user.id, preferredLanguage });
    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('Error in registerUser:', error);
    return {
      success: false,
      error: error.message || 'Failed to register user',
    };
  }
};

/**
 * Login a user
 */
export const loginUser = async (username, password) => {
  try {
    console.log('Attempting to login user:', username);
    
    const data = await authAPI.login(username, password);
    
    console.log('User logged in successfully:', data.user);
    
    return {
      success: true,
      user: data.user,
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
  await authAPI.logout();
};

/**
 * Get the current logged-in user
 */
export const getCurrentUser = async () => {
  try {
    const user = await authAPI.getCurrentUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Find a user by username
 */
export const findUserByUsername = async (username) => {
  try {
    const users = await authAPI.getAllUsers();
    const user = users.find(u => u.username === username);
    
    if (user) {
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
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
    const users = await authAPI.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
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
    const users = await authAPI.getAllUsers();
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
