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
    phone: '', // Optional
    email: '', // Optional
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
      formData.preferredLanguage,
      formData.phone,
      formData.email
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
          <Text style={styles.titleTamil}>eThavanai Book</Text>
          <Text style={styles.titleEnglish}>Digital Ledger</Text>
        </View>

        {/* Register Form */}
        <View style={styles.formContainer}>

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
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) =>
                setFormData({ ...formData, phone: text })
              }
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) =>
                setFormData({ ...formData, email: text })
              }
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#928eb6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  titleTamil: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  titleEnglish: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
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
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 0,
    borderRadius: 30,
    padding: 18,
    paddingLeft: 20,
    fontSize: 16,
    color: '#333',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
    marginLeft: 10,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  languageButton: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  languageButtonActive: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: '#5d61beb5',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(200, 200, 200, 0.6)',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 5,
  },
  loginText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

