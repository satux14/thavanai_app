import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLanguage } from '../utils/i18n';

export default function LanguageToggle() {
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ta' : 'en';
    changeLanguage(newLang);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={toggleLanguage}>
      <View style={styles.button}>
        <Text style={[styles.lang, language === 'en' && styles.activeLang]}>
          EN
        </Text>
        <Text style={styles.separator}>|</Text>
        <Text style={[styles.lang, language === 'ta' && styles.activeLang]}>
          த
        </Text>
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

