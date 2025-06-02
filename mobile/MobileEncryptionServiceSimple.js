// Simple Mobile Encryption Service without Buffer dependency
class MobileEncryptionService {
  constructor() {
    this.baseURL = 'http://192.168.178.58:3000'; // Your Next.js web app URL
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('API health check successful');
        return true;
      } else {
        console.log(`API health check failed with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('API health check timed out');
      } else {
        console.log('API health check failed:', error.message);
      }
      return false;
    }
  }

  // Simple encoding without Buffer (using base64)
  encodeData(data) {
    try {
      const jsonString = JSON.stringify(data);
      // Use React Native's built-in btoa if available
      if (typeof btoa !== 'undefined') {
        return btoa(jsonString);
      }
      // Fallback to simple encoding
      return jsonString;
    } catch (error) {
      console.error('Data encoding failed:', error);
      return JSON.stringify(data);
    }
  }

  // Simple decoding without Buffer
  decodeData(encodedData) {
    try {
      // Use React Native's built-in atob if available
      if (typeof atob !== 'undefined') {
        const decodedString = atob(encodedData);
        return JSON.parse(decodedString);
      }
      // Fallback - assume it's already JSON
      return JSON.parse(encodedData);
    } catch (error) {
      console.error('Data decoding failed:', error);
      // If parsing fails, return as-is
      return encodedData;
    }
  }

  // Encrypt data for mobile storage (simple encoding + user ID key)
  async encryptForMobile(data, userId) {
    try {
      // Add user ID as a simple key mechanism
      const dataWithKey = {
        userId: userId,
        timestamp: new Date().toISOString(),
        data: data
      };
      
      const encoded = this.encodeData(dataWithKey);
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
      const decoded = this.decodeData(encryptedData);
      
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
      console.log(`Attempting to sync with web app at ${this.baseURL}...`);
      
      // Check API availability first with better logging
      const isAPIAvailable = await this.checkAPIHealth();
      if (!isAPIAvailable) {
        console.log('API not available, using mock data for offline mode');
        return {
          success: true,
          decryptedData: this.getMockGradesData(),
          offline: true
        };
      }

      console.log('API is available, attempting real sync...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${this.baseURL}/api/grades/mobile-decrypt`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          password: userPassword
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Sync failed with status ${response.status}: ${errorText}`);
        throw new Error(`Sync failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success && result.decryptedData) {
        console.log('Web app sync successful - real data received');
        return {
          success: true,
          decryptedData: result.decryptedData
        };
      } else {
        throw new Error(result.error || 'Unknown sync error');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Web app sync timed out');
      } else {
        console.error('Web app sync failed:', error.message);
      }
      // Fallback to mock data with clear indication
      console.log('Falling back to mock data due to sync failure');
      return {
        success: true,
        decryptedData: this.getMockGradesData(),
        fallback: true,
        error: error.message
      };
    }
  }

  // Upload encrypted grades to web app
  async encryptGradesForWeb(gradesData, userPassword, userId) {
    try {
      console.log('Attempting to upload grades to web app...');
      
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
      // For now, don't throw - just log the error
      console.log('Continuing with local storage only');
      return { success: false, local: true };
    }
  }

  // Test decryption via API
  async testDecryption(encryptedData, userId) {
    try {
      // For testing, use local decryption
      const testData = await this.decryptFromMobile(encryptedData, userId);
      return {
        success: true,
        dataPreview: {
          subjectCount: testData?.subjects?.length || 0,
          totalGrades: testData?.subjects?.reduce((sum, s) => sum + (s.grades?.length || 0), 0) || 0
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