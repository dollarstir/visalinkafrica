const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const updateAdminPassword = async () => {
  try {
    console.log('Updating admin user password...');
    
    const adminEmail = 'admin@visalink.com';
    const adminPassword = 'Admin@123';
    
    // Check if admin exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (existingAdmin.rows.length === 0) {
      console.log('Admin user not found');
      return;
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    // Update admin password
    const result = await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING id, name, email, role',
      [hashedPassword, adminEmail]
    );
    
    console.log('Admin password updated successfully:');
    console.log('Email:', adminEmail);
    console.log('New Password:', adminPassword);
    console.log('User details:', result.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
};

updateAdminPassword();
