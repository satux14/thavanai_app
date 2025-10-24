/**
 * Internationalization (i18n) system
 * Supports multiple languages with easy extension
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translations
const translations = {
  en: {
    // App Name
    appNameTamil: 'Daily Installment Book',
    appNameEnglish: 'Daily Installment Book',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    close: 'Close',
    reopen: 'Reopen',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    confirm: 'Confirm',
    
    // Login
    login: 'Login',
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    loggingIn: 'Logging in...',
    dontHaveAccount: "Don't have an account?",
    registerHere: 'Register here',
    secureDigitalLending: 'Secure Digital Lending',
    
    // Register
    register: 'Register',
    newAccount: 'New Account',
    createNewAccount: 'Create New Account',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    createAccount: 'Create Account',
    creatingAccount: 'Creating Account...',
    alreadyHaveAccount: 'Already have an account?',
    loginHere: 'Login here',
    minChars: 'Min {count} characters',
    usernameLowercase: 'lowercase only',
    preferredLanguage: 'Preferred Language',
    selectLanguage: 'Select your preferred language',
    languageEnglish: 'English',
    languageTamil: 'தமிழ் (Tamil)',
    
    // Dashboard (now Homepage)
    homepage: 'Homepage',
    welcome: 'Welcome',
    logout: 'Logout',
    booksCount: '{filtered} of {total} Book(s)',
    myBooks: 'My Books',
    sharedWithMe: 'Shared with Me',
    shared: 'Shared',
    searchPlaceholder: 'Search by name, D.L.No, father name...',
    sortBy: 'Sort by:',
    latest: 'Latest',
    name: 'Name',
    amount: 'Amount',
    startDate: 'Start Date',
    showBooksFilter: 'Show:',
    activeBooks: 'Active Books',
    closedBooks: 'Closed Books',
    allBooks: 'All Books',
    noBooksYet: 'No Books Yet',
    noBooksYetDesc: 'Create your first installment book to get started',
    noBooksFound: 'No Books Found',
    noBooksFoundDesc: 'No books match "{query}"',
    clearSearch: 'Clear Search',
    createNewBook: '+ Create New Book',
    loanAmount: 'Loan Amount',
    balance: 'Balance',
    endDate: 'End Date',
    lastUpdated: 'Last Updated',
    closed: 'CLOSED',
    exportPdf: 'PDF Download',
    editInfo: 'Edit',
    closeBook: 'Close',
    reopenBook: 'Reopen',
    deleteBook: 'Delete',
    backToDashboard: '← Homepage',
    
    // Book Info
    dlNo: 'D.L.No.',
    borrowerName: 'Name',
    fatherName: "Father Name",
    address: 'Address',
    loanAmountRs: 'Loan Amount Rs.',
    backgroundColor: 'Background Color',
    backgroundImage: 'Background Image',
    imageSelected: 'Image Selected',
    clearImage: 'Clear',
    imageUploadWebOnly: 'Image upload (web only for now)',
    createBook: 'Create Book',
    updateBook: 'Update Book',
    
    // Entries
    dailyEntries: 'Daily Entries',
    prev: '← Prev',
    next: 'Next →',
    pageOf: 'Page {current} of {total}',
    serialNo: 'S.No',
    date: 'Date',
    creditRs: 'Credit Rs.',
    balanceRs: 'Balance Rs.',
    signature: 'Signature',
    addNewPage: '+ Add New Page',
    updateEntry: 'Update Entry',
    fillDate: 'Fill Date',
    signed: 'Signed',
    notSigned: 'Not Signed',
    addSignature: 'Add Signature',
    clearSignature: 'Clear Signature',
    editEntry: 'Edit Entry',
    save: 'Save',
    cancel: 'Cancel',
    
    // Features
    secureAuth: 'Secure Authentication',
    qrVerification: 'QR Code Verification',
    trackPayments: 'Track Payments',
    
    // Alerts & Messages
    fillAllFields: 'Please fill in all fields',
    fillNameAndAmount: 'Please fill in Name and Loan Amount at minimum',
    bookUpdated: 'Book information updated successfully',
    bookCreated: 'Book created successfully',
    bookClosed: 'Book closed successfully',
    bookReopened: 'Book reopened successfully',
    bookDeleted: 'Book deleted successfully',
    confirmCloseBook: 'Are you sure you want to close "{name}"? This will hide it from the active books list.',
    confirmReopenBook: 'Reopen "{name}"?',
    confirmDeleteBook: 'Are you sure you want to permanently delete "{name}"? This action cannot be undone.',
    confirmLogout: 'Are you sure you want to logout?',
    pageAdded: 'Page {page} added! You can now add entries.',
    fillDateField: 'Please fill in the date',
    entrySaved: 'Entry saved successfully',
    entryFailed: 'Failed to save entry',
    pdfExported: 'PDF exported successfully!',
    pdfFailed: 'Failed to export PDF',
    invalidCredentials: 'Invalid username or password',
    usernameTooShort: 'Username must be at least 3 characters',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordsDontMatch: 'Passwords do not match',
    accountCreated: 'Account created! Please login.',
    registrationFailed: 'Registration Failed',
  },
  ta: {
    // App Name
    appNameTamil: 'தினத்தவணைப் புத்தகம்',
    appNameEnglish: 'Daily Installment Book',
    
    // Common
    save: 'சேமி',
    cancel: 'ரத்து',
    edit: 'திருத்து',
    delete: 'அழி',
    close: 'மூடு',
    reopen: 'மீண்டும் திற',
    loading: 'ஏற்றுகிறது...',
    success: 'வெற்றி',
    error: 'பிழை',
    confirm: 'உறுதிப்படுத்து',
    
    // Login
    login: 'உள்நுழை',
    username: 'பயனர்பெயர்',
    password: 'கடவுச்சொல்',
    loginButton: 'உள்நுழை',
    loggingIn: 'உள்நுழைகிறது...',
    dontHaveAccount: 'கணக்கு இல்லையா?',
    registerHere: 'இங்கே பதிவு செய்க',
    secureDigitalLending: 'பாதுகாப்பான டிஜிட்டல் கடன்',
    
    // Register
    register: 'பதிவு',
    createNewAccount: 'புதிய கணக்கு',
    fullName: 'முழு பெயர்',
    confirmPassword: 'கடவுச்சொல் உறுதி',
    createAccount: 'கணக்கை உருவாக்கு',
    creatingAccount: 'கணக்கை உருவாக்குகிறது...',
    alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    loginHere: 'இங்கே உள்நுழைக',
    minChars: 'குறைந்தபட்சம் {count} எழுத்துகள்',
    usernameLowercase: 'சிறிய எழுத்துகள் மட்டும்',
    preferredLanguage: 'விருப்ப மொழி',
    selectLanguage: 'உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்',
    languageEnglish: 'English',
    languageTamil: 'தமிழ் (Tamil)',
    
    // Dashboard (now Homepage)
    homepage: 'முதன்மை பக்கம்',
    welcome: 'வருக',
    logout: 'வெளியேறு',
    booksCount: '{total} இல் {filtered} புத்தகம்',
    myBooks: 'எனது புத்தகங்கள்',
    sharedWithMe: 'என்னுடன் பகிரப்பட்டவை',
    shared: 'பகிரப்பட்டது',
    searchPlaceholder: 'பெயர், D.L.எண், தந்தை பெயர் மூலம் தேடு...',
    sortBy: 'வரிசைப்படுத்து:',
    latest: 'சமீபத்திய',
    name: 'பெயர்',
    amount: 'தொகை',
    startDate: 'தொடக்க தேதி',
    showBooksFilter: 'காட்டு:',
    activeBooks: 'செயலில் உள்ள புத்தகங்கள்',
    closedBooks: 'மூடிய புத்தகங்கள்',
    allBooks: 'அனைத்து புத்தகங்கள்',
    noBooksYet: 'இன்னும் புத்தகங்கள் இல்லை',
    noBooksYetDesc: 'தொடங்க உங்கள் முதல் தவணைப் புத்தகத்தை உருவாக்கவும்',
    noBooksFound: 'புத்தகங்கள் கிடைக்கவில்லை',
    noBooksFoundDesc: '"{query}" உடன் பொருந்தும் புத்தகங்கள் இல்லை',
    clearSearch: 'தேடலை அழி',
    createNewBook: '+ புதிய புத்தகத்தை உருவாக்கு',
    loanAmount: 'கடன் தொகை',
    balance: 'மீதம்',
    endDate: 'முடிவு தேதி',
    lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
    closed: 'மூடப்பட்டது',
    exportPdf: 'PDF பதிவிறக்கவும்',
    editInfo: 'திருத்து',
    closeBook: 'மூடு',
    reopenBook: 'திற',
    deleteBook: 'அழி',
    backToDashboard: '← முதன்மை பக்கம்',
    
    // Book Info
    dlNo: 'D.L.எண்.',
    borrowerName: 'பெயர்',
    fatherName: 'தந்தை பெயர்',
    address: 'முகவரி',
    loanAmountRs: 'கடன் தொகை ரூ.',
    backgroundColor: 'பின்னணி நிறம்',
    backgroundImage: 'பின்னணி படம்',
    imageSelected: '✓ படம் தேர்ந்தெடுக்கப்பட்டது',
    clearImage: 'அழி',
    imageUploadWebOnly: 'படப் பதிவேற்றம் (இப்போது வெப் மட்டும்)',
    createBook: 'புத்தகத்தை உருவாக்கு',
    updateBook: 'புத்தகத்தை புதுப்பி',
    
    // Entries
    dailyEntries: 'தினசரி பதிவுகள்',
    prev: '← முன்',
    next: 'அடுத்து →',
    pageOf: 'பக்கம் {current} / {total}',
    serialNo: 'வ.எண்',
    date: 'தேதி',
    creditRs: 'பெற்ற ரூ.',
    balanceRs: 'மீதம் ரூ.',
    signature: 'கையொப்பம்',
    addNewPage: '+ புதிய பக்கம் சேர்',
    updateEntry: 'பதிவை புதுப்பி',
    fillDate: 'தேதி நிரப்பு',
    signed: 'கையொப்பமிடப்பட்டது',
    notSigned: 'கையொப்பமிடப்படவில்லை',
    addSignature: 'கையொப்பம் சேர்',
    clearSignature: 'கையொப்பத்தை அழி',
    editEntry: 'பதிவை திருத்து',
    save: 'சேமி',
    cancel: 'ரத்து',
    
    // Features
    secureAuth: 'பாதுகாப்பான அங்கீகாரம்',
    qrVerification: 'QR குறியீடு சரிபார்ப்பு',
    trackPayments: 'செலுத்துதல் கண்காணிப்பு',
    
    // Alerts & Messages
    fillAllFields: 'அனைத்து புலங்களையும் நிரப்பவும்',
    fillNameAndAmount: 'குறைந்தபட்சம் பெயர் மற்றும் கடன் தொகையை நிரப்பவும்',
    bookUpdated: 'புத்தக தகவல் வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
    bookCreated: 'புத்தகம் வெற்றிகரமாக உருவாக்கப்பட்டது',
    bookClosed: 'புத்தகம் வெற்றிகரமாக மூடப்பட்டது',
    bookReopened: 'புத்தகம் வெற்றிகரமாக திறக்கப்பட்டது',
    bookDeleted: 'புத்தகம் வெற்றிகரமாக அழிக்கப்பட்டது',
    confirmCloseBook: '"{name}" ஐ மூட விரும்புகிறீர்களா? இது செயலில் உள்ள புத்தகப் பட்டியலில் இருந்து மறைக்கப்படும்.',
    confirmReopenBook: '"{name}" ஐ மீண்டும் திறக்கவா?',
    confirmDeleteBook: '"{name}" ஐ நிரந்தரமாக அழிக்க விரும்புகிறீர்களா? இந்தச் செயலை மீட்டமுடியாது.',
    confirmLogout: 'நிச்சயமாக வெளியேற விரும்புகிறீர்களா?',
    pageAdded: 'பக்கம் {page} சேர்க்கப்பட்டது! இப்போது பதிவுகளைச் சேர்க்கலாம்.',
    fillDateField: 'தயவுசெய்து தேதியை நிரப்பவும்',
    entrySaved: 'பதிவு வெற்றிகரமாக சேமிக்கப்பட்டது',
    entryFailed: 'பதிவு சேமிக்க தோல்வியுற்றது',
    pdfExported: 'PDF வெற்றிகரமாக ஏற்றுமதி செய்யப்பட்டது!',
    pdfFailed: 'PDF ஏற்றுமதி தோல்வியுற்றது',
    invalidCredentials: 'தவறான பயனர்பெயர் அல்லது கடவுச்சொல்',
    usernameTooShort: 'பயனர்பெயர் குறைந்தது 3 எழுத்துகளாக இருக்க வேண்டும்',
    passwordTooShort: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகளாக இருக்க வேண்டும்',
    passwordsDontMatch: 'கடவுச்சொற்கள் பொருந்தவில்லை',
    accountCreated: 'கணக்கு உருவாக்கப்பட்டது! தயவுசெய்து உள்நுழையவும்.',
    registrationFailed: 'பதிவு தோல்வியுற்றது',
  },
};

// Language Context
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default to English
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('app_language');
      if (savedLang && (savedLang === 'en' || savedLang === 'ta')) {
        setLanguage(savedLang);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLang) => {
    try {
      await AsyncStorage.setItem('app_language', newLang);
      setLanguage(newLang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key;
    
    // Replace parameters
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper function to format date as dd-mm-yyyy
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    return dateString;
  }
};

// Helper function to convert dd-mm-yyyy back to yyyy-mm-dd for storage
export const parseDate = (ddmmyyyy) => {
  if (!ddmmyyyy) return '';
  
  try {
    const parts = ddmmyyyy.split('-');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return ddmmyyyy;
  } catch (error) {
    return ddmmyyyy;
  }
};

