const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db/config');
const PDFDocument = require('pdfkit');

// @route   GET api/reports/weekly
// @desc    Generate weekly report
// @access  Private
router.get('/weekly', auth, async (req, res) => {
    try {
        const [records] = await pool.query(
            `SELECT * FROM records 
            WHERE user_id = ? 
            AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ORDER BY date DESC`,
            [req.user.id]
        );

        const format = req.query.format || 'csv';
        
        if (format === 'csv') {
            // Generate CSV
            const csv = generateCSV(records);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=weekly-report.csv');
            res.send(csv);
        } else {
            // Generate PDF
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=weekly-report.pdf');
            doc.pipe(res);
            
            // Add content to PDF
            doc.fontSize(20).text('Weekly Financial Report', { align: 'center' });
            doc.moveDown();
            
            records.forEach(record => {
                doc.fontSize(12).text(`${record.date}: ${record.type.toUpperCase()} - $${record.amount}`);
                doc.fontSize(10).text(`Description: ${record.description}`);
                doc.moveDown();
            });
            
            doc.end();
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/reports/monthly
// @desc    Generate monthly report
// @access  Private
router.get('/monthly', auth, async (req, res) => {
    try {
        const [records] = await pool.query(
            `SELECT * FROM records 
            WHERE user_id = ? 
            AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            ORDER BY date DESC`,
            [req.user.id]
        );

        const format = req.query.format || 'csv';
        
        if (format === 'csv') {
            // Generate CSV
            const csv = generateCSV(records);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=monthly-report.csv');
            res.send(csv);
        } else {
            // Generate PDF
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=monthly-report.pdf');
            doc.pipe(res);
            
            // Add content to PDF
            doc.fontSize(20).text('Monthly Financial Report', { align: 'center' });
            doc.moveDown();
            
            records.forEach(record => {
                doc.fontSize(12).text(`${record.date}: ${record.type.toUpperCase()} - $${record.amount}`);
                doc.fontSize(10).text(`Description: ${record.description}`);
                doc.moveDown();
            });
            
            doc.end();
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Helper function to generate CSV
function generateCSV(records) {
    const headers = ['Date', 'Type', 'Amount', 'Description'];
    const rows = records.map(record => [
        record.date,
        record.type,
        record.amount,
        record.description
    ]);
    
    return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
}

module.exports = router; 