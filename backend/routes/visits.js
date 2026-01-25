const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all visits
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, customer_name, customer_email, visit_type, visit_date, visit_time, 
             duration, status, staff_member, location, purpose, outcome, follow_up_required,
             created_at, updated_at
      FROM visits
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (customer_name ILIKE $${paramCount} OR customer_email ILIKE $${paramCount} OR visit_type ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (status !== 'all') {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM visits WHERE 1=1';
    const countParams = [];
    paramCount = 0;

    if (search) {
      paramCount++;
      countQuery += ` AND (customer_name ILIKE $${paramCount} OR customer_email ILIKE $${paramCount} OR visit_type ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }

    if (status !== 'all') {
      paramCount++;
      countQuery += ` AND status = $${paramCount}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      visits: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get visits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visit by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM visits WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({ visit: result.rows[0] });
  } catch (error) {
    console.error('Get visit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new visit
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      visit_type,
      visit_date,
      visit_time,
      duration,
      status = 'scheduled',
      staff_member,
      location,
      purpose,
      outcome,
      follow_up_required = false
    } = req.body;

    const result = await pool.query(
      `INSERT INTO visits (customer_name, customer_email, visit_type, visit_date, visit_time, 
                          duration, status, staff_member, location, purpose, outcome, follow_up_required)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [customer_name, customer_email, visit_type, visit_date, visit_time, duration, 
       status, staff_member, location, purpose, outcome, follow_up_required]
    );

    res.status(201).json({
      message: 'Visit created successfully',
      visit: result.rows[0]
    });
  } catch (error) {
    console.error('Create visit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update visit
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name,
      customer_email,
      visit_type,
      visit_date,
      visit_time,
      duration,
      status,
      staff_member,
      location,
      purpose,
      outcome,
      follow_up_required
    } = req.body;

    const result = await pool.query(
      `UPDATE visits SET 
       customer_name = $1, customer_email = $2, visit_type = $3, visit_date = $4, visit_time = $5,
       duration = $6, status = $7, staff_member = $8, location = $9, purpose = $10, outcome = $11,
       follow_up_required = $12, updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [customer_name, customer_email, visit_type, visit_date, visit_time, duration,
       status, staff_member, location, purpose, outcome, follow_up_required, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({
      message: 'Visit updated successfully',
      visit: result.rows[0]
    });
  } catch (error) {
    console.error('Update visit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete visit
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM visits WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    console.error('Delete visit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visit statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN follow_up_required = true THEN 1 END) as follow_up_required
      FROM visits
    `);

    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get visit stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




