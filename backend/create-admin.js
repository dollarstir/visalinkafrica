const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const createAdminUser = async () => {
  try {
    console.log('Creating admin user...');
    
    const adminEmail = 'admin@visalink.com';
    const adminPassword = 'Admin@123';
    const adminName = 'System Administrator';
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    // Create admin user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [adminName, adminEmail, hashedPassword, 'admin', 'Administration']
    );
    
    console.log('Admin user created successfully:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('User details:', result.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
