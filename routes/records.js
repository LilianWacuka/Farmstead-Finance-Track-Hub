const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db/config');

// @route   POST api/records
// @desc    Add a new record
// @access  Private
router.post('/', auth, async (req, res) => {
    const {
        type,
        category,
        amount,
        date,
        description,
        payment_method,
        vendor_buyer,
        receipt_number,
        notes
    } = req.body;

    // Validate required fields
    if (!type || !category || !amount || !date || !description || !payment_method || !vendor_buyer) {
        return res.status(400).json({ 
            msg: 'Missing required fields',
            details: {
                type: !type ? 'Type is required' : null,
                category: !category ? 'Category is required' : null,
                amount: !amount ? 'Amount is required' : null,
                date: !date ? 'Date is required' : null,
                description: !description ? 'Description is required' : null,
                payment_method: !payment_method ? 'Payment method is required' : null,
                vendor_buyer: !vendor_buyer ? 'Vendor/Buyer is required' : null
            }
        });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO records (
                user_id, type, category, amount, date, description,
                payment_method, vendor_buyer, receipt_number, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                type,
                category,
                amount,
                date || new Date(),
                description,
                payment_method,
                vendor_buyer,
                receipt_number || null,
                notes || null
            ]
        );

        res.json({
            id: result.insertId,
            type,
            category,
            amount,
            date,
            description,
            payment_method,
            vendor_buyer,
            receipt_number,
            notes
        });
    } catch (err) {
        console.error('Add record error:', err);
        res.status(500).json({ 
            msg: 'Failed to add record',
            error: err.message
        });
    }
});

// @route   GET api/records
// @desc    Get all records for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const [records] = await pool.query(
            'SELECT * FROM records WHERE user_id = ? ORDER BY date DESC',
            [req.user.id]
        );

        res.json(records);
    } catch (err) {
        console.error('Get records error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/records/summary
// @desc    Get financial summary
// @access  Private
router.get('/summary', auth, async (req, res) => {
    try {
        const [summary] = await pool.query(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
            FROM records 
            WHERE user_id = ?`,
            [req.user.id]
        );

        const netBalance = summary[0].total_income - summary[0].total_expenses;
        res.json({
            totalIncome: summary[0].total_income || 0,
            totalExpenses: summary[0].total_expenses || 0,
            netBalance
        });
    } catch (err) {
        console.error('Get summary error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/records/filter
// @desc    Get filtered records
// @access  Private
router.get('/filter', auth, async (req, res) => {
    const { startDate, endDate, period } = req.query;
    let query = 'SELECT * FROM records WHERE user_id = ?';
    let params = [req.user.id];

    try {
        if (period === 'week') {
            query += ' AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } else if (period === 'month') {
            query += ' AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        } else if (startDate && endDate) {
            query += ' AND date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY date DESC';

        const [records] = await pool.query(query, params);
        res.json(records);
    } catch (err) {
        console.error('Filter records error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router; 