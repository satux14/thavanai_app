import {
  getDatabase,
  getAllBooksData,
  saveAllBooksData,
  getAllEntriesData,
  saveAllEntriesData,
  getAllBookSharesData,
  saveAllBookSharesData,
  getAllUsers,
} from './database';
import { getCurrentUser } from './auth';

/**
 * Generate a unique ID
 */
const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Save a new book
 */
export const saveBook = async (bookData) => {
  try {
    getDatabase(); // Check if initialized
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const bookId = generateId();
    const now = new Date().toISOString();

    const newBook = {
      id: bookId,
      ownerId: currentUser.id,
      dlNo: bookData.dlNo,
      name: bookData.name,
      fatherName: bookData.fatherName,
      address: bookData.address,
      loanAmount: bookData.loanAmount,
      startDate: bookData.startDate,
      endDate: bookData.endDate,
      backgroundColor: bookData.backgroundColor || '#2196F3',
      backgroundImage: bookData.backgroundImage || null,
      status: 'active', // 'active' or 'closed'
      createdAt: now,
      updatedAt: now,
    };

    const books = await getAllBooksData();
    books.push(newBook);
    await saveAllBooksData(books);

    console.log('Book saved:', bookId);
    return newBook;
  } catch (error) {
    console.error('Error saving book:', error);
    throw error;
  }
};

/**
 * Get all books for the current user (owned + shared)
 */
export const getAllBooks = async () => {
  try {
    getDatabase(); // Check if initialized
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const books = await getAllBooksData();
    const shares = await getAllBookSharesData();
    const users = await getAllUsers();

    // Get owned books
    const ownedBooks = books
      .filter(book => book.ownerId === currentUser.id)
      .map(book => {
        const owner = users.find(u => u.id === book.ownerId);
        return {
          ...book,
          ownerUsername: owner?.username || 'Unknown',
          ownerName: owner?.fullName || 'Unknown',
          isOwned: true,
        };
      });

    // Get shared books
    const sharedBookIds = shares
      .filter(share => share.sharedWithUserId === currentUser.id)
      .map(share => share.bookId);

    const sharedBooks = books
      .filter(book => sharedBookIds.includes(book.id))
      .map(book => {
        const owner = users.find(u => u.id === book.ownerId);
        const share = shares.find(s => s.bookId === book.id && s.sharedWithUserId === currentUser.id);
        return {
          ...book,
          ownerUsername: owner?.username || 'Unknown',
          ownerName: owner?.fullName || 'Unknown',
          sharedAt: share?.sharedAt,
          isOwned: false,
        };
      });

    // Sort by updated date
    const allBooks = [...ownedBooks, ...sharedBooks];
    allBooks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return allBooks;
  } catch (error) {
    console.error('Error getting all books:', error);
    throw error;
  }
};

/**
 * Get a specific book by ID
 */
export const getBook = async (bookId) => {
  try {
    getDatabase(); // Check if initialized
    const books = await getAllBooksData();
    const users = await getAllUsers();
    
    const book = books.find(b => b.id === bookId);

    if (!book) {
      throw new Error('Book not found');
    }

    const owner = users.find(u => u.id === book.ownerId);

    return {
      ...book,
      ownerUsername: owner?.username || 'Unknown',
      ownerName: owner?.fullName || 'Unknown',
    };
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
    getDatabase(); // Check if initialized
    const books = await getAllBooksData();
    const now = new Date().toISOString();

    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) {
      throw new Error('Book not found');
    }

    books[bookIndex] = {
      ...books[bookIndex],
      dlNo: bookData.dlNo,
      name: bookData.name,
      fatherName: bookData.fatherName,
      address: bookData.address,
      loanAmount: bookData.loanAmount,
      startDate: bookData.startDate,
      endDate: bookData.endDate,
      backgroundColor: bookData.backgroundColor || books[bookIndex].backgroundColor || '#2196F3',
      backgroundImage: bookData.backgroundImage !== undefined ? bookData.backgroundImage : books[bookIndex].backgroundImage,
      updatedAt: now,
    };

    await saveAllBooksData(books);

    console.log('Book updated:', bookId);
    return await getBook(bookId);
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

/**
 * Close a book (mark as closed, don't delete)
 */
export const closeBook = async (bookId) => {
  try {
    getDatabase(); // Check if initialized
    const books = await getAllBooksData();
    const now = new Date().toISOString();

    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) {
      throw new Error('Book not found');
    }

    books[bookIndex] = {
      ...books[bookIndex],
      status: 'closed',
      closedAt: now,
      updatedAt: now,
    };

    await saveAllBooksData(books);

    console.log('Book closed:', bookId);
    return true;
  } catch (error) {
    console.error('Error closing book:', error);
    throw error;
  }
};

/**
 * Reopen a closed book
 */
export const reopenBook = async (bookId) => {
  try {
    getDatabase(); // Check if initialized
    const books = await getAllBooksData();
    const now = new Date().toISOString();

    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) {
      throw new Error('Book not found');
    }

    books[bookIndex] = {
      ...books[bookIndex],
      status: 'active',
      updatedAt: now,
    };

    await saveAllBooksData(books);

    console.log('Book reopened:', bookId);
    return true;
  } catch (error) {
    console.error('Error reopening book:', error);
    throw error;
  }
};

/**
 * Delete a book
 */
