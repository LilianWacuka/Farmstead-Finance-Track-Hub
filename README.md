# Farmstead Finance Hub
# Deployment live link use this http://192.168.100.191:3000
A comprehensive financial management system designed specifically for farmers to track their income and expenses.

## Features

- **User Authentication**
  - Secure registration and login system
  - Password reset functionality
  - JWT-based authentication

- **Financial Tracking**
  - Record income and expenses
  - Categorized transactions
  - Detailed transaction information
  - Payment method tracking
  - Vendor/Buyer information

- **Dashboard**
  - Real-time financial summary
  - Total income tracking
  - Total expenses tracking
  - Net balance calculation
  - Transaction history

- **Reporting**
  - Weekly and monthly reports
  - Export to CSV and PDF formats
  - Custom date range filtering
  - Quick filters for common time periods

## Tech Stack

- **Frontend**
  - HTML5
  - CSS3 (Bootstrap 5)
  - Vanilla JavaScript
  - Responsive design

- **Backend**
  - Node.js
  - Express.js
  - MySQL Database
  - JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/LilianWacuka/Farmstead-Finance-Hub.git
   cd farmstead-finance-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=farmstead_finance
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   FRONTEND_URL=http://localhost:5000
   ```

4. Set up the database:
   ```bash
   mysql -u root -p < db/schema.sql
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Access the application at `http://192.168.100.191:3000 `

## Email Configuration

To enable password reset functionality:

1. Use a Gmail account
2. Enable 2-factor authentication
3. Generate an App Password
4. Use the App Password in your `.env` file

## Usage

1. **Registration**
   - Click "Register" tab
   - Fill in your details
   - Password must be at least 6 characters with letters and numbers

2. **Adding Records**
   - Select transaction type (Income/Expense)
   - Choose category
   - Enter amount and date
   - Add additional details (optional)

3. **Viewing Reports**
   - Use the Reports dropdown in the navigation
   - Choose between weekly and monthly reports
   - Select format (CSV/PDF)

4. **Filtering Records**
   - Use the filter section
   - Set custom date ranges
   - Use quick filters for common periods

## Security Features

- Password hashing using bcrypt
- JWT token authentication
- Secure password reset process
- Input validation and sanitization
- SQL injection prevention

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- Bootstrap for the UI framework
- Express.js team for the backend framework
- MySQL team for the database system 
