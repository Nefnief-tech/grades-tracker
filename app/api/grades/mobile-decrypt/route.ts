import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
function decryptWebData(encryptedData: string, userPassword: string) {
    try {
        const data = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
        
        // Derive key from password using web app method
        const key = crypto.pbkdf2Sync(userPassword, Buffer.from(data.salt, 'hex'), 10000, WEB_KEY_LENGTH, 'sha256');
          // Create decipher
        const decipher = crypto.createDecipheriv(WEB_ENCRYPTION_ALGORITHM, key, Buffer.from(data.iv, 'hex'));
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
function encryptForMobile(data: any, userId: string) {
    try {
        // Create simple key from user ID
        const keySource = userId.padEnd(32, '0'); // Pad to 32 characters
        const key = crypto.createHash('sha256').update(keySource).digest();
        
        // Generate random IV
        const iv = crypto.randomBytes(MOBILE_IV_LENGTH);
          // Encrypt data
        const cipher = crypto.createCipheriv(MOBILE_ENCRYPTION_ALGORITHM, key, iv);
        
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
 * Encrypt data using web app method (for reverse operation)
 */
function encryptWebData(data: any, userPassword: string) {
    try {
        // Generate salt and IV
        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(WEB_IV_LENGTH);
        
        // Derive key
        const key = crypto.pbkdf2Sync(userPassword, salt, 10000, WEB_KEY_LENGTH, 'sha256');
          // Encrypt
        const cipher = crypto.createCipheriv(WEB_ENCRYPTION_ALGORITHM, key, iv);
        
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

/**
 * POST /api/grades/mobile-decrypt
 * Decrypt grades from web app and re-encrypt for mobile
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            encryptedGrades, 
            userPassword, 
            userId,
            requestId 
        } = body;

        // Validate required fields
        if (!encryptedGrades || !userPassword || !userId) {
            return NextResponse.json({
                error: 'Missing required fields',
                required: ['encryptedGrades', 'userPassword', 'userId']
            }, { status: 400 });
        }

        console.log(`Processing grade decryption for user: ${userId}`);

        // Decrypt grades using web app method
        const decryptedGrades = decryptWebData(encryptedGrades, userPassword);

        // Re-encrypt for mobile using user ID as key
        const mobileEncryptedGrades = encryptForMobile(decryptedGrades, userId);

        // Log successful conversion
        console.log(`Successfully converted grades for user ${userId}:`, {
            subjectCount: decryptedGrades.subjects?.length || 0,
            totalGrades: decryptedGrades.subjects?.reduce((total: number, subject: any) => 
                total + (subject.grades?.length || 0), 0) || 0
        });

        return NextResponse.json({
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
        
        return NextResponse.json({
            error: 'Failed to decrypt grades',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}