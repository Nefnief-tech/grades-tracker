import { Client, Functions } from 'appwrite';
import fs from 'fs';
import path from 'path';
import { AppwriteException } from 'appwrite';

/**
 * Service for sending emails through Appwrite Functions
 */
export class EmailService {
  private client: Client;
  private functions: Functions;
  private readonly emailFunctionId: string;
  
  constructor() {
    this.client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
      
    this.functions = new Functions(this.client);
    this.emailFunctionId = process.env.NEXT_PUBLIC_APPWRITE_EMAIL_FUNCTION_ID || '';
  }
  
  /**
   * Send a 2FA verification code via email
   * @param email Recipient's email address
   * @param name Recipient's name
   * @param code Verification code
   * @returns Success status
   */
  async send2FACode(email: string, name: string, code: string): Promise<boolean> {
    try {
      const payload = JSON.stringify({
        email,
        name,
        code,
        template: '2fa',
        subject: 'Your GradeTracker Verification Code'
      });
      
      const response = await this.functions.createExecution(
        this.emailFunctionId,
        payload
      );
      
      return response.status === 'completed';
    } catch (error) {
      console.error('Error sending 2FA email:', error);
      return false;
    }
  }
  
  /**
   * Generate HTML for a 2FA verification email
   * @param name Recipient's name
   * @param code Verification code
   * @returns HTML email content
   */
  static generate2FAEmailHTML(name: string, code: string): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin-bottom: 5px;">GradeTracker</h1>
          <p style="color: #6B7280; margin-top: 0;">Security Verification</p>
        </div>
        
        <div style="background-color: #F9FAFB; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
          <h2 style="color: #111827; margin-top: 0;">Two-Factor Authentication</h2>
          <p style="color: #374151;">Hello ${name || 'there'},</p>
          <p style="color: #374151;">Your verification code for GradeTracker is:</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; background-color: #F3F4F6; border-radius: 5px; color: #374151;">
            ${code}
          </div>
          <p style="color: #6B7280; margin-top: 10px; font-size: 14px;">
            This code will expire in 10 minutes.
          </p>
        </div>
        
        <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin-bottom: 20px;">
          <p style="color: #B91C1C; margin: 0;">If you did not request this code, please secure your account immediately by changing your password.</p>
        </div>
        
        <div style="text-align: center; padding-top: 15px; border-top: 1px solid #e0e0e0;">
          <p style="color: #6B7280; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
            <br>
            &copy; ${new Date().getFullYear()} GradeTracker. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }
}

/**
 * Interface for email template data
 */
interface EmailTemplateData {
  user: string;
  code: string;
  project: string;
  redirect: string;
  logoUrl?: string;
  currentYear?: number;
  emails?: {
    mfaChallenge: {
      body: string;
      footer: string;
    }
  };
  [key: string]: any;
}

/**
 * Default values for MFA email templates
 */
const DEFAULT_MFA_EMAIL_DATA: Partial<EmailTemplateData> = {
  project: 'Grade Tracker',
  logoUrl: 'https://appwrite.nief.tech/images/logo.png',
  currentYear: new Date().getFullYear(),
  emails: {
    mfaChallenge: {
      body: 'For security purposes, we need to verify your identity. Please use the verification code below to complete the authentication process:',
      footer: 'This is an automated message. Please do not reply to this email.'
    }
  }
};

/**
 * Renders an email template with the provided data
 * @param templatePath Path to the email template file
 * @param data Data to inject into the template
 * @returns Rendered email content
 */
export function renderEmailTemplate(templatePath: string, data: EmailTemplateData): string {
  try {
    // Read the template file
    const template = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace placeholders with data
    const rendered = template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const keys = key.trim().split('.');
      let value = data;
      
      // Handle nested properties
      for (const k of keys) {
        if (value === undefined || value === null) return '';
        value = value[k];
      }
      
      return value !== undefined ? value : '';
    });
    
    return rendered;
  } catch (error) {
    console.error('Error rendering email template:', error);
    return '';
  }
}

/**
 * Sends an MFA verification email with the provided data
 * @param email Recipient email address
 * @param code Verification code
 * @param challengeId Challenge ID for verification
 * @param userData Additional user data
 * @returns Success status
 */
export async function sendMfaVerificationEmail(
  email: string,
  code: string,
  challengeId: string,
  userData: Partial<EmailTemplateData> = {}
): Promise<boolean> {
  try {
    // Combine default data with user data
    const data: EmailTemplateData = {
      ...DEFAULT_MFA_EMAIL_DATA,
      ...userData,
      user: userData.user || email.split('@')[0],
      code,
      redirect: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-mfa?challengeId=${challengeId}&email=${encodeURIComponent(email)}&code=${code}`
    };
    
    // Render the email templates
    const htmlTemplate = path.join(process.cwd(), 'templates', 'mfa-verification-email.html');
    const textTemplate = path.join(process.cwd(), 'templates', 'mfa-verification-email.txt');
    
    const htmlContent = renderEmailTemplate(htmlTemplate, data);
    const textContent = renderEmailTemplate(textTemplate, data);
    
    // TODO: Implement your email sending logic here
    // This is placeholder code - replace with your actual email service
    console.log(`[Email Service] Would send email to ${email}`);
    console.log(`[Email Service] HTML Content: ${htmlContent.substring(0, 100)}...`);
    console.log(`[Email Service] Text Content: ${textContent.substring(0, 100)}...`);
    
    // For production, you would use a service like SendGrid, AWS SES, etc.
    // Example with a hypothetical email service:
    /*
    await emailClient.send({
      to: email,
      from: 'noreply@yourdomain.com',
      subject: 'Your Verification Code',
      text: textContent,
      html: htmlContent
    });
    */
    
    return true;
  } catch (error) {
    console.error('Error sending MFA verification email:', error);
    return false;
  }
}

/**
 * Sends a test MFA verification email
 * @param email Recipient email address
 * @returns Success status
 */
export async function sendTestMfaEmail(email: string): Promise<boolean> {
  const testCode = '123456';
  const testChallengeId = 'test-challenge-id';
  
  return sendMfaVerificationEmail(email, testCode, testChallengeId, {
    user: 'Test User'
  });
}