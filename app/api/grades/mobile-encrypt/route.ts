import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Mobile app encryption configuration
const MOBILE_ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const MOBILE_IV_LENGTH = 16;

// Web app encryption configuration
const WEB_ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const WEB_KEY_LENGTH = 32;
const WEB_IV_LENGTH = 16;

/**
 * Decrypt data using simple Base64 method from mobile app
 */
function decryptFromMobile(encryptedData: string, userId: string) {
    try {
        // Decode from Base64
        const combined = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
        
        // Create key from user ID
        const keySource = userId.padEnd(32, '0');
        const key = crypto.createHash('sha256').update(keySource).digest();
        
        // Decrypt
        const decipher = crypto.createDecipheriv(MOBILE_ENCRYPTION_ALGORITHM, key, Buffer.from(combined.iv, 'hex'));
        
        let decrypted = decipher.update(combined.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Mobile decryption failed:', error);
        throw new Error('Failed to decrypt mobile data');
    }
}

/**
 * Encrypt data using web app method
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
 * POST /api/grades/mobile-encrypt
 * Encrypt grades from mobile app format back to web format
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            mobileEncryptedGrades,
            userPassword,
            userId,
            requestId
        } = body;

        // Validate required fields
        if (!mobileEncryptedGrades || !userPassword || !userId) {
            return NextResponse.json({
                error: 'Missing required fields',
                required: ['mobileEncryptedGrades', 'userPassword', 'userId']
            }, { status: 400 });
        }

        console.log(`Processing grade encryption for user: ${userId}`);

        // Decrypt from mobile format
        const gradesData = decryptFromMobile(mobileEncryptedGrades, userId);

        // Re-encrypt using web app method
        const webEncryptedGrades = encryptWebData(gradesData, userPassword);

        console.log(`Successfully converted grades from mobile for user ${userId}:`, {
            subjectCount: gradesData.subjects?.length || 0,
            totalGrades: gradesData.subjects?.reduce((total: number, subject: any) => 
                total + (subject.grades?.length || 0), 0) || 0
        });

        return NextResponse.json({
            success: true,
            encryptedGrades: webEncryptedGrades,
            encryption: {
                method: 'web_app_compatible',
                algorithm: WEB_ENCRYPTION_ALGORITHM
            },
            metadata: {
                userId: userId,
                requestId: requestId || crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                subjectCount: gradesData.subjects?.length || 0
            }
        });

    } catch (error) {
        console.error('Grade encryption API error:', error);
        
        return NextResponse.json({
            error: 'Failed to encrypt grades',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}