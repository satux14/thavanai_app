import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { registerUser, loginUser } from '../utils/auth';
import { useLanguage } from '../utils/i18n';

export default function RegisterScreen({ navigation }) {
  const { t, setLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: 'en', // Default to English
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.username || !formData.fullName || !formData.password) {
      const message = 'Please fill in all fields';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    if (formData.username.length < 3) {
      const message = 'Username must be at least 3 characters';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    if (formData.password.length < 6) {
      const message = 'Password must be at least 6 characters';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const message = 'Passwords do not match';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    setLoading(true);
    
    const result = await registerUser(
      formData.username,
      formData.password,
      formData.fullName,
      formData.preferredLanguage
    );

    if (result.success) {
      // Set the user's preferred language immediately
      if (formData.preferredLanguage) {
        await setLanguage(formData.preferredLanguage);
      }
      
      // Auto-login after successful registration
      const loginResult = await loginUser(formData.username, formData.password);
      setLoading(false);
      
      if (loginResult.success) {
        // Navigate directly to Dashboard
        navigation.replace('Dashboard');
      } else {
        // Registration succeeded but login failed, go to login screen
        if (Platform.OS === 'web') {
          alert('Account created! Please login.');
          navigation.replace('Login');
        } else {
          Alert.alert('Success', 'Account created! Please login.', [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login'),
            },
          ]);
        }
      }
    } else {
      setLoading(false);
      if (Platform.OS === 'web') {
        alert('Registration Failed: ' + result.error);
      } else {
        Alert.alert('Registration Failed', result.error);
      }
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={true}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleTamil}>{t('newAccount')}</Text>
          <Text style={styles.titleEnglish}>{t('createNewAccount')}</Text>
        </View>

        {/* Register Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{t('register')}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('fullName')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
              placeholder="Enter your full name"
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('username')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) =>
                setFormData({ ...formData, username: text.toLowerCase() })
              }
              placeholder="Choose a username"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <Text style={styles.hint}>{t('minChars', { count: 3 })}, {t('usernameLowercase')}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('password')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              placeholder="Choose a strong password"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <Text style={styles.hint}>{t('minChars', { count: 6 })}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('confirmPassword')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, confirmPassword: text })
              }
              placeholder="Re-enter your password"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Language Preference */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('preferredLanguage')} *</Text>
            <Text style={styles.hint}>{t('selectLanguage')}</Text>
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  formData.preferredLanguage === 'en' && styles.languageButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, preferredLanguage: 'en' })}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    formData.preferredLanguage === 'en' && styles.languageButtonTextActive,
                  ]}
                >
                  {t('languageEnglish')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  formData.preferredLanguage === 'ta' && styles.languageButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, preferredLanguage: 'ta' })}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    formData.preferredLanguage === 'ta' && styles.languageButtonTextActive,
                  ]}
                >
                  {t('languageTamil')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={loading ? [styles.registerButton, styles.buttonDisabled] : styles.registerButton}
            onPress={handleRegister}
            disabled={Boolean(loading)}
          >
            <Text style={styles.registerButtonText}>
              {loading ? t('creatingAccount') : t('createAccount')}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.loginLink}>{t('loginHere')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>What you'll get:</Text>
          <View style={styles.infoItem}>
            <Text style={styles.bulletPoint}>✓</Text>
            <Text style={styles.infoText}>Create and manage loan books</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bulletPoint}>✓</Text>
            <Text style={styles.infoText}>Share books with debtors</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bulletPoint}>✓</Text>
            <Text style={styles.infoText}>Secure QR code payments</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bulletPoint}>✓</Text>
            <Text style={styles.infoText}>Track all transactions</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titleTamil: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  titleEnglish: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000', // Explicit text color for Android
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  languageButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  languageButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: '#2196F3',
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 5,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 10,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
});

