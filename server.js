require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS configuration - more permissive for development
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Basic route for testing
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/records', require('./routes/records'));
app.use('/api/reports', require('./routes/reports'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        msg: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

// Listen on all network interfaces
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
}); 