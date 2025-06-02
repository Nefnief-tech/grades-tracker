import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CloudSync class integrated directly
class CloudSync {
  constructor() {
    this.storageKey = 'gradeTracker_subjects';
  }

  async initialize() {
    try {
      console.log('[CloudSync] Initializing...');
      return true;
    } catch (error) {
      console.error('[CloudSync] Initialization error:', error);
      return false;
    }
  }

  async loadSubjects() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const subjects = JSON.parse(data);
        console.log(`[CloudSync] Loaded ${subjects.length} subjects`);
        return subjects;
      }
      return [];
    } catch (error) {
      console.error('[CloudSync] Load error:', error);
      return [];
    }
  }

  async saveSubjects(subjects) {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(subjects));
      console.log(`[CloudSync] Saved ${subjects.length} subjects`);
      return true;
    } catch (error) {
      console.error('[CloudSync] Save error:', error);
      return false;
    }
  }

  calculateAverageGrade(grades) {
    if (!grades || grades.length === 0) return 0;
    const sum = grades.reduce((total, grade) => total + parseFloat(grade.grade || 0), 0);
    return (sum / grades.length).toFixed(2);
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

// Quick Grade Entry Modal Component
const QuickGradeEntry = ({ visible, onClose, onSave, subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [gradeType, setGradeType] = useState('Test');
  const [weight, setWeight] = useState('1');

  const gradeTypes = ['Test', 'Quiz', 'Homework', 'Project', 'Final', 'Midterm'];
  const quickGrades = ['1.0', '1.3', '1.7', '2.0', '2.3', '2.7', '3.0', '3.3', '3.7', '4.0', '5.0', '6.0'];

  const handleSave = () => {
    if (!selectedSubject || !grade) {
      Alert.alert('Error', 'Please select a subject and enter a grade');
      return;
    }

    const gradeData = {
      id: Date.now().toString(),
      grade: parseFloat(grade),
      type: gradeType,
      weight: parseFloat(weight),
      date: new Date().toISOString(),
    };

    onSave(selectedSubject, gradeData);
    setGrade('');
    setSelectedSubject('');
    setGradeType('Test');
    setWeight('1');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🎯 Quick Grade Entry</Text>

          {/* Subject Selection */}
          <Text style={styles.fieldLabel}>Subject:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={[
                  styles.subjectChip,
                  selectedSubject === subject.id && styles.selectedSubjectChip
                ]}
                onPress={() => setSelectedSubject(subject.id)}
              >
                <Text style={[
                  styles.subjectChipText,
                  selectedSubject === subject.id && styles.selectedSubjectChipText
                ]}>
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Grade Buttons */}
          <Text style={styles.fieldLabel}>Quick Grades:</Text>
          <View style={styles.quickGradesContainer}>
            {quickGrades.map((quickGrade) => (
              <TouchableOpacity
                key={quickGrade}
                style={[
                  styles.quickGradeButton,
                  grade === quickGrade && styles.selectedQuickGrade
                ]}
                onPress={() => setGrade(quickGrade)}
              >
                <Text style={[
                  styles.quickGradeText,
                  grade === quickGrade && styles.selectedQuickGradeText
                ]}>
                  {quickGrade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Manual Grade Entry */}
          <Text style={styles.fieldLabel}>Custom Grade:</Text>
          <TextInput
            style={styles.gradeInput}
            value={grade}
            onChangeText={setGrade}
            placeholder="Enter grade (1.0-6.0)"
            keyboardType="numeric"
          />

          {/* Grade Type */}
          <Text style={styles.fieldLabel}>Type:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {gradeTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  gradeType === type && styles.selectedTypeChip
                ]}
                onPress={() => setGradeType(type)}
              >
                <Text style={[
                  styles.typeChipText,
                  gradeType === type && styles.selectedTypeChipText
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>💾 Save Grade</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main App Component
export default function App() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');
  const [currentBottomTab, setCurrentBottomTab] = useState('overview');
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [cloudSync] = useState(new CloudSync());

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('[App] Initializing...');
      await cloudSync.initialize();
      const loadedSubjects = await cloudSync.loadSubjects();
      
      // Update subjects with calculated averages
      const updatedSubjects = loadedSubjects.map(subject => ({
        ...subject,
        averageGrade: cloudSync.calculateAverageGrade(subject.grades || [])
      }));
      
      setSubjects(updatedSubjects);
      console.log(`[App] Loaded ${updatedSubjects.length} subjects`);
    } catch (error) {
      console.error('[App] Initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGradeSave = async (subjectId, gradeData) => {
    try {
      const updatedSubjects = subjects.map(subject => {
        if (subject.id === subjectId) {
          const updatedGrades = [...(subject.grades || []), gradeData];
          return {
            ...subject,
            grades: updatedGrades,
            averageGrade: cloudSync.calculateAverageGrade(updatedGrades)
          };
        }
        return subject;
      });

      setSubjects(updatedSubjects);
      await cloudSync.saveSubjects(updatedSubjects);
      
      Alert.alert('Success', 'Grade added successfully!');
    } catch (error) {
      console.error('Error saving grade:', error);
      Alert.alert('Error', 'Failed to save grade');
    }
  };

  const renderSubjectCard = ({ item }) => (
    <View style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        <Text style={styles.subjectName}>{item.name}</Text>
        <Text style={[
          styles.subjectAverage,
          {
            color: item.averageGrade <= 2 ? '#27ae60' :
                   item.averageGrade <= 3 ? '#f1c40f' :
                   item.averageGrade <= 4 ? '#f39c12' : '#e74c3c'
          }
        ]}>
          {item.averageGrade || 'N/A'}
        </Text>
      </View>
      <Text style={styles.gradeCount}>
        {item.grades?.length || 0} grades
      </Text>
      <View style={styles.subjectStats}>
        <Text style={styles.statText}>
          Best: {item.grades?.length ? Math.min(...item.grades.map(g => g.grade)).toFixed(1) : 'N/A'}
        </Text>
        <Text style={styles.statText}>
          Latest: {item.grades?.length ? item.grades[item.grades.length - 1].grade.toFixed(1) : 'N/A'}
        </Text>
      </View>
    </View>
  );

  const renderOverviewTab = () => {
    const totalGrades = subjects.reduce((total, subject) => total + (subject.grades?.length || 0), 0);
    const overallAverage = subjects.length > 0 
      ? (subjects.reduce((sum, s) => sum + parseFloat(s.averageGrade || 0), 0) / subjects.length).toFixed(2)
      : '0.00';

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.tabTitle}>📚 Grade Overview</Text>
        
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{subjects.length}</Text>
            <Text style={styles.summaryLabel}>Subjects</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalGrades}</Text>
            <Text style={styles.summaryLabel}>Total Grades</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{overallAverage}</Text>
            <Text style={styles.summaryLabel}>Overall Avg</Text>
          </View>
        </View>

        <FlatList
          data={subjects}
          renderItem={renderSubjectCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </ScrollView>
    );
  };

  const renderStatsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>📊 Statistics</Text>
      
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Grade Distribution</Text>
        {subjects.map(subject => (
          <View key={subject.id} style={styles.distributionItem}>
            <Text style={styles.distributionSubject}>{subject.name}</Text>
            <View style={styles.distributionBar}>
              <View 
                style={[
                  styles.distributionFill, 
                  { 
                    width: `${Math.max(10, 100 - (parseFloat(subject.averageGrade || 6) * 16.67))}%`,
                    backgroundColor: subject.averageGrade <= 2 ? '#27ae60' :
                                   subject.averageGrade <= 3 ? '#f1c40f' :
                                   subject.averageGrade <= 4 ? '#f39c12' : '#e74c3c'
                  }
                ]} 
              />
            </View>
            <Text style={styles.distributionGrade}>{subject.averageGrade}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Performance Metrics</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Best Subject:</Text>
          <Text style={styles.metricValue}>
            {subjects.length > 0 
              ? subjects.reduce((best, current) => 
                  parseFloat(current.averageGrade || 6) < parseFloat(best.averageGrade || 6) ? current : best
                ).name
              : 'N/A'
            }
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Needs Improvement:</Text>
          <Text style={styles.metricValue}>
            {subjects.length > 0 
              ? subjects.reduce((worst, current) => 
                  parseFloat(current.averageGrade || 0) > parseFloat(worst.averageGrade || 0) ? current : worst
                ).name
              : 'N/A'
            }
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderGoalsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>🎯 Goals & Targets</Text>
      
      <View style={styles.goalsCard}>
        <Text style={styles.cardTitle}>Academic Goals</Text>
        <Text style={styles.goalText}>🎯 Target Overall Average: 2.0</Text>
        <Text style={styles.goalText}>📈 Current Progress: {
          subjects.length > 0 
            ? (subjects.reduce((sum, s) => sum + parseFloat(s.averageGrade || 0), 0) / subjects.length).toFixed(2)
            : '0.00'
        }</Text>
        <Text style={styles.goalText}>✨ Goal Status: {
          subjects.length > 0 && 
          (subjects.reduce((sum, s) => sum + parseFloat(s.averageGrade || 0), 0) / subjects.length) <= 2.0 
            ? 'Achieved! 🎉' : 'In Progress 💪'
        }</Text>
      </View>

      <View style={styles.goalsCard}>
        <Text style={styles.cardTitle}>Subject Goals</Text>
        {subjects.map(subject => (
          <View key={subject.id} style={styles.subjectGoal}>
            <Text style={styles.subjectGoalName}>{subject.name}</Text>
            <Text style={styles.subjectGoalStatus}>
              Target: 2.0 | Current: {subject.averageGrade} 
              {parseFloat(subject.averageGrade || 6) <= 2.0 ? ' ✅' : ' 🎯'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderTrendsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>📈 Trends</Text>
      
      <View style={styles.trendsCard}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        <Text style={styles.trendText}>📅 Grades added this week: {
          subjects.reduce((total, subject) => {
            const thisWeek = subject.grades?.filter(grade => {
              const gradeDate = new Date(grade.date);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return gradeDate > weekAgo;
            }).length || 0;
            return total + thisWeek;
          }, 0)
        }</Text>
        <Text style={styles.trendText}>📊 Most active subject: {
          subjects.length > 0 
            ? subjects.reduce((most, current) => 
                (current.grades?.length || 0) > (most.grades?.length || 0) ? current : most
              ).name
            : 'N/A'
        }</Text>
      </View>

      <View style={styles.trendsCard}>
        <Text style={styles.cardTitle}>Performance Trends</Text>
        {subjects.map(subject => {
          const recentGrades = subject.grades?.slice(-3) || [];
          const trend = recentGrades.length >= 2 
            ? recentGrades[recentGrades.length - 1].grade - recentGrades[0].grade
            : 0;
          
          return (
            <View key={subject.id} style={styles.trendItem}>
              <Text style={styles.trendSubject}>{subject.name}</Text>
              <Text style={[
                styles.trendIndicator,
                { color: trend < 0 ? '#27ae60' : trend > 0 ? '#e74c3c' : '#7f8c8d' }
              ]}>
                {trend < -0.1 ? '📈 Improving' : trend > 0.1 ? '📉 Declining' : '➡️ Stable'}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>⚙️ Settings</Text>
      
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>App Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version:</Text>
          <Text style={styles.infoValue}>2.0.0 Enhanced</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Subjects:</Text>
          <Text style={styles.infoValue}>{subjects.length}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Grades:</Text>
          <Text style={styles.infoValue}>
            {subjects.reduce((total, subject) => total + (subject.grades?.length || 0), 0)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>📊 Export Grade Report</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>🔄 Sync with Cloud</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
        <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>📚 About</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderBottomTabContent = () => {
    switch (currentBottomTab) {
      case 'overview':
        return renderOverviewTab();
      case 'stats':
        return renderStatsTab();
      case 'goals':
        return renderGoalsTab();
      case 'trends':
        return renderTrendsTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderMainContent = () => {
    if (currentTab === 'grades') {
      return (
        <View style={styles.gradesContainer}>
          {/* Bottom Navigation for Grades */}
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={[styles.bottomTab, currentBottomTab === 'overview' && styles.activeBottomTab]}
              onPress={() => setCurrentBottomTab('overview')}
            >
              <Text style={[styles.bottomTabText, currentBottomTab === 'overview' && styles.activeBottomTabText]}>
                📊 Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomTab, currentBottomTab === 'stats' && styles.activeBottomTab]}
              onPress={() => setCurrentBottomTab('stats')}
            >
              <Text style={[styles.bottomTabText, currentBottomTab === 'stats' && styles.activeBottomTabText]}>
                📈 Stats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomTab, currentBottomTab === 'goals' && styles.activeBottomTab]}
              onPress={() => setCurrentBottomTab('goals')}
            >
              <Text style={[styles.bottomTabText, currentBottomTab === 'goals' && styles.activeBottomTabText]}>
                🎯 Goals
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomTab, currentBottomTab === 'trends' && styles.activeBottomTab]}
              onPress={() => setCurrentBottomTab('trends')}
            >
              <Text style={[styles.bottomTabText, currentBottomTab === 'trends' && styles.activeBottomTabText]}>
                📈 Trends
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {renderBottomTabContent()}

          {/* Floating Action Button */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowQuickEntry(true)}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return renderSettingsTab();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>📚 Loading Grade Tracker...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grade Tracker</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.headerButton,
              currentTab === 'grades' && styles.activeHeaderButton
            ]}
            onPress={() => setCurrentTab('grades')}
          >
            <Text style={[
              styles.headerButtonText,
              currentTab === 'grades' && styles.activeHeaderButtonText
            ]}>
              📊 Grades
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.headerButton,
              currentTab === 'settings' && styles.activeHeaderButton
            ]}
            onPress={() => setCurrentTab('settings')}
          >
            <Text style={[
              styles.headerButtonText,
              currentTab === 'settings' && styles.activeHeaderButtonText
            ]}>
              ⚙️ Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      {renderMainContent()}

      {/* Quick Grade Entry Modal */}
      <QuickGradeEntry
        visible={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
        onSave={handleQuickGradeSave}
        subjects={subjects}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
  },
  activeHeaderButton: {
    backgroundColor: '#3498db',
  },
  headerButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeHeaderButtonText: {
    color: '#ffffff',
  },
  gradesContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  bottomTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeBottomTab: {
    backgroundColor: '#3498db',
  },
  bottomTabText: {
    fontSize: 10,
    color: '#7f8c8d',
    fontWeight: '600',
    textAlign: 'center',
  },
  activeBottomTabText: {
    color: '#ffffff',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  subjectCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  subjectAverage: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  gradeCount: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#34495e',
  },
  distributionItem: {
    marginBottom: 12,
  },
  distributionSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  distributionBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 4,
  },
  distributionFill: {
    height: '100%',
    borderRadius: 4,
  },
  distributionGrade: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  metricLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  goalsCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  subjectGoal: {
    marginBottom: 8,
  },
  subjectGoalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  subjectGoalStatus: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  trendsCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  trendIndicator: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  actionButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#ecf0f1',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#2c3e50',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
    marginTop: 12,
  },
  subjectScroll: {
    marginBottom: 8,
  },
  subjectChip: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedSubjectChip: {
    backgroundColor: '#3498db',
  },
  subjectChipText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  selectedSubjectChipText: {
    color: '#ffffff',
  },
  quickGradesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  quickGradeButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedQuickGrade: {
    backgroundColor: '#27ae60',
  },
  quickGradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  selectedQuickGradeText: {
    color: '#ffffff',
  },
  gradeInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  typeScroll: {
    marginBottom: 8,
  },
  typeChip: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedTypeChip: {
    backgroundColor: '#f39c12',
  },
  typeChipText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  selectedTypeChipText: {
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});