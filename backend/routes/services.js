const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all services
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.id, s.name, s.description, s.category_id, s.pricing_tiers, s.requirements, s.is_active,
             s.success_rate, s.created_at, s.updated_at,
             sc.name as category_name,
             COUNT(DISTINCT a.id) as total_applications
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      LEFT JOIN applications a ON s.id = a.service_id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (s.name ILIKE $${paramCount} OR s.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (category !== 'all') {
      paramCount++;
      query += ` AND s.category_id = $${paramCount}`;
      queryParams.push(category);
    }

    query += ` GROUP BY s.id, s.name, s.description, s.category_id, s.pricing_tiers, s.requirements, 
                      s.is_active, s.success_rate, s.created_at, s.updated_at, sc.name
               ORDER BY s.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE 1=1
    `;
    const countParams = [];
    paramCount = 0;

    if (search) {
      paramCount++;
      countQuery += ` AND (s.name ILIKE $${paramCount} OR s.description ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }

    if (category !== 'all') {
      paramCount++;
      countQuery += ` AND s.category_id = $${paramCount}`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      services: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get service by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT s.id, s.name, s.description, s.category_id, s.pricing_tiers, s.requirements, s.is_active,
              s.success_rate, s.created_at, s.updated_at,
              sc.name as category_name,
              COUNT(DISTINCT a.id) as total_applications
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       LEFT JOIN applications a ON s.id = a.service_id
       WHERE s.id = $1
       GROUP BY s.id, s.name, s.description, s.category_id, s.pricing_tiers, s.requirements, 
                s.is_active, s.success_rate, s.created_at, s.updated_at, sc.name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ service: result.rows[0] });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new service
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      category_id,
      pricing_tiers,
      requirements,
      is_active = true,
      success_rate = 0,
      total_applications = 0
    } = req.body;

    // Ensure pricing_tiers is properly formatted for JSONB
    // Convert to JSON string explicitly for PostgreSQL JSONB type
    let pricingTiersJson = null;
    if (pricing_tiers !== null && pricing_tiers !== undefined) {
      if (typeof pricing_tiers === 'string') {
        // If it's already a string, validate it's valid JSON
        try {
          const parsed = JSON.parse(pricing_tiers);
          pricingTiersJson = Array.isArray(parsed) && parsed.length > 0 ? JSON.stringify(parsed) : null;
        } catch (e) {
          // If parsing fails, it's not valid JSON
          return res.status(400).json({ error: 'Invalid pricing_tiers JSON format' });
        }
      } else if (Array.isArray(pricing_tiers)) {
        // If it's an array, stringify it if it has items
        pricingTiersJson = pricing_tiers.length > 0 ? JSON.stringify(pricing_tiers) : null;
      } else if (typeof pricing_tiers === 'object') {
        // If it's an object, stringify it
        pricingTiersJson = JSON.stringify(pricing_tiers);
      }
    }

    // Set total_applications to 0 for new services (will be calculated dynamically on GET)
    const result = await pool.query(
      `INSERT INTO services (name, description, category_id, pricing_tiers, requirements, is_active, success_rate, total_applications)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, 0)
       RETURNING *`,
      [name, description, category_id, pricingTiersJson, requirements, is_active, success_rate]
    );

    res.status(201).json({
      message: 'Service created successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update service
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category_id,
      pricing_tiers,
      requirements,
      is_active,
      success_rate,
      total_applications
    } = req.body;

    // Ensure pricing_tiers is properly formatted for JSONB
    // Convert to JSON string explicitly for PostgreSQL JSONB type
    let pricingTiersJson = null;
    if (pricing_tiers !== null && pricing_tiers !== undefined) {
      if (typeof pricing_tiers === 'string') {
        // If it's already a string, validate it's valid JSON
        try {
          const parsed = JSON.parse(pricing_tiers);
          pricingTiersJson = Array.isArray(parsed) && parsed.length > 0 ? JSON.stringify(parsed) : null;
        } catch (e) {
          // If parsing fails, it's not valid JSON
          return res.status(400).json({ error: 'Invalid pricing_tiers JSON format' });
        }
      } else if (Array.isArray(pricing_tiers)) {
        // If it's an array, stringify it if it has items
        pricingTiersJson = pricing_tiers.length > 0 ? JSON.stringify(pricing_tiers) : null;
      } else if (typeof pricing_tiers === 'object') {
        // If it's an object, stringify it
        pricingTiersJson = JSON.stringify(pricing_tiers);
      }
    }

    // Calculate total_applications dynamically instead of using the passed value
    const appCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM applications WHERE service_id = $1',
      [id]
    );
    const calculatedTotalApplications = parseInt(appCountResult.rows[0].count) || 0;

    const result = await pool.query(
      `UPDATE services SET 
       name = $1, description = $2, category_id = $3, pricing_tiers = $4::jsonb,
       requirements = $5, is_active = $6, success_rate = $7, total_applications = $8,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, description, category_id, pricingTiersJson, requirements, is_active, success_rate, calculatedTotalApplications, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({
      message: 'Service updated successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete service
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM services WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get service statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    // Get service counts
    const serviceStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive,
        AVG(success_rate) as avg_success_rate
      FROM services
    `);

    // Get total applications count dynamically
    const appStats = await pool.query(`
      SELECT COUNT(*) as total_applications
      FROM applications
    `);

    res.json({ 
      stats: {
        ...serviceStats.rows[0],
        total_applications: parseInt(appStats.rows[0].total_applications) || 0
      }
    });
  } catch (error) {
    console.error('Get service stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




