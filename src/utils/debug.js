/**
 * Debug utility with configurable verbosity levels
 * 
 * Usage:
 *   import { debug } from '../utils/debug';
 *   debug.log('Normal message'); // Only shows in development
 *   debug.verbose('Verbose details'); // Only shows if VERBOSE enabled
 *   debug.error('Error message'); // Always shows
 *   debug.warn('Warning message'); // Always shows
 */

// Debug configuration
const DEBUG_CONFIG = {
  ENABLED: __DEV__, // Only enable in development mode
  VERBOSE: false,    // Set to true for verbose logging
};

export const debug = {
  /**
   * Standard debug log - shows only in development
   */
  log: (...args) => {
    if (DEBUG_CONFIG.ENABLED) {
      console.log(...args);
    }
  },

  /**
   * Verbose debug log - shows only when VERBOSE is enabled
   */
  verbose: (...args) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.VERBOSE) {
      console.log('[VERBOSE]', ...args);
    }
  },

  /**
   * Error log - always shows
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Warning log - always shows
   */
  warn: (...args) => {
    console.warn(...args);
  },

  /**
   * Info log - shows only in development
   */
  info: (...args) => {
    if (DEBUG_CONFIG.ENABLED) {
      console.info(...args);
    }
  },
};

// For backwards compatibility, also export as default
export default debug;

