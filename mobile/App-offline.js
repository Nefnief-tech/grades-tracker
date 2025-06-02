import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen-offline';
import SubjectsScreen from './src/screens/SubjectsScreen-offline';
import GradesScreen from './src/screens/GradesScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import GradePredictionScreen from './src/screens/GradePredictionScreen';
import VocabularyScreen from './src/screens/VocabularyScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import { GradeProvider } from './src/context/GradeContext-offline';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext-offline';

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

function AppContent() {
  const { theme, isDarkMode } = useTheme();
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer>
        {user ? (
          <TabNavigator />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <GradeProvider>
          <AppContent />
        </GradeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}