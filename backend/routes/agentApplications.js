const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

const router = express.Router();

// Pending count (for sidebar badge) – auth required
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const result = await pool.query(
      'SELECT COUNT(*)::int AS count FROM agent_applications WHERE status = $1',
      [status]
    );
    res.json({ count: result.rows[0]?.count ?? 0 });
  } catch (error) {
    console.error('Agent applications count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List agent applications (admin only)
router.get('/', authenticateToken, requirePermission('users.view'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT a.id, a.user_id, a.status, a.message, a.created_at, a.reviewed_at, a.reviewed_by,
             u.name, u.email, u.role, u.department, u.created_at as user_created_at
      FROM agent_applications a
      JOIN users u ON u.id = a.user_id
      WHERE 1=1
    `;
    const params = [];
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }
    query += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ applications: result.rows });
  } catch (error) {
    console.error('List agent applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve agent application (admin only)
router.post('/:id/approve', authenticateToken, requirePermission('users.edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const adminId = req.user.userId;

    const appResult = await pool.query(
      'SELECT id, user_id, status FROM agent_applications WHERE id = $1',
      [id]
    );
    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const app = appResult.rows[0];
    if (app.status !== 'pending') {
      return res.status(400).json({ error: 'Application already processed' });
    }

    await pool.query('BEGIN');
    await pool.query(
      'UPDATE users SET role = $1, department = COALESCE(department, $2), updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['agent', 'Agent', app.user_id]
    );
    await pool.query(
      'UPDATE agent_applications SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2 WHERE id = $3',
      ['approved', adminId, id]
    );
    await pool.query('COMMIT');

    res.json({ message: 'Agent application approved', userId: app.user_id });
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('Approve agent application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject agent application (admin only)
router.post('/:id/reject', authenticateToken, requirePermission('users.edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const adminId = req.user.userId;
    const { message } = req.body || {};

    const appResult = await pool.query(
      'SELECT id, user_id, status FROM agent_applications WHERE id = $1',
      [id]
    );
    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const app = appResult.rows[0];
    if (app.status !== 'pending') {
      return res.status(400).json({ error: 'Application already processed' });
    }

    await pool.query(
      'UPDATE agent_applications SET status = $1, message = $2, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $3 WHERE id = $4',
      ['rejected', message || null, adminId, id]
    );

    res.json({ message: 'Agent application rejected' });
  } catch (error) {
    console.error('Reject agent application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
