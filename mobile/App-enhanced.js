import React, { useEffect, useState } from 'react';
import './src/utils/gradeDisplayDebug'; // Import grade debugging
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Enhanced Screens
import WelcomeScreen from './src/screens/WelcomeScreenEnhanced';
import HomeScreen from './src/screens/HomeScreenEnhanced';
import SubjectsScreen from './src/screens/SubjectsScreenEnhanced';
import GradesScreen from './src/screens/GradesScreenEnhanced';
import AddGradeScreen from './src/screens/AddGradeScreenEnhanced';
import SettingsScreen from './src/screens/SettingsScreenSimple';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
        setInitialRoute(hasSeenWelcome ? 'Home' : 'Welcome');
      } catch (error) {
        console.error('Error checking welcome status:', error);
        setInitialRoute('Welcome');
      }
    };

    checkFirstTime();
  }, []);

  if (initialRoute === null) {
    return null; // Loading state
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#ffffff',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#e2e8f0',
            },
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
              color: '#1e293b',
              letterSpacing: -0.3,
            },
            headerTintColor: '#475569',
            cardStyle: { backgroundColor: '#f8fafc' },
            headerBackTitleVisible: false,
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Subjects" 
            component={SubjectsScreen}
            options={{ 
              title: 'Fächer verwalten',
              headerStyle: {
                backgroundColor: '#ffffff',
                elevation: 0,
                shadowOpacity: 0,
              },
            }}
          />
          <Stack.Screen 
            name="Grades" 
            component={GradesScreen}
            options={{ 
              title: 'Noten',
              headerStyle: {
                backgroundColor: '#ffffff',
                elevation: 0,
                shadowOpacity: 0,
              },
            }}
          />
          <Stack.Screen 
            name="AddGrade" 
            component={AddGradeScreen}
            options={{ 
              title: 'Note hinzufügen',
              headerStyle: {
                backgroundColor: '#ffffff',
                elevation: 0,
                shadowOpacity: 0,
              },
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              title: 'Einstellungen',
              headerStyle: {
                backgroundColor: '#ffffff',
                elevation: 0,
                shadowOpacity: 0,
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}