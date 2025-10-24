import CryptoJS from 'crypto-js';

// Secret key for encryption (in production, this should be more secure)
const SECRET_KEY = 'thavanai_secure_key_2025';

// Generate QR code data for an entry
export const generateQRCodeData = (entryData, ownerUserId) => {
  const qrData = {
    bookId: entryData.bookId,
    pageNumber: entryData.pageNumber,
    serialNo: entryData.serialNo,
    date: entryData.date,
    creditAmount: entryData.creditAmount,
    balanceAmount: entryData.balanceAmount,
    ownerId: ownerUserId,
    timestamp: new Date().toISOString(),
    location: entryData.location || null,
  };
  
  // Encrypt the data
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(qrData),
    SECRET_KEY
  ).toString();
  
  return encrypted;
};

// Verify and decrypt QR code data
export const verifyQRCodeData = (encryptedData) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      return { valid: false, error: 'Invalid QR code' };
    }
    
    const data = JSON.parse(decryptedText);
    
    // Check if QR code is not too old (e.g., valid for 24 hours)
    const qrTimestamp = new Date(data.timestamp);
    const now = new Date();
    const hoursDiff = (now - qrTimestamp) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      return { valid: false, error: 'QR code expired (older than 24 hours)' };
    }
    
    return { valid: true, data };
  } catch (error) {
    console.error('QR verification error:', error);
    return { valid: false, error: 'Failed to verify QR code' };
  }
};

// Format QR data for display
export const formatQRDataForDisplay = (data) => {
  return {
    'Entry #': data.serialNo,
    'Date': data.date,
    'Credit Amount': `₹${data.creditAmount}`,
    'Balance Amount': `₹${data.balanceAmount}`,
    'Generated At': new Date(data.timestamp).toLocaleString('en-GB'),
    'Location': data.location || 'Not captured',
  };
};

// Get location (optional - for future use)
export const getCurrentLocation = async () => {
  try {
    // This is a placeholder. In a real app, you'd use expo-location
    // For now, we'll return null
    return null;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

