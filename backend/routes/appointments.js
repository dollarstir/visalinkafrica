const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const smsService = require('../services/smsService');

const router = express.Router();

// Get all appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all', date = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, customer_name, customer_email, customer_phone, service, appointment_date, 
             appointment_time, duration, status, staff_member, location, notes, reminder_sent,
             created_at, updated_at
      FROM appointments
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (customer_name ILIKE $${paramCount} OR customer_email ILIKE $${paramCount} OR service ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (status !== 'all') {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      queryParams.push(status);
    }

    if (date !== 'all') {
      const today = new Date();
      let dateFilter = '';
      
      switch (date) {
        case 'today':
          dateFilter = `appointment_date = '${today.toISOString().split('T')[0]}'`;
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          dateFilter = `appointment_date = '${tomorrow.toISOString().split('T')[0]}'`;
          break;
        case 'this-week':
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          dateFilter = `appointment_date BETWEEN '${startOfWeek.toISOString().split('T')[0]}' AND '${endOfWeek.toISOString().split('T')[0]}'`;
          break;
        case 'next-week':
          const nextWeekStart = new Date(today);
          nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
          const nextWeekEnd = new Date(nextWeekStart);
          nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
          dateFilter = `appointment_date BETWEEN '${nextWeekStart.toISOString().split('T')[0]}' AND '${nextWeekEnd.toISOString().split('T')[0]}'`;
          break;
      }
      
      if (dateFilter) {
        query += ` AND ${dateFilter}`;
      }
    }

    query += ` ORDER BY appointment_date ASC, appointment_time ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM appointments WHERE 1=1';
    const countParams = [];
    paramCount = 0;

    if (search) {
      paramCount++;
      countQuery += ` AND (customer_name ILIKE $${paramCount} OR customer_email ILIKE $${paramCount} OR service ILIKE $${paramCount})`;
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
      appointments: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ appointment: result.rows[0] });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      service,
      appointment_date,
      appointment_time,
      duration,
      status = 'pending',
      staff_member,
      location,
      notes,
      reminder_sent = false
    } = req.body;

    const result = await pool.query(
      `INSERT INTO appointments (customer_name, customer_email, customer_phone, service, 
                                appointment_date, appointment_time, duration, status, staff_member, 
                                location, notes, reminder_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [customer_name, customer_email, customer_phone, service, appointment_date, 
       appointment_time, duration, status, staff_member, location, notes, reminder_sent]
    );

    const appointment = result.rows[0];

    // Send SMS notification to customer (async, don't wait for it)
    if (customer_phone) {
      try {
        smsService.notifyAppointmentCreated(
          customer_phone,
          customer_name,
          appointment_date,
          appointment_time,
          service,
          location
        ).catch(err => {
          console.error('Failed to send appointment created SMS:', err);
          // Don't fail the request if SMS fails
        });
      } catch (smsError) {
        console.error('Error sending appointment created SMS:', smsError);
        // Don't fail the request if SMS fails
      }
    }

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name,
      customer_email,
      customer_phone,
      service,
      appointment_date,
      appointment_time,
      duration,
      status,
      staff_member,
      location,
      notes,
      reminder_sent
    } = req.body;

    const result = await pool.query(
      `UPDATE appointments SET 
       customer_name = $1, customer_email = $2, customer_phone = $3, service = $4,
       appointment_date = $5, appointment_time = $6, duration = $7, status = $8,
       staff_member = $9, location = $10, notes = $11, reminder_sent = $12,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [customer_name, customer_email, customer_phone, service, appointment_date,
       appointment_time, duration, status, staff_member, location, notes, reminder_sent, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment updated successfully',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete appointment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM appointments WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointment statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN reminder_sent = true THEN 1 END) as reminders_sent
      FROM appointments
    `);

    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




