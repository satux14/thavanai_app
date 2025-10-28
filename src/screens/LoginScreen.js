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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loginUser } from '../utils/auth';
import { useLanguage } from '../utils/i18n';

export default function LoginScreen({ navigation }) {
  const { setLanguage } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      if (Platform.OS === 'web') {
        alert('Please enter username and password');
      } else {
        Alert.alert('Error', 'Please enter username and password');
      }
      return;
    }

    setLoading(true);
    const result = await loginUser(username, password);
    setLoading(false);

    if (result.success) {
      // Set the user's preferred language
      if (result.user.preferredLanguage) {
        await setLanguage(result.user.preferredLanguage);
      }
      
      // Navigate to Dashboard
      navigation.replace('Dashboard');
    } else {
      
      // Better error message for network issues
      let errorMessage = result.error || 'Invalid username or password';
      if (result.error && result.error.toLowerCase().includes('network')) {
        errorMessage = 'Cannot connect to server.\n\n' +
          '📱 Make sure your phone is on WiFi (same network as server)\n' +
          '🌐 Server should be at: 192.168.1.17:3000\n' +
          '❌ Mobile data will not work';
      }
      
      // Show error message (web-compatible)
      if (Platform.OS === 'web') {
        alert('Login Failed: ' + errorMessage);
      } else {
        Alert.alert('Login Failed', errorMessage);
      }
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const keyboardAvoidingBehavior = Platform.OS === 'ios' ? 'padding' : 'height';
  const keyboardShouldPersist = 'handled';

  try {
    return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={keyboardAvoidingBehavior}
      enabled={true}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps={keyboardShouldPersist}
      >
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.titleTamil}>eThavanai Book</Text>
          <Text style={styles.titleEnglish}>Digital Ledger</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            style={loading ? [styles.loginButton, styles.buttonDisabled] : styles.loginButton}
            onPress={handleLogin}
            disabled={Boolean(loading)}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Register here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
  } catch (error) {
    console.error('=== LOGINSCREEN RENDER ERROR ===');
    console.error('Error during render:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#928eb6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginTop: 8,
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
  loginButton: {
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 5,
  },
  registerText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  registerLink: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

