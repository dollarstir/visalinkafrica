# VisaLink Africa Backend API

This is the backend API for the VisaLink Africa application, built with Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Configuration

1. Make sure PostgreSQL is running on port 5433
2. Create a database named `visalink_africa`
3. Create a `.env` file in the backend directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=visalink_africa
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Database Migration

Run the database migration to create tables and insert sample data:

```bash
npm run migrate
```

Or run the setup script:

```bash
node setup.js
```

### 4. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Visitors
- `GET /api/visitors` - Get all visitors
- `GET /api/visitors/:id` - Get visitor by ID
- `POST /api/visitors` - Create visitor
- `PUT /api/visitors/:id` - Update visitor
- `DELETE /api/visitors/:id` - Delete visitor
- `GET /api/visitors/stats/overview` - Get visitor statistics

### Visits
- `GET /api/visits` - Get all visits
- `GET /api/visits/:id` - Get visit by ID
- `POST /api/visits` - Create visit
- `PUT /api/visits/:id` - Update visit
- `DELETE /api/visits/:id` - Delete visit
- `GET /api/visits/stats/overview` - Get visit statistics

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/appointments/stats/overview` - Get appointment statistics

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `GET /api/applications/stats/overview` - Get application statistics

### Staff
- `GET /api/staff` - Get all staff
- `GET /api/staff/:id` - Get staff member by ID
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member
- `GET /api/staff/stats/overview` - Get staff statistics

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/services/stats/overview` - Get service statistics

### Service Categories
- `GET /api/service-categories` - Get all service categories
- `GET /api/service-categories/:id` - Get service category by ID
- `POST /api/service-categories` - Create service category
- `PUT /api/service-categories/:id` - Update service category
- `DELETE /api/service-categories/:id` - Delete service category
- `GET /api/service-categories/stats/overview` - Get service category statistics

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Create report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/stats/dashboard` - Get dashboard statistics

## Database Schema

The database includes the following tables:
- `users` - System users and authentication
- `service_categories` - Service categories
- `services` - Available services
- `customers` - Customer information
- `applications` - Visa applications
- `visitors` - Visitor records
- `visits` - Visit records
- `appointments` - Appointment records
- `staff` - Staff member information
- `reports` - Generated reports

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection protection

## Development

The server uses nodemon for development, which automatically restarts the server when files change.

## Production Deployment

1. Set `NODE_ENV=production` in your environment variables
2. Use a process manager like PM2
3. Set up proper logging
4. Configure reverse proxy (nginx)
5. Use HTTPS
6. Set up database backups




