require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS configuration - most permissive for development
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        ip: req.ip,
        ips: req.ips
    });
    
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

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
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3000;

// Only start the server if we're not in a Vercel environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log('=================================');
        console.log(`Server is running on port ${PORT}`);
        console.log('=================================');
        console.log('Access the application at:');
        console.log(`- Local: http://localhost:${PORT}`);
        console.log(`- Network: http://192.168.100.191:${PORT}`);
        console.log('=================================');
        console.log('To test the server, visit:');
        console.log(`- http://192.168.100.191:${PORT}/test`);
        console.log('=================================');
        console.log('Server is listening on all network interfaces (0.0.0.0)');
        console.log('=================================');
    });
}

// Export the Express API
module.exports = app; 