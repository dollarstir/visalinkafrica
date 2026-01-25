const pool = require('../config/database');

async function addSettingsPermissions() {
  try {
    console.log('Adding settings permissions...');

    // Check if permissions already exist
    const checkView = await pool.query(
      "SELECT id FROM permissions WHERE code = 'settings.view'"
    );
    const checkUpdate = await pool.query(
      "SELECT id FROM permissions WHERE code = 'settings.update'"
    );

    // Add settings.view permission if it doesn't exist
    if (checkView.rows.length === 0) {
      await pool.query(`
        INSERT INTO permissions (name, code, description, category)
        VALUES ('View Settings', 'settings.view', 'View application settings including SMS and Email configuration', 'Settings')
      `);
      console.log('Added settings.view permission');
    } else {
      console.log('settings.view permission already exists');
    }

    // Add settings.update permission if it doesn't exist
    if (checkUpdate.rows.length === 0) {
      await pool.query(`
        INSERT INTO permissions (name, code, description, category)
        VALUES ('Update Settings', 'settings.update', 'Update application settings including SMS and Email configuration', 'Settings')
      `);
      console.log('Added settings.update permission');
    } else {
      console.log('settings.update permission already exists');
    }

    console.log('Settings permissions setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding settings permissions:', error);
    process.exit(1);
  }
}

addSettingsPermissions();

