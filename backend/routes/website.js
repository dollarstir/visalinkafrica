const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

const router = express.Router();

// Public: get all website pages (no auth – for corporate site)
router.get('/pages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT slug, title, body, meta_description, updated_at FROM website_pages ORDER BY slug'
    );
    res.json({ pages: result.rows });
  } catch (error) {
    console.error('Get website pages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public: get one page by slug (no auth)
router.get('/pages/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT slug, title, body, meta_description, updated_at FROM website_pages WHERE slug = $1',
      [slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json({ page: result.rows[0] });
  } catch (error) {
    console.error('Get website page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: update or create page (auth + settings permission)
router.put('/pages/:slug', authenticateToken, requirePermission('settings.update'), async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, body, meta_description } = req.body;

    const updateResult = await pool.query(
      `UPDATE website_pages
       SET title = COALESCE($1, title), body = COALESCE($2, body), meta_description = COALESCE($3, meta_description), updated_at = CURRENT_TIMESTAMP
       WHERE slug = $4
       RETURNING slug, title, body, meta_description, updated_at`,
      [title || null, body !== undefined ? body : null, meta_description !== undefined ? meta_description : null, slug]
    );

    if (updateResult.rows.length > 0) {
      return res.json({ page: updateResult.rows[0], message: 'Page updated successfully' });
    }

    // Page doesn't exist – insert (upsert)
    const insertResult = await pool.query(
      `INSERT INTO website_pages (slug, title, body, meta_description)
       VALUES ($1, $2, $3, $4)
       RETURNING slug, title, body, meta_description, updated_at`,
      [slug, title || slug, body !== undefined ? body : '', meta_description !== undefined ? meta_description : '']
    );
    res.json({ page: insertResult.rows[0], message: 'Page created successfully' });
  } catch (error) {
    console.error('Update website page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
