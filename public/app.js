// API URL - Using specific IP address
const API_URL = 'http://192.168.100.191:5000/api';

// Add debug logging
console.log('API URL:', API_URL);

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const recordForm = document.getElementById('record-form');
const recordsTableBody = document.getElementById('records-table-body');
const applyFilterBtn = document.getElementById('apply-filter');
const userNameElement = document.getElementById('user-name');

// Forgot Password Modal
let forgotPasswordModal;
let resetPasswordModal;

// Check for token on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showDashboard();
    } else {
        showAuth();
    }

    // Initialize modals
    forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    resetPasswordModal = new bootstrap.Modal(document.getElementById('resetPasswordModal'));

    // Check for reset token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    if (resetToken) {
        document.getElementById('reset-token').value = resetToken;
        resetPasswordModal.show();
    }
});

// Load User Info
async function loadUserInfo() {
    try {
        console.log('Attempting to load user info...');
        const response = await fetch(`${API_URL}/auth/user`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        console.log('User info response:', response.status);
        if (response.ok) {
            const user = await response.json();
            userNameElement.textContent = `Welcome, ${user.name}`;
        }
    } catch (err) {
        console.error('Load user info error:', err);
    }
}

// Show Auth Section
function showAuth() {
    authSection.classList.remove('d-none');
    dashboardSection.classList.add('d-none');
    document.getElementById('auth-nav-item').classList.add('d-none');
    document.getElementById('user-nav-item').classList.add('d-none');
    document.getElementById('logout-nav-item').classList.add('d-none');
}

// Show Dashboard
function showDashboard() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAuth();
        return;
    }
    
    authSection.classList.add('d-none');
    dashboardSection.classList.remove('d-none');
    document.getElementById('auth-nav-item').classList.add('d-none');
    document.getElementById('user-nav-item').classList.remove('d-none');
    document.getElementById('logout-nav-item').classList.remove('d-none');
    
    loadRecords();
    loadSummary();
    loadUserInfo();
}

// Logout Function
function logout() {
    localStorage.removeItem('token');
    showAuth();
    loginForm.reset();
    registerForm.reset();
}

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        console.log('Attempting login...');
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Login response:', response.status);
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showDashboard();
            loadRecords();
            loadSummary();
        } else {
            alert(data.msg || 'Login failed');
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Login failed. Please try again.');
    }
});

// Handle record type change
document.getElementById('record-type').addEventListener('change', function() {
    const type = this.value;
    const categorySelect = document.getElementById('record-category');
    const incomeCategories = categorySelect.querySelector('.income-categories');
    const expenseCategories = categorySelect.querySelector('.expense-categories');
    
    // Reset category selection
    categorySelect.value = '';
    
    // Show/hide appropriate categories
    if (type === 'income') {
        incomeCategories.style.display = '';
        expenseCategories.style.display = 'none';
        // Select first income category
        const firstIncomeOption = incomeCategories.querySelector('option');
        if (firstIncomeOption) {
            firstIncomeOption.selected = true;
            updateCategoryDescription();
        }
    } else {
        incomeCategories.style.display = 'none';
        expenseCategories.style.display = '';
        // Select first expense category
        const firstExpenseOption = expenseCategories.querySelector('option');
        if (firstExpenseOption) {
            firstExpenseOption.selected = true;
            updateCategoryDescription();
        }
    }
});

// Handle category change
document.getElementById('record-category').addEventListener('change', updateCategoryDescription);

// Update category description
function updateCategoryDescription() {
    const categorySelect = document.getElementById('record-category');
    const selectedOption = categorySelect.options[categorySelect.selectedIndex];
    const description = selectedOption.getAttribute('data-description') || '';
    
    // Update the description field with the category description
    const descriptionInput = document.getElementById('record-description');
    descriptionInput.placeholder = description;
    
    // If the description field is empty, set it to the category description
    if (!descriptionInput.value) {
        descriptionInput.value = description;
    }
}

// Register Form Handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const farmName = document.getElementById('register-farm-name').value;
    const location = document.getElementById('register-location').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, farm_name: farmName, location })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showDashboard();
            loadRecords();
            loadSummary();
        } else {
            alert(data.msg || 'Registration failed');
        }
    } catch (err) {
        console.error('Registration error:', err);
        alert('Registration failed. Please try again.');
    }
});

