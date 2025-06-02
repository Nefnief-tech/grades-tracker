import React, { useState } from 'react';
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
} from 'react-native';

// Simple in-memory data storage (no external dependencies)
const createDataStore = () => {
  let subjects = [
    {
      id: '1',
      name: 'Mathematics',
      grades: [
        { id: '1', grade: 2.0, type: 'Test', date: '2024-01-15', weight: 1 },
        { id: '2', grade: 1.7, type: 'Quiz', date: '2024-01-20', weight: 1 },
      ]
    },
    {
      id: '2', 
      name: 'Physics',
      grades: [
        { id: '3', grade: 2.3, type: 'Test', date: '2024-01-10', weight: 1 },
        { id: '4', grade: 3.0, type: 'Homework', date: '2024-01-18', weight: 1 },
      ]
    },
    {
      id: '3',
      name: 'English',
      grades: [
        { id: '5', grade: 1.3, type: 'Essay', date: '2024-01-12', weight: 1 },
      ]
    }
  ];

  const calculateAverage = (grades) => {
    if (!grades || grades.length === 0) return '0.0';
    const sum = grades.reduce((total, grade) => total + parseFloat(grade.grade), 0);
    return (sum / grades.length).toFixed(1);
  };

  const addGrade = (subjectId, gradeData) => {
    subjects = subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          grades: [...subject.grades, { ...gradeData, id: Date.now().toString() }]
        };
      }
      return subject;
    });
    return subjects;
  };

  const getSubjects = () => subjects.map(subject => ({
    ...subject,
    averageGrade: calculateAverage(subject.grades)
  }));

  return { addGrade, getSubjects, calculateAverage };
};

