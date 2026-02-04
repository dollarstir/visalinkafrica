const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

const router = express.Router();

// List all agents with total applications and vital application stats (admin only)
router.get('/', authenticateToken, requirePermission('agents.view'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE u.role = 'agent'";
    const queryParams = [];
    let paramCount = 0;

    if (search && search.trim()) {
      paramCount++;
      whereClause += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      queryParams.push(`%${search.trim()}%`);
    }

    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.department, u.is_active, u.created_at,
             COUNT(a.id)::int AS total_applications,
             COUNT(CASE WHEN a.status = 'draft' THEN 1 END)::int AS draft,
             COUNT(CASE WHEN a.status = 'submitted' THEN 1 END)::int AS submitted,
             COUNT(CASE WHEN a.status = 'under_review' THEN 1 END)::int AS under_review,
             COUNT(CASE WHEN a.status = 'approved' THEN 1 END)::int AS approved,
             COUNT(CASE WHEN a.status = 'rejected' THEN 1 END)::int AS rejected
      FROM users u
      LEFT JOIN applications a ON a.agent_user_id = u.id
      ${whereClause}
      GROUP BY u.id, u.name, u.email, u.phone, u.department, u.is_active, u.created_at
      ORDER BY total_applications DESC, u.name ASC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM users u
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams.slice(0, paramCount));
    const total = countResult.rows[0]?.total ?? 0;

    res.json({
      agents: result.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get one agent by id with application summary and recent applications (admin only)
router.get('/:id', authenticateToken, requirePermission('agents.view'), async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      `SELECT id, name, email, phone, department, is_active, created_at, updated_at
       FROM users WHERE id = $1 AND role = 'agent'`,
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agent = userResult.rows[0];

    const statsResult = await pool.query(
      `SELECT COUNT(*)::int AS total_applications,
              COUNT(CASE WHEN status = 'draft' THEN 1 END)::int AS draft,
              COUNT(CASE WHEN status = 'submitted' THEN 1 END)::int AS submitted,
              COUNT(CASE WHEN status = 'under_review' THEN 1 END)::int AS under_review,
              COUNT(CASE WHEN status = 'approved' THEN 1 END)::int AS approved,
              COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int AS rejected
       FROM applications WHERE agent_user_id = $1`,
      [id]
    );
    agent.application_stats = statsResult.rows[0] || {
      total_applications: 0, draft: 0, submitted: 0, under_review: 0, approved: 0, rejected: 0
    };

    const recentResult = await pool.query(
      `SELECT a.id, a.status, a.priority, a.created_at,
              c.first_name, c.last_name, c.email,
              s.name AS service_name
       FROM applications a
       LEFT JOIN customers c ON a.customer_id = c.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.agent_user_id = $1
       ORDER BY a.created_at DESC
       LIMIT 10`,
      [id]
    );
    agent.recent_applications = recentResult.rows;

    res.json({ agent });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
