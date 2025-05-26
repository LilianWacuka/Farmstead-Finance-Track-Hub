-- Create database
CREATE DATABASE IF NOT EXISTS farmstead_finance;
USE farmstead_finance;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    farm_name VARCHAR(100),
    location VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Records table with enhanced fields
CREATE TABLE IF NOT EXISTS records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    payment_method ENUM('cash', 'check', 'bank_transfer') NOT NULL,
    vendor_buyer VARCHAR(100),
    receipt_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_records_user_id ON records(user_id);
CREATE INDEX idx_records_date ON records(date);
CREATE INDEX idx_records_type ON records(type);
CREATE INDEX idx_records_category ON records(category); 