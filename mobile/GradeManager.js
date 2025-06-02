import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import MobileEncryptionService from './MobileEncryptionService';

const GradeManager = ({ userId, userPassword }) => {
  const [subjects, setSubjects] = useState([]);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newGrade, setNewGrade] = useState('');
  const [gradeType, setGradeType] = useState('Test');
  const [encryptionService] = useState(() => new MobileEncryptionService());

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      // Try to sync with web app first
      if (userId && userPassword) {
        const syncResult = await encryptionService.syncWithWebApp(userId, userPassword);
        if (syncResult.decryptedData?.subjects) {
          setSubjects(syncResult.decryptedData.subjects);
          return;
        }
      }
      
      // Fallback to sample data
      const sampleData = encryptionService.getMockGradesData();
      setSubjects(sampleData.subjects || []);
    } catch (error) {
      console.error('Failed to load grades:', error);
      // Use sample data as fallback
      const sampleData = encryptionService.getMockGradesData();
      setSubjects(sampleData.subjects || []);
    }
  };

  const addGrade = async () => {
    if (!selectedSubject || !newGrade || isNaN(parseFloat(newGrade))) {
      Alert.alert('Invalid Input', 'Please select a subject and enter a valid grade');
      return;
    }

    const grade = parseFloat(newGrade);
    if (grade < 1.0 || grade > 6.0) {
      Alert.alert('Invalid Grade', 'Grade must be between 1.0 and 6.0');
      return;
    }

    try {
      const newGradeObj = {
        id: Date.now().toString(),
        grade: grade,
        type: gradeType,
        date: new Date().toISOString().split('T')[0],
        weight: 1
      };

      const updatedSubjects = subjects.map(subject => {
        if (subject.id === selectedSubject.id) {
          return {
            ...subject,
            grades: [...(subject.grades || []), newGradeObj]
          };
        }
        return subject;
      });

      setSubjects(updatedSubjects);

      // Try to sync back to web app
      if (userId && userPassword) {
        try {
          const gradesData = { subjects: updatedSubjects };
          await encryptionService.encryptGradesForWeb(gradesData, userPassword, userId);
          console.log('Grade synced to web app successfully');
        } catch (syncError) {
          console.log('Sync to web app failed, keeping local changes:', syncError);
        }
      }

      // Show achievement notification for good grades
      if (grade <= 2.0) {
        Alert.alert(
          '🎉 Great Grade!',
          `Excellent ${gradeType} grade of ${grade} in ${selectedSubject.name}!`,
          [{ text: 'Awesome!' }]
        );
      }

      setShowAddGrade(false);
      setNewGrade('');
      setSelectedSubject(null);

    } catch (error) {
      console.error('Failed to add grade:', error);
      Alert.alert('Error', 'Failed to add grade. Please try again.');
    }
  };

  const calculateAverage = (grades) => {
    if (!grades || grades.length === 0) return 'No grades';
    const average = grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length;
    return average.toFixed(1);
  };

  const getGradeColor = (grade) => {
    if (grade <= 2.0) return '#27ae60'; // Green for good grades
    if (grade <= 3.0) return '#f39c12'; // Orange for okay grades
    return '#e74c3c'; // Red for poor grades
  };

  const renderSubject = ({ item }) => (
    <View style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        <Text style={styles.subjectName}>{item.name}</Text>
        <Text style={styles.subjectAverage}>
          Ø {calculateAverage(item.grades)}
        </Text>
      </View>
      
      <View style={styles.gradesContainer}>
        {item.grades && item.grades.length > 0 ? (
          item.grades.map((grade, index) => (
            <View key={index} style={styles.gradeItem}>
              <View style={[styles.gradeCircle, { backgroundColor: getGradeColor(grade.grade) }]}>
                <Text style={styles.gradeValue}>{grade.grade}</Text>
              </View>
              <Text style={styles.gradeType}>{grade.type}</Text>
              <Text style={styles.gradeDate}>{grade.date}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noGrades}>No grades yet</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedSubject(item);
          setShowAddGrade(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Add Grade</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 My Grades</Text>
      
      <FlatList
        data={subjects}
        renderItem={renderSubject}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showAddGrade}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add Grade for {selectedSubject?.name}
            </Text>

            <TextInput
              style={styles.gradeInput}
              placeholder="Enter grade (1.0 - 6.0)"
              value={newGrade}
              onChangeText={setNewGrade}
              keyboardType="decimal-pad"
            />

            <View style={styles.typeContainer}>
              {['Test', 'Quiz', 'Homework', 'Exam', 'Project'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    gradeType === type && styles.typeButtonSelected
                  ]}
                  onPress={() => setGradeType(type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    gradeType === type && styles.typeButtonTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddGrade(false);
                  setNewGrade('');
                  setSelectedSubject(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addGrade}
              >
                <Text style={styles.saveButtonText}>Add Grade</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  subjectCard: {
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
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subjectAverage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  gradesContainer: {
    marginBottom: 12,
  },
  gradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gradeValue: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  gradeType: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
  },
  gradeDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  noGrades: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  gradeInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  typeButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  typeButtonTextSelected: {
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  cancelButtonText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default GradeManager;