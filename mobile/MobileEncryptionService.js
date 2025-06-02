// React Native Buffer polyfill
import { Buffer } from 'buffer';
if (!global.Buffer) {
  global.Buffer = Buffer;
}

class MobileEncryptionService {
  constructor() {
    this.baseURL = 'http://localhost:3000'; // Your Next.js web app URL
    this.initialized = false;
    this.init();
  }

  init() {
    console.log('MobileEncryptionService: Initializing...');
    this.initialized = true;
    console.log('MobileEncryptionService: Initialized successfully');
  }

  // Check if web app API is available
  async checkAPIHealth() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      console.log('API health check failed:', error.message);
      return false;
    }
  }

  // Simple Base64 encoding for mobile compatibility
  encodeBase64(data) {
    try {
      const jsonString = JSON.stringify(data);
      return Buffer.from(jsonString, 'utf8').toString('base64');
    } catch (error) {
      console.error('Base64 encoding failed:', error);
      throw new Error('Failed to encode data');
    }
  }

  // Simple Base64 decoding for mobile compatibility
  decodeBase64(encodedData) {
    try {
      const decodedString = Buffer.from(encodedData, 'base64').toString('utf8');
      return JSON.parse(decodedString);
    } catch (error) {
      console.error('Base64 decoding failed:', error);
      throw new Error('Failed to decode data');
    }
  }

  // Encrypt data for mobile storage (simple Base64 + user ID key)
  async encryptForMobile(data, userId) {
    try {
      // Add user ID as a simple key mechanism
      const dataWithKey = {
        userId: userId,
        timestamp: new Date().toISOString(),
        data: data
      };
      
      const encoded = this.encodeBase64(dataWithKey);
      console.log('Mobile encryption successful');
      return encoded;
    } catch (error) {
      console.error('Mobile encryption failed:', error);
      throw error;
    }
  }

  // Decrypt data from mobile storage
  async decryptFromMobile(encryptedData, userId) {
    try {
      const decoded = this.decodeBase64(encryptedData);
      
      // Verify user ID matches
      if (decoded.userId !== userId) {
        throw new Error('User ID mismatch');
      }
      
      console.log('Mobile decryption successful');
      return decoded.data;
    } catch (error) {
      console.error('Mobile decryption failed:', error);
      throw error;
    }
  }

  // Sync with web app - download and decrypt grades
  async syncWithWebApp(userId, userPassword) {
    try {
      console.log('Attempting to sync with web app...');
      
      const response = await fetch(`${this.baseURL}/api/grades/mobile-decrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          password: userPassword
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sync failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success && result.decryptedData) {
        console.log('Web app sync successful');
        return {
          success: true,
          decryptedData: result.decryptedData
        };
      } else {
        throw new Error(result.error || 'Unknown sync error');
      }
    } catch (error) {
      console.error('Web app sync failed:', error);
      throw error;
    }
  }

  // Upload encrypted grades to web app
  async encryptGradesForWeb(gradesData, userPassword, userId) {
    try {
      const response = await fetch(`${this.baseURL}/api/grades/mobile-encrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          password: userPassword,
          gradesData: gradesData
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Grades uploaded to web app successfully');
        return result;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload grades to web app:', error);
      throw error;
    }
  }

  // Test decryption via API
  async testDecryption(encryptedData, userId) {
    try {
      const response = await fetch(`${this.baseURL}/api/test-decrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedData: encryptedData,
          userId: userId
        }),
      });

      if (!response.ok) {
        return { success: false, error: `API test failed: ${response.status}` };
      }

      const result = await response.json();
      return {
        success: true,
        dataPreview: {
          subjectCount: result.decryptedData?.subjects?.length || 0,
          totalGrades: result.decryptedData?.subjects?.reduce((sum, s) => sum + (s.grades?.length || 0), 0) || 0
        }
      };
    } catch (error) {
      console.error('Decryption test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get sample data for offline mode
  getMockGradesData() {
    return {
      subjects: [
        {
          id: 'math-001',
          name: 'Mathematik',
          color: '#FF6B6B',
          grades: [
            { id: '1', grade: 2.3, type: 'Test', weight: 1, date: '2024-01-15', timestamp: '2024-01-15T10:00:00Z' },
            { id: '2', grade: 1.7, type: 'Klausur', weight: 2, date: '2024-01-22', timestamp: '2024-01-22T14:00:00Z' }
          ]
        },
        {
          id: 'german-002',
          name: 'Deutsch',
          color: '#4ECDC4',
          grades: [
            { id: '3', grade: 2.0, type: 'Hausaufgabe', weight: 1, date: '2024-01-18', timestamp: '2024-01-18T09:00:00Z' },
            { id: '4', grade: 2.7, type: 'Präsentation', weight: 1.5, date: '2024-01-25', timestamp: '2024-01-25T11:00:00Z' }
          ]
        },
        {
          id: 'english-003',
          name: 'Englisch',
          color: '#45B7D1',
          grades: [
            { id: '5', grade: 1.3, type: 'Test', weight: 1, date: '2024-01-20', timestamp: '2024-01-20T08:00:00Z' }
          ]
        },
        {
          id: 'science-004',
          name: 'Naturwissenschaften',
          color: '#96CEB4',
          grades: []
        }
      ],
      lastUpdated: new Date().toISOString(),
      source: 'sample_data'
    };
  }
}

export default MobileEncryptionService;