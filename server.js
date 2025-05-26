require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://192.168.100.191:3000', 'https://farmstead-finance-track-hub.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request Headers:', req.headers);
    next();
});

// Basic route for testing
app.get('/test', (req, res) => {
    console.log('Test endpoint hit from IP:', req.ip);
    res.json({ 
        message: 'Server is running!',
        timestamp: new Date().toISOString(),
        clientIP: req.ip,
        headers: req.headers
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/records', require('./routes/records'));
app.use('/api/reports', require('./routes/reports'));

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        headers: req.headers,
        ip: req.ip
    });
    res.status(500).json({ 
        msg: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Only start the server if we're not in a Vercel environment
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log('=================================');
        console.log(`Server is running on port ${PORT}`);
        console.log('=================================');
        console.log('Access the application at:');
        console.log(`- Local: http://localhost:${PORT}`);
        console.log(`- Network: http://192.168.100.191:${PORT}`);
        console.log('=================================');
    });
}

// Export the Express API
module.exports = app; 