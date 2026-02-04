const pool = require('../config/database');

// Cache settings in memory for performance
let settingsCache = {};
let cacheTimestamp = null;
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Create settings table if it doesn't exist
 */
const ensureSettingsTable = async () => {
  try {
    // Check if table exists
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'settings'
      )
    `);

    if (!checkTable.rows[0].exists) {
      console.log('Settings table does not exist. Creating it...');
      
      // Create settings table
      await pool.query(`
        CREATE TABLE settings (
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
        CREATE INDEX idx_settings_category_key 
        ON settings(category, key)
      `);

      // Insert default SMS settings
      await pool.query(`
        INSERT INTO settings (category, key, value, type, description) VALUES
        ('sms', 'enabled', 'false', 'boolean', 'Enable or disable SMS notifications'),
        ('sms', 'api_key', '', 'string', 'mNotify API key for sending SMS'),
        ('sms', 'sender_name', 'VisaLink', 'string', 'Sender name displayed in SMS (max 11 characters)')
      `);

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
      `);

      // Insert default General/Branding settings (site logo for login/register)
      await pool.query(`
        INSERT INTO settings (category, key, value, type, description) VALUES
        ('general', 'site_logo', '', 'string', 'Website logo URL (shown on login and register pages)')
      `);

      console.log('Settings table created successfully with default values.');
    }
  } catch (error) {
    console.error('Error ensuring settings table exists:', error);
    throw error;
  }
};

/**
 * Load all settings from database
 */
const loadSettings = async () => {
  try {
    // Ensure table exists first
    await ensureSettingsTable();

    const result = await pool.query(
      'SELECT key, value, type, category FROM settings ORDER BY category, key'
    );

    const settings = {};
    result.rows.forEach(row => {
      if (!settings[row.category]) {
        settings[row.category] = {};
      }
      // Convert value based on type
      let parsedValue = row.value;
      if (row.type === 'boolean') {
        parsedValue = row.value === 'true' || row.value === true;
      } else if (row.type === 'number') {
        parsedValue = parseFloat(row.value) || 0;
      }
      settings[row.category][row.key] = parsedValue;
    });

    // Ensure general.site_logo row exists (for existing DBs created before this feature)
    if (!settings.general || settings.general.site_logo === undefined) {
      await pool.query(`
        INSERT INTO settings (category, key, value, type, description)
        VALUES ('general', 'site_logo', '', 'string', 'Website logo URL (shown on login and register pages)')
        ON CONFLICT (category, key) DO NOTHING
      `);
      if (!settings.general) settings.general = {};
      settings.general.site_logo = settings.general.site_logo || '';
    }

    settingsCache = settings;
    cacheTimestamp = Date.now();
    return settings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return settingsCache; // Return cached settings if DB fails
  }
};

/**
 * Get a setting value by key
 */
const getSetting = async (category, key, defaultValue = null) => {
  // Check cache first
  const now = Date.now();
  if (!cacheTimestamp || (now - cacheTimestamp) > CACHE_TTL) {
    await loadSettings();
  }

  if (settingsCache[category] && settingsCache[category][key] !== undefined) {
    return settingsCache[category][key];
  }

  return defaultValue;
};

/**
 * Get all settings for a category
 */
const getCategorySettings = async (category) => {
  const now = Date.now();
  if (!cacheTimestamp || (now - cacheTimestamp) > CACHE_TTL) {
    await loadSettings();
  }

  return settingsCache[category] || {};
};

/**
 * Invalidate cache (call this after updating settings)
 */
const invalidateCache = () => {
  cacheTimestamp = null;
  settingsCache = {};
};

/**
 * Initialize settings - load on startup
 */
const initialize = async () => {
  await loadSettings();
};

module.exports = {
  loadSettings,
  getSetting,
  getCategorySettings,
  invalidateCache,
  initialize
};

