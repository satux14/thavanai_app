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
    share: 'Share',
    asOwner: 'Owner',
    asBorrower: 'Borrower',
    noOwnedBooks: 'No Books as Owner',
    noOwnedBooksDesc: 'Create your first book to lend money',
    noSharedBooks: 'No Shared Books',
    noSharedBooksDesc: 'No books have been shared with you yet',
    shareBook: 'Share Book',
    shareBookDesc: 'Share "{bookName}" with a borrower',
    borrowerUsername: 'Borrower Username',
    enterUsername: 'Enter borrower username',
    shareBookHint: 'The borrower can view and request signatures for this book',
    shareNow: 'Share Now',
    bookShared: 'Book shared successfully!',
    shareFailed: 'Failed to share book',
    viewShared: 'View Shared',
    sharedWith: 'Shared With',
    sharedWithDesc: 'Users who have access to "{bookName}"',
    noSharedUsers: 'This book is not shared with anyone yet',
    sharedOn: 'Shared on',
    unshare: 'Unshare',
    confirmUnshare: 'Remove access for {username}?',
    bookUnshared: 'Book access removed successfully!',
    unshareFailed: 'Failed to remove access',
    failedToLoadSharedUsers: 'Failed to load shared users',
    
    // Digital Signature System
    digitalSignature: 'Digital Signature',
    requestSignature: 'Request Signature',
    requestSignatureAgain: 'Request Signature Again',
    waitingForSignature: 'Waiting for Other Party',
    signatureRequestReceived: 'Signature Requested - Approve/Reject',
    signatureRequestedByOtherParty: 'The other party has requested your signature',
    approve: 'Approve',
    reject: 'Reject',
    pleaseSaveEntryFirst: 'Please save the entry before requesting signature',
    signatureRequested: 'Signature request sent successfully!',
    requestFailed: 'Failed to request signature',
    confirmApproveSignature: 'Approve signature request?',
    signatureApproved: 'Signature approved!',
    approveFailed: 'Failed to approve signature',
    confirmRejectSignature: 'Reject signature request?',
    signatureRejected: 'Signature request rejected',
    rejectFailed: 'Failed to reject signature',
    reqBy: 'Req. by',
    approvedBy: 'Approved by',
    pendingApproval: 'pending approval',
    cannotEditApprovedEntry: 'Cannot edit approved entries. Both parties have agreed to this transaction.',
    
    searchPlaceholder: 'Search by name, D.L.No, father name...',
    sortBy: 'Sort by:',
    latest: 'Latest',
    name: 'Name',
    amount: 'Amount',
    startDate: 'Start Date',
    showBooksFilter: 'Show:',
    activeBooks: 'Active Books',
    pendingBooks: 'Pending',
    closedBooks: 'Closed Books',
    allBooks: 'All Books',
    noBooksYet: 'No Books Yet',
    noBooksYetDesc: 'Create your first installment book to get started',
    noBooksFound: 'No Books Found',
    noBooksFoundDesc: 'No books match "{query}"',
    clearSearch: 'Clear Search',
    connectionError: 'Cannot Connect to Server',
    connectionErrorDesc: 'Unable to load books. Please check if the server is running and try again.',
    retry: 'Retry',
    createNewBook: '+ Create New Book',
    loanAmount: 'Loan Amount',
    balance: 'Balance',
    endDate: 'End Date',
    lastUpdated: 'Last Updated',
    updated: 'Updated',
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
    backgroundImage: 'Background Image',
    selectFromGallery: 'Select from Gallery',
    selectBackground: 'Select Background',
    backgroundColor: 'Background Color',
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
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    reqSign: 'Req. Sign',
    reReqSign: 'Re-req Sign',
    pendingApproval: 'Pending Approval',
    approveReject: 'Approve/Reject',
    chooseAction: 'Please choose an action:',
    addSignature: 'Add Signature',
    clearSignature: 'Clear Signature',
    cannotEditSignedEntry: 'Cannot edit signed entries',
    ownerCannotEditSigned: 'Owner cannot edit signed entries',
    editSignedWarning: 'This entry is signed. Editing will clear the signature and you will need to request a new signature. Continue?',
    continueEdit: 'Continue',
    warning: 'Warning',
    continue: 'Continue',
    creditNotChanged: 'Credit amount has not changed. Please update the credit amount to save.',
    signatureClearedRequestAgain: 'Entry saved. Signature cleared. Please request a new signature from the owner.',
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
    
    // Offline Mode
    offline_mode: 'Offline Mode',
    offline_viewing_cached: 'Viewing cached data. Connect to sync.',
    cannot_edit_offline: 'Cannot edit while offline. Please connect to the internet.',
    server_not_connected: 'Cannot connect to server. Using offline data.',
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
    share: 'பகிர்',
    asOwner: 'உரிமையாளர்',
    asBorrower: 'கடன் வாங்குபவர்',
    noOwnedBooks: 'உரிமையாளராக புத்தகங்கள் இல்லை',
    noOwnedBooksDesc: 'பணத்தை கடனாக கொடுக்க உங்கள் முதல் புத்தகத்தை உருவாக்கவும்',
    noSharedBooks: 'பகிரப்பட்ட புத்தகங்கள் இல்லை',
    noSharedBooksDesc: 'உங்களுடன் இதுவரை எந்த புத்தகங்களும் பகிரப்படவில்லை',
    shareBook: 'புத்தகத்தை பகிர்',
    shareBookDesc: '"{bookName}" ஐ கடன் வாங்குபவருடன் பகிர்',
    borrowerUsername: 'கடன் வாங்குபவர் பயனர்பெயர்',
    enterUsername: 'கடன் வாங்குபவர் பயனர்பெயரை உள்ளிடவும்',
    shareBookHint: 'கடன் வாங்குபவர் இந்த புத்தகத்தை பார்க்கலாம் மற்றும் கையொப்பம் கோரலாம்',
    shareNow: 'இப்போது பகிர்',
    bookShared: 'புத்தகம் வெற்றிகரமாக பகிரப்பட்டது!',
    shareFailed: 'புத்தகத்தை பகிர தவறிவிட்டது',
    viewShared: 'பகிரப்பட்டவர்களைக் காண்க',
    sharedWith: 'பகிரப்பட்டவர்கள்',
    sharedWithDesc: '"{bookName}" புத்தகத்திற்கான அணுகல் உள்ள பயனர்கள்',
    noSharedUsers: 'இந்த புத்தகம் இதுவரை யாருடனும் பகிரப்படவில்லை',
    sharedOn: 'பகிரப்பட்ட தேதி',
    unshare: 'பகிர்வை நீக்கு',
    confirmUnshare: '{username} இன் அணுகலை நீக்கவா?',
    bookUnshared: 'புத்தக அணுகல் வெற்றிகரமாக நீக்கப்பட்டது!',
    unshareFailed: 'அணுகலை நீக்க முடியவில்லை',
    failedToLoadSharedUsers: 'பகிரப்பட்ட பயனர்களை ஏற்ற முடியவில்லை',
    
    // Digital Signature System
    digitalSignature: 'டிஜிட்டல் கையொப்பம்',
    requestSignature: 'கையொப்பம் கோரவும்',
    requestSignatureAgain: 'மீண்டும் கையொப்பம் கோரவும்',
    waitingForSignature: 'மற்றவர் கையொப்பத்திற்கு காத்திருக்கிறது',
    signatureRequestReceived: 'கையொப்பம் கோரப்பட்டது - ஒப்புக்கொள்/நிராகரி',
    signatureRequestedByOtherParty: 'மற்றவர் உங்கள் கையொப்பத்தை கோரியுள்ளார்',
    approve: 'ஒப்புக்கொள்',
    reject: 'நிராகரி',
    pleaseSaveEntryFirst: 'கையொப்பம் கோருவதற்கு முன் பதிவை சேமிக்கவும்',
    signatureRequested: 'கையொப்பம் கோரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது!',
    requestFailed: 'கையொப்பம் கோர முடியவில்லை',
    confirmApproveSignature: 'கையொப்பம் கோரிக்கையை ஒப்புக்கொள்ளவா?',
    signatureApproved: 'கையொப்பம் ஒப்புக்கொள்ளப்பட்டது!',
    approveFailed: 'கையொப்பத்தை ஒப்புக்கொள்ள முடியவில்லை',
    confirmRejectSignature: 'கையொப்பம் கோரிக்கையை நிராகரிக்கவா?',
    signatureRejected: 'கையொப்பம் கோரிக்கை நிராகரிக்கப்பட்டது',
    rejectFailed: 'கையொப்பத்தை நிராகரிக்க முடியவில்லை',
    reqBy: 'கோரியவர்',
    approvedBy: 'ஒப்புதல் அளித்தவர்',
    pendingApproval: 'ஒப்புதல் நிலுவையில்',
    cannotEditApprovedEntry: 'ஒப்புதல் பெற்ற பதிவுகளை திருத்த முடியாது. இரு தரப்பினரும் இந்த பரிவர்த்தனையை ஒப்புக்கொண்டனர்.',
    
    searchPlaceholder: 'பெயர், D.L.எண், தந்தை பெயர் மூலம் தேடு...',
    sortBy: 'வரிசைப்படுத்து:',
    latest: 'சமீபத்திய',
    name: 'பெயர்',
    amount: 'தொகை',
    startDate: 'தொடக்க தேதி',
    showBooksFilter: 'காட்டு:',
    activeBooks: 'செயலில் உள்ள புத்தகங்கள்',
    pendingBooks: 'நிலுவையில்',
    closedBooks: 'மூடிய புத்தகங்கள்',
    allBooks: 'அனைத்து புத்தகங்கள்',
    noBooksYet: 'இன்னும் புத்தகங்கள் இல்லை',
    noBooksYetDesc: 'தொடங்க உங்கள் முதல் தவணைப் புத்தகத்தை உருவாக்கவும்',
    noBooksFound: 'புத்தகங்கள் கிடைக்கவில்லை',
    noBooksFoundDesc: '"{query}" உடன் பொருந்தும் புத்தகங்கள் இல்லை',
    clearSearch: 'தேடலை அழி',
    connectionError: 'சேவையகத்துடன் இணைக்க முடியவில்லை',
    connectionErrorDesc: 'புத்தகங்களை ஏற்ற முடியவில்லை. சேவையகம் இயங்குகிறதா என சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    retry: 'மீண்டும் முயற்சி',
    createNewBook: '+ புதிய புத்தகத்தை உருவாக்கு',
    loanAmount: 'கடன் தொகை',
    balance: 'மீதம்',
    endDate: 'முடிவு தேதி',
    lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
    updated: 'புதுப்பிப்பு',
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
    backgroundImage: 'பின்னணி படம்',
    selectFromGallery: 'கேலரியிலிருந்து தேர்ந்தெடு',
    selectBackground: 'பின்னணியைத் தேர்ந்தெடு',
    backgroundColor: 'பின்னணி நிறம்',
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
    pending: 'நிலுவையில்',
    approved: 'ஒப்புக்கொள்ளப்பட்டது',
    rejected: 'நிராகரிக்கப்பட்டது',
    reqSign: 'கையொப்பம் கேள்',
    reReqSign: 'மீண்டும் கையொப்பம் கேள்',
    pendingApproval: 'ஒப்புதல் நிலுவையில்',
    approveReject: 'ஒப்புக்கொள் / நிராகரி',
    chooseAction: 'செயலைத் தேர்ந்தெடுங்கள்:',
    addSignature: 'கையொப்பம் சேர்',
    clearSignature: 'கையொப்பத்தை அழி',
    cannotEditSignedEntry: 'கையொப்பமிடப்பட்ட பதிவுகளை திருத்த முடியாது',
    ownerCannotEditSigned: 'உரிமையாளர் கையொப்பமிடப்பட்ட பதிவுகளை திருத்த முடியாது',
    editSignedWarning: 'இந்த பதிவு கையொப்பமிடப்பட்டது. திருத்தினால் கையொப்பம் அழிக்கப்படும், உரிமையாளரிடம் புதிய கையொப்பம் கோர வேண்டும். தொடரவா?',
    continueEdit: 'தொடர்க',
    warning: 'எச்சரிக்கை',
    continue: 'தொடர்',
    creditNotChanged: 'கடன் தொகை மாறவில்லை. சேமிக்க கடன் தொகையை புதுப்பிக்கவும்.',
    signatureClearedRequestAgain: 'பதிவு சேமிக்கப்பட்டது. கையொப்பம் அழிக்கப்பட்டது. உரிமையாளரிடம் புதிய கையொப்பம் கோரவும்.',
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
    
    // Offline Mode
    offline_mode: 'ஆஃப்லைன் முறை',
    offline_viewing_cached: 'சேமித்த தரவைப் பார்க்கிறீர்கள். ஒத்திசைக்க இணைக்கவும்.',
    cannot_edit_offline: 'ஆஃப்லைனில் திருத்த முடியாது. இணையத்துடன் இணைக்கவும்.',
    server_not_connected: 'சேவையகத்துடன் இணைக்க முடியவில்லை. ஆஃப்லைன் தரவைப் பயன்படுத்துகிறது.',
  },
};

