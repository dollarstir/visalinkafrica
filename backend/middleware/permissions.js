const pool = require('../config/database');

/**
 * Check if user has a specific permission
 * @param {string} permissionCode - The permission code to check
 * @returns {Function} Express middleware
 */
const requirePermission = (permissionCode) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = req.user.userId;
      const userRole = req.user.role;

      // Admins have all permissions
      if (userRole === 'admin') {
        return next();
      }

      // Check if user has the permission directly
      const userPermission = await pool.query(
        `SELECT up.granted 
         FROM user_permissions up
         JOIN permissions p ON up.permission_id = p.id
         WHERE up.user_id = $1 AND p.code = $2`,
        [userId, permissionCode]
      );

      if (userPermission.rows.length > 0) {
        if (userPermission.rows[0].granted) {
          return next();
        } else {
          return res.status(403).json({ error: 'Permission denied' });
        }
      }

      // Check if user's role has the permission
      const rolePermission = await pool.query(
        `SELECT rp.granted 
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role = $1 AND p.code = $2`,
        [userRole, permissionCode]
      );

      if (rolePermission.rows.length > 0) {
        if (rolePermission.rows[0].granted) {
          return next();
        } else {
          return res.status(403).json({ error: 'Permission denied' });
        }
      }

      // Permission not found - deny access
      return res.status(403).json({ error: 'Permission denied' });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Check if user has any of the specified permissions
 * @param {string[]} permissionCodes - Array of permission codes
 * @returns {Function} Express middleware
 */
const requireAnyPermission = (permissionCodes) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = req.user.userId;
      const userRole = req.user.role;

      // Admins have all permissions
      if (userRole === 'admin') {
        return next();
      }

      // Check user permissions
      const userPermissions = await pool.query(
        `SELECT p.code, up.granted 
         FROM user_permissions up
         JOIN permissions p ON up.permission_id = p.id
         WHERE up.user_id = $1 AND p.code = ANY($2::varchar[])`,
        [userId, permissionCodes]
      );

      for (const perm of userPermissions.rows) {
        if (perm.granted) {
          return next();
        }
      }

      // Check role permissions
      const rolePermissions = await pool.query(
        `SELECT p.code, rp.granted 
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role = $1 AND p.code = ANY($2::varchar[])`,
        [userRole, permissionCodes]
      );

      for (const perm of rolePermissions.rows) {
        if (perm.granted) {
          return next();
        }
      }

      return res.status(403).json({ error: 'Permission denied' });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Get all permissions for a user (for frontend)
 */
const getUserPermissions = async (userId, userRole) => {
  try {
    const permissions = {};

    // Admins have all permissions
    if (userRole === 'admin') {
      const allPerms = await pool.query('SELECT code FROM permissions');
      allPerms.rows.forEach(p => {
        permissions[p.code] = true;
      });
      return permissions;
    }

    // Get user-specific permissions
    const userPerms = await pool.query(
      `SELECT p.code, up.granted 
       FROM user_permissions up
       JOIN permissions p ON up.permission_id = p.id
       WHERE up.user_id = $1`,
      [userId]
    );

    userPerms.rows.forEach(p => {
      permissions[p.code] = p.granted;
    });

    // Get role permissions (only if not overridden by user permission)
    const rolePerms = await pool.query(
      `SELECT p.code, rp.granted 
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role = $1`,
      [userRole]
    );

    rolePerms.rows.forEach(p => {
      if (permissions[p.code] === undefined) {
        permissions[p.code] = p.granted;
      }
    });

    return permissions;
  } catch (error) {
    console.error('Get user permissions error:', error);
    return {};
  }
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  getUserPermissions
};

