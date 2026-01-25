const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const smsService = require('../services/smsService');

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let query = `
      SELECT id, first_name, last_name, email, phone, address, date_of_birth, 
             nationality, passport_number, gender, occupation, city, state, country,
             emergency_contact, emergency_phone, notes, status, created_at, updated_at,
             agent_user_id
      FROM customers
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    // If user is an agent, only show their customers
    if (userRole === 'agent') {
      paramCount++;
      query += ` AND agent_user_id = $${paramCount}`;
      queryParams.push(userId);
    }

    if (search) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM customers WHERE 1=1';
    const countParams = [];
    paramCount = 0;

    // Apply same agent filter to count
    if (userRole === 'agent') {
      paramCount++;
      countQuery += ` AND agent_user_id = $${paramCount}`;
      countParams.push(userId);
    }

    if (search) {
      paramCount++;
      countQuery += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      customers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const result = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = result.rows[0];

    // If user is an agent, ensure they can only view their own customers
    if (userRole === 'agent' && customer.agent_user_id !== userId) {
      return res.status(403).json({ error: 'Access denied. This customer is not assigned to you.' });
    }

    res.json({ customer });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new customer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      date_of_birth,
      nationality,
      passport_number,
      gender,
      occupation,
      city,
      state,
      country,
      emergency_contact,
      emergency_phone,
      notes,
      status = 'active'
    } = req.body;

    // Convert empty strings to null for optional fields
    const sanitizedDateOfBirth = date_of_birth && date_of_birth.trim() !== '' ? date_of_birth : null;

    // If user is an agent, automatically set agent_user_id to their user ID
    let insertQuery;
    let insertParams;
    if (userRole === 'agent') {
      insertQuery = `INSERT INTO customers (first_name, last_name, email, phone, address, date_of_birth, nationality, passport_number,
                                           gender, occupation, city, state, country, emergency_contact, emergency_phone, notes, status,
                                           agent_user_id)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                     RETURNING *`;
      insertParams = [first_name, last_name, email, phone, address, sanitizedDateOfBirth, nationality, passport_number,
                      gender, occupation, city, state, country, emergency_contact, emergency_phone, notes, status,
                      userId];
    } else {
      insertQuery = `INSERT INTO customers (first_name, last_name, email, phone, address, date_of_birth, nationality, passport_number,
                                           gender, occupation, city, state, country, emergency_contact, emergency_phone, notes, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                     RETURNING *`;
      insertParams = [first_name, last_name, email, phone, address, sanitizedDateOfBirth, nationality, passport_number,
                      gender, occupation, city, state, country, emergency_contact, emergency_phone, notes, status];
    }

    const result = await pool.query(insertQuery, insertParams);
    const customer = result.rows[0];

    // Send welcome SMS to customer (async, don't wait for it)
    if (phone) {
      try {
        const customerName = `${first_name} ${last_name}`.trim();
        smsService.notifyCustomerCreated(
          phone,
          customerName
        ).catch(err => {
          console.error('Failed to send customer welcome SMS:', err);
          // Don't fail the request if SMS fails
        });
      } catch (smsError) {
        console.error('Error sending customer welcome SMS:', smsError);
        // Don't fail the request if SMS fails
      }
    }

    res.status(201).json({
      message: 'Customer created successfully',
      customer: customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      date_of_birth,
      nationality,
      passport_number,
      gender,
      occupation,
      city,
      state,
      country,
      emergency_contact,
      emergency_phone,
      notes,
      status
    } = req.body;

    // If user is an agent, ensure they can only update their own customers
    if (userRole === 'agent') {
      const ownerCheck = await pool.query(
        'SELECT agent_user_id FROM customers WHERE id = $1',
        [id]
      );
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      if (ownerCheck.rows[0].agent_user_id !== userId) {
        return res.status(403).json({ error: 'Access denied. This customer is not assigned to you.' });
      }
    }

    // Convert empty strings to null for optional fields
    const sanitizedDateOfBirth = date_of_birth && date_of_birth.trim() !== '' ? date_of_birth : null;

    const result = await pool.query(
      `UPDATE customers SET 
       first_name = $1, last_name = $2, email = $3, phone = $4, address = $5,
       date_of_birth = $6, nationality = $7, passport_number = $8, gender = $9,
       occupation = $10, city = $11, state = $12, country = $13,
       emergency_contact = $14, emergency_phone = $15, notes = $16, status = $17,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $18
       RETURNING *`,
      [first_name, last_name, email, phone, address, sanitizedDateOfBirth, nationality, passport_number,
       gender, occupation, city, state, country, emergency_contact, emergency_phone, notes, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({
      message: 'Customer updated successfully',
      customer: result.rows[0]
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete customer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // If user is an agent, ensure they can only delete their own customers
    if (userRole === 'agent') {
      const ownerCheck = await pool.query(
        'SELECT agent_user_id FROM customers WHERE id = $1',
        [id]
      );
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      if (ownerCheck.rows[0].agent_user_id !== userId) {
        return res.status(403).json({ error: 'Access denied. This customer is not assigned to you.' });
      }
    }

    const result = await pool.query(
      'DELETE FROM customers WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




