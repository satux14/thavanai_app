// Polyfills are loaded in index.js before this file is imported
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { initDatabase } from './src/utils/database';
import { getCurrentUser } from './src/utils/auth';
import { LanguageProvider, useLanguage } from './src/utils/i18n';
import ErrorBoundary from './src/components/ErrorBoundary';

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
  
  useEffect(() => {
    console.log('🎯 AppNavigator MOUNTED (useEffect after render)');
    return () => {
      console.log('🔄 AppNavigator UNMOUNTING');
    };
  }, []);

  const initializeApp = async () => {
    try {
      console.log('=== APP INITIALIZATION START ===');
      console.log('Initializing database...');
      await initDatabase();
      console.log('Database initialized successfully');
      
      console.log('Checking login status...');
      const user = await getCurrentUser();
      console.log('getCurrentUser returned:', user);
      console.log('User type:', typeof user);
      console.log('User !== null:', user !== null);
      console.log('Boolean(user !== null):', Boolean(user !== null));
      
      const loginStatus = Boolean(user !== null);
      console.log('Setting isLoggedIn to:', loginStatus, '| Type:', typeof loginStatus);
      setIsLoggedIn(loginStatus);
      console.log('isLoggedIn state set successfully');
    } catch (error) {
      console.error('=== ERROR in initializeApp ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      setIsLoggedIn(false);
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
      console.log('=== APP INITIALIZATION COMPLETE ===');
    }
  };

  // Ensure isLoading is boolean
  if (isLoading === true) {
    console.log('=== SHOWING LOADING SCREEN ===');
    return null;
  }

  console.log('=== RENDERING NAVIGATION ===');
  console.log('isLoggedIn:', isLoggedIn, '| Type:', typeof isLoggedIn);
  console.log('initialRouteName will be:', isLoggedIn ? 'Dashboard' : 'Login');

  const initialRoute = isLoggedIn ? 'Dashboard' : 'Login';
  console.log('initialRoute value:', initialRoute, '| Type:', typeof initialRoute);
  
  // Log all props that will be passed to Navigator
  const screenOptions = {
    headerStyle: {
      backgroundColor: '#2196F3',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: '700',
    },
  };
  console.log('screenOptions object created:', JSON.stringify(screenOptions));

  console.log('=== ABOUT TO RETURN JSX FROM AppNavigator ===');
  return (
    <NavigationContainer>
      {console.log('1️⃣ NavigationContainer JSX start')}
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={screenOptions}
      >
      {console.log('2️⃣ Stack.Navigator JSX start')}
        {console.log('Stack.Navigator is rendering with initialRouteName:', initialRoute)}
        {/* Auth Screens */}
        {console.log('About to render Login Stack.Screen with headerShown:', false, 'Type:', typeof false)}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false, // Explicitly boolean
          }}
        />
        {console.log('Login Stack.Screen registered successfully')}
        {console.log('About to register Register screen, t function type:', typeof t)}
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Register', // Hardcoded for now to eliminate t() function
            headerTitleAlign: 'center',
          }}
        />
        {console.log('Register Stack.Screen registered successfully')}

        {/* Main App Screens */}
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            headerShown: false, // Explicitly boolean
          }}
        />
        {console.log('Dashboard Stack.Screen registered successfully')}
        <Stack.Screen
          name="BookInfo"
          component={BookInfoScreen}
          options={{
            title: 'Book Info', // Hardcoded
            headerTitleAlign: 'center',
          }}
        />
        {console.log('BookInfo Stack.Screen registered successfully')}
        <Stack.Screen
          name="Entries"
          component={EntriesScreen}
          options={{
            title: 'Daily Entries', // Hardcoded
            headerTitleAlign: 'center',
          }}
        />
        {console.log('Entries Stack.Screen registered successfully')}
        {console.log('3️⃣ All Stack.Screens registered')}
      </Stack.Navigator>
      {console.log('4️⃣ Stack.Navigator closed')}
    </NavigationContainer>
  ) || console.log('5️⃣ NavigationContainer return value created');
  // This will never execute - just for clarity
  // console.log('After return');
}

export default function App() {
  console.log('🚀 === APP COMPONENT RENDERING ===');
  return (
    <ErrorBoundary>
      {console.log('🛡️ ErrorBoundary wrapping')}
      <LanguageProvider>
        {console.log('🌐 LanguageProvider wrapping')}
        <AppNavigator />
        {console.log('📱 AppNavigator rendered')}
      </LanguageProvider>
      {console.log('✅ App JSX complete')}
    </ErrorBoundary>
  );
}
