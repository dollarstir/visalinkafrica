const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const settingsService = require('../services/settingsService');

const router = express.Router();

// Logo upload config (for site logo on login/register)
const uploadsDir = path.join(__dirname, '..', 'uploads');
const siteLogoDir = path.join(uploadsDir, 'site-logo');
if (!fs.existsSync(siteLogoDir)) {
  fs.mkdirSync(siteLogoDir, { recursive: true });
}
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, siteLogoDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `logo${ext}`);
  }
});
const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for the logo'));
    }
    cb(null, true);
  }
});

// Public settings (no auth) – for login/register page logo
router.get('/public', async (req, res) => {
  try {
    const siteLogo = await settingsService.getSetting('general', 'site_logo', '');
    res.json({ siteLogo: siteLogo || '' });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ siteLogo: '' });
  }
});

// Upload site logo (admin only)
router.post('/logo', authenticateToken, requirePermission('settings.update'), logoUpload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No logo file uploaded' });
    }
    const relativePath = `/uploads/site-logo/${req.file.filename}`;
    await pool.query(
      `INSERT INTO settings (category, key, value, type, description)
       VALUES ('general', 'site_logo', $1, 'string', 'Website logo URL (shown on login and register pages)')
       ON CONFLICT (category, key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
      [relativePath]
    );
    settingsService.invalidateCache();
    res.json({ message: 'Logo updated successfully', siteLogo: relativePath });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all settings (admin only)
router.get('/', authenticateToken, requirePermission('settings.view'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM settings ORDER BY category, key'
    );

    // Transform to object format for easier access
    const settings = {};
    result.rows.forEach(row => {
      if (!settings[row.category]) {
        settings[row.category] = {};
      }
      settings[row.category][row.key] = {
        value: row.value,
        type: row.type,
        description: row.description
      };
    });

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get setting by key
router.get('/:key', authenticateToken, requirePermission('settings.view'), async (req, res) => {
  try {
    const { key } = req.params;
    const result = await pool.query(
      'SELECT * FROM settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ setting: result.rows[0] });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update settings (admin only)
router.put('/', authenticateToken, requirePermission('settings.update'), async (req, res) => {
  try {
    const { settings } = req.body; // Array of { key, value } objects where key is "category.key"

    if (!Array.isArray(settings)) {
      return res.status(400).json({ error: 'Settings must be an array' });
    }

    // Update each setting
    for (const setting of settings) {
      const { key, value } = setting;
      
      if (!key) {
        continue; // Skip invalid entries
      }

      // Parse category.key format
      const [category, settingKey] = key.includes('.') ? key.split('.', 2) : [null, key];
      
      if (!category || !settingKey) {
        console.warn(`Invalid setting key format: ${key}`);
        continue;
      }

      await pool.query(
        `UPDATE settings 
         SET value = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE category = $2 AND key = $3`,
        [value, category, settingKey]
      );
    }

    // Invalidate cache so new settings are loaded
    settingsService.invalidateCache();

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update single setting
router.put('/:key', authenticateToken, requirePermission('settings.update'), async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const result = await pool.query(
      `UPDATE settings 
       SET value = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE key = $2
       RETURNING *`,
      [value, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    // Invalidate cache so new settings are loaded
    settingsService.invalidateCache();

    res.json({
      message: 'Setting updated successfully',
      setting: result.rows[0]
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

