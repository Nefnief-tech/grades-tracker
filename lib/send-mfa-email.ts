// Dependency note: This file requires the following packages:
// npm install nodemailer handlebars
// npm install --save-dev @types/nodemailer @types/handlebars

import fs from 'fs/promises';
import path from 'path';

// Handle importing dependencies that might not be installed
let nodemailer: any;
let Handlebars: any;

try {
  // Dynamic imports to prevent build errors if dependencies aren't installed
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('Nodemailer not installed. Email functionality will be disabled.');
}

try {
  // Dynamic imports to prevent build errors if dependencies aren't installed
  Handlebars = require('handlebars');
} catch (e) {
  console.warn('Handlebars not installed. Email templating will be disabled.');
}

interface MfaEmailOptions {
  to: string;
  userName: string;
  code: string;
  challengeId: string;
  projectName?: string;
  logoUrl?: string;
}

/**
 * Send an MFA verification email with the verification code
 */
export async function sendMfaVerificationEmail(options: MfaEmailOptions): Promise<boolean> {
  const {
    to,
    userName,
    code,
    challengeId,
    projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || 'Grade Tracker',
    logoUrl = process.env.NEXT_PUBLIC_LOGO_URL
  } = options;

  try {
    // Read the email template files
    const templateDir = path.join(process.cwd(), 'templates');
    const htmlTemplate = await fs.readFile(path.join(templateDir, 'mfa-verification-email.html'), 'utf8');
    const textTemplate = await fs.readFile(path.join(templateDir, 'mfa-verification-email-text.txt'), 'utf8');

    // Create the verification URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-mfa?challengeId=${encodeURIComponent(challengeId)}`;

    // Compile templates with Handlebars
    const compileHtml = Handlebars.compile(htmlTemplate);
    const compileText = Handlebars.compile(textTemplate);

    // Prepare email data
    const emailData = {
      user: userName,
      code,
      redirect: verifyUrl,
      project: projectName,
      logoUrl,
      currentYear: new Date().getFullYear(),
      subject: `${projectName} - Your Verification Code`,
      preHeader: `Your verification code for ${projectName}`,
      emails: {
        mfaChallenge: {
          body: "You've requested to log in to your account. Please enter the verification code below to complete the authentication process.",
          footer: "This email was sent to you because you requested to log in to your account. If you didn't make this request, please ignore this email or contact support."
        }
      }
    };

    // Render the email content
    const htmlContent = compileHtml(emailData);
    const textContent = compileText(emailData);

    // Configure email transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Send the email
    const info = await transporter.sendMail({
      from: `"${projectName}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: `${projectName} - Your Verification Code`,
      text: textContent,
      html: htmlContent
    });

    console.log(`[MFA Email] Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[MFA Email] Error sending verification email:', error);
    return false;
  }
}