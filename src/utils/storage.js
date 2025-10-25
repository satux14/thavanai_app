import { booksAPI, entriesAPI, sharingAPI } from '../services/api';
import { getCurrentUser } from './auth';

/**
 * Generate a unique ID
 */
const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ==================== BOOKS ====================

/**
 * Save a new book
 */
export const saveBook = async (bookData) => {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const bookId = generateId();

    const newBook = {
      id: bookId,
      dlNo: bookData.dlNo,
      name: bookData.name,
      fatherName: bookData.fatherName,
      address: bookData.address,
      loanAmount: bookData.loanAmount,
      numberOfDays: bookData.numberOfDays || '100',
      startDate: bookData.startDate,
      endDate: bookData.endDate,
      backgroundColor: bookData.backgroundColor || '#2196F3',
      backgroundImage: bookData.backgroundImage || null,
    };

    await booksAPI.createBook(newBook);

    console.log('Book saved:', bookId);
    return { ...newBook, ownerId: currentUser.id, status: 'active', numberOfDays: parseInt(bookData.numberOfDays) || 100 };
  } catch (error) {
    console.error('Error saving book:', error);
    throw error;
  }
};

/**
 * Get all books for the current user (owned + shared)
 */
export const getAllBooks = async (forceRefresh = false) => {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const books = await booksAPI.getAllBooks(forceRefresh);
    return books;
  } catch (error) {
    console.error('Error getting all books:', error);
    return [];
  }
};

/**
 * Get a single book
 */
export const getBook = async (bookId) => {
  try {
    const book = await booksAPI.getBook(bookId);
    return book;
  } catch (error) {
    console.error('Error getting book:', error);
    throw error;
  }
};

/**
 * Update a book
 */
export const updateBook = async (bookId, bookData) => {
  try {
    await booksAPI.updateBook(bookId, {
      dlNo: bookData.dlNo,
      name: bookData.name,
      fatherName: bookData.fatherName,
      address: bookData.address,
      loanAmount: bookData.loanAmount,
      numberOfDays: bookData.numberOfDays || 100,
      startDate: bookData.startDate,
      endDate: bookData.endDate,
      backgroundColor: bookData.backgroundColor,
      backgroundImage: bookData.backgroundImage,
    });

    console.log('Book updated:', bookId);
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

/**
 * Delete a book
 */
export const deleteBook = async (bookId) => {
  try {
    await booksAPI.deleteBook(bookId);
    console.log('Book deleted:', bookId);
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};

/**
 * Close a book
 */
export const closeBook = async (bookId) => {
  try {
    await booksAPI.closeBook(bookId);
    console.log('Book closed:', bookId);
  } catch (error) {
    console.error('Error closing book:', error);
    throw error;
  }
};

/**
 * Reopen a book
 */
export const reopenBook = async (bookId) => {
  try {
    await booksAPI.reopenBook(bookId);
    console.log('Book reopened:', bookId);
  } catch (error) {
    console.error('Error reopening book:', error);
    throw error;
  }
};

// ==================== ENTRIES ====================

/**
 * Get all entries for a book
 */
export const getEntries = async (bookId) => {
  try {
    const entries = await entriesAPI.getEntries(bookId);
    return entries;
  } catch (error) {
    console.error('Error getting entries:', error);
    return [];
  }
};

/**
 * Save a new entry
 */
export const saveEntry = async (entryData) => {
  try {
    const entryId = entryData.id || generateId();

    await entriesAPI.saveEntry({
      id: entryId,
      bookId: entryData.bookId,
      serialNumber: entryData.serialNumber,
      pageNumber: entryData.pageNumber || 1,
      date: entryData.date,
      amount: entryData.amount,
      remaining: entryData.remaining,
      signatureStatus: entryData.signatureStatus || 'none',
      signatureRequestedBy: entryData.signatureRequestedBy || null,
      signedBy: entryData.signedBy || null,
      signedAt: entryData.signedAt || null,
    });

    console.log('Entry saved:', entryId);
    return { ...entryData, id: entryId };
  } catch (error) {
    console.error('Error saving entry:', error);
    throw error;
  }
};

/**
 * Update an entry
 */
export const updateEntry = async (entryId, entryData) => {
  try {
    await entriesAPI.saveEntry({
      id: entryId,
      bookId: entryData.bookId,
      serialNumber: entryData.serialNumber,
      pageNumber: entryData.pageNumber || 1,
      date: entryData.date,
      amount: entryData.amount,
      remaining: entryData.remaining,
      signatureStatus: entryData.signatureStatus,
      signatureRequestedBy: entryData.signatureRequestedBy,
      signedBy: entryData.signedBy,
      signedAt: entryData.signedAt,
    });

    console.log('Entry updated:', entryId);
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
};

/**
 * Request signature for an entry
 */
export const requestSignature = async (entryId, requesterId) => {
  try {
    await entriesAPI.requestSignature(entryId);
    console.log('Signature requested for entry:', entryId);
  } catch (error) {
    console.error('Error requesting signature:', error);
    throw error;
  }
};

/**
 * Approve signature request
 */
export const approveSignatureRequest = async (entryId, approverId) => {
  try {
    await entriesAPI.approveSignature(entryId);
    console.log('Signature approved for entry:', entryId);
  } catch (error) {
    console.error('Error approving signature:', error);
    throw error;
  }
};

/**
 * Reject signature request
 */
export const rejectSignatureRequest = async (entryId) => {
  try {
    await entriesAPI.rejectSignature(entryId);
    console.log('Signature rejected for entry:', entryId);
  } catch (error) {
    console.error('Error rejecting signature:', error);
    throw error;
  }
};

// ==================== SHARING ====================

/**
 * Share a book with another user
 */
export const shareBook = async (bookId, username) => {
  try {
    await sharingAPI.shareBook(bookId, username);
    console.log('Book shared:', bookId, 'with', username);
  } catch (error) {
    console.error('Error sharing book:', error);
    throw error;
  }
};

/**
 * Get all users a book is shared with
 */
export const getBookShares = async (bookId) => {
  try {
    const shares = await sharingAPI.getBookShares(bookId);
    return shares;
  } catch (error) {
    console.error('Error getting book shares:', error);
    return [];
  }
};

/**
 * Unshare a book from a user
 */
export const unshareBook = async (bookId, userId) => {
  try {
    await sharingAPI.unshareBook(bookId, userId);
    console.log('Book unshared:', bookId, 'from user', userId);
  } catch (error) {
    console.error('Error unsharing book:', error);
    throw error;
  }
};

// ==================== PAGE MANAGEMENT ====================

/**
 * Get max page number for a book (from entries)
 */
export const getMaxPageNumber = async (bookId) => {
  try {
    const entries = await entriesAPI.getEntries(bookId);
    if (entries.length === 0) return 1;
    
    const maxPage = Math.max(...entries.map(e => e.pageNumber || 1));
    return maxPage;
  } catch (error) {
    console.error('Error getting max page number:', error);
    return 1;
  }
};

// Note: These functions are kept for compatibility but are no-ops
// as the server handles page management automatically
export const saveMaxPageNumber = async (bookId, maxPage) => {
  // Server handles this automatically
  console.log('Max page number:', maxPage, 'for book:', bookId);
};

export const getStoredMaxPage = async (bookId) => {
  // Get from server entries
  return await getMaxPageNumber(bookId);
};
