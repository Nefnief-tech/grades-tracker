import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(combined.iv, 'hex'));
        
        let decrypted = decipher.update(combined.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Mobile decryption failed:', error);
        throw new Error('Failed to decrypt mobile data');
    }
}

/**
 * POST /api/grades/test-mobile-decrypt
 * Test endpoint to verify mobile decryption works
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { mobileEncryptedGrades, userId } = body;

        if (!mobileEncryptedGrades || !userId) {
            return NextResponse.json({
                error: 'Missing required fields',
                required: ['mobileEncryptedGrades', 'userId']
            }, { status: 400 });
        }

        // Test decryption
        const decryptedData = decryptFromMobile(mobileEncryptedGrades, userId);

        return NextResponse.json({
            success: true,
            message: 'Mobile decryption test successful',
            dataPreview: {
                subjectCount: decryptedData.subjects?.length || 0,
                sampleSubject: decryptedData.subjects?.[0]?.name || 'none',
                totalGrades: decryptedData.subjects?.reduce((total: number, subject: any) => 
                    total + (subject.grades?.length || 0), 0) || 0,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Test decryption failed:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Decryption test failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
    }
}

/**
 * GET /api/grades/test-mobile-decrypt
 * Get information about the test endpoint
 */
export async function GET() {
    return NextResponse.json({
        endpoint: '/api/grades/test-mobile-decrypt',
        method: 'POST',
        description: 'Test mobile decryption functionality',
        requiredFields: ['mobileEncryptedGrades', 'userId'],
        usage: {
            description: 'Send mobile-encrypted grades to test if they can be decrypted',
            example: {
                mobileEncryptedGrades: 'base64_encoded_mobile_data',
                userId: 'user123'
            }
        },
        encryption: {
            method: 'AES-256-CBC with Base64 encoding',
            keySource: 'SHA256 hash of user ID (padded to 32 chars)',
            format: 'Base64 JSON with IV and encrypted data'
        }
    });
}