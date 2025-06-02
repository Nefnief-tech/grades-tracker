const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:19006'], // React web app and Expo dev server
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Stricter rate limit for encryption/decryption operations
const encryptionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit encryption operations
    message: 'Too many encryption requests, please try again later'
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const mobileGradesRouter = require('./routes/mobile-grades');

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Grade Tracker Mobile API',
        version: '1.0.0'
    });
});

// Apply stricter rate limiting to mobile routes
app.use('/api/mobile/grades', encryptionLimiter, mobileGradesRouter);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        service: 'Grade Tracker Mobile API',
        version: '1.0.0',
        endpoints: {
            'GET /api/health': 'Health check',
            'POST /api/mobile/grades/decrypt': 'Decrypt grades from web app format to mobile format',
            'POST /api/mobile/grades/encrypt': 'Encrypt grades from mobile format to web app format',
            'POST /api/mobile/grades/test-decrypt': 'Test mobile decryption functionality'
        },
        encryption: {
            web_method: 'AES-256-GCM with PBKDF2 key derivation',
            mobile_method: 'AES-256-CBC with Base64 encoding and user ID key',
            security: 'JWT authentication required for all operations'
        },
        usage: {
            decrypt: {
                description: 'Convert web app encrypted grades to mobile format',
                required_fields: ['token', 'encryptedGrades', 'userPassword'],
                optional_fields: ['requestId']
            },
            encrypt: {
                description: 'Convert mobile encrypted grades back to web format',
                required_fields: ['token', 'mobileEncryptedGrades', 'userPassword'],
                optional_fields: ['requestId']
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    
    res.status(err.status || 500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableEndpoints: [
            'GET /api/health',
            'GET /api/docs',
            'POST /api/mobile/grades/decrypt',
            'POST /api/mobile/grades/encrypt',
            'POST /api/mobile/grades/test-decrypt'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Grade Tracker Mobile API running on port ${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📖 Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`🔐 Encryption endpoint: http://localhost:${PORT}/api/mobile/grades/decrypt`);
});

module.exports = app;