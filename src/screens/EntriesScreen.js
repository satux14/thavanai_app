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
import { getBook, getEntries, saveEntry, updateEntry as updateEntryStorage, signEntry, requestSignature, approveSignatureRequest, rejectSignatureRequest } from '../utils/storage';
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
  const [editFormData, setEditFormData] = useState(null);
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

  const loadData = async () => {
    try {
      console.log('Loading book:', bookId);
      const loadedBook = await getBook(bookId);
      let loadedEntries = await getEntries(bookId);
      
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
      
      console.log(`Creating ${totalDays} entries across ${totalPages} pages`);
      
      for (let day = 0; day < totalDays; day++) {
        const serialNumber = day + 1;
        const pageNumber = Math.floor(day / ENTRIES_PER_PAGE) + 1;
        
        // Calculate the date for this entry
        const entryDate = new Date(startDate);
        entryDate.setDate(startDate.getDate() + day);
        const formattedDate = entryDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Create entry with date pre-filled
        await saveEntry({
          bookId: book.id,
          serialNumber,
          pageNumber,
          date: formattedDate,
          amount: '',
          remaining: '',
          signature: '',
        });
      }
      
      // Save the max page number
      await saveMaxPage(book.id, totalPages);
      
      console.log(`Auto-fill complete: ${totalDays} days of entries created`);
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
    
    // No one can edit approved/signed entries - it requires both parties' agreement
    if (isSigned) {
      if (Platform.OS === 'web') {
        alert(t('cannotEditApprovedEntry'));
      } else {
        Alert.alert(t('error'), t('cannotEditApprovedEntry'));
      }
      return;
    }

    proceedToEdit(entry);
  };

  const proceedToEdit = (entry) => {
    setSelectedEntry(entry);
    
    // Auto-fill date to today if empty
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Calculate current balance (loan amount - sum of all previous payments)
    const previousEntries = entries.filter(e => e.serialNumber < entry.serialNumber && e.amount);
    const totalPaid = previousEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const currentBalance = (book.loanAmount || 0) - totalPaid;
    
    setEditFormData({
      serialNumber: entry.serialNumber,
      date: entry.date || today,  // Auto-fill today's date
      amount: entry.amount || '',
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
      
      // Find all entries BEFORE current that have dates but no amount filled
      const previousEmptyEntries = allEntries.filter(
        e => e.serialNumber < currentSerialNumber && 
             e.date && 
             (e.amount === null || e.amount === undefined || e.amount === '')
      );
      
      console.log(`Filling ${previousEmptyEntries.length} previous empty entries with 0`);
      
      // Fill ONLY previous empty entries with 0 amount
      for (const emptyEntry of previousEmptyEntries) {
        if (emptyEntry.id) {
          // Calculate balance for this entry
          const entriesBeforeThis = allEntries.filter(
            e => e.serialNumber < emptyEntry.serialNumber && 
                 e.amount !== null && e.amount !== undefined && e.amount !== ''
          );
          const totalPaidBefore = entriesBeforeThis.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
          const balance = (book.loanAmount || 0) - totalPaidBefore;
          
          await updateEntryStorage(emptyEntry.id, {
            ...emptyEntry,
            amount: 0,
            remaining: balance,
          });
        }
      }

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

      // STEP 3: Recalculate balances ONLY for future entries that ALREADY have amounts
      // DO NOT fill future empty entries - leave them empty
      const updatedEntries = await getEntries(bookId);
      const entriesAfterCurrent = updatedEntries.filter(
        e => e.serialNumber > currentSerialNumber && 
             e.amount !== null && 
             e.amount !== undefined && 
             e.amount !== ''  // Only entries that have been filled
      );
      
      console.log(`Recalculating ${entriesAfterCurrent.length} future entries (not filling empty ones)`);
      
      for (const entry of entriesAfterCurrent) {
        const entriesBeforeThis = updatedEntries.filter(
          e => e.serialNumber < entry.serialNumber && 
               e.amount !== null && 
               e.amount !== undefined && 
               e.amount !== ''
        );
        const totalPaidBefore = entriesBeforeThis.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        const balance = (book.loanAmount || 0) - totalPaidBefore - (parseFloat(entry.amount) || 0);
        
        if (entry.id) {
          await updateEntryStorage(entry.id, {
            ...entry,
            remaining: balance,
          });
        }
      }

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
      await requestSignature(selectedEntry.id, currentUser.id);
      if (Platform.OS === 'web') {
        alert(t('signatureRequested'));
      } else {
        Alert.alert(t('success'), t('signatureRequested'));
      }
      await loadData();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error requesting signature:', error);
      if (Platform.OS === 'web') {
        alert(t('requestFailed'));
      } else {
        Alert.alert(t('error'), t('requestFailed'));
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
      if (Platform.OS === 'web') {
        alert(t('signatureApproved'));
      } else {
        Alert.alert(t('success'), t('signatureApproved'));
      }
      await loadData();
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
      if (Platform.OS === 'web') {
        alert(t('signatureRejected'));
      } else {
        Alert.alert(t('success'), t('signatureRejected'));
      }
      await loadData();
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
              const totalPaid = entries.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);
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
              {currentPageEntries.map((entry, index) => (
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
                    <Text style={[styles.cellText, { fontSize }]}>
                      {entry.amount !== null && entry.amount !== undefined && entry.amount !== '' ? entry.amount : ''}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.amountCell]}>
                    <Text style={[styles.cellText, { fontSize }]}>
                      {entry.remaining !== null && entry.remaining !== undefined && entry.remaining !== '' ? entry.remaining : ''}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.signatureCell]}>
                    {(() => {
                      const status = entry.signatureStatus || 'none';
                      const requesterId = entry.signatureRequestedBy;
                      const signedById = entry.signedBy;
                      
                      // Find usernames
                      const requester = allUsers.find(u => u.id === requesterId);
                      const signer = allUsers.find(u => u.id === signedById);
                      const requesterName = requester?.username || 'Unknown';
                      const signerName = signer?.username || 'Unknown';
                      
                      switch (status) {
                        case 'signature_requested':
                          return (
                            <View style={styles.signatureStatusContainer}>
                              <Text style={styles.signatureRequestedText}>⏳ {t('pending')}</Text>
                              <Text style={styles.signatureDetailText}>
                                {t('reqBy')} {requesterName}
                              </Text>
                            </View>
                          );
                        case 'signed_by_request':
                          return (
                            <View style={styles.signatureStatusContainer}>
                              <Text style={styles.signatureStatusText}>✓ {t('approved')}</Text>
                              <Text style={styles.signatureDetailText}>
                                {t('reqBy')} {requesterName}
                              </Text>
                              <Text style={styles.signatureDetailText}>
                                {t('approvedBy')} {signerName}
                              </Text>
                            </View>
                          );
                        case 'request_rejected':
                          return (
                            <View style={styles.signatureStatusContainer}>
                              <Text style={styles.signatureRejectedText}>✗ {t('rejected')}</Text>
                              <Text style={styles.signatureDetailText}>
                                {t('reqBy')} {requesterName}
                              </Text>
                            </View>
                          );
                        default:
                          return <Text style={styles.cellText}></Text>;
                      }
                    })()}
                  </View>
                </TouchableOpacity>
              ))}
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

              {/* Date */}
              <DatePicker
                label={t('date') + ' *'}
                value={editFormData.date}
                onChange={(date) => setEditFormData({ ...editFormData, date })}
              />

              {/* Credit Amount */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('creditRs')}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editFormData.amount.toString()}
                  onChangeText={(text) => {
                    // Auto-calculate balance when credit amount changes
                    const creditAmount = parseFloat(text) || 0;
                    const previousEntries = entries.filter(e => e.serialNumber < selectedEntry.serialNumber && e.amount);
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

              {/* Digital Signature System */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('digitalSignature')}</Text>
                {(() => {
                  const buttonConfig = getSignatureButtonConfig();
                  if (!buttonConfig) return null;

                  return (
                    <View>
                      {buttonConfig.action === 'approve_reject' ? (
                        // Show approve/reject buttons for owner when signature is requested
                        <View style={styles.approveRejectContainer}>
                          <Text style={styles.requestWarning}>⚠️ {t('signatureRequestedByOtherParty')}</Text>
                          <View style={styles.approveRejectButtons}>
                            <TouchableOpacity
                              style={[styles.approveButton, styles.signatureActionButton]}
                              onPress={handleApproveRequest}
                            >
                              <Text style={styles.approveButtonText}>✓ {t('approve')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.rejectButton, styles.signatureActionButton]}
                              onPress={handleRejectRequest}
                            >
                              <Text style={styles.rejectButtonText}>✗ {t('reject')}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        // Show single button for other states
                        <TouchableOpacity
                          style={[
                            styles.signatureStatusButton,
                            { backgroundColor: buttonConfig.color },
                            buttonConfig.disabled && styles.signatureButtonDisabled
                          ]}
                          onPress={() => {
                            if (buttonConfig.action === 'request') {
                              handleRequestSignature();
                            }
                          }}
                          disabled={buttonConfig.disabled}
                        >
                          <Text style={styles.signatureStatusButtonText}>
                            {buttonConfig.text}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })()}
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
    // Fixed width = sum of all column widths (80 + 140 + 140 + 140 + 150 = 650)
    width: 650,
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
    width: 150,
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
