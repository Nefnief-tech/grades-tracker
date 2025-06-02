import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import SubjectsScreen from './src/screens/SubjectsScreen';
import GradesScreen from './src/screens/GradesScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import GradePredictionScreen from './src/screens/GradePredictionScreen';
import { GradeProvider } from './src/context/GradeContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { theme, isDarkMode } = useTheme();

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Übersicht') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Fächer') {
                iconName = focused ? 'book' : 'book-outline';
              } else if (route.name === 'Noten') {
                iconName = focused ? 'school' : 'school-outline';
              } else if (route.name === 'Prognose') {
                iconName = focused ? 'trending-up' : 'trending-up-outline';
              } else if (route.name === 'Analytik') {
                iconName = focused ? 'analytics' : 'analytics-outline';
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
          <Tab.Screen name="Prognose" component={GradePredictionScreen} />
          <Tab.Screen name="Analytik" component={AnalyticsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GradeProvider>
        <AppContent />
      </GradeProvider>
    </ThemeProvider>
  );
}