const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const settingsService = require('../services/settingsService');

const router = express.Router();

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

