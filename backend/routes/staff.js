const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all staff
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.id, s.first_name, s.last_name, s.email, s.phone, s.position, s.department, 
             s.hire_date, s.salary, s.status, s.location, s.working_hours, 
             s.created_at, s.updated_at, s.user_id,
             COUNT(DISTINCT a.id) as total_applications,
             CASE 
               WHEN COUNT(DISTINCT a.id) = 0 THEN 'low'
               WHEN COUNT(DISTINCT a.id) <= 5 THEN 'low'
               WHEN COUNT(DISTINCT a.id) <= 15 THEN 'medium'
               ELSE 'high'
             END as current_workload
      FROM staff s
      LEFT JOIN applications a ON s.id = a.staff_id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (s.first_name ILIKE $${paramCount} OR s.last_name ILIKE $${paramCount} OR s.email ILIKE $${paramCount} OR s.position ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (status !== 'all') {
      paramCount++;
      query += ` AND s.status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` GROUP BY s.id, s.first_name, s.last_name, s.email, s.phone, s.position, s.department, 
                      s.hire_date, s.salary, s.status, s.location, s.working_hours, 
                      s.created_at, s.updated_at, s.user_id
               ORDER BY s.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count (using DISTINCT to handle GROUP BY)
    let countQuery = `
      SELECT COUNT(DISTINCT s.id) 
      FROM staff s
      WHERE 1=1
    `;
    const countParams = [];
    paramCount = 0;

    if (search) {
      paramCount++;
      countQuery += ` AND (s.first_name ILIKE $${paramCount} OR s.last_name ILIKE $${paramCount} OR s.email ILIKE $${paramCount} OR s.position ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }

    if (status !== 'all') {
      paramCount++;
      countQuery += ` AND s.status = $${paramCount}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      staff: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get staff member by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM staff WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ staff: result.rows[0] });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new staff member
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      hire_date,
      salary,
      status = 'active',
      location,
      working_hours,
      total_applications = 0,
      current_workload = 'low',
      create_user_account = false,
      password
    } = req.body;

    let userId = null;

    // If create_user_account is true, create a user account
    if (create_user_account) {
      if (!password || password.length < 6) {
        return res.status(400).json({ 
          error: 'Password required',
          message: 'Password must be at least 6 characters when creating user account'
        });
      }

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
      } else {
        // Create new user account
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const fullName = `${first_name} ${last_name}`;

        const userResult = await pool.query(
          `INSERT INTO users (name, email, password, role, department, phone, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [fullName, email, hashedPassword, 'staff', department, phone, true]
        );

        userId = userResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `INSERT INTO staff (first_name, last_name, email, phone, position, department, 
                          hire_date, salary, status, location, working_hours, total_applications, current_workload, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [first_name, last_name, email, phone, position, department, hire_date, 
       salary, status, location, working_hours, total_applications, current_workload, userId]
    );

    res.status(201).json({
      message: 'Staff member created successfully',
      staff: result.rows[0],
      user_account_created: create_user_account && userId !== null
    });
  } catch (error) {
    console.error('Create staff error:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Duplicate entry',
        message: 'A staff member with this email already exists'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update staff member
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      hire_date,
      salary,
      status,
      location,
      working_hours,
      total_applications,
      current_workload,
      user_id,
      create_user_account = false,
      password
    } = req.body;

    let userId = user_id || null;

    // If create_user_account is true, create a user account
    if (create_user_account && !userId) {
      if (!password || password.length < 6) {
        return res.status(400).json({ 
          error: 'Password required',
          message: 'Password must be at least 6 characters when creating user account'
        });
      }

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        // Update user role to staff if not already
        await pool.query(
          'UPDATE users SET role = $1 WHERE id = $2',
          ['staff', userId]
        );
      } else {
        // Create new user account
        const bcrypt = require('bcryptjs');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const fullName = `${first_name} ${last_name}`;

        const userResult = await pool.query(
          `INSERT INTO users (name, email, password, role, department, phone, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [fullName, email, hashedPassword, 'staff', department, phone, true]
        );

        userId = userResult.rows[0].id;
      }
    }

    // If linking to an existing user account, ensure role is staff
    if (userId && !create_user_account) {
      await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        ['staff', userId]
      );
    }

    const result = await pool.query(
      `UPDATE staff SET 
       first_name = $1, last_name = $2, email = $3, phone = $4, position = $5,
       department = $6, hire_date = $7, salary = $8, status = $9, location = $10,
       working_hours = $11, total_applications = $12, current_workload = $13,
       user_id = $14,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $15
       RETURNING *`,
      [first_name, last_name, email, phone, position, department, hire_date,
       salary, status, location, working_hours, total_applications, current_workload, userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({
      message: 'Staff member updated successfully',
      staff: result.rows[0],
      user_account_linked: userId !== null
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete staff member
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM staff WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get applications assigned to a staff member
router.get('/:id/applications', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const result = await pool.query(`
      SELECT a.id, a.status, a.priority, a.created_at, a.updated_at,
             c.first_name, c.last_name, c.email, c.phone,
             s.name as service_name
      FROM applications a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.staff_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2
    `, [id, limit]);

    res.json({ applications: result.rows });
  } catch (error) {
    console.error('Get staff applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get staff statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT s.id) as total,
        COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active,
        COUNT(DISTINCT CASE WHEN s.status = 'inactive' THEN s.id END) as inactive,
        COUNT(DISTINCT CASE 
          WHEN COUNT(DISTINCT a.id) = 0 THEN s.id
          WHEN COUNT(DISTINCT a.id) <= 5 THEN s.id
        END) as low_workload,
        COUNT(DISTINCT CASE 
          WHEN COUNT(DISTINCT a.id) > 5 AND COUNT(DISTINCT a.id) <= 15 THEN s.id
        END) as medium_workload,
        COUNT(DISTINCT CASE 
          WHEN COUNT(DISTINCT a.id) > 15 THEN s.id
        END) as high_workload,
        AVG(application_counts.app_count) as avg_applications
      FROM staff s
      LEFT JOIN applications a ON s.id = a.staff_id
      LEFT JOIN (
        SELECT staff_id, COUNT(*) as app_count
        FROM applications
        GROUP BY staff_id
      ) application_counts ON s.id = application_counts.staff_id
      GROUP BY s.id
    `);

    // Simplify the stats calculation
    const statsResult = await pool.query(`
      WITH staff_app_counts AS (
        SELECT 
          s.id,
          s.status,
          COUNT(DISTINCT a.id) as app_count,
          CASE 
            WHEN COUNT(DISTINCT a.id) = 0 THEN 'low'
            WHEN COUNT(DISTINCT a.id) <= 5 THEN 'low'
            WHEN COUNT(DISTINCT a.id) <= 15 THEN 'medium'
            ELSE 'high'
          END as workload
        FROM staff s
        LEFT JOIN applications a ON s.id = a.staff_id
        GROUP BY s.id, s.status
      )
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN workload = 'low' THEN 1 END) as low_workload,
        COUNT(CASE WHEN workload = 'medium' THEN 1 END) as medium_workload,
        COUNT(CASE WHEN workload = 'high' THEN 1 END) as high_workload,
        COALESCE(AVG(app_count), 0) as avg_applications
      FROM staff_app_counts
    `);

    res.json({ stats: statsResult.rows[0] });
  } catch (error) {
    console.error('Get staff stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




