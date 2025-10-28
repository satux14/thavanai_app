import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ImageBackground,
  Modal,
  TextInput,
} from 'react-native';
import { getBook, closeBook, reopenBook, deleteBook, getEntries, shareBook, getBookShares, unshareBook, toggleFavoriteBook } from '../utils/storage';
import { getCurrentUser } from '../utils/auth';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useLanguage, formatDate as formatDateDDMMYYYY } from '../utils/i18n';

export default function BookDetailScreen({ navigation, route }) {
  const { t } = useLanguage();
  const { bookId } = route.params;
  const [book, setBook] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUsername, setShareUsername] = useState('');
  const [showSharedUsersModal, setShowSharedUsersModal] = useState(false);
  const [sharedUsers, setSharedUsers] = useState([]);

  useEffect(() => {
    loadBookDetail();
    loadCurrentUser();
  }, [bookId]);

  const calculateBalance = (loanAmount, entries) => {
    const loan = parseFloat(loanAmount) || 0;
    if (!entries || entries.length === 0) return loan;
    const totalPaid = entries
      .filter(entry => entry.signatureStatus !== 'request_rejected')
      .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);
    return loan - totalPaid;
  };

  const loadBookDetail = async () => {
    try {
      const bookData = await getBook(bookId);
      if (bookData) {
        const entries = await getEntries(bookId);
        const balance = calculateBalance(bookData.loanAmount, entries);
        
        const user = await getCurrentUser();
        const pendingSignatures = entries.filter(
          e => e.signatureStatus === 'signature_requested' && 
               e.signatureRequestedBy !== user?.id
        ).length;
        
        // Determine if the book is owned by the current user
        // Note: API returns 'ownerId' (camelCase), not 'owner_id'
        const bookOwnerId = bookData.ownerId || bookData.owner_id;
        const isOwned = bookOwnerId === user?.id || bookData.isOwned === true;
        
        // DEBUG: Check ownership
        console.log('🔍 BookDetail Debug:');
        console.log('  Current user ID:', user?.id);
        console.log('  Book ownerId:', bookData.ownerId);
        console.log('  Book owner_id:', bookData.owner_id);
        console.log('  bookData.isOwned:', bookData.isOwned);
        console.log('  Calculated isOwned:', isOwned);
        console.log('  Match?', bookOwnerId === user?.id);
        
        setBook({ 
          ...bookData, 
          balance, 
          entryCount: entries.length, 
          pendingSignatures,
          isOwned 
        });
      }
    } catch (error) {
      console.error('Error loading book detail:', error);
    }
  };

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleViewEntries = () => {
    navigation.navigate('Entries', { bookId: book.id });
  };

  const handleAddEntry = () => {
    navigation.navigate('Entries', { bookId: book.id });
  };

  const handleEditBook = () => {
    navigation.navigate('BookInfo', { bookId: book.id });
  };

  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = !book.is_favorite;
      await toggleFavoriteBook(book.id, newFavoriteStatus);
      setBook({ ...book, is_favorite: newFavoriteStatus });
      
      const message = newFavoriteStatus ? t('addedToFavorites') : t('removedFromFavorites');
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert(t('success'), message);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (Platform.OS === 'web') {
        alert(t('error') + ': ' + error.message);
      } else {
        Alert.alert(t('error'), t('error') + ': ' + error.message);
      }
    }
  };

  const handleCloseBook = () => {
    const confirmMessage = t('confirmCloseBook', { name: book.name || book.dlNo });
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(confirmMessage);
      if (confirmed) {
        closeBook(book.id).then(() => {
          alert(t('bookClosed'));
          navigation.goBack();
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
                Alert.alert(t('success'), t('bookClosed'));
                navigation.goBack();
              } catch (error) {
                Alert.alert(t('error'), t('error') + ': ' + error.message);
              }
            },
          },
        ]
      );
    }
  };

  const handleReopenBook = () => {
    const confirmMessage = t('confirmReopenBook', { name: book.name || book.dlNo });
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(confirmMessage);
      if (confirmed) {
        reopenBook(book.id).then(() => {
          alert(t('bookReopened'));
          loadBookDetail();
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
                Alert.alert(t('success'), t('bookReopened'));
                loadBookDetail();
              } catch (error) {
                Alert.alert(t('error'), t('error') + ': ' + error.message);
              }
            },
          },
        ]
      );
    }
  };

  const handleDeleteBook = () => {
    const confirmMessage = t('confirmDeleteBook', { name: book.name || book.dlNo });
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(confirmMessage);
      if (confirmed) {
        deleteBook(book.id).then(() => {
          alert(t('bookDeleted'));
          navigation.navigate('Dashboard');
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
                Alert.alert(t('success'), t('bookDeleted'));
                navigation.navigate('Dashboard');
              } catch (error) {
                Alert.alert(t('error'), t('error') + ': ' + error.message);
              }
            },
          },
        ]
      );
    }
  };

  const handleShareBook = () => {
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
      await shareBook(book.id, shareUsername.trim());
      setShowShareModal(false);
      setShareUsername('');
      
      if (Platform.OS === 'web') {
        alert(t('bookShared'));
      } else {
        Alert.alert(t('success'), t('bookShared'));
      }
    } catch (error) {
      console.error('Error sharing book:', error);
      if (Platform.OS === 'web') {
        alert(t('shareFailed') + ': ' + error.message);
      } else {
        Alert.alert(t('error'), t('shareFailed') + ': ' + error.message);
      }
    }
  };

  const handleViewSharedUsers = async () => {
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
      await unshareBook(book.id, username);
      
      if (Platform.OS === 'web') {
        alert(t('bookUnshared'));
      } else {
        Alert.alert(t('success'), t('bookUnshared'));
      }
      
      const shares = await getBookShares(book.id);
      setSharedUsers(shares);
    } catch (error) {
      console.error('Error unsharing book:', error);
      if (Platform.OS === 'web') {
        alert(t('unshareFailed'));
      } else {
        Alert.alert(t('error'), t('unshareFailed'));
      }
    }
  };

  const handleExportBook = async () => {
    try {
      const entries = await getEntries(book.id);
      const sortedEntries = entries.sort((a, b) => a.serialNumber - b.serialNumber);
      
      const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Arial', sans-serif; padding: 20px; }
              h1 { text-align: center; color: #2196F3; margin-bottom: 30px; }
              h2 { color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 5px; margin-top: 30px; }
              .info-section { margin: 20px 0; }
              .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
              .info-label { font-weight: bold; color: #666; }
              .info-value { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #2196F3; color: white; padding: 12px; text-align: left; font-weight: bold; }
              td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              tr:hover { background-color: #f5f5f5; }
              .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>Daily Installment Book</h1>
            
            <div class="info-section">
              <h2>Book Information</h2>
              <div class="info-row">
                <span class="info-label">D.L. Number:</span>
                <span class="info-value">${book.dlNo || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Borrower Name:</span>
                <span class="info-value">${book.name || 'N/A'}</span>
              </div>
              ${book.fatherName ? `
              <div class="info-row">
                <span class="info-label">Father Name:</span>
                <span class="info-value">${book.fatherName}</span>
              </div>` : ''}
              <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${book.address || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Loan Amount:</span>
                <span class="info-value">₹${book.loanAmount || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Current Balance:</span>
                <span class="info-value">₹${book.balance != null ? book.balance.toFixed(2) : 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Start Date:</span>
                <span class="info-value">${formatDateDDMMYYYY(book.startDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">End Date:</span>
                <span class="info-value">${formatDateDDMMYYYY(book.endDate)}</span>
              </div>
            </div>
            
            <h2>Payment Records</h2>
            ${sortedEntries.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Credit (₹)</th>
                  <th>Balance (₹)</th>
                  <th>Signature</th>
                </tr>
              </thead>
              <tbody>
                ${sortedEntries.map(entry => `
                  <tr>
                    <td>${entry.serialNumber || ''}</td>
                    <td>${entry.date || ''}</td>
                    <td>${entry.amount || ''}</td>
                    <td>${entry.remaining || ''}</td>
                    <td>${entry.signatureStatus === 'signed_by_request' ? '✓ Signed' : ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ` : '<p>No payment records found.</p>'}
            
            <div class="footer">
              Generated on: ${new Date().toLocaleString()}
            </div>
          </body>
        </html>
      `;
      
      const { uri } = await Print.printToFileAsync({ html });
      
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `DailyInstallment_${book.name || book.dlNo || 'book'}_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(t('pdfExported'));
      } else {
        await Sharing.shareAsync(uri);
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

  if (!book) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const CardWrapper = book.backgroundImage ? ImageBackground : View;
  const cardWrapperProps = book.backgroundImage
    ? {
        source: { uri: book.backgroundImage },
        style: [styles.bookCard, { backgroundColor: book.backgroundColor || '#fff' }],
        imageStyle: { borderRadius: 12 },
      }
    : {
        style: [styles.bookCard, { backgroundColor: book.backgroundColor || '#fff' }],
      };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Large "Add Entry" Button at Top */}
        <TouchableOpacity style={styles.addEntryButton} onPress={handleAddEntry}>
          <Text style={styles.addEntryButtonText}>➕ {t('addEntry')}</Text>
        </TouchableOpacity>

        {/* Full Book Card */}
        <CardWrapper {...cardWrapperProps}>
          {book.backgroundImage && <View style={styles.imageOverlay} />}
          
          {/* Card Header */}
          <View style={[styles.bookHeader, book.backgroundImage && { zIndex: 1 }]}>
            <View style={styles.bookTitleSection}>
              <View style={styles.headerTopRow}>
                <Text style={styles.bookDlNo}>D.L.No: {book.dlNo || 'N/A'}</Text>
                <View style={styles.updatedContainer}>
                  <Text style={styles.updatedLabel}>{t('updated')}</Text>
                  <Text style={styles.updatedTime}>{formatDateTime(book.updatedAt)}</Text>
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

          {/* Loan Amount & Balance */}
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

          {/* Address */}
          {book.address && (
            <View style={[styles.addressSection, book.backgroundImage && { zIndex: 1 }]}>
              <Text style={styles.addressLabel}>{t('address')}:</Text>
              <Text style={styles.addressValue}>{book.address}</Text>
            </View>
          )}

          {/* Status Badge */}
          {book.status === 'closed' && (
            <View style={[styles.statusBadge, book.backgroundImage && { zIndex: 1 }]}>
              <Text style={styles.statusBadgeText}>🔒 {t('closed')}</Text>
            </View>
          )}

          {book.isShared && (
            <View style={[styles.sharedBadge, book.backgroundImage && { zIndex: 1 }]}>
              <Text style={styles.sharedBadgeText}>🤝 {t('shared')}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={[styles.bookActions, book.backgroundImage && { zIndex: 1 }]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewEntriesButton]}
              onPress={handleViewEntries}
            >
              <Text style={styles.actionButtonText}>📖 {t('viewEntries')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.exportButton]}
              onPress={handleExportBook}
            >
              <Text style={styles.actionButtonText}>📄 {t('exportPdf')}</Text>
            </TouchableOpacity>

            {book.isOwned && (
              <TouchableOpacity
                style={[styles.actionButton, styles.favoriteButton]}
                onPress={handleToggleFavorite}
              >
                <Text style={styles.actionButtonText}>
                  {book.is_favorite ? '⭐' : '☆'} {book.is_favorite ? t('unfavorite') : t('favorite')}
                </Text>
              </TouchableOpacity>
            )}

            {book.isOwned && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={handleEditBook}
                >
                  <Text style={styles.actionButtonText}>✏️ {t('edit')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={handleShareBook}
                >
                  <Text style={styles.actionButtonText}>🤝 {t('share')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.viewSharesButton]}
                  onPress={handleViewSharedUsers}
                >
                  <Text style={styles.actionButtonText}>👥 {t('viewShared')}</Text>
                </TouchableOpacity>

                {book.status === 'closed' ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.reopenButton]}
                    onPress={handleReopenBook}
                  >
                    <Text style={styles.actionButtonText}>🔓 {t('reopen')}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.closeButton]}
                    onPress={handleCloseBook}
                  >
                    <Text style={styles.actionButtonText}>🔒 {t('close')}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDeleteBook}
                >
                  <Text style={styles.deleteButtonText}>🗑️ {t('delete')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </CardWrapper>
      </View>

      {/* Share Book Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('shareBook')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('shareBookDesc', { bookName: book?.name || '' })}
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
                onPress={() => setShowShareModal(false)}
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
              {t('sharedWithDesc', { bookName: book?.name || '' })}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 15,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#666',
  },
  addEntryButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addEntryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2196F3',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bookTitleSection: {
    flex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookDlNo: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  updatedContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  updatedLabel: {
    fontSize: 10,
    color: '#000',
    fontWeight: '700',
  },
  updatedTime: {
    fontSize: 9,
    color: '#000',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  bookName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  fatherNameInline: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#000',
    fontStyle: 'italic',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pendingBadgeInline: {
    backgroundColor: '#FF9800',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  pendingBadgeInlineText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  loanSection: {
    backgroundColor: '#e8f5e9',
    padding: 14,
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
    fontSize: 12,
    color: '#000',
    marginBottom: 4,
    fontWeight: '600',
  },
  loanAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#000',
    marginBottom: 4,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 24,
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
    color: '#000',
    marginBottom: 4,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  addressSection: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  addressValue: {
    fontSize: 14,
    color: '#333',
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
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  viewEntriesButton: {
    backgroundColor: '#00BCD4',
  },
  exportButton: {
    backgroundColor: '#9C27B0',
  },
  favoriteButton: {
    backgroundColor: '#FFC107',
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
  viewSharesButton: {
    backgroundColor: '#9C27B0',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  deleteButtonText: {
    color: '#f44336',
    fontWeight: 'bold',
    fontSize: 13,
  },
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
});

