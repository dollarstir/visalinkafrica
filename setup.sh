#!/bin/bash

# VisaLink Africa Setup Script
echo "🚀 Setting up VisaLink Africa..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Create .env file for backend
echo "⚙️ Creating backend environment file..."
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=visalink_africa
DB_USER=postgres
DB_PASSWORD=password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
EOF

# Create .env file for frontend
echo "⚙️ Creating frontend environment file..."
cd ..
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
EOF

# Setup database
echo "🗄️ Setting up database..."
cd backend
node setup.js

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   npm start"
echo ""
echo "3. Access the application at http://localhost:3000"
echo ""
echo "Default login credentials:"
echo "Email: admin@visalink.com"
echo "Password: admin123"
echo ""
echo "Note: Make sure PostgreSQL is running on port 5433"




