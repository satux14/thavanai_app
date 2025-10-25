import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ImageBackground,
  Modal,
} from 'react-native';
import { getAllBooks, deleteBook, closeBook, reopenBook, getEntries, shareBook, getBookShares, unshareBook } from '../utils/storage';
import { getCurrentUser, logoutUser } from '../utils/auth';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage, formatDate as formatDateDDMMYYYY } from '../utils/i18n';

export default function DashboardScreen({ navigation }) {
  console.log('=== DashboardScreen COMPONENT CALLED ===');
  const { t, language } = useLanguage();
  console.log('DashboardScreen: useLanguage hook OK, language:', language);
  const [books, setBooks] = useState([]);
  console.log('DashboardScreen: books state initialized');
  const [ownedBooks, setOwnedBooks] = useState([]);
  const [sharedBooks, setSharedBooks] = useState([]);
  const [filteredOwnedBooks, setFilteredOwnedBooks] = useState([]);
  const [filteredSharedBooks, setFilteredSharedBooks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // 'updated', 'name', 'amount', 'date'
  const [showFilters, setShowFilters] = useState(false);
  const [bookStatusFilter, setBookStatusFilter] = useState('active'); // 'active', 'closed', 'all'
  const [viewMode, setViewMode] = useState('owner'); // 'owner' or 'borrower'
  const [showShareModal, setShowShareModal] = useState(false);
  const [bookToShare, setBookToShare] = useState(null);
  const [shareUsername, setShareUsername] = useState('');
  const [showSharedUsersModal, setShowSharedUsersModal] = useState(false);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [bookToViewShares, setBookToViewShares] = useState(null);

  useEffect(() => {
    loadBooks();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Dashboard focused - reloading books...');
      loadBooks();
      loadCurrentUser();
    });
    return unsubscribe;
  }, [navigation]);

  // Update navigation header when language changes
  useEffect(() => {
    navigation.setOptions({
      title: t('appNameTamil'),
    });
  }, [t, navigation]);

  useEffect(() => {
    filterAndSortBooks();
  }, [ownedBooks, sharedBooks, searchQuery, sortBy, bookStatusFilter]);

  const calculateBalance = (loanAmount, entries) => {
    const loan = parseFloat(loanAmount) || 0;
    if (!entries || entries.length === 0) return loan;
    const totalPaid = entries.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);
    return loan - totalPaid;
  };

  const loadBooks = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const allBooks = await getAllBooks();
    
    // Load entries for each book to calculate balance and pending signatures
    const booksWithBalance = await Promise.all(
      allBooks.map(async (book) => {
        const entries = await getEntries(book.id);
        const balance = calculateBalance(book.loanAmount, entries);
        
        // Count pending signature requests that need THIS user's action
        // (where they are NOT the requester)
        const pendingSignatures = entries.filter(
          e => e.signatureStatus === 'signature_requested' && 
               e.signatureRequestedBy !== user.id
        ).length;
        
        return { ...book, balance, entryCount: entries.length, pendingSignatures };
      })
    );
    
    // Separate owned and shared books
    const owned = booksWithBalance.filter(book => book.isOwned === true);
    const shared = booksWithBalance.filter(book => book.isShared === true);
    
    setBooks(booksWithBalance);
    setOwnedBooks(owned);
    setSharedBooks(shared);
    
    // Auto-switch to borrower view if no owner books but has shared books
    if (owned.length === 0 && shared.length > 0) {
      setViewMode('borrower');
    } else {
      // Default to owner view
      setViewMode('owner');
    }
    
    console.log('Total books:', booksWithBalance.length);
    console.log('Owned books:', owned.length);
    console.log('Shared books:', shared.length);
    
    // Debug: Log book dates
    if (booksWithBalance.length > 0) {
      console.log('First book dates:', {
        name: booksWithBalance[0].name,
        startDate: booksWithBalance[0].startDate,
        endDate: booksWithBalance[0].endDate
      });
    }
  };

  const filterAndSortBooks = () => {
    // Helper function to apply filters
    const applyFilters = (booksList) => {
      let filtered = [...booksList];

      // Filter by status (active/closed/all/pending)
      if (bookStatusFilter === 'active') {
        filtered = filtered.filter(book => book.status !== 'closed');
      } else if (bookStatusFilter === 'closed') {
        filtered = filtered.filter(book => book.status === 'closed');
      } else if (bookStatusFilter === 'pending') {
        filtered = filtered.filter(book => book.pendingSignatures > 0);
      }
      // If 'all', don't filter by status

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(book => 
          (book.name && book.name.toLowerCase().includes(query)) ||
          (book.dlNo && book.dlNo.toLowerCase().includes(query)) ||
          (book.fatherName && book.fatherName.toLowerCase().includes(query)) ||
          (book.address && book.address.toLowerCase().includes(query))
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return (a.name || '').localeCompare(b.name || '');
          case 'amount':
            return (b.loanAmount || 0) - (a.loanAmount || 0);
          case 'date':
            return new Date(b.startDate) - new Date(a.startDate);
          case 'updated':
          default:
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
      });

      return filtered;
    };

    setFilteredOwnedBooks(applyFilters(ownedBooks));
    setFilteredSharedBooks(applyFilters(sharedBooks));
  };

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    console.log('Logout button clicked!');
    
    // Use web-compatible confirmation
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(t('confirmLogout'));
      if (confirmed) {
        console.log('User confirmed logout');
        await logoutUser();
        console.log('User logged out, navigating to Login');
        navigation.replace('Login');
      }
    } else {
      // Native platforms use Alert.alert
      Alert.alert(
        t('logout'),
        t('confirmLogout'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('logout'),
            style: 'destructive',
            onPress: async () => {
              console.log('User confirmed logout');
              await logoutUser();
              console.log('User logged out, navigating to Login');
              navigation.replace('Login');
            },
          },
        ]
      );
    }
  };

  const handleCreateBook = () => {
    navigation.navigate('BookInfo', { bookId: null });
  };

  const handleOpenBook = (book) => {
    navigation.navigate('Entries', { bookId: book.id });
  };

  const handleEditBook = (book) => {
    navigation.navigate('BookInfo', { bookId: book.id });
  };

  const handleCloseBook = (book) => {
    const confirmMessage = t('confirmCloseBook', { name: book.name || book.dlNo });
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(confirmMessage);
      if (confirmed) {
        closeBook(book.id).then(() => {
          loadBooks();
          alert(t('bookClosed'));
        }).catch(error => {
          alert(t('error') + ': ' + error.message);
        });
      }
    } else {
      Alert.alert(
        t('closeBook'),
        confirmMessage,
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('close'),
            style: 'default',
            onPress: async () => {
              try {
                await closeBook(book.id);
                loadBooks();
                Alert.alert(t('success'), t('bookClosed'));
              } catch (error) {
                Alert.alert(t('error'), t('error') + ': ' + error.message);
              }
            },
          },
        ]
      );
    }
  };

  const handleReopenBook = (book) => {
    const confirmMessage = t('confirmReopenBook', { name: book.name || book.dlNo });
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(confirmMessage);
      if (confirmed) {
        reopenBook(book.id).then(() => {
          loadBooks();
          alert(t('bookReopened'));
        }).catch(error => {
          alert(t('error') + ': ' + error.message);
        });
      }
    } else {
      Alert.alert(
        t('reopenBook'),
        confirmMessage,
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('reopen'),
            style: 'default',
            onPress: async () => {
              try {
                await reopenBook(book.id);
                loadBooks();
                Alert.alert(t('success'), t('bookReopened'));
              } catch (error) {
                Alert.alert(t('error'), t('error') + ': ' + error.message);
              }
            },
          },
        ]
      );
    }
  };

  const handleDeleteBook = (book) => {
    const confirmMessage = t('confirmDeleteBook', { name: book.name || book.dlNo });
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(confirmMessage);
      if (confirmed) {
        deleteBook(book.id).then(() => {
          loadBooks();
          alert(t('bookDeleted'));
        }).catch(error => {
          alert(t('error') + ': ' + error.message);
        });
      }
    } else {
      Alert.alert(
        t('deleteBook'),
        confirmMessage,
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteBook(book.id);
                loadBooks();
                Alert.alert(t('success'), t('bookDeleted'));
              } catch (error) {
                Alert.alert(t('error'), t('error') + ': ' + error.message);
              }
            },
          },
        ]
      );
    }
  };

  const handleShareBook = (book) => {
    setBookToShare(book);
    setShareUsername('');
    setShowShareModal(true);
  };

  const handleShareConfirm = async () => {
    if (!shareUsername.trim()) {
      if (Platform.OS === 'web') {
        alert(t('enterUsername'));
      } else {
        Alert.alert(t('error'), t('enterUsername'));
      }
      return;
    }

    try {
      await shareBook(bookToShare.id, shareUsername.trim());
      setShowShareModal(false);
      setShareUsername('');
      setBookToShare(null);
      
      if (Platform.OS === 'web') {
        alert(t('bookShared'));
      } else {
        Alert.alert(t('success'), t('bookShared'));
      }
      
      loadBooks();
    } catch (error) {
      console.error('Error sharing book:', error);
      if (Platform.OS === 'web') {
        alert(t('shareFailed') + ': ' + error.message);
      } else {
        Alert.alert(t('error'), t('shareFailed') + ': ' + error.message);
      }
    }
  };

  const handleShareCancel = () => {
    setShowShareModal(false);
    setShareUsername('');
    setBookToShare(null);
  };

  const handleViewSharedUsers = async (book) => {
    setBookToViewShares(book);
    try {
      const shares = await getBookShares(book.id);
      setSharedUsers(shares);
      setShowSharedUsersModal(true);
    } catch (error) {
      console.error('Error loading shared users:', error);
      if (Platform.OS === 'web') {
        alert(t('failedToLoadSharedUsers'));
      } else {
        Alert.alert(t('error'), t('failedToLoadSharedUsers'));
      }
    }
  };

  const handleUnshareBook = async (username) => {
    const confirmMsg = t('confirmUnshare', { username });
    
    const confirmed = Platform.OS === 'web'
      ? window.confirm(confirmMsg)
      : await new Promise((resolve) => {
          Alert.alert(
            t('confirm'),
            confirmMsg,
            [
              { text: t('cancel'), onPress: () => resolve(false), style: 'cancel' },
              { text: t('unshare'), onPress: () => resolve(true), style: 'destructive' },
            ]
          );
        });

    if (!confirmed) return;

    try {
      await unshareBook(bookToViewShares.id, username);
      
      if (Platform.OS === 'web') {
        alert(t('bookUnshared'));
      } else {
        Alert.alert(t('success'), t('bookUnshared'));
      }
      
      // Refresh shared users list
      const shares = await getBookShares(bookToViewShares.id);
      setSharedUsers(shares);
      
      // Reload books to update the dashboard
      loadBooks();
    } catch (error) {
      console.error('Error unsharing book:', error);
      if (Platform.OS === 'web') {
        alert(t('unshareFailed'));
      } else {
        Alert.alert(t('error'), t('unshareFailed'));
      }
    }
  };

  const handleExportBook = async (book) => {
    try {
      // Fetch entries for the book
      const entries = await getEntries(book.id);
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Daily Installment Book', 105, 20, { align: 'center' });
      
      // Book Information Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Book Information', 20, 35);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      let yPos = 45;
      
      doc.text(`D.L. Number: ${book.dlNo || 'N/A'}`, 20, yPos);
      yPos += 7;
      doc.text(`Borrower Name: ${book.name || 'N/A'}`, 20, yPos);
      
      if (book.fatherName) {
        yPos += 7;
        doc.text(`Father's Name: ${book.fatherName}`, 20, yPos);
      }
      
      yPos += 7;
      doc.text(`Address: ${book.address || 'N/A'}`, 20, yPos);
      yPos += 7;
      doc.text(`Loan Amount: Rs. ${book.loanAmount || 'N/A'}`, 20, yPos);
      yPos += 7;
      doc.text(`Current Balance: Rs. ${book.balance != null ? book.balance.toFixed(2) : 'N/A'}`, 20, yPos);
      yPos += 7;
      doc.text(`Start Date: ${formatDate(book.startDate)}`, 20, yPos);
      doc.text(`End Date: ${formatDate(book.endDate)}`, 110, yPos);
      
      // Daily Entries Table
      if (entries && entries.length > 0) {
        yPos += 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Records', 20, yPos);
        
        yPos += 10;
        
        // Table setup
        const tableStartY = yPos;
        const colWidths = [25, 40, 35, 35, 55]; // S.No, Date, Credit, Balance, Signature
        const colPositions = [20, 45, 85, 120, 155]; // X positions for each column
        const rowHeight = 8;
        
        // Draw table header
        doc.setFillColor(66, 139, 202); // Blue header
        doc.rect(20, yPos - 5, 190, rowHeight, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255); // White text
        doc.text('S.No', colPositions[0] + 2, yPos);
        doc.text('Date', colPositions[1] + 2, yPos);
        doc.text('Credit (Rs)', colPositions[2] + 2, yPos);
        doc.text('Balance (Rs)', colPositions[3] + 2, yPos);
        doc.text('Signature', colPositions[4] + 2, yPos);
        
        yPos += rowHeight;
        
        // Reset text color for table body
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        // Draw table rows
        entries.sort((a, b) => a.serialNumber - b.serialNumber).forEach((entry, index) => {
          // Check if we need a new page
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
            
            // Redraw header on new page
            doc.setFillColor(66, 139, 202);
            doc.rect(20, yPos - 5, 190, rowHeight, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('S.No', colPositions[0] + 2, yPos);
            doc.text('Date', colPositions[1] + 2, yPos);
            doc.text('Credit (Rs)', colPositions[2] + 2, yPos);
            doc.text('Balance (Rs)', colPositions[3] + 2, yPos);
            doc.text('Signature', colPositions[4] + 2, yPos);
            yPos += rowHeight;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
          }
          
          // Alternate row colors for better readability
          if (index % 2 === 0) {
            doc.setFillColor(240, 240, 240);
            doc.rect(20, yPos - 5, 190, rowHeight, 'F');
          }
          
          // Draw cell borders
          doc.setDrawColor(200, 200, 200);
          doc.rect(20, yPos - 5, colWidths[0], rowHeight);
          doc.rect(45, yPos - 5, colWidths[1], rowHeight);
          doc.rect(85, yPos - 5, colWidths[2], rowHeight);
          doc.rect(120, yPos - 5, colWidths[3], rowHeight);
          doc.rect(155, yPos - 5, colWidths[4], rowHeight);
          
          // Add data
          doc.text(String(entry.serialNumber || ''), colPositions[0] + 2, yPos);
          doc.text(entry.date || '', colPositions[1] + 2, yPos);
          doc.text(entry.amount ? String(entry.amount) : '', colPositions[2] + 2, yPos);
          doc.text(entry.remaining ? String(entry.remaining) : '', colPositions[3] + 2, yPos);
          doc.text(entry.signature ? 'Signed' : '', colPositions[4] + 2, yPos);
          
          yPos += rowHeight;
        });
        
        // Draw final border around entire table
        doc.setDrawColor(66, 139, 202);
        doc.setLineWidth(0.5);
        doc.rect(20, tableStartY - 5, 190, (entries.length + 1) * rowHeight);
      } else {
        yPos += 15;
        doc.setFontSize(12);
        doc.text('No payment records found.', 20, yPos);
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 290);
      }
      
      // Save the PDF
      const fileName = `DailyInstallment_${book.name || book.dlNo || 'book'}_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      
      if (Platform.OS === 'web') {
        alert(t('pdfExported'));
      } else {
        Alert.alert(t('success'), t('pdfExported'));
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      if (Platform.OS === 'web') {
        alert(t('pdfFailed') + ': ' + error.message);
      } else {
        Alert.alert(t('error'), t('pdfFailed') + ': ' + error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with User Info and Logout */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {currentUser && (
            <View>
              <Text style={styles.welcomeText}>{t('welcome')},</Text>
              <Text style={styles.userName}>
                {currentUser.fullName} (@{currentUser.username})
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerCount}>
            {viewMode === 'owner' 
              ? t('booksCount', { filtered: filteredOwnedBooks.length, total: ownedBooks.length })
              : t('booksCount', { filtered: filteredSharedBooks.length, total: sharedBooks.length })
            }
          </Text>
          <View style={styles.headerButtons}>
            <LanguageToggle />
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* App Title */}
      <View style={styles.appTitleContainer}>
        <Text style={styles.appTitle}>
          {language === 'ta' ? 'தினத்தவணைப் புத்தகம்' : 'Daily Installment Book'}
        </Text>
        {language === 'ta' && (
          <Text style={styles.appTitleEnglish}>Daily Installment Book</Text>
        )}
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'owner' && styles.viewModeTabActive]}
          onPress={() => setViewMode('owner')}
        >
          <Text style={[styles.viewModeTabText, viewMode === 'owner' && styles.viewModeTabTextActive]}>
            📖 {t('asOwner')} ({ownedBooks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'borrower' && styles.viewModeTabActive]}
          onPress={() => setViewMode('borrower')}
        >
          <Text style={[styles.viewModeTabText, viewMode === 'borrower' && styles.viewModeTabTextActive]}>
            🤝 {t('asBorrower')} ({sharedBooks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Toggle Button */}
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options - Collapsible */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>{t('sortBy')}</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'updated' && styles.sortButtonActive]}
              onPress={() => setSortBy('updated')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'updated' && styles.sortButtonTextActive]}>
                {t('latest')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
              onPress={() => setSortBy('name')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
                {t('name')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'amount' && styles.sortButtonActive]}
              onPress={() => setSortBy('amount')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'amount' && styles.sortButtonTextActive]}>
                {t('amount')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
              onPress={() => setSortBy('date')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'date' && styles.sortButtonTextActive]}>
                {t('startDate')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Book Status Filter */}
          <View style={styles.closedBooksToggle}>
            <Text style={styles.filterLabel}>{t('showBooksFilter')}</Text>
            <View style={styles.sortButtons}>
              <TouchableOpacity
                style={[styles.sortButton, bookStatusFilter === 'active' && styles.sortButtonActive]}
                onPress={() => setBookStatusFilter('active')}
              >
                <Text style={[styles.sortButtonText, bookStatusFilter === 'active' && styles.sortButtonTextActive]}>
                  {t('activeBooks')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, bookStatusFilter === 'pending' && styles.sortButtonActive]}
                onPress={() => setBookStatusFilter('pending')}
              >
                <Text style={[styles.sortButtonText, bookStatusFilter === 'pending' && styles.sortButtonTextActive]}>
                  ⚠️ {t('pendingBooks')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, bookStatusFilter === 'closed' && styles.sortButtonActive]}
                onPress={() => setBookStatusFilter('closed')}
              >
                <Text style={[styles.sortButtonText, bookStatusFilter === 'closed' && styles.sortButtonTextActive]}>
                  {t('closedBooks')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, bookStatusFilter === 'all' && styles.sortButtonActive]}
                onPress={() => setBookStatusFilter('all')}
              >
                <Text style={[styles.sortButtonText, bookStatusFilter === 'all' && styles.sortButtonTextActive]}>
                  {t('allBooks')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Books List - Scrollable Content */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        >
        {/* Show books based on view mode */}
        {viewMode === 'owner' ? (
          // Owner View
          ownedBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📖</Text>
              <Text style={styles.emptyTitle}>{t('noOwnedBooks')}</Text>
              <Text style={styles.emptyText}>
                {t('noOwnedBooksDesc')}
              </Text>
            </View>
          ) : filteredOwnedBooks.length === 0 && searchQuery ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>{t('noBooksFound')}</Text>
              <Text style={styles.emptyText}>
                {t('noBooksFoundDesc', { query: searchQuery })}
              </Text>
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearSearchButtonText}>{t('clearSearch')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredOwnedBooks.map((book, index) => {
            const CardWrapper = book.backgroundImage ? ImageBackground : View;
            const cardWrapperProps = book.backgroundImage
              ? {
                  source: { uri: book.backgroundImage },
                  style: [
                    styles.bookCard,
                    { backgroundColor: book.backgroundColor || '#fff' },
                  ],
                  imageStyle: { borderRadius: 12 },
                }
              : {
                  style: [
                    styles.bookCard,
                    { backgroundColor: book.backgroundColor || '#fff' },
                  ],
                };

            return (
              <TouchableOpacity
                key={book.id}
                onPress={() => handleOpenBook(book)}
                activeOpacity={0.8}
              >
                <CardWrapper {...cardWrapperProps}>
                  {/* Semi-transparent overlay if image is set */}
                  {book.backgroundImage && (
                    <View style={styles.imageOverlay} />
                  )}
                  
                  {/* Card Header */}
                  <View style={[styles.bookHeader, book.backgroundImage && { zIndex: 1 }]}>
                    <View style={styles.bookNumber}>
                      <Text style={styles.bookNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.bookTitleSection}>
                      <View style={styles.headerTopRow}>
                        <Text style={styles.bookDlNo}>D.L.No: {book.dlNo || 'N/A'}</Text>
                        <Text style={styles.lastUpdatedCompact}>
                          {t('lastUpdated')}: {formatDateTime(book.updatedAt)}
                        </Text>
                      </View>
                      <View style={styles.nameRow}>
                        <Text style={styles.bookName}>
                          {book.name}
                          {book.fatherName && (
                            <Text style={styles.fatherNameInline}> (Father: {book.fatherName})</Text>
                          )}
                        </Text>
                        {book.pendingSignatures > 0 && (
                          <View style={styles.pendingBadgeInline}>
                            <Text style={styles.pendingBadgeInlineText}>
                              ⚠️ {book.pendingSignatures}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

              {/* Loan Amount & Balance - Prominent */}
              <View style={[styles.loanSection, book.backgroundImage && { zIndex: 1 }]}>
                <View style={styles.amountRow}>
                  <View style={styles.amountItem}>
                    <Text style={styles.loanLabel}>{t('loanAmount')}</Text>
                    <Text style={styles.loanAmount}>₹{book.loanAmount || 'N/A'}</Text>
                  </View>
                  <View style={styles.balanceDivider} />
                  <View style={styles.amountItem}>
                    <Text style={styles.balanceLabel}>{t('balance')}</Text>
                    <Text style={[
                      styles.balanceAmount,
                      book.balance === 0 && styles.balanceZero,
                      book.balance < 0 && styles.balanceNegative
                    ]}>
                      ₹{(typeof book.balance === 'number' && !isNaN(book.balance)) ? book.balance.toFixed(2) : '0.00'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Date Information */}
              <View style={[styles.dateSection, book.backgroundImage && { zIndex: 1 }]}>
                <View style={styles.dateRow}>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>{t('startDate')}</Text>
                    <Text style={styles.dateValue}>{formatDateDDMMYYYY(book.startDate)}</Text>
                  </View>
                  <View style={styles.dateDivider} />
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>{t('endDate')}</Text>
                    <Text style={styles.dateValue}>{formatDateDDMMYYYY(book.endDate)}</Text>
                  </View>
                </View>
              </View>

              {/* Status Badge */}
              {book.status === 'closed' && (
                <View style={[styles.statusBadge, book.backgroundImage && { zIndex: 1 }]}>
                  <Text style={styles.statusBadgeText}>🔒 {t('closed')}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={[styles.bookActions, book.backgroundImage && { zIndex: 1 }]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.exportButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleExportBook(book);
                  }}
                >
                  <Text style={styles.actionButtonText}>📄 {t('exportPdf')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditBook(book);
                  }}
                >
                  <Text style={styles.actionButtonText}>✏️ {t('edit')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleShareBook(book);
                  }}
                >
                  <Text style={styles.actionButtonText}>🤝 {t('share')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.viewSharesButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleViewSharedUsers(book);
                  }}
                >
                  <Text style={styles.actionButtonText}>👥 {t('viewShared')}</Text>
                </TouchableOpacity>

                {book.status === 'closed' ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.reopenButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleReopenBook(book);
                    }}
                  >
                    <Text style={styles.actionButtonText}>🔓 {t('reopen')}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.closeButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleCloseBook(book);
                    }}
                  >
                    <Text style={styles.actionButtonText}>🔒 {t('close')}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteBook(book);
                  }}
                >
                  <Text style={styles.deleteButtonText}>🗑️ {t('delete')}</Text>
                </TouchableOpacity>
              </View>
            </CardWrapper>
          </TouchableOpacity>
            );
          })
          )
        ) : (
          // Borrower View
          sharedBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🤝</Text>
              <Text style={styles.emptyTitle}>{t('noSharedBooks')}</Text>
              <Text style={styles.emptyText}>
                {t('noSharedBooksDesc')}
              </Text>
            </View>
          ) : filteredSharedBooks.length === 0 && searchQuery ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>{t('noBooksFound')}</Text>
              <Text style={styles.emptyText}>
                {t('noBooksFoundDesc', { query: searchQuery })}
              </Text>
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearSearchButtonText}>{t('clearSearch')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredSharedBooks.map((book, index) => {
            const CardWrapper = book.backgroundImage ? ImageBackground : View;
            const cardWrapperProps = book.backgroundImage
              ? {
                  source: { uri: book.backgroundImage },
                  style: [
                    styles.bookCard,
                    { backgroundColor: book.backgroundColor || '#fff' },
                  ],
                }
              : {
                  style: [
                    styles.bookCard,
                    { backgroundColor: book.backgroundColor || '#fff' },
                  ],
                };

            return (
              <TouchableOpacity
                key={book.id}
                onPress={() => handleOpenBook(book)}
                activeOpacity={0.8}
              >
                <CardWrapper {...cardWrapperProps}>
                  {/* Semi-transparent overlay if image is set */}
                  {book.backgroundImage && (
                    <View style={styles.imageOverlay} />
                  )}
                  
                  {/* Card Header */}
                  <View style={[styles.bookHeader, book.backgroundImage && { zIndex: 1 }]}>
                    <View style={styles.bookNumber}>
                      <Text style={styles.bookNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.bookTitleSection}>
                      <View style={styles.headerTopRow}>
                        <Text style={styles.bookDlNo}>D.L.No: {book.dlNo || 'N/A'}</Text>
                        <View style={styles.lastUpdatedContainer}>
                          <Text style={styles.lastUpdatedCompact}>
                            {t('lastUpdated')}: {formatDateTime(book.updatedAt)}
                          </Text>
                          <Text style={styles.ownerInfo}>
                            {t('asOwner')}: {book.ownerName} (@{book.ownerUsername})
                          </Text>
                        </View>
                      </View>
                      <View style={styles.nameRow}>
                        <Text style={styles.bookName}>
                          {book.name}
                          {book.fatherName && (
                            <Text style={styles.fatherNameInline}> (Father: {book.fatherName})</Text>
                          )}
                        </Text>
                        {book.pendingSignatures > 0 && (
                          <View style={styles.pendingBadgeInline}>
                            <Text style={styles.pendingBadgeInlineText}>
                              ⚠️ {book.pendingSignatures}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

              {/* Loan Amount & Balance - Prominent */}
              <View style={[styles.loanSection, book.backgroundImage && { zIndex: 1 }]}>
                <View style={styles.amountRow}>
                  <View style={styles.amountItem}>
                    <Text style={styles.loanLabel}>{t('loanAmount')}</Text>
                    <Text style={styles.loanAmount}>₹{book.loanAmount || 'N/A'}</Text>
                  </View>
                  <View style={styles.balanceDivider} />
                  <View style={styles.amountItem}>
                    <Text style={styles.balanceLabel}>{t('balance')}</Text>
                    <Text style={[
                      styles.balanceAmount,
                      book.balance === 0 && styles.balanceZero,
                      book.balance < 0 && styles.balanceNegative
                    ]}>
                      ₹{(typeof book.balance === 'number' && !isNaN(book.balance)) ? book.balance.toFixed(2) : '0.00'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Date Information */}
              <View style={[styles.dateSection, book.backgroundImage && { zIndex: 1 }]}>
                <View style={styles.dateRow}>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>{t('startDate')}</Text>
                    <Text style={styles.dateValue}>{formatDateDDMMYYYY(book.startDate)}</Text>
                  </View>
                  <View style={styles.dateDivider} />
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>{t('endDate')}</Text>
                    <Text style={styles.dateValue}>{formatDateDDMMYYYY(book.endDate)}</Text>
                  </View>
                </View>
              </View>

              {/* Status Badge */}
              {book.status === 'closed' && (
                <View style={[styles.statusBadge, book.backgroundImage && { zIndex: 1 }]}>
                  <Text style={styles.statusBadgeText}>🔒 {t('closed')}</Text>
                </View>
              )}

              {/* Shared Badge */}
              <View style={[styles.sharedBadge, book.backgroundImage && { zIndex: 1 }]}>
                <Text style={styles.sharedBadgeText}>🤝 {t('shared')}</Text>
              </View>

              {/* Action Buttons - Borrower has limited actions */}
              <View style={[styles.bookActions, book.backgroundImage && { zIndex: 1 }]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.exportButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleExportBook(book);
                  }}
                >
                  <Text style={styles.actionButtonText}>📄 {t('exportPdf')}</Text>
                </TouchableOpacity>
              </View>
            </CardWrapper>
          </TouchableOpacity>
            );
          })
          )
        )}
        
        {/* Add some bottom padding in scroll content */}
        <View style={{ height: 20 }} />
        </ScrollView>
      </View>

      {/* Create Button - Fixed at bottom */}
      <View style={styles.createButtonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateBook}>
          <Text style={styles.createButtonText}>{t('createNewBook')}</Text>
        </TouchableOpacity>
      </View>

      {/* Share Book Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleShareCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('shareBook')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('shareBookDesc', { bookName: bookToShare?.name || '' })}
            </Text>
            
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>{t('borrowerUsername')}</Text>
              <TextInput
                style={styles.modalInput}
                value={shareUsername}
                onChangeText={setShareUsername}
                placeholder={t('enterUsername')}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
              />
              <Text style={styles.modalHint}>
                {t('shareBookHint')}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleShareCancel}
              >
                <Text style={styles.modalCancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleShareConfirm}
              >
                <Text style={styles.modalConfirmButtonText}>{t('shareNow')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Shared Users Modal */}
      <Modal
        visible={showSharedUsersModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSharedUsersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('sharedWith')}</Text>
              <TouchableOpacity onPress={() => setShowSharedUsersModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              {t('sharedWithDesc', { bookName: bookToViewShares?.name || '' })}
            </Text>

            <ScrollView style={styles.sharedUsersList}>
              {sharedUsers.length === 0 ? (
                <View style={styles.emptySharedUsers}>
                  <Text style={styles.emptySharedUsersText}>{t('noSharedUsers')}</Text>
                </View>
              ) : (
                sharedUsers.map((user) => (
                  <View key={user.userId} style={styles.sharedUserItem}>
                    <View style={styles.sharedUserInfo}>
                      <Text style={styles.sharedUserName}>{user.fullName}</Text>
                      <Text style={styles.sharedUserUsername}>@{user.username}</Text>
                      <Text style={styles.sharedUserDate}>
                        {t('sharedOn')}: {formatDateDDMMYYYY(user.sharedAt)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.unshareButton}
                      onPress={() => handleUnshareBook(user.username)}
                    >
                      <Text style={styles.unshareButtonText}>🚫 {t('unshare')}</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalConfirmButton]}
              onPress={() => setShowSharedUsersModal(false)}
            >
              <Text style={styles.modalConfirmButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  // App Title Styles
  appTitleContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
  },
  appTitleEnglish: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  // View Mode Toggle Styles
  viewModeContainer: {
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  viewModeTab: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  viewModeTabActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    elevation: 3,
    shadowOpacity: 0.2,
  },
  viewModeTabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  viewModeTabTextActive: {
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  welcomeText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 15,
    color: '#333',
  },
  clearIcon: {
    fontSize: 20,
    color: '#999',
    padding: 5,
  },
  filterToggleButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterIcon: {
    fontSize: 20,
  },
  filterPanel: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  closedBooksToggle: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  clearSearchButton: {
    marginTop: 15,
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#2196F3',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 0,
  },
  bookHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bookNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  bookNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  bookTitleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookDlNo: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
  },
  lastUpdatedContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  lastUpdatedCompact: {
    fontSize: 10,
    color: '#000',
    fontStyle: 'italic',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ownerInfo: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  bookName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  fatherNameInline: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#000',
    fontStyle: 'italic',
  },
  loanSection: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountItem: {
    flex: 1,
  },
  balanceDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#4CAF50',
    marginHorizontal: 10,
    opacity: 0.3,
  },
  loanLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  loanAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  balanceLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  balanceZero: {
    color: '#4CAF50',
  },
  balanceNegative: {
    color: '#f44336',
  },
  dateSection: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateItem: {
    flex: 1,
  },
  dateDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#FF9800',
    marginHorizontal: 10,
    opacity: 0.3,
  },
  dateLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  infoSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
  },
  infoRowSingle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#FF5722',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pendingBadgeInline: {
    backgroundColor: '#FF9800',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingBadgeInlineText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sharedBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  sharedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  bookActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: 80,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  exportButton: {
    backgroundColor: '#9C27B0',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  shareButton: {
    backgroundColor: '#FF9800',
  },
  closeButton: {
    backgroundColor: '#607D8B',
  },
  reopenButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  deleteButtonText: {
    color: '#f44336',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalInputContainer: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    backgroundColor: '#4CAF50',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
    padding: 4,
  },
  sharedUsersList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  emptySharedUsers: {
    padding: 40,
    alignItems: 'center',
  },
  emptySharedUsersText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  sharedUserItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sharedUserInfo: {
    flex: 1,
  },
  sharedUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sharedUserUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sharedUserDate: {
    fontSize: 12,
    color: '#999',
  },
  unshareButton: {
    backgroundColor: '#ff5252',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  unshareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewSharesButton: {
    backgroundColor: '#9C27B0',
  },
  createButtonContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: 15,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

