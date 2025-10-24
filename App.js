// Polyfills must be imported first
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { initDatabase } from './src/utils/database';
import { getCurrentUser } from './src/utils/auth';
import { LanguageProvider, useLanguage } from './src/utils/i18n';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import BookInfoScreen from './src/screens/BookInfoScreen';
import EntriesScreen from './src/screens/EntriesScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { t, language } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing database...');
      await initDatabase();
      console.log('Database initialized successfully');
      
      console.log('Checking login status...');
      const user = await getCurrentUser();
      setIsLoggedIn(user !== null);
      console.log('Login status checked:', user !== null);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    // You can show a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Dashboard' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: t('register'),
            headerTitleAlign: 'center',
          }}
        />

        {/* Main App Screens */}
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            headerShown: false, // Hide header to save space - Dashboard has its own custom header
          }}
        />
        <Stack.Screen
          name="BookInfo"
          component={BookInfoScreen}
          options={{
            title: t('appNameTamil'),
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="Entries"
          component={EntriesScreen}
          options={{
            title: t('dailyEntries'),
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppNavigator />
    </LanguageProvider>
  );
}
