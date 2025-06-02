// Import polyfills first
import './polyfills';

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MobileEncryptionService from './MobileEncryptionServiceSimple';
import { EncryptionProvider } from './src/context/EncryptionContext';

// Import Material You 3 Screens
import WelcomeScreen from './src/screens/WelcomeScreenEnhanced';
import HomeScreen from './src/screens/HomeScreenEnhanced';
import SettingsScreen from './src/screens/SettingsScreenEnhanced';
import AuthScreen from './src/screens/AuthScreenEnhanced';
import AddGradeScreen from './src/screens/AddGradeScreenMaterialEnhanced';

// Import Material You 3 Screens
import WelcomeScreen from './src/screens/WelcomeScreenEnhanced';
import HomeScreen from './src/screens/HomeScreenEnhanced';
import SubjectsScreen from './src/screens/SubjectsScreenMaterial';
import GradesScreen from './src/screens/GradesScreenMaterial';
import AddGradeScreen from './src/screens/AddGradeScreenMaterialEnhanced';
import SettingsScreen from './src/screens/SettingsScreenEnhanced';
import SubjectDetailScreen from './src/screens/SubjectDetailScreen';
import AuthScreen from './src/screens/AuthScreenEnhanced';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Subjects') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Grades') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6750A4',
        tabBarInactiveTintColor: '#938F99',
        tabBarStyle: {
          backgroundColor: '#1C1B1F',
          borderTopColor: '#2B2930',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Übersicht' }}
      />
      <Tab.Screen 
        name="Subjects" 
        component={SubjectsScreen}
        options={{ tabBarLabel: 'Fächer' }}
      />
      <Tab.Screen 
        name="Grades" 
        component={GradesScreen}
        options={{ tabBarLabel: 'Noten' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Einstellungen' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [encryptionService] = useState(() => new MobileEncryptionService());

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(false);
    }
  };

  if (isFirstLaunch === null) {
    return null;
  }
  return (
    <EncryptionProvider encryptionService={encryptionService}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName={isFirstLaunch ? "Welcome" : "Main"}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#1C1B1F' },
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen 
            name="AddGrade" 
            component={AddGradeScreen}
            options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: {
                backgroundColor: '#1C1B1F',
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTintColor: '#E6E0E9',
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen 
            name="SubjectDetail" 
            component={SubjectDetailScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{
              headerShown: true,
              headerTitle: 'Cloud Sync',
              headerStyle: {
                backgroundColor: '#1C1B1F',
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTintColor: '#E6E0E9',
              headerBackTitleVisible: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </EncryptionProvider>
  );
}                                        