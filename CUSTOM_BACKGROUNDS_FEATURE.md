# Custom Book Backgrounds Feature

## Overview
Users can now customize the appearance of each book in the dashboard by selecting a background color or uploading a background image.

## Features

### 1. **Background Color Selection**
- 8 preset colors to choose from (Blue, Green, Orange, Purple, Red, Cyan, Yellow, Pink)
- Custom hex color input (#RRGGBB format)
- Real-time color preview
- Default color: `#2196F3` (Blue)

### 2. **Background Image Upload**
- Upload any image file (JPG, PNG, GIF, etc.)
- Image is stored as base64 data URL
- Semi-transparent white overlay for text readability
- Web platform only (for now)

---

## How It Works

### Database Schema Updates

**Books now have two new fields:**
```javascript
{
  ...otherFields,
  backgroundColor: '#2196F3',     // Hex color code
  backgroundImage: 'data:image/png;base64,...' || null  // Base64 image or null
}
```

### UI Components Updated

#### 1. **BookInfoScreen** (`src/screens/BookInfoScreen.js`)
Added two new form sections:

**Color Picker:**
- Color preview square
- Text input for hex codes
- 8 color palette buttons for quick selection

**Image Upload:**
- File input (web only)
- "Image Selected" indicator when uploaded
- "Clear" button to remove image

#### 2. **DashboardScreen** (`src/screens/DashboardScreen.js`)
Books now render with custom backgrounds:

- Uses `ImageBackground` component if image is set
- Falls back to `View` with `backgroundColor` if no image
- Semi-transparent overlay (`rgba(255, 255, 255, 0.85)`) for readability
- All content has `zIndex: 1` to appear above the overlay

---

## Usage Instructions

### Setting a Background Color

1. Create or edit a book
2. Scroll to "பின்னணி நிறம் (Background Color)"
3. Either:
   - Click one of the 8 preset color squares
   - Or type a hex color code (e.g., `#FF5722`)
4. See the color preview update in real-time
5. Save the book

### Uploading a Background Image

1. Create or edit a book
2. Scroll to "பின்னணி படம் (Background Image)"
3. Click "Choose File" (web only)
4. Select an image from your computer
5. See "✓ Image Selected" confirmation
6. Save the book

### Removing a Background Image

1. Edit the book
2. Scroll to "பின்னணி படம் (Background Image)"
3. Click the red "Clear" button
4. Save the book

---

## Technical Implementation

### Color Picker UI
```javascript
<View style={styles.colorPickerContainer}>
  <View
    style={[
      styles.colorPreview,
      { backgroundColor: bookInfo.backgroundColor },
    ]}
  />
  <TextInput
    value={bookInfo.backgroundColor}
    onChangeText={(color) => setBookInfo({ ...bookInfo, backgroundColor: color })}
    placeholder="#2196F3"
  />
</View>

<View style={styles.colorPaletteContainer}>
  {['#2196F3', '#4CAF50', '#FF9800', ...].map((color) => (
    <TouchableOpacity
      style={[styles.colorOption, { backgroundColor: color }]}
      onPress={() => setBookInfo({ ...bookInfo, backgroundColor: color })}
    />
  ))}
</View>
```

### Image Upload (Web)
```javascript
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
/>
```

### Dashboard Rendering
```javascript
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

<TouchableOpacity onPress={() => handleOpenBook(book)}>
  <CardWrapper {...cardWrapperProps}>
    {book.backgroundImage && <View style={styles.imageOverlay} />}
    {/* Book content with zIndex: 1 */}
  </CardWrapper>
</TouchableOpacity>
```

---

## Preset Color Palette

| Color Name | Hex Code | Preview |
|------------|----------|---------|
| Blue | `#2196F3` | 🔵 |
| Green | `#4CAF50` | 🟢 |
| Orange | `#FF9800` | 🟠 |
| Purple | `#9C27B0` | 🟣 |
| Red | `#F44336` | 🔴 |
| Cyan | `#00BCD4` | 🔵 |
| Yellow | `#FFC107` | 🟡 |
| Pink | `#E91E63` | 🟣 |

---

## Storage Details

### Background Color Storage
- Stored as plain hex string: `"#2196F3"`
- Default value: `"#2196F3"`
- Persisted in `thavanai_books` AsyncStorage key

### Background Image Storage
- Stored as base64 Data URL: `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."`
- Can be quite large (50KB-500KB depending on image)
- Stored in same `thavanai_books` AsyncStorage key
- Set to `null` when no image

---

## Platform Compatibility

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| Color Picker | ✅ | ✅ | ✅ |
| Preset Colors | ✅ | ✅ | ✅ |
| Hex Input | ✅ | ✅ | ✅ |
| Image Upload | ✅ | 🚧 Not yet | 🚧 Not yet |
| Image Display | ✅ | ✅ | ✅ |

**Note:** Image upload on native platforms would require:
- `expo-image-picker` for iOS/Android
- File size limits to prevent storage issues
- Image compression

---

## Styling Classes Added

```javascript
// BookInfoScreen styles
colorPickerContainer: { flexDirection: 'row', gap: 10 }
colorPreview: { width: 50, height: 50, borderRadius: 8 }
colorInput: { flex: 1, borderWidth: 1, padding: 10 }
colorPaletteContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }
colorOption: { width: 40, height: 40, borderRadius: 8 }
imagePreviewContainer: { backgroundColor: '#e8f5e9', padding: 15 }
clearImageButton: { backgroundColor: '#f44336', padding: 8 }
imageUploadContainer: { borderStyle: 'dashed', padding: 15 }

// DashboardScreen styles
imageOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  zIndex: 0,
}
bookCard: {
  ...existingStyles,
  overflow: 'hidden',  // Clips image to card border
  position: 'relative',  // For absolute overlay
}
```

---

## Best Practices

### 1. **Image Size**
- Use compressed images to save storage space
- Recommended: < 200KB per image
- Consider implementing image compression in future

### 2. **Color Contrast**
- Choose colors that don't make text hard to read
- The semi-transparent overlay helps maintain readability with images
- Default colors are tested for good contrast

### 3. **Performance**
- Base64 images are stored in memory
- Large images can slow down the dashboard
- Consider lazy loading for many books with images

---

## Future Enhancements

🚀 **Potential Improvements:**
1. Native image picker support (iOS/Android)
2. Image compression before saving
3. Gradient backgrounds
4. Pattern backgrounds
5. Color themes (light/dark mode)
6. Book categories with auto-colors
7. Export/import book designs
8. Preview before saving

---

## Testing Checklist

### ✅ Color Picker
- [ ] Click each preset color → Book card updates in dashboard
- [ ] Type custom hex code → Preview square updates
- [ ] Invalid hex code → Falls back to default
- [ ] Edit book → Color persists correctly

### ✅ Image Upload (Web)
- [ ] Upload JPG → Image shows in dashboard
- [ ] Upload PNG → Image shows with transparency
- [ ] Upload large image → Loads correctly
- [ ] Clear image → Reverts to color only
- [ ] Edit book → Image persists correctly

### ✅ Dashboard Display
- [ ] Books with different colors display correctly
- [ ] Books with images display with overlay
- [ ] Text is readable over images
- [ ] All buttons work correctly
- [ ] Scrolling is smooth

---

## Example Usage

```javascript
// Create a book with custom background
const bookData = {
  name: 'John Doe',
  dlNo: 'DL123',
  loanAmount: 10000,
  // ... other fields
  backgroundColor: '#4CAF50',  // Green
  backgroundImage: null,
};

// Or with an image
const bookDataWithImage = {
  // ... other fields
  backgroundColor: '#2196F3',  // Fallback color
  backgroundImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
};
```

---

## Troubleshooting

**Problem:** Color doesn't apply
- Check if hex code is valid (starts with #, 6 characters)
- Try using a preset color first
- Ensure book is saved after selecting color

**Problem:** Image doesn't upload
- Check if using web platform
- Try smaller image (< 1MB)
- Check browser console for errors
- Ensure file is an image format

**Problem:** Image makes text unreadable
- The overlay should help, but try adjusting in code:
  ```javascript
  backgroundColor: 'rgba(255, 255, 255, 0.90)'  // More opaque
  ```

---

## Code Files Modified

1. **`src/utils/storage.js`**
   - Added `backgroundColor` and `backgroundImage` to `saveBook()`
   - Added `backgroundColor` and `backgroundImage` to `updateBook()`

2. **`src/screens/BookInfoScreen.js`**
   - Added color picker UI
   - Added image upload UI
   - Added state management for both
   - Added ~70 lines of styling

3. **`src/screens/DashboardScreen.js`**
   - Import `ImageBackground` component
   - Dynamic CardWrapper (View vs ImageBackground)
   - Apply custom backgrounds to book cards
   - Add overlay for images
   - Update all sections with zIndex

---

## Storage API Updates

```javascript
// saveBook() - Now accepts backgroundColor and backgroundImage
const newBook = {
  // ... existing fields
  backgroundColor: bookData.backgroundColor || '#2196F3',
  backgroundImage: bookData.backgroundImage || null,
};

// updateBook() - Preserves or updates background fields
books[bookIndex] = {
  ...books[bookIndex],
  // ... other updates
  backgroundColor: bookData.backgroundColor || books[bookIndex].backgroundColor || '#2196F3',
  backgroundImage: bookData.backgroundImage !== undefined 
    ? bookData.backgroundImage 
    : books[bookIndex].backgroundImage,
};
```

---

This feature adds visual customization to make each book unique and easily identifiable at a glance! 🎨✨

