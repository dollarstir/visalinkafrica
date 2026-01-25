const pool = require('../config/database');

async function createSettingsTable() {
  try {
    console.log('Creating settings table...');

    // Create settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        key VARCHAR(100) NOT NULL,
        value TEXT,
        type VARCHAR(20) NOT NULL DEFAULT 'string',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, key)
      )
    `);

    // Create index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_settings_category_key 
      ON settings(category, key)
    `);

    console.log('Settings table created successfully.');

    // Insert default SMS settings
    await pool.query(`
      INSERT INTO settings (category, key, value, type, description) VALUES
      ('sms', 'enabled', 'false', 'boolean', 'Enable or disable SMS notifications'),
      ('sms', 'api_key', '', 'string', 'mNotify API key for sending SMS'),
      ('sms', 'sender_name', 'VisaLink', 'string', 'Sender name displayed in SMS (max 11 characters)')
      ON CONFLICT (category, key) DO NOTHING
    `);

    console.log('Default SMS settings inserted.');

    // Insert default Email settings
    await pool.query(`
      INSERT INTO settings (category, key, value, type, description) VALUES
      ('email', 'enabled', 'false', 'boolean', 'Enable or disable Email notifications'),
      ('email', 'smtp_host', '', 'string', 'SMTP server hostname'),
      ('email', 'smtp_port', '', 'string', 'SMTP server port (usually 587 for TLS or 465 for SSL)'),
      ('email', 'smtp_user', '', 'string', 'SMTP username/email'),
      ('email', 'smtp_password', '', 'string', 'SMTP password'),
      ('email', 'from_email', '', 'string', 'Email address to send from'),
      ('email', 'from_name', 'VisaLink Africa', 'string', 'Display name for sent emails')
      ON CONFLICT (category, key) DO NOTHING
    `);

    console.log('Default Email settings inserted.');
    console.log('Settings table setup completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating settings table:', error);
    process.exit(1);
  }
}

createSettingsTable();

