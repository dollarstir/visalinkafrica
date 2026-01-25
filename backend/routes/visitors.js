const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all visitors
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, first_name, last_name, email, phone, purpose, visit_date, visit_time, 
             status, staff_member, notes, created_at, updated_at
      FROM visitors
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Add status filter
    if (status !== 'all') {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM visitors WHERE 1=1';
    const countParams = [];
    paramCount = 0;

    if (search) {
      paramCount++;
      countQuery += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
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
      visitors: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visitor by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM visitors WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    res.json({ visitor: result.rows[0] });
  } catch (error) {
    console.error('Get visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new visitor
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      purpose,
      visit_date = null,
      visit_time = null,
      status = 'scheduled',
      staff_member = null,
      notes = null
    } = req.body;

    const result = await pool.query(
      `INSERT INTO visitors (first_name, last_name, email, phone, purpose, visit_date, visit_time, status, staff_member, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [first_name, last_name, email, phone, purpose, visit_date, visit_time, status, staff_member, notes]
    );

    res.status(201).json({
      message: 'Visitor created successfully',
      visitor: result.rows[0]
    });
  } catch (error) {
    console.error('Create visitor error:', error.message);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Duplicate visitor',
        message: 'A visitor with this email already exists'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update visitor
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      purpose,
      visit_date,
      visit_time,
      status,
      staff_member,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE visitors SET 
       first_name = $1, last_name = $2, email = $3, phone = $4, purpose = $5,
       visit_date = $6, visit_time = $7, status = $8, staff_member = $9, notes = $10,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [first_name, last_name, email, phone, purpose, visit_date, visit_time, status, staff_member, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    res.json({
      message: 'Visitor updated successfully',
      visitor: result.rows[0]
    });
  } catch (error) {
    console.error('Update visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete visitor
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM visitors WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    res.json({ message: 'Visitor deleted successfully' });
  } catch (error) {
    console.error('Delete visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visitor statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'no-show' THEN 1 END) as no_show,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM visitors
    `);

    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get visitor stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