export const deleteBook = async (bookId) => {
  try {
    getDatabase(); // Check if initialized
    
    // Delete all entries
    const entries = await getAllEntriesData();
    const filteredEntries = entries.filter(e => e.bookId !== bookId);
    await saveAllEntriesData(filteredEntries);
    
    // Delete all shares
    const shares = await getAllBookSharesData();
    const filteredShares = shares.filter(s => s.bookId !== bookId);
    await saveAllBookSharesData(filteredShares);
    
    // Delete the book
    const books = await getAllBooksData();
    const filteredBooks = books.filter(b => b.id !== bookId);
    await saveAllBooksData(filteredBooks);

    console.log('Book deleted:', bookId);
    return true;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};

/**
 * Get all entries for a book
 */
export const getEntries = async (bookId) => {
  try {
    getDatabase(); // Check if initialized
    const entries = await getAllEntriesData();

    const bookEntries = entries
      .filter(e => e.bookId === bookId)
      .sort((a, b) => {
        if (a.pageNumber !== b.pageNumber) {
          return a.pageNumber - b.pageNumber;
        }
        return a.serialNumber - b.serialNumber;
      });

    return bookEntries;
  } catch (error) {
    console.error('Error getting entries:', error);
    throw error;
  }
};

/**
 * Save a new entry
 */
export const saveEntry = async (bookId, entryData) => {
  try {
    getDatabase(); // Check if initialized
    const entryId = generateId();
    const now = new Date().toISOString();

    const newEntry = {
      id: entryId,
      bookId,
      date: entryData.date,
      amount: entryData.amount,
      remaining: entryData.remaining,
      signature: entryData.signature || null,
      pageNumber: entryData.pageNumber,
      serialNumber: entryData.serialNumber,
      createdAt: now,
    };

    const entries = await getAllEntriesData();
    entries.push(newEntry);
    await saveAllEntriesData(entries);

    // Update book's updated_at timestamp
    const books = await getAllBooksData();
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex !== -1) {
      books[bookIndex].updatedAt = now;
      await saveAllBooksData(books);
    }

    console.log('Entry saved:', entryId);
    return newEntry;
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
    getDatabase(); // Check if initialized
    const now = new Date().toISOString();
    const entries = await getAllEntriesData();

    const entryIndex = entries.findIndex(e => e.id === entryId);
    if (entryIndex === -1) {
      throw new Error('Entry not found');
    }

    const bookId = entries[entryIndex].bookId;

    entries[entryIndex] = {
      ...entries[entryIndex],
      date: entryData.date,
      amount: entryData.amount,
      remaining: entryData.remaining,
      signature: entryData.signature || null,
    };

    await saveAllEntriesData(entries);

    // Update book's updated_at timestamp
    const books = await getAllBooksData();
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex !== -1) {
      books[bookIndex].updatedAt = now;
      await saveAllBooksData(books);
    }

    console.log('Entry updated:', entryId);
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
};

/**
 * Delete an entry
 */
export const deleteEntry = async (entryId) => {
  try {
    getDatabase(); // Check if initialized
    const entries = await getAllEntriesData();
    const filteredEntries = entries.filter(e => e.id !== entryId);
    await saveAllEntriesData(filteredEntries);
    console.log('Entry deleted:', entryId);
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
};

/**
 * Share a book with another user
 */
export const shareBook = async (bookId, username) => {
  try {
    getDatabase(); // Check if initialized
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    // Check if the current user owns the book
    const books = await getAllBooksData();
    const book = books.find(b => b.id === bookId);

    if (!book) {
      throw new Error('Book not found');
    }

    if (book.ownerId !== currentUser.id) {
      throw new Error('You can only share books you own');
    }

    // Find the user to share with
    const users = await getAllUsers();
    const userToShareWith = users.find(u => u.username === username);

    if (!userToShareWith) {
      throw new Error('User not found');
    }

    if (userToShareWith.id === currentUser.id) {
      throw new Error('You cannot share a book with yourself');
    }

    // Check if already shared
    const shares = await getAllBookSharesData();
    const existingShare = shares.find(
      s => s.bookId === bookId && s.sharedWithUserId === userToShareWith.id
    );

    if (existingShare) {
      throw new Error('Book is already shared with this user');
    }

    // Create the share
    const now = new Date().toISOString();
    const newShare = {
      id: generateId(),
      bookId,
      sharedWithUserId: userToShareWith.id,
      sharedAt: now,
    };

    shares.push(newShare);
    await saveAllBookSharesData(shares);

    console.log('Book shared successfully:', { bookId, username });
  } catch (error) {
    console.error('Error sharing book:', error);
    throw error;
  }
};

/**
 * Unshare a book
 */
export const unshareBook = async (bookId, username) => {
  try {
    getDatabase(); // Check if initialized
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    // Find the user
    const users = await getAllUsers();
    const userToUnshare = users.find(u => u.username === username);

    if (!userToUnshare) {
      throw new Error('User not found');
    }

    // Delete the share
    const shares = await getAllBookSharesData();
    const filteredShares = shares.filter(
      s => !(s.bookId === bookId && s.sharedWithUserId === userToUnshare.id)
    );
    await saveAllBookSharesData(filteredShares);

    console.log('Book unshared successfully:', { bookId, username });
  } catch (error) {
    console.error('Error unsharing book:', error);
    throw error;
  }
};

/**
 * Get all users a book is shared with
 */
export const getBookShares = async (bookId) => {
  try {
    getDatabase(); // Check if initialized
    const shares = await getAllBookSharesData();
    const users = await getAllUsers();

    const bookShares = shares
      .filter(s => s.bookId === bookId)
      .map(share => {
        const user = users.find(u => u.id === share.sharedWithUserId);
        return {
          userId: user?.id,
          username: user?.username || 'Unknown',
          fullName: user?.fullName || 'Unknown',
          sharedAt: share.sharedAt,
        };
      })
      .filter(share => share.userId) // Filter out shares with deleted users
      .sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt));

    return bookShares;
  } catch (error) {
    console.error('Error getting book shares:', error);
    throw error;
  }
};
