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
  Image,
  Modal,
} from 'react-native';
import { saveBook, getBook, updateBook } from '../utils/storage';
import DatePicker from '../components/DatePicker';
import { useLanguage } from '../utils/i18n';
import { BACKGROUND_IMAGES, getDefaultBackgroundImage } from '../utils/backgroundImages';

export default function BookInfoScreen({ navigation, route }) {
  const { t, language } = useLanguage();
  const { bookId } = route.params || {};
  const [bookInfo, setBookInfo] = useState({
    dlNo: '',
    name: '',
    fatherName: '',
    address: '',
    loanAmount: '',
    startDate: '',
    endDate: '',
    backgroundColor: '#2196F3',
    backgroundImage: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('nature');

  // Auto-calculate end date when start date changes
  const handleStartDateChange = (date) => {
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 100);
      
      // Format as YYYY-MM-DD
      const formattedEndDate = endDate.toISOString().split('T')[0];
      setBookInfo(prev => ({ ...prev, startDate: date, endDate: formattedEndDate }));
    } else {
      setBookInfo({ ...bookInfo, startDate: date });
    }
  };

  useEffect(() => {
    if (bookId) {
      loadBookInfo();
    } else {
      // Set default background image for new books
      const defaultImage = getDefaultBackgroundImage();
      setBookInfo(prev => ({ ...prev, backgroundImage: defaultImage.uri }));
    }
  }, [bookId]);

  // Update navigation header when language changes
  useEffect(() => {
    navigation.setOptions({
      title: t('appNameTamil'),
    });
  }, [t, navigation]);

  const loadBookInfo = async () => {
    const book = await getBook(bookId);
    if (book) {
      setBookInfo(book);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!bookInfo.name || !bookInfo.loanAmount) {
      if (Platform.OS === 'web') {
        alert('Please fill in Name and Loan Amount at minimum');
      } else {
        Alert.alert('Error', 'Please fill in Name and Loan Amount at minimum');
      }
      return;
    }

    if (isEditing && bookId) {
      // Update existing book
      try {
        console.log('Updating book with data:', {
          bookId,
          name: bookInfo.name,
          startDate: bookInfo.startDate,
          endDate: bookInfo.endDate,
          loanAmount: bookInfo.loanAmount
        });
        await updateBook(bookId, bookInfo);
        console.log('Book updated successfully');
        if (Platform.OS === 'web') {
          alert('Book information updated successfully');
          navigation.goBack();
        } else {
          Alert.alert('Success', 'Book information updated successfully', [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]);
        }
      } catch (error) {
        console.error('Error updating book:', error);
        if (Platform.OS === 'web') {
          alert('Failed to update book information: ' + error.message);
        } else {
          Alert.alert('Error', 'Failed to update book information');
        }
      }
    } else {
      // Create new book
      const newBook = await saveBook(bookInfo);
      console.log('New book created:', newBook);
      if (newBook && newBook.id) {
        // Navigate directly to entries page
        navigation.replace('Entries', { bookId: newBook.id });
      } else {
        Alert.alert('Error', 'Failed to create book');
      }
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSelectImage = (image) => {
    if (image.uri) {
      // Nature or pets image
      setBookInfo({ ...bookInfo, backgroundImage: image.uri });
    } else if (image.color) {
      // Pattern (just a color)
      setBookInfo({ ...bookInfo, backgroundColor: image.color, backgroundImage: null });
    }
    setShowImageGallery(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Title at Top */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleTamil}>தினத்தவணைப் புத்தகம்</Text>
          {language === 'en' && (
            <Text style={styles.titleEnglish}>Daily Installment Book</Text>
          )}
        </View>

        {/* D.L.No. below title */}
        <View style={styles.dlNoContainer}>
          <Text style={styles.dlNoLabel}>D.L.No.</Text>
          <TextInput
            style={styles.dlNoInput}
            value={bookInfo.dlNo}
            onChangeText={(text) => setBookInfo({ ...bookInfo, dlNo: text })}
            placeholder="Enter DL Number"
          />
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>பெயர். (Name) *</Text>
            <TextInput
              style={styles.input}
              value={bookInfo.name}
              onChangeText={(text) => setBookInfo({ ...bookInfo, name: text })}
              placeholder="Enter name"
            />
          </View>

          {/* Father Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>தந்தை பெயர். (Father Name)</Text>
            <TextInput
              style={styles.input}
              value={bookInfo.fatherName}
              onChangeText={(text) => setBookInfo({ ...bookInfo, fatherName: text })}
              placeholder="Enter father name"
            />
          </View>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>முகவரி (Address)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={bookInfo.address}
              onChangeText={(text) => setBookInfo({ ...bookInfo, address: text })}
              placeholder="Enter address"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Loan Amount */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>கடன் தொகை ரூ. (Loan Amount Rs.) *</Text>
            <TextInput
              style={styles.input}
              value={bookInfo.loanAmount}
              onChangeText={(text) => setBookInfo({ ...bookInfo, loanAmount: text })}
              placeholder="Enter loan amount"
              keyboardType="numeric"
            />
          </View>

          {/* Start Date */}
          <DatePicker
            label="ஆரம்ப தேதி (Start Date)"
            value={bookInfo.startDate}
            onChange={handleStartDateChange}
          />

          {/* End Date */}
          <DatePicker
            label="முடிவு தேதி (End Date)"
            value={bookInfo.endDate}
            onChange={(date) => setBookInfo({ ...bookInfo, endDate: date })}
          />

          {/* Background Color */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>பின்னணி நிறம் (Background Color)</Text>
            <View style={styles.colorPickerContainer}>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: bookInfo.backgroundColor },
                ]}
              />
              <TextInput
                style={styles.colorInput}
                value={bookInfo.backgroundColor}
                onChangeText={(color) => setBookInfo({ ...bookInfo, backgroundColor: color })}
                placeholder="#2196F3"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.colorPaletteContainer}>
              {['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#FFC107', '#E91E63'].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }]}
                  onPress={() => setBookInfo({ ...bookInfo, backgroundColor: color })}
                />
              ))}
            </View>
          </View>

          {/* Background Image */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('backgroundImage')}</Text>
            
            {/* Gallery Button */}
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => setShowImageGallery(true)}
            >
              <Text style={styles.galleryButtonText}>🖼️ {t('selectFromGallery')}</Text>
            </TouchableOpacity>

            {bookInfo.backgroundImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: bookInfo.backgroundImage }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.clearImageButton}
                  onPress={() => setBookInfo({ ...bookInfo, backgroundImage: null })}
                >
                  <Text style={styles.clearImageText}>{t('clear')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageUploadContainer}>
                {Platform.OS === 'web' ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setBookInfo({ ...bookInfo, backgroundImage: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      padding: 10,
                      borderWidth: 2,
                      borderColor: '#2196F3',
                      borderRadius: 8,
                      borderStyle: 'dashed',
                    }}
                  />
                ) : (
                  <Text style={styles.uploadPlaceholder}>Image upload (web only for now)</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>
              {isEditing ? 'Update Book' : 'Create Book'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Background Image Gallery Modal */}
      <Modal
        visible={showImageGallery}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageGallery(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectBackground')}</Text>
              <TouchableOpacity onPress={() => setShowImageGallery(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Category Tabs */}
            <View style={styles.categoryTabs}>
              {['nature', 'pets', 'gods', 'patterns'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryTab,
                    selectedCategory === category && styles.categoryTabActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      selectedCategory === category && styles.categoryTabTextActive,
                    ]}
                  >
                    {category === 'nature' 
                      ? '🌿 Nature' 
                      : category === 'pets' 
                      ? '🐾 Pets' 
                      : category === 'gods'
                      ? '🙏 Gods'
                      : '🎨 Colors'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Image Grid */}
            <ScrollView style={styles.imageGrid}>
              <View style={styles.imageGridContent}>
                {BACKGROUND_IMAGES[selectedCategory]?.map((image) => (
                  <TouchableOpacity
                    key={image.id}
                    style={styles.imageOption}
                    onPress={() => handleSelectImage(image)}
                  >
                    {image.uri ? (
                      <Image
                        source={{ uri: image.thumbnail || image.uri }}
                        style={styles.imageOptionPreview}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.imageOptionPreview,
                          { backgroundColor: image.color },
                        ]}
                      />
                    )}
                    <Text style={styles.imageOptionName}>{image.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
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
    padding: 20,
  },
  titleContainer: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#e91e63',
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  titleTamil: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  titleEnglish: {
    fontSize: 16,
    color: '#666',
  },
  dlNoContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  dlNoLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  dlNoInput: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#e91e63',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginBottom: 20,
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
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#e91e63',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: '#e91e63',
    borderRadius: 4,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
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
  colorPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  colorInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e91e63',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  colorPaletteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
  },
  imagePreviewText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearImageButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  clearImageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageUploadContainer: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  uploadPlaceholder: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  galleryButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  galleryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: 'bold',
  },
  categoryTabs: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryTab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 3,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryTabActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  imageGrid: {
    flex: 1,
  },
  imageGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 15,
  },
  imageOption: {
    width: '30%',
    minWidth: 120,
    marginBottom: 15,
    alignItems: 'center',
  },
  imageOptionPreview: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  imageOptionName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
