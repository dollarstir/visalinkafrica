const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all service categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sc.id, sc.name, sc.description, sc.is_active, sc.created_at, sc.updated_at,
             COUNT(s.id) as total_services
      FROM service_categories sc
      LEFT JOIN services s ON sc.id = s.category_id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += ` GROUP BY sc.id, sc.name, sc.description, sc.is_active, sc.created_at, sc.updated_at
               ORDER BY sc.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM service_categories WHERE 1=1';
    const countParams = [];
    paramCount = 0;

    if (search) {
      paramCount++;
      countQuery += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      categories: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get service category by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM service_categories WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service category not found' });
    }

    res.json({ category: result.rows[0] });
  } catch (error) {
    console.error('Get service category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new service category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, is_active = true } = req.body;

    const result = await pool.query(
      `INSERT INTO service_categories (name, description, is_active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, is_active]
    );

    res.status(201).json({
      message: 'Service category created successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Create service category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update service category
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const result = await pool.query(
      `UPDATE service_categories SET 
       name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service category not found' });
    }

    res.json({
      message: 'Service category updated successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Update service category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete service category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has services
    const servicesCheck = await pool.query(
      'SELECT COUNT(*) FROM services WHERE category_id = $1',
      [id]
    );

    if (parseInt(servicesCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing services' 
      });
    }

    const result = await pool.query(
      'DELETE FROM service_categories WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service category not found' });
    }

    res.json({ message: 'Service category deleted successfully' });
  } catch (error) {
    console.error('Delete service category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get service category statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive
      FROM service_categories
    `);

    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get service category stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




