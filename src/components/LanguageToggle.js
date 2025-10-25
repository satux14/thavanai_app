import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLanguage } from '../utils/i18n';

export default function LanguageToggle() {
  console.log('=== LanguageToggle RENDERING ===');
  const { language, changeLanguage } = useLanguage();
  console.log('LanguageToggle: current language:', language, 'Type:', typeof language);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ta' : 'en';
    changeLanguage(newLang);
  };

  console.log('LanguageToggle: About to render with language:', language);
  return (
    <TouchableOpacity style={styles.container} onPress={toggleLanguage}>
      <View style={styles.button}>
        {console.log('LanguageToggle: Rendering EN text, isActive:', language === 'en')}
        <Text style={language === 'en' ? [styles.lang, styles.activeLang] : styles.lang}>
          EN
        </Text>
        <Text style={styles.separator}>|</Text>
        {console.log('LanguageToggle: Rendering TA text, isActive:', language === 'ta')}
        <Text style={language === 'ta' ? [styles.lang, styles.activeLang] : styles.lang}>
          த
        </Text>
        {console.log('✅ LanguageToggle rendered successfully!')}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  lang: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  activeLang: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 6,
    fontSize: 12,
  },
});