// Quick Grade Entry Modal
const QuickGradeEntry = ({ visible, onClose, onSave, subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [gradeType, setGradeType] = useState('Test');

  const gradeTypes = ['Test', 'Quiz', 'Homework', 'Project', 'Final'];
  const quickGrades = ['1.0', '1.3', '1.7', '2.0', '2.3', '2.7', '3.0', '3.3', '3.7', '4.0'];

  const handleSave = () => {
    if (!selectedSubject || !grade) {
      Alert.alert('Error', 'Please select a subject and enter a grade');
      return;
    }

    const gradeData = {
      grade: parseFloat(grade),
      type: gradeType,
      date: new Date().toISOString(),
      weight: 1
    };

    onSave(selectedSubject, gradeData);
    setGrade('');
    setSelectedSubject('');
    setGradeType('Test');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🎯 Add New Grade</Text>

          <Text style={styles.fieldLabel}>Subject:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={[
                  styles.subjectChip,
                  selectedSubject === subject.id && styles.selectedChip
                ]}
                onPress={() => setSelectedSubject(subject.id)}
              >
                <Text style={[
                  styles.chipText,
                  selectedSubject === subject.id && styles.selectedChipText
                ]}>
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Quick Grades:</Text>
          <View style={styles.quickGradesContainer}>
            {quickGrades.map((quickGrade) => (
              <TouchableOpacity
                key={quickGrade}
                style={[
                  styles.gradeButton,
                  grade === quickGrade && styles.selectedGrade
                ]}
                onPress={() => setGrade(quickGrade)}
              >
                <Text style={[
                  styles.gradeButtonText,
                  grade === quickGrade && styles.selectedGradeText
                ]}>
                  {quickGrade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Custom Grade:</Text>
          <TextInput
            style={styles.gradeInput}
            value={grade}
            onChangeText={setGrade}
            placeholder="Enter grade (1.0-6.0)"
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabel}>Type:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {gradeTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  gradeType === type && styles.selectedChip
                ]}
                onPress={() => setGradeType(type)}
              >
                <Text style={[
                  styles.chipText,
                  gradeType === type && styles.selectedChipText
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>💾 Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main App Component
export default function App() {
  const [dataStore] = useState(() => createDataStore());
  const [subjects, setSubjects] = useState(() => dataStore.getSubjects());
  const [currentTab, setCurrentTab] = useState('grades');
  const [currentBottomTab, setCurrentBottomTab] = useState('overview');
  const [showQuickEntry, setShowQuickEntry] = useState(false);

  const handleGradeSave = (subjectId, gradeData) => {
    dataStore.addGrade(subjectId, gradeData);
    setSubjects(dataStore.getSubjects());
    Alert.alert('Success', 'Grade added successfully!');
  };

  const renderSubjectCard = ({ item }) => (
    <View style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        <Text style={styles.subjectName}>{item.name}</Text>
        <Text style={[
          styles.subjectAverage,
          {
            color: parseFloat(item.averageGrade) <= 2 ? '#27ae60' :
                   parseFloat(item.averageGrade) <= 3 ? '#f1c40f' : '#e74c3c'
          }
        ]}>
          {item.averageGrade}
        </Text>
      </View>
      <Text style={styles.gradeCount}>
        {item.grades.length} grades
      </Text>
      <View style={styles.subjectStats}>
        <Text style={styles.statText}>
          Best: {Math.min(...item.grades.map(g => g.grade)).toFixed(1)}
        </Text>
        <Text style={styles.statText}>
          Latest: {item.grades[item.grades.length - 1]?.grade.toFixed(1) || 'N/A'}
        </Text>
      </View>
    </View>
  );

  const renderOverview = () => {
    const totalGrades = subjects.reduce((total, subject) => total + subject.grades.length, 0);
    const overallAverage = subjects.length > 0 
      ? (subjects.reduce((sum, s) => sum + parseFloat(s.averageGrade), 0) / subjects.length).toFixed(1)
      : '0.0';

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
            <Text style={styles.summaryLabel}>Avg Grade</Text>
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

  const renderStats = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>📊 Statistics</Text>
      
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Grade Distribution</Text>
        {subjects.map(subject => (
          <View key={subject.id} style={styles.distributionRow}>
            <Text style={styles.subjectNameSmall}>{subject.name}</Text>
            <View style={styles.gradeBar}>
              <View 
                style={[
                  styles.gradeBarFill, 
                  { 
                    width: `${Math.max(10, 100 - (parseFloat(subject.averageGrade) * 15))}%`,
                    backgroundColor: parseFloat(subject.averageGrade) <= 2 ? '#27ae60' :
                                   parseFloat(subject.averageGrade) <= 3 ? '#f1c40f' : '#e74c3c'
                  }
                ]} 
              />
            </View>
            <Text style={styles.gradeValue}>{subject.averageGrade}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Performance Summary</Text>
        <Text style={styles.statItem}>
          🏆 Best Subject: {subjects.reduce((best, current) => 
            parseFloat(current.averageGrade) < parseFloat(best.averageGrade) ? current : best
          ).name}
        </Text>
        <Text style={styles.statItem}>
          📈 Most Active: {subjects.reduce((most, current) => 
            current.grades.length > most.grades.length ? current : most
          ).name}
        </Text>
        <Text style={styles.statItem}>
          🎯 Target: 2.0 Average
        </Text>
      </View>
    </ScrollView>
  );

  const renderGoals = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>🎯 Academic Goals</Text>
      
      <View style={styles.goalsCard}>
        <Text style={styles.cardTitle}>Overall Progress</Text>
        <Text style={styles.goalText}>
          Target: 2.0 Average
        </Text>
        <Text style={styles.goalText}>
          Current: {subjects.length > 0 
            ? (subjects.reduce((sum, s) => sum + parseFloat(s.averageGrade), 0) / subjects.length).toFixed(1)
            : '0.0'}
        </Text>
        <Text style={styles.goalStatus}>
          {subjects.length > 0 && 
          (subjects.reduce((sum, s) => sum + parseFloat(s.averageGrade), 0) / subjects.length) <= 2.0 
            ? '🎉 Goal Achieved!' : '💪 Keep Going!'}
        </Text>
      </View>

      <View style={styles.goalsCard}>
        <Text style={styles.cardTitle}>Subject Goals</Text>
        {subjects.map(subject => (
          <View key={subject.id} style={styles.subjectGoalRow}>
            <Text style={styles.subjectGoalName}>{subject.name}</Text>
            <Text style={styles.subjectGoalStatus}>
              {parseFloat(subject.averageGrade) <= 2.0 ? '✅' : '🎯'} {subject.averageGrade}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderTrends = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>📈 Trends</Text>
      
      <View style={styles.trendsCard}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        <Text style={styles.trendText}>
          📊 Total Grades: {subjects.reduce((total, s) => total + s.grades.length, 0)}
        </Text>
        <Text style={styles.trendText}>
          📚 Active Subjects: {subjects.length}
        </Text>
        <Text style={styles.trendText}>
          🎯 Average Performance: {subjects.length > 0 
            ? (subjects.reduce((sum, s) => sum + parseFloat(s.averageGrade), 0) / subjects.length).toFixed(1)
            : '0.0'}
        </Text>
      </View>

      <View style={styles.trendsCard}>
        <Text style={styles.cardTitle}>Subject Performance</Text>
        {subjects.map(subject => (
          <View key={subject.id} style={styles.trendRow}>
            <Text style={styles.trendSubject}>{subject.name}</Text>
            <Text style={styles.trendIndicator}>
              {parseFloat(subject.averageGrade) <= 2 ? '📈 Excellent' : 
               parseFloat(subject.averageGrade) <= 3 ? '➡️ Good' : '📉 Needs Work'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderBottomTabContent = () => {
    switch (currentBottomTab) {
      case 'overview': return renderOverview();
      case 'stats': return renderStats();
      case 'goals': return renderGoals();
      case 'trends': return renderTrends();
      default: return renderOverview();
    }
  };

  const renderSettings = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>⚙️ Settings</Text>
      
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>App Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version:</Text>
          <Text style={styles.infoValue}>2.0 Enhanced</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Subjects:</Text>
          <Text style={styles.infoValue}>{subjects.length}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Grades:</Text>
          <Text style={styles.infoValue}>
            {subjects.reduce((total, s) => total + s.grades.length, 0)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>📊 Export Report</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>🔄 Sync Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grade Tracker Enhanced</Text>
        <View style={styles.headerTabs}>
          <TouchableOpacity
            style={[styles.headerTab, currentTab === 'grades' && styles.activeHeaderTab]}
            onPress={() => setCurrentTab('grades')}
          >
            <Text style={[styles.headerTabText, currentTab === 'grades' && styles.activeHeaderTabText]}>
              📊 Grades
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerTab, currentTab === 'settings' && styles.activeHeaderTab]}
            onPress={() => setCurrentTab('settings')}
          >
            <Text style={[styles.headerTabText, currentTab === 'settings' && styles.activeHeaderTabText]}>
              ⚙️ Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {currentTab === 'grades' ? (
        <View style={styles.gradesContainer}>
          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            {[
              { key: 'overview', label: '📊 Overview' },
              { key: 'stats', label: '📈 Stats' },
              { key: 'goals', label: '🎯 Goals' },
              { key: 'trends', label: '📈 Trends' }
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.bottomTab, currentBottomTab === tab.key && styles.activeBottomTab]}
                onPress={() => setCurrentBottomTab(tab.key)}
              >
                <Text style={[
                  styles.bottomTabText, 
                  currentBottomTab === tab.key && styles.activeBottomTabText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
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
      ) : (
        renderSettings()
      )}

      {/* Modal */}
      <QuickGradeEntry
        visible={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
        onSave={handleGradeSave}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  headerTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  headerTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
  },
  activeHeaderTab: {
    backgroundColor: '#3498db',
  },
  headerTabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeHeaderTabText: {
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
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  bottomTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 2,
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
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectNameSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    width: 80,
  },
  gradeBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  gradeBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  gradeValue: {
    fontSize: 12,
    color: '#7f8c8d',
    width: 30,
    textAlign: 'right',
  },
  statItem: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
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
  goalStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    textAlign: 'center',
    marginTop: 8,
  },
  subjectGoalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectGoalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  subjectGoalStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
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
  trendRow: {
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
    color: '#27ae60',
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
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
  subjectChip: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#3498db',
  },
  chipText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  selectedChipText: {
    color: '#ffffff',
  },
  quickGradesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  gradeButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedGrade: {
    backgroundColor: '#27ae60',
  },
  gradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  selectedGradeText: {
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
  typeChip: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
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