// Record Form Handler
recordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        // Get form values
        const type = document.getElementById('record-type').value;
        const category = document.getElementById('record-category').value;
        const amount = document.getElementById('record-amount').value;
        const date = document.getElementById('record-date').value;
        const description = document.getElementById('record-description').value;
        const paymentMethod = document.getElementById('record-payment-method').value;
        const vendorBuyer = document.getElementById('record-vendor-buyer').value;
        const receiptNumber = document.getElementById('record-receipt-number').value;
        const notes = document.getElementById('record-notes').value;

        // Validate amount
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount greater than 0');
            return;
        }

        // Validate date
        if (!date) {
            alert('Please select a date');
            return;
        }

        // Validate category
        if (!category) {
            alert('Please select a category');
            return;
        }

        // Get the token
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to add records');
            showAuth();
            return;
        }

        // Show loading state
        const submitButton = recordForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Adding...';
        submitButton.disabled = true;

        const response = await fetch(`${API_URL}/records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                type,
                category,
                amount: parseFloat(amount),
                date,
                description,
                payment_method: paymentMethod,
                vendor_buyer: vendorBuyer,
                receipt_number: receiptNumber || null,
                notes: notes || null
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Reset form
            recordForm.reset();
            document.getElementById('record-date').valueAsDate = new Date();
            
            // Reload data
            await loadRecords();
            await loadSummary();
            
            alert('Record added successfully!');
        } else {
            // Handle validation errors
            if (response.status === 400 && data.details) {
                const errorMessages = Object.values(data.details)
                    .filter(msg => msg !== null)
                    .join('\n');
                alert(`Please fix the following errors:\n${errorMessages}`);
            } else {
                alert(data.msg || 'Failed to add record');
            }
        }
    } catch (err) {
        console.error('Add record error:', err);
        alert('Failed to add record. Please check your connection and try again.');
    } finally {
        // Reset button state
        const submitButton = recordForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Add Record';
        submitButton.disabled = false;
    }
});

// Filter Handler
applyFilterBtn.addEventListener('click', () => {
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;
    const period = document.getElementById('quick-filter').value;

    loadRecords({ startDate, endDate, period });
});

// Load Records
async function loadRecords(filters = {}) {
    try {
        let url = `${API_URL}/records`;
        if (filters.startDate || filters.endDate || filters.period) {
            url = `${API_URL}/records/filter`;
            const params = new URLSearchParams(filters);
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const records = await response.json();
            displayRecords(records);
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to load records');
        }
    } catch (err) {
        console.error('Load records error:', err);
        alert('Failed to load records. Please try again.');
    }
}

// Load Summary
async function loadSummary() {
    try {
        const response = await fetch(`${API_URL}/records/summary`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const summary = await response.json();
            const totalIncome = summary.totalIncome || 0;
            const totalExpenses = summary.totalExpenses || 0;
            const netBalance = summary.netBalance || 0;

            // Format numbers with commas and 2 decimal places
            document.getElementById('total-income').textContent = 
                `$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            document.getElementById('total-expenses').textContent = 
                `$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            document.getElementById('net-balance').textContent = 
                `$${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            // Add color to net balance based on value
            const netBalanceElement = document.getElementById('net-balance');
            if (netBalance < 0) {
                netBalanceElement.parentElement.classList.remove('bg-primary');
                netBalanceElement.parentElement.classList.add('bg-danger');
            } else {
                netBalanceElement.parentElement.classList.remove('bg-danger');
                netBalanceElement.parentElement.classList.add('bg-primary');
            }
        }
    } catch (err) {
        console.error('Load summary error:', err);
    }
}

// Display Records
function displayRecords(records) {
    recordsTableBody.innerHTML = '';
    
    if (records.length === 0) {
        recordsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No records found</td>
            </tr>
        `;
        return;
    }

    records.forEach(record => {
        const row = document.createElement('tr');
        const amount = parseFloat(record.amount || 0).toFixed(2);
        const typeClass = record.type === 'income' ? 'text-success' : 'text-danger';
        
        // Safely format category and payment method
        const formatField = (field) => {
            if (!field) return '';
            return field.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };
        
        row.innerHTML = `
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td><span class="${typeClass}">${record.type ? record.type.charAt(0).toUpperCase() + record.type.slice(1) : ''}</span></td>
            <td>${formatField(record.category)}</td>
            <td class="${typeClass}">$${amount}</td>
            <td>${record.description || ''}</td>
            <td>${record.vendor_buyer || ''}</td>
            <td>${formatField(record.payment_method)}</td>
        `;
        recordsTableBody.appendChild(row);
    });
}

// Download Report
async function downloadReport(type, format) {
    try {
        const button = event.target.closest('.dropdown').querySelector('.dropdown-toggle');
        const originalText = button.textContent;
        button.textContent = 'Generating...';
        button.disabled = true;

        const response = await fetch(`${API_URL}/reports/${type}?format=${format}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-report.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to download report');
        }
    } catch (err) {
        console.error('Download report error:', err);
        alert('Failed to download report. Please try again.');
    } finally {
        const button = event.target.closest('.dropdown').querySelector('.dropdown-toggle');
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Set default date to today
document.getElementById('record-date').valueAsDate = new Date();

// Show Forgot Password Modal
function showForgotPassword() {
    forgotPasswordModal.show();
}

// Handle Forgot Password Form
document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;

    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Password reset link has been sent to your email.');
            forgotPasswordModal.hide();
            document.getElementById('forgot-password-form').reset();
        } else {
            alert(data.msg || 'Failed to send reset link');
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        alert('Failed to send reset link. Please try again.');
    }
});

// Handle Reset Password Form
document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('reset-token').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, password: newPassword })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Password has been reset successfully. Please login with your new password.');
            resetPasswordModal.hide();
            document.getElementById('reset-password-form').reset();
            // Remove token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            alert(data.msg || 'Failed to reset password');
        }
    } catch (err) {
        console.error('Reset password error:', err);
        alert('Failed to reset password. Please try again.');
    }
}); 