// Language Context with default values
const LanguageContext = createContext({
  language: 'en',
  changeLanguage: () => {},
  setLanguage: () => {},
  t: (key) => key,
  isLoading: false,
});

export const LanguageProvider = ({ children }) => {
  console.log('=== LanguageProvider INITIALIZING ===');
  const [language, setLanguage] = useState('en'); // Default to English
  const [isLoading, setIsLoading] = useState(true);
  console.log('LanguageProvider initial state - language:', language, 'isLoading:', isLoading);

  useEffect(() => {
    console.log('LanguageProvider useEffect triggered');
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      console.log('Loading language from AsyncStorage...');
      const savedLang = await AsyncStorage.getItem('app_language');
      console.log('Saved language:', savedLang, '| Type:', typeof savedLang);
      
      if (savedLang && (savedLang === 'en' || savedLang === 'ta')) {
        console.log('Setting language to:', savedLang);
        setLanguage(savedLang);
      }
      
      console.log('Setting isLoading to false');
      setIsLoading(false);
      console.log('Language loading complete');
    } catch (error) {
      console.error('=== ERROR loading language ===');
      console.error('Error:', error);
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
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      setLanguage, 
      t, 
      isLoading: Boolean(isLoading) 
    }}>
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
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    return 'N/A';
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

