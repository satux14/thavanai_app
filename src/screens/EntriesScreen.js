import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { getBook, getEntries, saveEntry, bulkSaveEntries, updateEntry as updateEntryStorage, signEntry, requestSignature, approveSignatureRequest, rejectSignatureRequest } from '../utils/storage';
import { getCurrentUser, getAllUsersForDisplay } from '../utils/auth';
import DatePicker from '../components/DatePicker';
import { useLanguage, formatDate as formatDateDDMMYYYY } from '../utils/i18n';

const ENTRIES_PER_PAGE = 10;

export default function EntriesScreen({ navigation, route }) {
  console.log('=== EntriesScreen COMPONENT CALLED ===');
  const { bookId } = route.params;
  console.log('EntriesScreen: route.params bookId:', bookId);
  const { t, language } = useLanguage();
  console.log('EntriesScreen: useLanguage hook OK, language:', language);
  const [book, setBook] = useState(null);
  console.log('EntriesScreen: book state initialized');
  const [entries, setEntries] = useState([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [maxPageNumber, setMaxPageNumber] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showApproveRejectModal, setShowApproveRejectModal] = useState(false);
  const [selectedEntryForApproval, setSelectedEntryForApproval] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [originalAmount, setOriginalAmount] = useState(null); // Track original amount to check for changes
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [fontSize, setFontSize] = useState(14); // Default font size

  useEffect(() => {
    loadData();
  }, [bookId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  // Update navigation header when language changes
  useEffect(() => {
    navigation.setOptions({
      title: t('dailyEntries'),
    });
  }, [t, navigation]);

  const loadData = async (forceRefresh = false) => {
    try {
      console.log('Loading book:', bookId, '| Force refresh:', forceRefresh);
      const loadedBook = await getBook(bookId);
      let loadedEntries = await getEntries(bookId, forceRefresh);
      
      // Load current user and check if they are the owner
      const user = await getCurrentUser();
      setCurrentUser(user);
      setIsOwner(user && loadedBook && user.id === loadedBook.ownerId);
      
      // Load all users for signature display
      const users = await getAllUsersForDisplay();
      setAllUsers(users);
      
      console.log('Book loaded:', loadedBook);
      console.log('Entries loaded:', loadedEntries.length);
      console.log('Users loaded:', users.length);
      console.log('Current user:', user?.username, 'Is owner:', user?.id === loadedBook?.ownerId);
      
      // Auto-fill entries if this is a new book with start date
      let justAutoFilled = false;
      if (loadedEntries.length === 0 && loadedBook.startDate) {
        const days = parseInt(loadedBook.numberOfDays) || 100;
        console.log(`Auto-filling ${days} days of entries from start date:`, loadedBook.startDate);
        await autoFillEntries(loadedBook, days);
        // Reload entries after auto-fill
        loadedEntries = await getEntries(bookId);
        console.log('Entries after auto-fill:', loadedEntries.length);
        justAutoFilled = true;
      }
      
      setBook(loadedBook);
      setEntries(loadedEntries);
      
      // Calculate max page from entries
      const calculatedMaxPage = getMaxPageFromEntries(loadedEntries);
      
      // Load stored max page from AsyncStorage
      const storedMaxPage = await getStoredMaxPage(bookId);
      
      // Use the higher of the two
      const actualMaxPage = Math.max(calculatedMaxPage, storedMaxPage);
      setMaxPageNumber(actualMaxPage);
      
      // Always start at page 1 when opening a book
      setCurrentPageNumber(1);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      if (Platform.OS === 'web') {
        alert('Error loading entries: ' + error.message);
      } else {
        Alert.alert('Error', 'Failed to load entries: ' + error.message);
      }
      setLoading(false);
    }
  };

  // Auto-fill entries with dates from start date
  const autoFillEntries = async (book, numberOfDays) => {
    try {
      const startDate = new Date(book.startDate);
      const totalDays = parseInt(numberOfDays) || 100;
      const totalPages = Math.ceil(totalDays / ENTRIES_PER_PAGE);
      
      console.log(`📦 Bulk creating ${totalDays} entries across ${totalPages} pages`);
      
      // Prepare all entries in memory first
      const entriesToCreate = [];
      
      for (let day = 0; day < totalDays; day++) {
        const serialNumber = day + 1;
        const pageNumber = Math.floor(day / ENTRIES_PER_PAGE) + 1;
        
        // Calculate the date for this entry
        const entryDate = new Date(startDate);
        entryDate.setDate(startDate.getDate() + day);
        const formattedDate = entryDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Add entry to batch array
        entriesToCreate.push({
          bookId: book.id,
          serialNumber,
          pageNumber,
          date: formattedDate,
          amount: '',
          remaining: '',
          signature: '',
        });
      }
      
      // Bulk create ALL entries in a SINGLE API call!
      console.log(`🚀 Sending bulk request for ${entriesToCreate.length} entries...`);
      await bulkSaveEntries(book.id, entriesToCreate);
      console.log(`✅ Bulk creation complete!`);
      
      // Save the max page number
      await saveMaxPage(book.id, totalPages);
      
      console.log(`Auto-fill complete: ${totalDays} days of entries created in 1 API call`);
    } catch (error) {
      console.error('Error auto-filling entries:', error);
      // Don't throw - let the app continue even if auto-fill fails
    }
  };

  // Get stored max page from AsyncStorage
  const getStoredMaxPage = async (bookId) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const key = `maxPage_${bookId}`;
      const stored = await AsyncStorage.getItem(key);
      return stored ? parseInt(stored, 10) : 1;
    } catch (error) {
      console.error('Error getting stored max page:', error);
      return 1;
    }
  };

  // Save max page to AsyncStorage
  const saveMaxPage = async (bookId, pageNumber) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const key = `maxPage_${bookId}`;
      await AsyncStorage.setItem(key, pageNumber.toString());
    } catch (error) {
      console.error('Error saving max page:', error);
    }
  };

  // Calculate max page from existing entries
  const getMaxPageFromEntries = (allEntries) => {
    if (allEntries.length === 0) return 1;
    
    const maxPage = Math.max(...allEntries.map(e => e.pageNumber), 1);
    return maxPage;
  };

  // Find the page number of the last updated/filled entry
  const findLastPageWithEntry = (allEntries) => {
    if (allEntries.length === 0) {
      return 1; // First page
    }

    // Find the highest page number with data
    let lastPage = 1;
    allEntries.forEach(entry => {
      if (entry.date || entry.amount || entry.remaining) {
        if (entry.pageNumber > lastPage) {
          lastPage = entry.pageNumber;
        }
      }
    });
    
    return lastPage;
  };

  // Calculate correct balance for an entry (excluding rejected entries)
  const calculateEntryBalance = (entry) => {
    if (!entry || !entry.serialNumber) return '';
    
    // Get all entries before this one (excluding rejected)
    const previousEntries = entries.filter(
      e => e.serialNumber < entry.serialNumber && 
           e.signatureStatus !== 'request_rejected' &&
           e.amount !== null && e.amount !== undefined && e.amount !== ''
    );
    
    // Calculate total paid before this entry
    const totalPaidBefore = previousEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    
    // Calculate balance at this entry
    // If this entry itself is rejected, don't deduct its amount
    const amountAtThisEntry = entry.signatureStatus === 'request_rejected' ? 0 : (parseFloat(entry.amount) || 0);
    const balance = (book.loanAmount || 0) - totalPaidBefore - amountAtThisEntry;
    
    return balance.toFixed(2);
  };

  // Get entries for current page
  const getCurrentPageEntries = () => {
    // Filter entries for current page
    const pageEntries = entries.filter(e => e.pageNumber === currentPageNumber);
    
    // Create array of 10 entries (empty if not exists)
    const result = [];
    for (let i = 1; i <= ENTRIES_PER_PAGE; i++) {
      const serialNumber = (currentPageNumber - 1) * ENTRIES_PER_PAGE + i;
      const existingEntry = pageEntries.find(e => e.serialNumber === serialNumber);
      
      if (existingEntry) {
        result.push(existingEntry);
      } else {
        // Empty entry placeholder
        result.push({
          id: null,
          serialNumber,
          pageNumber: currentPageNumber,
          date: '',
          amount: '',
          remaining: '',
          signature: '',
        });
      }
    }
    
    return result;
  };

  const handleAddPage = async () => {
    const newPageNumber = maxPageNumber + 1;
    setMaxPageNumber(newPageNumber);
    setCurrentPageNumber(newPageNumber);
    
    // Save the new max page
    await saveMaxPage(bookId, newPageNumber);
    
    if (Platform.OS === 'web') {
      alert(`Page ${newPageNumber} added! You can now add entries.`);
    } else {
      Alert.alert('Success', `Page ${newPageNumber} added successfully`);
    }
  };

  const handleEditEntry = (entry) => {
    const status = entry.signatureStatus || 'none';
    const isSigned = status === 'signed_by_request';
    
    // Allow editing of approved entries, but warn that signature will be cleared
    if (isSigned) {
      const confirmed = Platform.OS === 'web'
        ? window.confirm(t('editSignedWarning'))
        : false; // Will show alert below
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          t('warning'),
          t('editSignedWarning'),
          [
            { text: t('cancel'), style: 'cancel' },
            { 
              text: t('continue'), 
              onPress: () => proceedToEdit(entry),
              style: 'default'
            }
          ]
        );
        return;
      }
      
      if (!confirmed) return;
    }

    proceedToEdit(entry);
  };

  const proceedToEdit = (entry) => {
    setSelectedEntry(entry);
    
    // Auto-fill date to today if empty
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Calculate current balance (loan amount - sum of all previous payments, excluding rejected entries)
    const previousEntries = entries.filter(
      e => e.serialNumber < entry.serialNumber && 
           e.amount &&
           e.signatureStatus !== 'request_rejected' // Exclude rejected entries
    );
    const totalPaid = previousEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const currentBalance = (book.loanAmount || 0) - totalPaid;
    
    // Store original amount to check for changes
    const originalAmountValue = entry.amount !== null && entry.amount !== undefined && entry.amount !== '' ? String(entry.amount) : '';
    setOriginalAmount(originalAmountValue);
    
    setEditFormData({
      serialNumber: entry.serialNumber,
      date: entry.date || today,  // Auto-fill today's date
      amount: originalAmountValue,  // Allow 0, convert to string
      remaining: entry.remaining || currentBalance.toFixed(2),  // Auto-calculate balance
      signature: entry.signature || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEntry = async () => {
    if (!editFormData.date) {
      if (Platform.OS === 'web') {
        alert('Please fill in the date');
      } else {
        Alert.alert('Error', 'Please fill in the date');
      }
      return;
    }

    // Check if credit amount has changed
    const currentAmount = editFormData.amount || '';
    if (currentAmount === originalAmount) {
      if (Platform.OS === 'web') {
        alert(t('creditNotChanged'));
      } else {
        Alert.alert(t('error'), t('creditNotChanged'));
      }
      return;
    }

    try {
      // Check if anyone is editing a signed entry - clear signature status
      const wasSigned = selectedEntry.signatureStatus === 'signed_by_request';
      const shouldClearSignature = wasSigned;
      
      const entryData = {
        bookId: bookId,
        date: editFormData.date,
        amount: parseFloat(editFormData.amount) || 0,
        remaining: parseFloat(editFormData.remaining) || 0,
        signature: editFormData.signature,
        pageNumber: currentPageNumber,
        serialNumber: selectedEntry.serialNumber,
      };

      // Clear signature status if borrower edited a signed entry
      if (shouldClearSignature) {
        entryData.signatureStatus = 'none';
        entryData.signatureRequestedBy = null;
        entryData.signedBy = null;
        entryData.signedAt = null;
      }

      // STEP 1: Auto-fill ONLY previous empty entries with 0
      const currentSerialNumber = selectedEntry.serialNumber;
      const allEntries = await getEntries(bookId);
      
      // Find all entries BEFORE current that have no amount filled (regardless of date)
      // But skip entries that already have 0 - they've been filled
      const previousEmptyEntries = allEntries.filter(
        e => e.serialNumber < currentSerialNumber && 
             (e.amount === null || e.amount === undefined || e.amount === '')
      );
      
      console.log(`⭐ Current entry serial: ${currentSerialNumber}`);
      console.log(`⭐ Total entries found: ${allEntries.length}`);
      console.log(`⭐ Previous empty entries to fill: ${previousEmptyEntries.length}`);
      console.log(`⭐ Empty entries details:`, previousEmptyEntries.map(e => ({ serial: e.serialNumber, amount: e.amount, id: e.id })));
      
      // Fill ONLY previous empty entries with 0 amount and today's date if no date
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const entriesToUpdate = [];
      
      for (const emptyEntry of previousEmptyEntries) {
        if (emptyEntry.id) {
          // Calculate balance for this entry (excluding rejected entries)
          const entriesBeforeThis = allEntries.filter(
            e => e.serialNumber < emptyEntry.serialNumber && 
                 e.amount !== null && e.amount !== undefined && e.amount !== '' &&
                 e.signatureStatus !== 'request_rejected' // Exclude rejected entries from balance calculation
          );
          const totalPaidBefore = entriesBeforeThis.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
          const balance = (book.loanAmount || 0) - totalPaidBefore;
          
          const updateData = {
            ...emptyEntry,
            date: emptyEntry.date || today, // Fill date if empty
            amount: 0,
            remaining: balance,
          };
          console.log(`⭐ Preparing entry ${emptyEntry.serialNumber} with 0 credit`);
          entriesToUpdate.push(updateData);
        } else {
          console.log(`⚠️ Entry ${emptyEntry.serialNumber} has no ID, skipping`);
        }
      }
      
      // Bulk update all empty entries at once - SINGLE API CALL!
      if (entriesToUpdate.length > 0) {
        console.log(`📦 Bulk updating ${entriesToUpdate.length} empty entries...`);
        await bulkSaveEntries(bookId, entriesToUpdate);
        console.log(`✅ Bulk update complete!`);
      }
      console.log(`⭐ Auto-fill complete`);

      // STEP 2: Save the current entry being edited
      if (selectedEntry.id) {
        // Update existing entry
        await updateEntryStorage(selectedEntry.id, entryData);
        
        // Show message to borrower that they need to request signature again
        if (shouldClearSignature) {
          if (Platform.OS === 'web') {
            alert(t('signatureClearedRequestAgain'));
          } else {
            Alert.alert(t('success'), t('signatureClearedRequestAgain'));
          }
        }
      } else {
        // Create new entry
        await saveEntry(entryData);
      }

      // STEP 3: Recalculate balances for ALL entries (including those with and without amounts)
      const updatedEntries = await getEntries(bookId);
      
      // Get ALL entries, sorted by serial number
      const allEntriesSorted = updatedEntries.sort((a, b) => a.serialNumber - b.serialNumber);
      
      console.log(`⭐ Recalculating balances for ALL ${allEntriesSorted.length} entries`);
      
      const balanceUpdates = [];
      
      // Recalculate balance for each entry based on cumulative payments (excluding rejected entries)
      for (const entry of allEntriesSorted) {
        // Calculate total paid up to (but not including) this entry - exclude rejected entries
        const entriesBeforeThis = allEntriesSorted.filter(
          e => e.serialNumber < entry.serialNumber && 
               e.signatureStatus !== 'request_rejected' // Exclude rejected entries
        );
        const totalPaidBefore = entriesBeforeThis.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        
        // Balance at this entry = Loan Amount - Total Paid Before - Amount Paid at This Entry
        // If this entry itself is rejected, don't deduct its amount
        const amountAtThisEntry = entry.signatureStatus === 'request_rejected' ? 0 : (parseFloat(entry.amount) || 0);
        const balance = (book.loanAmount || 0) - totalPaidBefore - amountAtThisEntry;
        
        // Prepare balance update if it has changed
        if (entry.id && entry.remaining !== balance) {
          balanceUpdates.push({
            ...entry,
            remaining: balance,
          });
          console.log(`✅ Queued balance update for entry ${entry.serialNumber}: ${balance}`);
        }
      }
      
      // Bulk update all balances at once - SINGLE API CALL!
      if (balanceUpdates.length > 0) {
        console.log(`📦 Bulk updating ${balanceUpdates.length} entry balances...`);
        await bulkSaveEntries(bookId, balanceUpdates);
        console.log(`✅ Bulk balance update complete!`);
      }
      
      console.log(`⭐ Balance recalculation complete`);

      // Reload data
      await loadData();
      setShowEditModal(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error saving entry:', error);
      if (Platform.OS === 'web') {
        alert('Failed to save entry: ' + error.message);
      } else {
        Alert.alert('Error', 'Failed to save entry');
      }
    }
  };

  const handleSignature = (signature) => {
    setEditFormData({ ...editFormData, signature });
    setShowSignature(false);
  };

  const handleClearSignature = () => {
    setEditFormData({ ...editFormData, signature: '' });
  };

  // Signature action handlers
  const handleRequestSignature = async () => {
    if (!selectedEntry || !selectedEntry.id) {
      if (Platform.OS === 'web') {
        alert(t('pleaseSaveEntryFirst'));
      } else {
        Alert.alert(t('error'), t('pleaseSaveEntryFirst'));
      }
      return;
    }

    try {
      console.log('🔔 Requesting signature for entry:', selectedEntry.id);
      await requestSignature(selectedEntry.id, currentUser.id);
      
      // Force a delay to ensure DB write completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('📥 Reloading data after signature request...');
      // Force refresh from server (bypass cache)
      await loadData(true);
      
      if (Platform.OS === 'web') {
        alert(t('signatureRequested'));
      } else {
        Alert.alert(t('success'), t('signatureRequested'));
      }
      setShowEditModal(false);
    } catch (error) {
      console.error('Error requesting signature:', error);
      if (Platform.OS === 'web') {
        alert(t('requestFailed') + ': ' + error.message);
      } else {
        Alert.alert(t('error'), t('requestFailed') + ': ' + error.message);
      }
    }
  };

  const handleApproveRequest = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm(t('confirmApproveSignature'))
      : await new Promise((resolve) => {
          Alert.alert(
            t('confirm'),
            t('confirmApproveSignature'),
            [
              { text: t('cancel'), onPress: () => resolve(false), style: 'cancel' },
              { text: t('approve'), onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmed) return;

    try {
      await approveSignatureRequest(selectedEntry.id, currentUser.id);
      
      // Force a delay to ensure DB write completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (Platform.OS === 'web') {
        alert(t('signatureApproved'));
      } else {
        Alert.alert(t('success'), t('signatureApproved'));
      }
      await loadData(true); // Force refresh
      setShowEditModal(false);
    } catch (error) {
      console.error('Error approving signature:', error);
      if (Platform.OS === 'web') {
        alert(t('approveFailed'));
      } else {
        Alert.alert(t('error'), t('approveFailed'));
      }
    }
  };

  const handleRejectRequest = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm(t('confirmRejectSignature'))
      : await new Promise((resolve) => {
          Alert.alert(
            t('confirm'),
            t('confirmRejectSignature'),
            [
              { text: t('cancel'), onPress: () => resolve(false), style: 'cancel' },
              { text: t('reject'), onPress: () => resolve(true), style: 'destructive' },
            ]
          );
        });

    if (!confirmed) return;

    try {
      await rejectSignatureRequest(selectedEntry.id);
      
      // Force a delay to ensure DB write completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (Platform.OS === 'web') {
        alert(t('signatureRejected'));
      } else {
        Alert.alert(t('success'), t('signatureRejected'));
      }
      await loadData(true); // Force refresh
      setShowEditModal(false);
    } catch (error) {
      console.error('Error rejecting signature:', error);
      if (Platform.OS === 'web') {
        alert(t('rejectFailed'));
      } else {
        Alert.alert(t('error'), t('rejectFailed'));
      }
    }
  };

  // Get signature button text and action based on user role and entry status
  const getSignatureButtonConfig = () => {
    if (!selectedEntry || !currentUser) return null;

    const status = selectedEntry.signatureStatus || 'none';
    const requesterId = selectedEntry.signatureRequestedBy;
    
    // Check if current user is the one who requested signature
    const isRequester = requesterId === currentUser.id;
    // Check if current user is the one being asked to sign
    const isRecipient = !isRequester && status === 'signature_requested';

    switch (status) {
      case 'signed_by_request':
        // Entry has been signed
        return { text: t('approved'), action: null, disabled: true, color: '#4CAF50' };
      
      case 'signature_requested':
        if (isRecipient) {
          // Current user needs to approve/reject
          return { text: t('signatureRequestReceived'), action: 'approve_reject', color: '#FF9800' };
        } else {
          // Current user is waiting for other party to respond
          return { text: t('waitingForSignature'), action: null, disabled: true, color: '#FF9800' };
        }
      
      case 'request_rejected':
        // Signature was rejected, can request again
        return { text: t('requestSignatureAgain'), action: 'request', color: '#2196F3' };
      
      case 'none':
      default:
        // No signature yet - anyone can request from the other party
        return { text: t('requestSignature'), action: 'request', color: '#2196F3' };
    }
  };

  if (loading || !book) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const currentPageEntries = getCurrentPageEntries();
  const style = `.m-signature-pad--footer {display: none; margin: 0px;}`;

  return (
    <View style={styles.container}>
      {/* User Info - Top Left */}
      {currentUser && (
        <View style={styles.userInfoHeader}>
          <Text style={styles.userInfoText}>
            👤 {currentUser.fullName} (@{currentUser.username})
          </Text>
        </View>
      )}

      {/* Book Info Header */}
      <View style={styles.bookHeader}>
        <View style={styles.bookHeaderLeft}>
          <Text style={styles.bookHeaderText}>
            {book.name} | D.L.No: {book.dlNo || 'N/A'}
          </Text>
        </View>
        <View style={styles.bookHeaderRight}>
          <Text style={styles.bookHeaderSubtext}>
            {t('loanAmount')}: ₹{book.loanAmount}
          </Text>
          <Text style={styles.bookHeaderSubtext}>
            {t('balance')}: ₹{(() => {
              const loanAmount = parseFloat(book.loanAmount) || 0;
              // Exclude rejected entries from balance calculation
              const totalPaid = entries
                .filter(entry => entry.signatureStatus !== 'request_rejected')
                .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);
              const balance = loanAmount - totalPaid;
              return balance.toFixed(2);
            })()}
          </Text>
        </View>
      </View>

      {/* Page Navigation */}
      <View style={styles.pageNavigation}>
        <TouchableOpacity
          style={[styles.pageNavButton, currentPageNumber === 1 && styles.pageNavButtonDisabled]}
          onPress={() => setCurrentPageNumber(Math.max(1, currentPageNumber - 1))}
          disabled={currentPageNumber === 1}
        >
          <Text style={styles.pageNavButtonText}>{t('prev')}</Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          {t('pageOf', { current: currentPageNumber, total: maxPageNumber })}
        </Text>

        <TouchableOpacity
          style={[
            styles.pageNavButton,
            currentPageNumber === maxPageNumber && styles.pageNavButtonDisabled,
          ]}
          onPress={() =>
            setCurrentPageNumber(Math.min(maxPageNumber, currentPageNumber + 1))
          }
          disabled={currentPageNumber === maxPageNumber}
        >
          <Text style={styles.pageNavButtonText}>{t('next')}</Text>
        </TouchableOpacity>
        
        {/* Font Size Controls */}
        <View style={styles.fontSizeControls}>
          <TouchableOpacity
            style={styles.fontSizeButton}
            onPress={() => setFontSize(Math.max(10, fontSize - 1))}
          >
            <Text style={styles.fontSizeButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.fontSizeText}>{fontSize}</Text>
          <TouchableOpacity
            style={styles.fontSizeButton}
            onPress={() => setFontSize(Math.min(20, fontSize + 1))}
          >
            <Text style={styles.fontSizeButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <ScrollView 
          horizontal={true} 
          showsHorizontalScrollIndicator={true}
          bounces={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={[styles.cell, styles.headerCell, styles.serialCell]}>
                <Text style={styles.headerText}>{t('serialNo')}</Text>
              </View>
              <View style={[styles.cell, styles.headerCell, styles.dateCell]}>
                <Text style={styles.headerText}>{t('date')}</Text>
              </View>
              <View style={[styles.cell, styles.headerCell, styles.amountCell]}>
                <Text style={styles.headerText}>{t('creditRs')}</Text>
              </View>
              <View style={[styles.cell, styles.headerCell, styles.amountCell]}>
                <Text style={styles.headerText}>{t('balanceRs')}</Text>
              </View>
              <View style={[styles.cell, styles.headerCell, styles.signatureCell]}>
                <Text style={styles.headerText}>{t('signature')}</Text>
              </View>
            </View>

            {/* Table Rows - Scrollable */}
            <ScrollView 
              style={styles.tableBodyScroll}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {currentPageEntries.map((entry, index) => {
                // Debug: Log entry data for first few entries
                if (entry.serialNumber <= 3 || entry.serialNumber === 9) {
                  console.log(`Entry ${entry.serialNumber}: amount=${entry.amount} (type: ${typeof entry.amount}), remaining=${entry.remaining}`);
                }
                
                return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tableRow,
                    entry.date && styles.tableRowFilled,
                  ]}
                  onPress={() => handleEditEntry(entry)}
                >
                  <View style={[styles.cell, styles.serialCell]}>
                    <Text style={[styles.cellText, { fontSize }]}>{entry.serialNumber}</Text>
                  </View>
                  <View style={[styles.cell, styles.dateCell]}>
                    <Text style={[styles.cellText, { fontSize }]}>{entry.date ? formatDateDDMMYYYY(entry.date) : ''}</Text>
                  </View>
                  <View style={[styles.cell, styles.amountCell]}>
                    <Text style={[
                      styles.cellText, 
                      { fontSize },
                      // Strike through if rejected
                      entry.signatureStatus === 'request_rejected' && styles.strikethrough
                    ]}>
                      {entry.amount !== null && entry.amount !== undefined && entry.amount !== '' ? String(entry.amount) : (entry.amount === 0 ? '0' : '')}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.amountCell]}>
                    <Text style={[styles.cellText, { fontSize }]}>
                      {entry.id ? calculateEntryBalance(entry) : ''}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.signatureCell]}>
                    {(() => {
                      const status = entry.signatureStatus || 'none';
                      const requesterId = entry.signatureRequestedBy;
                      const signedById = entry.signedBy;
                      const isRequester = requesterId === currentUser?.id;
                      const canApprove = status === 'signature_requested' && !isRequester && entry.id;
                      // Allow request for any entry with id (allow 0 amounts)
                      const hasAmount = entry.amount !== null && entry.amount !== undefined && entry.amount !== '';
                      const canRequest = entry.id && hasAmount;
                      const canReRequest = status === 'signed_by_request' && entry.id && hasAmount; // Allow re-request after approval
                      
                      // Find usernames
                      const requester = allUsers.find(u => u.id === requesterId);
                      const signer = allUsers.find(u => u.id === signedById);
                      const requesterName = requester?.username || 'Unknown';
                      const signerName = signer?.username || 'Unknown';
                      
                      switch (status) {
                        case 'signature_requested':
                          return (
                            <View style={styles.signatureStatusContainer}>
                              {isRequester ? (
                                // Requester sees "Pending Approval" button (non-clickable)
                                <View style={styles.pendingApprovalButton}>
                                  <Text style={styles.pendingApprovalButtonText}>{t('pendingApproval')}</Text>
                                </View>
                              ) : canApprove ? (
                                // Approver sees "Approve/Reject" button
                                <TouchableOpacity
                                  style={styles.approveRejectButton}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    setSelectedEntryForApproval(entry);
                                    setShowApproveRejectModal(true);
                                  }}
                                >
                                  <Text style={styles.approveRejectButtonText}>{t('approveReject')}</Text>
                                </TouchableOpacity>
                              ) : (
                                // Other users just see pending status button
                                <View style={styles.pendingApprovalButton}>
                                  <Text style={styles.pendingApprovalButtonText}>{t('pending')}</Text>
                                </View>
                              )}
                            </View>
                          );
                        case 'signed_by_request':
                          // Approved - show info + "Request Sign" button for re-signing
                          return (
                            <View style={styles.signatureStatusContainer}>
                              <View style={styles.approvedInfoBox}>
                                <Text style={styles.approvedInfoText}>✓ {t('approved')}</Text>
                                <Text style={styles.approvedDetailText}>
                                  {t('reqBy')} {requesterName}
                                </Text>
                                <Text style={styles.approvedDetailText}>
                                  {t('approvedBy')} {signerName}
                                </Text>
                              </View>
                              {canReRequest && (
                                <TouchableOpacity
                                  style={styles.reSignRequestButton}
                                  onPress={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await requestSignature(entry.id, currentUser.id);
                                      await new Promise(resolve => setTimeout(resolve, 500));
                                      await loadData(true);
                                      if (Platform.OS === 'web') {
                                        alert(t('signatureRequested'));
                                      } else {
                                        Alert.alert(t('success'), t('signatureRequested'));
                                      }
                                    } catch (error) {
                                      console.error('Error:', error);
                                      if (Platform.OS === 'web') {
                                        alert(t('requestFailed'));
                                      } else {
                                        Alert.alert(t('error'), t('requestFailed'));
                                      }
                                    }
                                  }}
                                >
                                  <Text style={styles.reSignRequestButtonText}>{t('reReqSign')}</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        case 'request_rejected':
                          return (
                            <View style={styles.signatureStatusContainer}>
                              {canRequest && (
                                <TouchableOpacity
                                  style={styles.inlineRequestButton}
                                  onPress={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await requestSignature(entry.id, currentUser.id);
                                      await new Promise(resolve => setTimeout(resolve, 500));
                                      await loadData(true);
                                      if (Platform.OS === 'web') {
                                        alert(t('signatureRequested'));
                                      } else {
                                        Alert.alert(t('success'), t('signatureRequested'));
                                      }
                                    } catch (error) {
                                      console.error('Error:', error);
                                      if (Platform.OS === 'web') {
                                        alert(t('requestFailed'));
                                      } else {
                                        Alert.alert(t('error'), t('requestFailed'));
                                      }
                                    }
                                  }}
                                >
                                  <Text style={styles.inlineRequestButtonText}>{t('reqSign')}</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        default:
                          // No signature - always show "Request Sign" button if entry has amount
                          return canRequest ? (
                            <TouchableOpacity
                              style={styles.inlineRequestButton}
                              onPress={async (e) => {
                                e.stopPropagation();
                                try {
                                  await requestSignature(entry.id, currentUser.id);
                                  await new Promise(resolve => setTimeout(resolve, 500));
                                  await loadData(true);
                                  if (Platform.OS === 'web') {
                                    alert(t('signatureRequested'));
                                  } else {
                                    Alert.alert(t('success'), t('signatureRequested'));
                                  }
                                } catch (error) {
                                  console.error('Error:', error);
                                  if (Platform.OS === 'web') {
                                    alert(t('requestFailed'));
                                  } else {
                                    Alert.alert(t('error'), t('requestFailed'));
                                  }
                                }
                              }}
                            >
                              <Text style={styles.inlineRequestButtonText}>{t('reqSign')}</Text>
                            </TouchableOpacity>
                          ) : <Text style={styles.cellText}></Text>;
                      }
                    })()}
                  </View>
                </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.addPageButton} onPress={handleAddPage}>
          <Text style={styles.addPageButtonText}>{t('addNewPage')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.backButtonText}>{t('backToDashboard')}</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Entry Modal */}
      {editFormData && (
        <Modal
          visible={showEditModal}
          animationType="slide"
          onRequestClose={() => setShowEditModal(false)}
        >
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('editEntry')} #{selectedEntry?.serialNumber}
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {/* Serial Number (Read-only) */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('serialNo')}</Text>
                <Text style={styles.readOnlyText}>{editFormData.serialNumber}</Text>
              </View>

              {/* Date (Read-only) */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('date')}</Text>
                <Text style={styles.readOnlyText}>{editFormData.date ? formatDateDDMMYYYY(editFormData.date) : ''}</Text>
              </View>

              {/* Credit Amount */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('creditRs')}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editFormData.amount.toString()}
                  onChangeText={(text) => {
                    // Auto-calculate balance when credit amount changes (excluding rejected entries)
                    const creditAmount = parseFloat(text) || 0;
                    const previousEntries = entries.filter(
                      e => e.serialNumber < selectedEntry.serialNumber && 
                           e.amount &&
                           e.signatureStatus !== 'request_rejected' // Exclude rejected entries
                    );
                    const totalPaid = previousEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
                    const newBalance = (book.loanAmount || 0) - totalPaid - creditAmount;
                    
                    setEditFormData({ 
                      ...editFormData, 
                      amount: text,
                      remaining: newBalance.toFixed(2)
                    });
                  }}
                  placeholder="Enter credit amount"
                  keyboardType="numeric"
                />
              </View>

              {/* Balance Amount */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('balanceRs')}</Text>
                <TextInput
                  style={[styles.modalInput, styles.autoCalculated]}
                  value={editFormData.remaining.toString()}
                  onChangeText={(text) =>
                    setEditFormData({ ...editFormData, remaining: text })
                  }
                  placeholder={t('balanceRs')}
                  keyboardType="numeric"
                  editable={true}
                />
              </View>

              {/* Save/Cancel Buttons */}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
                  <Text style={styles.saveButtonText}>{t('save')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Modal>
      )}

      {/* Signature Modal */}
      <Modal
        visible={showSignature}
        animationType="slide"
        onRequestClose={() => setShowSignature(false)}
      >
        <View style={styles.signatureModal}>
          <View style={styles.signatureHeader}>
            <Text style={styles.signatureTitle}>Draw Your Signature</Text>
            <TouchableOpacity onPress={() => setShowSignature(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <SignatureScreen
            onOK={handleSignature}
            onEmpty={() => {
              if (Platform.OS === 'web') {
                alert('Please provide a signature');
              } else {
                Alert.alert('Error', 'Please provide a signature');
              }
            }}
            descriptionText=""
            clearText="Clear"
            confirmText="Save"
            webStyle={style}
          />
        </View>
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal
        visible={showApproveRejectModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowApproveRejectModal(false)}
      >
        <View style={styles.approveRejectModalOverlay}>
          <View style={styles.approveRejectModalContent}>
            <Text style={styles.approveRejectModalTitle}>{t('approveReject')}</Text>
            <Text style={styles.approveRejectModalText}>
              {t('chooseAction')}
            </Text>
            
            <View style={styles.approveRejectModalButtons}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalApproveButton]}
                onPress={async () => {
                  try {
                    await approveSignatureRequest(selectedEntryForApproval.id, currentUser.id);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await loadData(true);
                    setShowApproveRejectModal(false);
                    setSelectedEntryForApproval(null);
                    if (Platform.OS === 'web') {
                      alert(t('signatureApproved'));
                    } else {
                      Alert.alert(t('success'), t('signatureApproved'));
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    if (Platform.OS === 'web') {
                      alert(t('approveFailed'));
                    } else {
                      Alert.alert(t('error'), t('approveFailed'));
                    }
                  }
                }}
              >
                <Text style={styles.modalActionButtonText}>✓ {t('approve')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalRejectButton]}
                onPress={async () => {
                  try {
                    await rejectSignatureRequest(selectedEntryForApproval.id);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await loadData(true);
                    setShowApproveRejectModal(false);
                    setSelectedEntryForApproval(null);
                    if (Platform.OS === 'web') {
                      alert(t('signatureRejected'));
                    } else {
                      Alert.alert(t('success'), t('signatureRejected'));
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    if (Platform.OS === 'web') {
                      alert(t('rejectFailed'));
                    } else {
                      Alert.alert(t('error'), t('rejectFailed'));
                    }
                  }
                }}
              >
                <Text style={styles.modalActionButtonText}>✗ {t('reject')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowApproveRejectModal(false);
                setSelectedEntryForApproval(null);
              }}
            >
              <Text style={styles.modalCancelButtonText}>{t('cancel')}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoHeader: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userInfoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  bookHeader: {
    backgroundColor: '#2196F3',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  bookHeaderRight: {
    alignItems: 'flex-end',
  },
  bookHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookHeaderSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    fontWeight: '600',
  },
  pageNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  pageNavButton: {
    padding: 8,
    paddingHorizontal: 15,
    backgroundColor: '#2196F3',
    borderRadius: 6,
  },
  pageNavButtonDisabled: {
    backgroundColor: '#ccc',
  },
  pageNavButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tableWrapper: {
    flex: 1,
    marginBottom: 10,
  },
  horizontalScroll: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 10,
  },
  tableContainer: {
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 8,
    backgroundColor: '#fff',
    // Fixed width = sum of all column widths (80 + 140 + 140 + 140 + 200 = 700)
    width: 700,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    borderBottomWidth: 2,
    borderBottomColor: '#e91e63',
  },
  tableBodyScroll: {
    maxHeight: 500, // Allows vertical scrolling for rows
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e91e63',
    minHeight: 38,
    backgroundColor: '#fff',
  },
  tableRowFilled: {
    backgroundColor: '#f0f8ff',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#e91e63',
  },
  headerCell: {
    paddingVertical: 8,
  },
  serialCell: {
    width: 80,
  },
  dateCell: {
    width: 140,
  },
  amountCell: {
    width: 140,
  },
  signatureCell: {
    width: 200,
    borderRightWidth: 0,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  headerSubText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  cellText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  signatureIndicator: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  signatureStatusContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureStatusText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signatureRequestedText: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signatureRejectedText: {
    fontSize: 11,
    color: '#f44336',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signatureDetailText: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  inlineSignatureButtons: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  inlineButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineApproveButton: {
    backgroundColor: '#4CAF50',
  },
  inlineRejectButton: {
    backgroundColor: '#f44336',
  },
  inlineButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inlineRequestButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  inlineRequestButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pendingApprovalButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
    minWidth: 120,
    alignItems: 'center',
  },
  pendingApprovalButtonText: {
    color: '#FF9800',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  approveRejectButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#673AB7',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  approveRejectButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  approvedInfoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
    minWidth: 120,
    alignItems: 'center',
  },
  approvedInfoText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  approvedDetailText: {
    fontSize: 8,
    color: '#2E7D32',
    marginTop: 2,
    textAlign: 'center',
  },
  reSignRequestButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#2196F3',
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  reSignRequestButtonText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  approveRejectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveRejectModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  approveRejectModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  approveRejectModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  approveRejectModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalApproveButton: {
    backgroundColor: '#4CAF50',
  },
  modalRejectButton: {
    backgroundColor: '#f44336',
  },
  modalActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomActions: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    gap: 10,
  },
  addPageButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addPageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2196F3',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 8,
    fontWeight: '600',
  },
  readOnlyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e91e63',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  autoCalculated: {
    backgroundColor: '#f0f8ff',
    borderColor: '#2196F3',
  },
  hint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  signatureButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  signatureButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signaturePreview: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signatureText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // New signature system styles
  signatureStatusButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  signatureStatusButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signatureButtonDisabled: {
    opacity: 0.7,
  },
  approveRejectContainer: {
    marginTop: 8,
  },
  requestWarning: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  approveRejectButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  signatureActionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    marginTop: 20,
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f44336',
  },
  cancelButtonText: {
    color: '#f44336',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signatureModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2196F3',
  },
  signatureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 4,
    gap: 8,
  },
  fontSizeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#2196F3',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fontSizeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
});
