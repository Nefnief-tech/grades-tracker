import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ScrollView,
  TextInput,
  Modal 
} from 'react-native';
import MobileEncryptionService from './MobileEncryptionService';

export default function App() {
  const [showMessage, setShowMessage] = useState(false);
  const [encryptionService] = useState(() => new MobileEncryptionService());
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showEncryptionTest, setShowEncryptionTest] = useState(false);
  const [userId, setUserId] = useState('demo-user-123');
  const [userPassword, setUserPassword] = useState('');
  const [gradesData, setGradesData] = useState(null);

  useEffect(() => {
    checkApiStatus();
    loadSampleGrades();
  }, []);

  const checkApiStatus = async () => {
    try {
      const available = await encryptionService.checkAPIHealth();
      setIsApiAvailable(available);
      console.log('API Status:', available ? 'Available' : 'Offline');
    } catch (error) {
      console.log('API check failed:', error);
      setIsApiAvailable(false);
    }
  };

  const loadSampleGrades = () => {
    const sampleData = encryptionService.getMockGradesData();
    setGradesData(sampleData);
  };

  const testEncryption = async () => {
    if (!userPassword) {
      Alert.alert('Password Required', 'Please enter a password to test encryption');
      return;
    }

    try {
      Alert.alert('Testing Encryption...', 'This may take a moment');
      
      // Test mobile encryption
      const mobileEncrypted = await encryptionService.encryptForMobile(gradesData, userId);
      console.log('Mobile encryption successful');

      // Test decryption
      const testResult = await encryptionService.testDecryption(mobileEncrypted, userId);
      
      setTestResults({
        success: true,
        mobileEncryption: 'Success',
        apiTest: testResult.success ? 'Success' : 'Failed',
        dataPreview: testResult.dataPreview || null
      });

      Alert.alert(
        'Encryption Test Complete! ✅',
        `Mobile Encryption: Success\nAPI Test: ${testResult.success ? 'Success' : 'Failed'}\nSubjects: ${testResult.dataPreview?.subjectCount || 0}`
      );

    } catch (error) {
      console.error('Encryption test failed:', error);
      setTestResults({
        success: false,
        error: error.message,
        fallback: 'Using sample data'
      });

      Alert.alert(
        'Encryption Test Results',
        `Status: ${error.message}\n\nUsing offline sample data for demonstration.`
      );
    }
  };

  const syncWithWebApp = async () => {
    if (!userPassword) {
      Alert.alert('Password Required', 'Please enter your password to sync with web app');
      return;
    }

    try {
      Alert.alert('Syncing...', 'Attempting to sync with web app');
      
      const syncResult = await encryptionService.syncWithWebApp(userId, userPassword);
      
      if (syncResult.decryptedData) {
        setGradesData(syncResult.decryptedData);
        Alert.alert(
          'Sync Complete! 🔄',
          `Successfully synced grades:\n• ${syncResult.decryptedData.subjects?.length || 0} subjects\n• ${syncResult.decryptedData.subjects?.reduce((total, s) => total + (s.grades?.length || 0), 0) || 0} total grades`
        );
      }
    } catch (error) {
      console.error('Sync failed:', error);
      Alert.alert('Sync Failed', `Error: ${error.message}\n\nUsing local data instead.`);
    }
  };

  const showNotificationInfo = () => {
    Alert.alert(
      '📱 Grade Tracker Enhanced',
      'Ready for notifications and grade sync! Features:\n\n' +
      '🔔 Grade reminders\n' +
      '🎉 Achievement notifications\n' +
      '📊 Weekly progress reports\n' +
      '🔄 Web app grade sync\n' +
      '🔐 Secure encryption bridge\n\n' +
      'API Status: ' + (isApiAvailable ? 'Connected ✅' : 'Offline ⚠️'),
      [{ text: 'OK' }]
    );
  };

  const renderGradesSummary = () => {
    if (!gradesData?.subjects) return null;

    const totalGrades = gradesData.subjects.reduce((total, subject) => 
      total + (subject.grades?.length || 0), 0);
    const averageGrade = gradesData.subjects.length > 0 
      ? (gradesData.subjects.reduce((sum, subject) => {
          const subjectAvg = subject.grades?.length > 0 
            ? subject.grades.reduce((sum, grade) => sum + grade.grade, 0) / subject.grades.length
            : 0;
          return sum + subjectAvg;
        }, 0) / gradesData.subjects.length).toFixed(1)
      : '0.0';

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Current Grades</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{gradesData.subjects.length}</Text>
            <Text style={styles.statLabel}>Subjects</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalGrades}</Text>
            <Text style={styles.statLabel}>Total Grades</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{averageGrade}</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectsScroll}>
          {gradesData.subjects.map((subject, index) => (
            <View key={index} style={styles.subjectChip}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.subjectGradeCount}>{subject.grades?.length || 0} grades</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Grade Tracker Enhanced</Text>
        <Text style={styles.subtitle}>
          {isApiAvailable ? 'Connected to Web App ✅' : 'Offline Mode ⚠️'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔐 Encryption & Sync</Text>
          <Text style={styles.cardText}>
            Your Grade Tracker can now sync with the web app using secure encryption.
          </Text>
          
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password for sync"
            value={userPassword}
            onChangeText={setUserPassword}
            secureTextEntry
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.syncButton]}
              onPress={syncWithWebApp}
            >
              <Text style={styles.actionButtonText}>🔄 Sync Grades</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.testButton]}
              onPress={testEncryption}
            >
              <Text style={styles.actionButtonText}>🧪 Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderGradesSummary()}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔔 Features Available</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>📚 Secure grade decryption from web app</Text>
            <Text style={styles.feature}>🔄 Two-way sync with web application</Text>
            <Text style={styles.feature}>🔐 Base64 encryption with user ID key</Text>
            <Text style={styles.feature}>📱 Offline capability with cached data</Text>
            <Text style={styles.feature}>🧪 Encryption testing and validation</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📡 API Status</Text>
          <View style={styles.apiStatus}>
            <Text style={styles.apiStatusText}>
              Web App API: {isApiAvailable ? '✅ Connected' : '❌ Offline'}
            </Text>
            <Text style={styles.apiStatusDetail}>
              {isApiAvailable 
                ? 'Ready for grade sync and encryption' 
                : 'Using local data and sample grades'
              }
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={checkApiStatus}
          >
            <Text style={styles.refreshButtonText}>🔄 Check API Status</Text>
          </TouchableOpacity>
        </View>

        {testResults && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧪 Last Test Results</Text>
            <Text style={styles.testResult}>
              Status: {testResults.success ? '✅ Success' : '❌ Failed'}
            </Text>
            {testResults.dataPreview && (
              <Text style={styles.testDetail}>
                Subjects: {testResults.dataPreview.subjectCount}
              </Text>
            )}
            {testResults.error && (
              <Text style={styles.testError}>Error: {testResults.error}</Text>
            )}
          </View>
        )}

        {showMessage && (
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              🎯 Your mobile app is now connected to the web app's encryption system! 
              You can securely sync grades between platforms.
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => setShowMessage(!showMessage)}
        >
          <Text style={styles.infoButtonText}>
            {showMessage ? '📋 Hide Details' : '📋 Show Details'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={showNotificationInfo}
        >
          <Text style={styles.upgradeButtonText}>
            📱 View All Features
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#ecf0f1',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 12,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButton: {
    backgroundColor: '#27ae60',
  },
  testButton: {
    backgroundColor: '#f39c12',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  subjectsScroll: {
    maxHeight: 60,
  },
  subjectChip: {
    backgroundColor: '#ecf0f1',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subjectGradeCount: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
    color: '#34495e',
    paddingVertical: 4,
  },
  apiStatus: {
    marginBottom: 12,
  },
  apiStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  apiStatusDetail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  refreshButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  testResult: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  testDetail: {
    fontSize: 12,
    color: '#27ae60',
  },
  testError: {
    fontSize: 12,
    color: '#e74c3c',
  },
  messageCard: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  messageText: {
    fontSize: 14,
    color: '#27ae60',
    lineHeight: 20,
  },
  infoButton: {
    backgroundColor: '#9b59b6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  infoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeButton: {
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});