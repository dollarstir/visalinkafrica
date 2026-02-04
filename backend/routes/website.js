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

// Shared handler: update or create a page by slug
async function upsertPage(slug, { title, body, meta_description }) {
  const updateResult = await pool.query(
    `UPDATE website_pages
     SET title = COALESCE($1, title), body = COALESCE($2, body), meta_description = COALESCE($3, meta_description), updated_at = CURRENT_TIMESTAMP
     WHERE slug = $4
     RETURNING slug, title, body, meta_description, updated_at`,
    [title || null, body !== undefined ? body : null, meta_description !== undefined ? meta_description : null, slug]
  );
  if (updateResult.rows.length > 0) {
    return { page: updateResult.rows[0], message: 'Page updated successfully' };
  }
  const insertResult = await pool.query(
    `INSERT INTO website_pages (slug, title, body, meta_description)
     VALUES ($1, $2, $3, $4)
     RETURNING slug, title, body, meta_description, updated_at`,
    [slug, title || slug, body !== undefined ? body : '', meta_description !== undefined ? meta_description : '']
  );
  return { page: insertResult.rows[0], message: 'Page created successfully' };
}

// Admin: update or create page by slug in URL (PUT /pages/:slug)
router.put('/pages/:slug', authenticateToken, requirePermission('settings.update'), async (req, res) => {
  try {
    const slug = req.params.slug;
    const result = await upsertPage(slug, req.body);
    res.json(result);
  } catch (error) {
    console.error('Update website page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: update or create page by slug in body (PUT /pages) – fallback when URL path is wrong
router.put('/pages', authenticateToken, requirePermission('settings.update'), async (req, res) => {
  try {
    const slug = req.body.slug;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'slug is required in request body' });
    }
    const result = await upsertPage(slug.trim(), req.body);
    res.json(result);
  } catch (error) {
    console.error('Update website page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
