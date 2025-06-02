import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen-appwrite';
import SubjectsScreen from './src/screens/SubjectsScreen-appwrite';
import GradesScreen from './src/screens/GradesScreen-appwrite';
import AnalyticsScreen from './src/screens/AnalyticsScreen-appwrite';
import GradePredictionScreen from './src/screens/GradePredictionScreen-appwrite';
import VocabularyScreen from './src/screens/VocabularyScreen-appwrite';
import SettingsScreen from './src/screens/SettingsScreen-appwrite';
import LoginScreen from './src/screens/LoginScreen-appwrite';
import RegisterScreen from './src/screens/RegisterScreen-appwrite';
import { GradeProvider } from './src/context/GradeContext-appwrite';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext-appwrite';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch(route.name) {
            case 'Übersicht':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Fächer':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Noten':
              iconName = focused ? 'school' : 'school-outline';
              break;
            case 'Vokabeln':
              iconName = focused ? 'library' : 'library-outline';
              break;
            case 'Prognose':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'Analytik':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Einstellungen':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Übersicht" component={HomeScreen} />
      <Tab.Screen name="Fächer" component={SubjectsScreen} />
      <Tab.Screen name="Noten" component={GradesScreen} />
      <Tab.Screen name="Vokabeln" component={VocabularyScreen} />
      <Tab.Screen name="Prognose" component={GradePredictionScreen} />
      <Tab.Screen name="Analytik" component={AnalyticsScreen} />
      <Tab.Screen name="Einstellungen" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { theme, isDarkMode } = useTheme();
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or loading screen
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer>
        {user ? (
          <GradeProvider>
            <TabNavigator />
          </GradeProvider>
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}