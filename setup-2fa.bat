@echo off
echo Setting up Two-Factor Authentication...

echo.
echo ======================================================
echo IMPORTANT: Create collections in Appwrite
echo ======================================================
echo.
echo You can create the collections in two ways:
echo.
echo 1. AUTOMATIC: Run create-collections.bat script
echo    - This will create both collections automatically
echo    - Requires APPWRITE_API_KEY in your .env file
echo.
echo 2. MANUAL: Create collections through Appwrite Console
echo    - Collection #1: two_factor_codes
echo      Attributes:
echo      - userId (String, required, indexed)
echo      - code (String, required)
echo      - expiresAt (DateTime, required, indexed)
echo      - used (Boolean, required, default: false)
echo.
echo    - Collection #2: user_preferences
echo      Attributes:
echo      - userId (String, required, indexed)
echo      - twoFactorEnabled (Boolean, required, default: false)
echo.
echo ==============================================================
echo.
echo Appwrite Function Setup:
echo.
echo Create a function for sending emails with these settings:
echo 1. Name: send-2fa-email
echo 2. Runtime: Node.js
echo 3. Environment Variables:
echo    - EMAIL_FROM: Your sender email address
echo.
echo Function code example:
echo.
echo const sdk = require("node-appwrite");
echo const nodemailer = require("nodemailer");
echo.
echo module.exports = async function(req, res) {
echo   const data = JSON.parse(req.payload);
echo   const { email, name, code, subject, template } = data;
echo.
echo   // Create a transporter
echo   const transporter = nodemailer.createTransport({
echo     // Your email service settings
echo     service: "gmail", // or your preferred service
echo     auth: {
echo       user: process.env.EMAIL_FROM,
echo       pass: process.env.EMAIL_PASSWORD
echo     }
echo   });
echo.
echo   // Send email with code
echo   await transporter.sendMail({
echo     from: process.env.EMAIL_FROM,
echo     to: email,
echo     subject: subject || "Your verification code",
echo     html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
echo       <h2>Hello ${name},</h2>
echo       <p>Your verification code is:</p>
echo       <div style="background:#f4f4f4;padding:10px;text-align:center;font-size:24px;font-weight:bold;letter-spacing:5px">
echo         ${code}
echo       </div>
echo       <p>This code will expire in 10 minutes.</p>
echo       <p>If you didn't request this code, you can ignore this email.</p>
echo     </div>`
echo   });
echo.
echo   return res.json({
echo     success: true,
echo     message: "Verification email sent"
echo   });
echo };
echo.
echo ==============================================================
echo.
echo Add these environment variables to your .env.local file:
echo NEXT_PUBLIC_APPWRITE_EMAIL_FUNCTION_ID=your_function_id
echo NEXT_PUBLIC_APPWRITE_DATABASE_ID=68121d5f002cc0967d46
echo NEXT_PUBLIC_APPWRITE_USER_PREFS_COLLECTION_ID=user_preferences
echo NEXT_PUBLIC_APPWRITE_2FA_CODES_COLLECTION_ID=two_factor_codes
echo.
echo ======================================================
echo.
echo IMPORTANT: Until collections are created, you'll see errors like:
echo "Collection with the requested ID could not be found"
echo.
echo During development, you can still test 2FA with these codes:
echo - "123456" (standard test code)
echo - "111111" (universal fallback code)
echo.
echo The 2FA settings will temporarily use localStorage until
echo the proper collections are set up in Appwrite.
echo.
echo ======================================================
echo.
echo Press any key to continue...
pause > nul

echo Creating email function configuration...
echo Set up an Appwrite function to handle sending emails
echo with the verification codes using the example templates.
echo.
echo Press any key to continue...
pause > nul

echo Setup complete!
echo Run fix-login.bat to implement the 2FA flow in your app.