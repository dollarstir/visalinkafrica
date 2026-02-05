const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const smsService = require('../services/smsService');
const settingsService = require('../services/settingsService');

const router = express.Router();

// Register (public – user, agent-applicant, or customer)
// When role is 'agent', user is created as 'user' and an agent_application (pending) is created; admin must approve.
// When role is 'customer', user is created as 'customer' and a customer record is linked (for portal self-service).
router.post('/register', async (req, res) => {
  try {
    let { name, email, password, role = 'user', department, phone } = req.body;
    if (!['user', 'agent', 'customer'].includes(role)) {
      role = 'user';
    }

    // Customer must provide phone for welcome SMS
    if (role === 'customer') {
      const phoneStr = (phone != null && typeof phone === 'string') ? phone.trim() : '';
      if (!phoneStr) {
        return res.status(400).json({ error: 'Phone number is required for customer registration. We send a welcome SMS to this number.' });
      }
      phone = phoneStr;
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // If they applied as agent, create as user and add pending agent application
    const createRole = role === 'agent' ? 'user' : role;

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, department, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, department, created_at',
      [name, email, hashedPassword, createRole, department || (role === 'agent' ? 'Agent' : null), role === 'customer' ? (phone || null) : null]
    );

    const user = result.rows[0];
    delete user.password;

    if (role === 'customer') {
      const parts = (name || '').trim().split(/\s+/);
      const first_name = parts[0] || name || 'Customer';
      const last_name = parts.slice(1).join(' ') || '';
      await pool.query(
        `INSERT INTO customers (first_name, last_name, email, phone, user_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET user_id = $5, first_name = $1, last_name = $2, phone = COALESCE(customers.phone, $4)`,
        [first_name, last_name, email, phone || null, user.id]
      );
      // Send welcome SMS (async, don't block response)
      const customerName = `${first_name} ${last_name}`.trim() || name || 'Customer';
      if (phone) {
        smsService.notifyCustomerCreated(phone, customerName).catch(err => {
          console.error('Failed to send customer welcome SMS:', err);
        });
      }
    }

    if (role === 'agent') {
      const appResult = await pool.query(
        'INSERT INTO agent_applications (user_id, status) VALUES ($1, $2) RETURNING id',
        [user.id, 'pending']
      );
      const applicationId = appResult.rows[0]?.id;

      // Notify admins via WebSocket
      const notification = notificationService.createNotification(
        'info',
        'New agent application',
        `${name} (${email}) requested to become an agent.`,
        { type: 'agent_application', applicationId, userId: user.id, name, email }
      );
      notificationService.notifyRole('admin', notification);

      // SMS to support number if set and SMS enabled
      try {
        const supportPhone = await settingsService.getSetting('general', 'support_phone', '');
        if (supportPhone && supportPhone.trim()) {
          const message = `VisaLink: New agent application from ${name} (${email}). Please check Agent applications in the CRM.`;
          await smsService.sendSMS(supportPhone.trim(), message);
        }
      } catch (smsErr) {
        console.error('SMS alert for agent application failed:', smsErr);
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: role === 'agent'
        ? 'Application submitted. An admin will review your request to become an agent.'
        : 'User created successfully',
      user,
      token,
      agentApplicationPending: role === 'agent'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, name, email, password, role, department, phone, address, avatar, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Remove password from response
    delete user.password;

    // Get user permissions
    const { getUserPermissions } = require('../middleware/permissions');
    const permissions = await getUserPermissions(user.id, user.role);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        ...user,
        permissions
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, department, phone, address, avatar, is_active, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Get user permissions
    const { getUserPermissions } = require('../middleware/permissions');
    const permissions = await getUserPermissions(user.id, user.role);

    res.json({ 
      user: {
        ...user,
        permissions
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address, department } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2, address = $3, department = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, email, role, department, phone, address, avatar',
      [name, phone, address, department, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Get current password
    const result = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


