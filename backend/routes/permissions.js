const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

const router = express.Router();

// Get all permissions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM permissions ORDER BY category, name';
    const params = [];

    if (category) {
      query = 'SELECT * FROM permissions WHERE category = $1 ORDER BY name';
      params.push(category);
    }

    const result = await pool.query(query, params);
    res.json({ permissions: result.rows });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get permission by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM permissions WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    res.json({ permission: result.rows[0] });
  } catch (error) {
    console.error('Get permission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create permission (admin only)
router.post('/', authenticateToken, requirePermission('permissions.create'), async (req, res) => {
  try {
    const { name, code, description, category } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const result = await pool.query(
      `INSERT INTO permissions (name, code, description, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, code, description, category]
    );

    res.status(201).json({
      message: 'Permission created successfully',
      permission: result.rows[0]
    });
  } catch (error) {
    console.error('Create permission error:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Duplicate permission',
        message: 'A permission with this name or code already exists'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update permission (admin only)
router.put('/:id', authenticateToken, requirePermission('permissions.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, category } = req.body;

    const result = await pool.query(
      `UPDATE permissions 
       SET name = $1, code = $2, description = $3, category = $4
       WHERE id = $5
       RETURNING *`,
      [name, code, description, category, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    res.json({
      message: 'Permission updated successfully',
      permission: result.rows[0]
    });
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete permission (admin only)
router.delete('/:id', authenticateToken, requirePermission('permissions.delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM permissions WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    res.json({ 
      message: 'Permission deleted successfully',
      permission: result.rows[0]
    });
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user permissions
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;
    const requestingUserRole = req.user.role;

    // Users can only view their own permissions unless they're admin
    if (parseInt(userId) !== requestingUserId && requestingUserRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT p.id, p.name, p.code, p.description, p.category, up.granted
       FROM user_permissions up
       JOIN permissions p ON up.permission_id = p.id
       WHERE up.user_id = $1
       ORDER BY p.category, p.name`,
      [userId]
    );

    res.json({ permissions: result.rows });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set user permissions (admin only)
router.post('/user/:userId', authenticateToken, requirePermission('users.manage_permissions'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body; // Array of { permission_id, granted }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }

    // Delete existing permissions
    await pool.query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);

    // Insert new permissions
    if (permissions.length > 0) {
      const values = permissions.map((p, index) => {
        const base = index * 3;
        return `($${base + 1}, $${base + 2}, $${base + 3})`;
      }).join(', ');

      const params = [];
      permissions.forEach(p => {
        params.push(userId, p.permission_id, p.granted !== false);
      });

      await pool.query(
        `INSERT INTO user_permissions (user_id, permission_id, granted)
         VALUES ${values}`,
        params
      );
    }

    res.json({ message: 'User permissions updated successfully' });
  } catch (error) {
    console.error('Set user permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get role permissions
router.get('/role/:role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;

    const result = await pool.query(
      `SELECT p.id, p.name, p.code, p.description, p.category, rp.granted
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role = $1
       ORDER BY p.category, p.name`,
      [role]
    );

    res.json({ permissions: result.rows });
  } catch (error) {
    console.error('Get role permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set role permissions (admin only)
router.post('/role/:role', authenticateToken, requirePermission('roles.manage_permissions'), async (req, res) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body; // Array of { permission_id, granted }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }

    // Delete existing permissions
    await pool.query('DELETE FROM role_permissions WHERE role = $1', [role]);

    // Insert new permissions
    if (permissions.length > 0) {
      const values = permissions.map((p, index) => {
        const base = index * 3;
        return `($${base + 1}, $${base + 2}, $${base + 3})`;
      }).join(', ');

      const params = [];
      permissions.forEach(p => {
        params.push(role, p.permission_id, p.granted !== false);
      });

      await pool.query(
        `INSERT INTO role_permissions (role, permission_id, granted)
         VALUES ${values}`,
        params
      );
    }

    res.json({ message: 'Role permissions updated successfully' });
  } catch (error) {
    console.error('Set role permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

