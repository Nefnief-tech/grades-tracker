const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Client, Databases, Account } = require('node-appwrite');

const router = express.Router();

// Appwrite configuration
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const account = new Account(client);

// Web app encryption configuration (complex method)
const WEB_ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const WEB_KEY_LENGTH = 32;
const WEB_IV_LENGTH = 16;

// Mobile app encryption configuration (simple Base64 with user ID key)
const MOBILE_ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const MOBILE_IV_LENGTH = 16;

/**
 * Decrypt data using web app method (complex encryption)
 */
function decryptWebData(encryptedData, userPassword) {
    try {
        const data = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
        
        // Derive key from password using web app method
        const key = crypto.pbkdf2Sync(userPassword, data.salt, 10000, WEB_KEY_LENGTH, 'sha256');
        
        // Create decipher
        const decipher = crypto.createDecipherGCM(WEB_ENCRYPTION_ALGORITHM, key);
        decipher.setIV(Buffer.from(data.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
        
        // Decrypt
        let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Web decryption failed:', error);
        throw new Error('Failed to decrypt web data');
    }
}

/**
 * Encrypt data using simple Base64 method for mobile app
 */
function encryptForMobile(data, userId) {
    try {
        // Create simple key from user ID
        const keySource = userId.padEnd(32, '0'); // Pad to 32 characters
        const key = crypto.createHash('sha256').update(keySource).digest();
        
        // Generate random IV
        const iv = crypto.randomBytes(MOBILE_IV_LENGTH);
        
        // Encrypt data
        const cipher = crypto.createCipher(MOBILE_ENCRYPTION_ALGORITHM, key);
        cipher.setIV(iv);
        
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Combine IV and encrypted data, then encode as Base64
        const combined = {
            iv: iv.toString('hex'),
            encrypted: encrypted
        };
        
        return Buffer.from(JSON.stringify(combined)).toString('base64');
    } catch (error) {
        console.error('Mobile encryption failed:', error);
        throw new Error('Failed to encrypt for mobile');
    }
}

/**
 * Decrypt data using simple Base64 method for mobile app
 */
function decryptFromMobile(encryptedData, userId) {
    try {
        // Decode from Base64
        const combined = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
        
        // Create key from user ID
        const keySource = userId.padEnd(32, '0');
        const key = crypto.createHash('sha256').update(keySource).digest();
        
        // Decrypt
        const decipher = crypto.createDecipher(MOBILE_ENCRYPTION_ALGORITHM, key);
        decipher.setIV(Buffer.from(combined.iv, 'hex'));
        
        let decrypted = decipher.update(combined.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Mobile decryption failed:', error);
        throw new Error('Failed to decrypt mobile data');
    }
}

/**
 * Verify JWT token and get user info
 */
async function verifyUser(token) {
    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from Appwrite
        const user = await account.get();
        
        return { userId: user.$id, email: user.email };
    } catch (error) {
        throw new Error('Invalid authentication token');
    }
}

/**
 * GET /api/mobile/grades/decrypt
 * Decrypt grades from web app and re-encrypt for mobile
 */
router.post('/decrypt', async (req, res) => {
    try {
        const { 
            token,           // JWT authentication token
            encryptedGrades, // Encrypted grades from web app
            userPassword,    // User's password for web decryption
            requestId        // Optional: request ID for additional security
        } = req.body;

        // Validate required fields
        if (!token || !encryptedGrades || !userPassword) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['token', 'encryptedGrades', 'userPassword']
            });
        }

        // Verify user authentication
        const { userId, email } = await verifyUser(token);

        console.log(`Processing grade decryption for user: ${userId}`);

        // Decrypt grades using web app method
        const decryptedGrades = decryptWebData(encryptedGrades, userPassword);

        // Re-encrypt for mobile using user ID as key
        const mobileEncryptedGrades = encryptForMobile(decryptedGrades, userId);

        // Log successful conversion
        console.log(`Successfully converted grades for user ${userId}:`, {
            subjectCount: decryptedGrades.subjects?.length || 0,
            totalGrades: decryptedGrades.subjects?.reduce((total, subject) => 
                total + (subject.grades?.length || 0), 0) || 0
        });

        res.json({
            success: true,
            encryptedGrades: mobileEncryptedGrades,
            encryption: {
                method: 'base64_with_userid_key',
                algorithm: MOBILE_ENCRYPTION_ALGORITHM,
                keySource: 'user_id_hash'
            },
            metadata: {
                userId: userId,
                requestId: requestId || crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                subjectCount: decryptedGrades.subjects?.length || 0
            }
        });

    } catch (error) {
        console.error('Grade decryption API error:', error);
        
        res.status(500).json({
            error: 'Failed to decrypt grades',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/mobile/grades/encrypt
 * Encrypt grades from mobile app format back to web format
 */
router.post('/encrypt', async (req, res) => {
    try {
        const { 
            token,
            mobileEncryptedGrades,
            userPassword,
            requestId
        } = req.body;

        if (!token || !mobileEncryptedGrades || !userPassword) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['token', 'mobileEncryptedGrades', 'userPassword']
            });
        }

        // Verify user
        const { userId } = await verifyUser(token);

        // Decrypt from mobile format
        const gradesData = decryptFromMobile(mobileEncryptedGrades, userId);

        // Re-encrypt using web app method
        const webEncryptedGrades = encryptWebData(gradesData, userPassword);

        res.json({
            success: true,
            encryptedGrades: webEncryptedGrades,
            encryption: {
                method: 'web_app_compatible',
                algorithm: WEB_ENCRYPTION_ALGORITHM
            },
            metadata: {
                userId: userId,
                requestId: requestId || crypto.randomUUID(),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Grade encryption API error:', error);
        
        res.status(500).json({
            error: 'Failed to encrypt grades',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/mobile/grades/test-decrypt
 * Test endpoint to verify mobile decryption works
 */
router.post('/test-decrypt', async (req, res) => {
    try {
        const { token, mobileEncryptedGrades } = req.body;

        if (!token || !mobileEncryptedGrades) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['token', 'mobileEncryptedGrades']
            });
        }

        // Verify user
        const { userId } = await verifyUser(token);

        // Test decryption
        const decryptedData = decryptFromMobile(mobileEncryptedGrades, userId);

        res.json({
            success: true,
            message: 'Mobile decryption test successful',
            dataPreview: {
                subjectCount: decryptedData.subjects?.length || 0,
                sampleSubject: decryptedData.subjects?.[0]?.name || 'none',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Test decryption failed:', error);
        
        res.status(400).json({
            success: false,
            error: 'Decryption test failed',
            message: error.message
        });
    }
});

// Helper function for web encryption (reverse operation)
function encryptWebData(data, userPassword) {
    try {
        // Generate salt and IV
        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(WEB_IV_LENGTH);
        
        // Derive key
        const key = crypto.pbkdf2Sync(userPassword, salt, 10000, WEB_KEY_LENGTH, 'sha256');
        
        // Encrypt
        const cipher = crypto.createCipherGCM(WEB_ENCRYPTION_ALGORITHM, key);
        cipher.setIV(iv);
        
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        // Combine all components
        const result = {
            encrypted: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            salt: salt.toString('hex')
        };
        
        return Buffer.from(JSON.stringify(result)).toString('base64');
    } catch (error) {
        console.error('Web encryption failed:', error);
        throw new Error('Failed to encrypt for web');
    }
}

module.exports = router;