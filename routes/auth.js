const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('../db/config');
const auth = require('../middleware/auth');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, farm_name, location } = req.body;

    try {
        // Check if user exists
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, farm_name, location) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, farm_name, location]
        );

        // Create JWT payload
        const payload = {
            user: {
                id: result.insertId
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) {
                    console.error('JWT sign error:', err);
                    return res.status(500).json({ msg: 'Server error' });
                }
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) {
                    console.error('JWT sign error:', err);
                    return res.status(500).json({ msg: 'Server error' });
                }
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/auth/user
// @desc    Get user information
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, name, email, farm_name, location FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(users[0]);
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ msg: 'No user found with this email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save reset token to database
        await pool.query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
            [resetToken, resetTokenExpiry, email]
        );

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ msg: 'Password reset link sent to your email' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        // Find user with valid reset token
        const [users] = await pool.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ msg: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear reset token
        await pool.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
            [hashedPassword, users[0].id]
        );

        res.json({ msg: 'Password has been reset' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router; 