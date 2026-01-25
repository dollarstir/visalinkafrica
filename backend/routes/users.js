const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = 'all', is_active = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, email, role, department, phone, address, avatar, is_active, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR department ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Add role filter
    if (role !== 'all') {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      queryParams.push(role);
    }

    // Add active status filter
    if (is_active !== 'all') {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      queryParams.push(is_active === 'true');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];
    paramCount = 0;

    if (search) {
      paramCount++;
      countQuery += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR department ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }

    if (role !== 'all') {
      paramCount++;
      countQuery += ` AND role = $${paramCount}`;
      countParams.push(role);
    }

    if (is_active !== 'all') {
      paramCount++;
      countQuery += ` AND is_active = $${paramCount}`;
      countParams.push(is_active === 'true');
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, name, email, role, department, phone, address, avatar, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'user',
      department,
      phone,
      address,
      avatar,
      is_active = true
    } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, department, phone, address, avatar, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, email, role, department, phone, address, avatar, is_active, created_at, updated_at`,
      [name, email, hashedPassword, role, department, phone, address, avatar, is_active]
    );

    const newUser = result.rows[0];

    // If role is 'staff', automatically create a staff record and link it
    if (role === 'staff') {
      try {
        // Parse name to get first and last name
        const nameParts = name.trim().split(/\s+/);
        const first_name = nameParts[0] || name;
        const last_name = nameParts.slice(1).join(' ') || name;

        await pool.query(
          `INSERT INTO staff (first_name, last_name, email, phone, department, 
                            position, status, user_id, total_applications, current_workload)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [first_name, last_name, email, phone || null, department || null, 
           'Staff Member', 'active', newUser.id, 0, 'low']
        );
      } catch (staffError) {
        // If staff creation fails, log but don't fail the user creation
        console.error('Error creating staff record for user:', staffError);
        // Continue - user is created, staff can be linked later
      }
    }

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
      staff_record_created: role === 'staff'
    });
  } catch (error) {
    console.error('Create user error:', error.message);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Duplicate user',
        message: 'A user with this email already exists'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      role,
      department,
      phone,
      address,
      avatar,
      is_active
    } = req.body;

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it conflicts with another user
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ 
          error: 'Email already in use',
          message: 'Another user with this email already exists'
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
    }
    if (email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(email);
    }
    if (password !== undefined) {
      paramCount++;
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push(`password = $${paramCount}`);
      updateValues.push(hashedPassword);
    }
    if (role !== undefined) {
      paramCount++;
      updateFields.push(`role = $${paramCount}`);
      updateValues.push(role);
    }
    if (department !== undefined) {
      paramCount++;
      updateFields.push(`department = $${paramCount}`);
      updateValues.push(department);
    }
    if (phone !== undefined) {
      paramCount++;
      updateFields.push(`phone = $${paramCount}`);
      updateValues.push(phone);
    }
    if (address !== undefined) {
      paramCount++;
      updateFields.push(`address = $${paramCount}`);
      updateValues.push(address);
    }
    if (avatar !== undefined) {
      paramCount++;
      updateFields.push(`avatar = $${paramCount}`);
      updateValues.push(avatar);
    }
    if (is_active !== undefined) {
      paramCount++;
      updateFields.push(`is_active = $${paramCount}`);
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add updated_at
    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const query = `
      UPDATE users SET 
      ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, department, phone, address, avatar, is_active, created_at, updated_at
    `;

    const result = await pool.query(query, updateValues);

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Duplicate user',
        message: 'A user with this email already exists'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ 
        error: 'Cannot delete own account',
        message: 'You cannot delete your own account. Please use the profile deletion feature.'
      });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User deleted successfully',
      deletedUser: result.rows[0]
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: 'Cannot delete user',
        message: 'This user has associated records and cannot be deleted'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive
      FROM users
    `);

    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


