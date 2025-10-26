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

  console.log('=== LoginScreen ABOUT TO RENDER JSX ===');
  console.log('Disabled prop will be:', Boolean(loading));
  console.log('Platform.OS:', Platform.OS);
  console.log('KeyboardAvoidingView behavior:', Platform.OS === 'ios' ? 'padding' : 'height');
  
  const keyboardAvoidingBehavior = Platform.OS === 'ios' ? 'padding' : 'height';
  const keyboardShouldPersist = 'handled'; // Changed from 'handled' to boolean for iOS/Hermes
  console.log('KeyboardAvoidingView behavior type:', typeof keyboardAvoidingBehavior);
  console.log('keyboardShouldPersistTaps value:', keyboardShouldPersist, '| Type:', typeof keyboardShouldPersist);

  try {
    console.log('=== STARTING LOGINSCREEN RENDER ===');
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
          <Text style={styles.titleTamil}>தினத்தவணைப் புத்தகம்</Text>
          <Text style={styles.titleEnglish}>Daily Installment Book</Text>
          <Text style={styles.subtitle}>Secure Digital Lending</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Login</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            {console.log('About to render Username TextInput with autoCorrect:', false, 'Type:', typeof false)}
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus on password field (if we had a ref)
                // For now, just move to next field naturally
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            {console.log('About to render Password TextInput with secureTextEntry:', true, 'Type:', typeof true, 'autoCorrect:', false)}
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

          {console.log('About to render Login TouchableOpacity with disabled:', Boolean(loading), 'Type:', typeof Boolean(loading))}
          {(() => {
            const buttonStyle = loading ? [styles.loginButton, styles.buttonDisabled] : styles.loginButton;
            console.log('Login button style computed:', Array.isArray(buttonStyle) ? 'array' : 'object', 'loading:', loading);
            if (Array.isArray(buttonStyle)) {
              console.log('Style array has', buttonStyle.length, 'items, contains false?', buttonStyle.includes(false));
            }
            return null;
          })()}
          <TouchableOpacity
            style={loading ? [styles.loginButton, styles.buttonDisabled] : styles.loginButton}
            onPress={handleLogin}
            disabled={Boolean(loading)}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
          {console.log('✅ Login TouchableOpacity rendered successfully!')}

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Register here</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔐</Text>
            <Text style={styles.featureText}>Secure Authentication</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={styles.featureText}>QR Code Verification</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Track Payments</Text>
          </View>
        </View>
        {console.log('✅✅✅ ALL LoginScreen JSX RENDERED SUCCESSFULLY ✅✅✅')}
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
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleTamil: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  titleEnglish: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
  loginButton: {
    backgroundColor: '#2196F3',
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
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 5,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

