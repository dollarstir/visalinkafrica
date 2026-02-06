const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const smsService = require('../services/smsService');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Helper function to check if user has a specific permission
const hasPermission = async (userId, userRole, permissionCode) => {
  // Admins have all permissions
  if (userRole === 'admin') {
    return true;
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
    return userPermission.rows[0].granted === true;
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
    return rolePermission.rows[0].granted === true;
  }

  // Permission not found - deny
  return false;
};

// Get all applications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all', priority = 'all' } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // If user is staff, get their staff_id from staff table
    let staffId = null;
    if (userRole === 'staff') {
      const staffResult = await pool.query(
        'SELECT id FROM staff WHERE user_id = $1',
        [userId]
      );
      if (staffResult.rows.length > 0) {
        staffId = staffResult.rows[0].id;
      }
    }

    // Flags for access control
    let shouldFilterByStaff = false;
    let shouldFilterByAgent = false;

    // Staff access rules: if staff lacks applications.view, only show their assigned applications
    if (userRole === 'staff' && staffId) {
      const hasViewPermission = await hasPermission(userId, userRole, 'applications.view');
      if (!hasViewPermission) {
        shouldFilterByStaff = true;
      }
    }

    // If user is agent, only show applications they created
    if (userRole === 'agent') {
      shouldFilterByAgent = true;
    }

    // If user is customer (portal), only show their own applications (via linked customer record)
    let customerIdForUser = null;
    if (userRole === 'customer') {
      const custResult = await pool.query('SELECT id FROM customers WHERE user_id = $1', [userId]);
      if (custResult.rows.length > 0) {
        customerIdForUser = custResult.rows[0].id;
      } else {
        return res.json({ applications: [], pagination: { page: 1, limit: parseInt(limit, 10), total: 0, pages: 0 } });
      }
    }

    let query = `
      SELECT a.id, a.customer_id, a.service_id, a.staff_id, a.agent_user_id, a.application_source, a.status, a.priority, a.documents, 
             a.notes, a.estimated_completion_date, a.actual_completion_date, 
             a.created_at, a.updated_at,
             c.first_name, c.last_name, c.email, c.phone,
             s.name as service_name,
             CONCAT(st.first_name, ' ', st.last_name) as staff_name,
             u_agent.name as agent_name
      FROM applications a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN staff st ON a.staff_id = st.id
      LEFT JOIN users u_agent ON a.agent_user_id = u_agent.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (userRole === 'customer' && customerIdForUser) {
      paramCount++;
      query += ` AND a.customer_id = $${paramCount}`;
      queryParams.push(customerIdForUser);
    }

    // If user is staff without view permission, only show their assigned applications
    if (shouldFilterByStaff) {
      paramCount++;
      query += ` AND a.staff_id = $${paramCount}`;
      queryParams.push(staffId);
    }

    if (shouldFilterByAgent) {
      paramCount++;
      query += ` AND a.agent_user_id = $${paramCount}`;
      queryParams.push(userId);
    }

    if (search) {
      paramCount++;
      query += ` AND (c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount} OR c.email ILIKE $${paramCount} OR s.name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (status !== 'all') {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      queryParams.push(status);
    }

    if (priority !== 'all') {
      paramCount++;
      query += ` AND a.priority = $${paramCount}`;
      queryParams.push(priority);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) FROM applications a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (userRole === 'customer' && customerIdForUser) {
      countParamCount++;
      countQuery += ` AND a.customer_id = $${countParamCount}`;
      countParams.push(customerIdForUser);
    }

    // If user is staff without view permission, only count their assigned applications
    if (shouldFilterByStaff) {
      countParamCount++;
      countQuery += ` AND a.staff_id = $${countParamCount}`;
      countParams.push(staffId);
    }

    if (shouldFilterByAgent) {
      countParamCount++;
      countQuery += ` AND a.agent_user_id = $${countParamCount}`;
      countParams.push(userId);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (c.first_name ILIKE $${countParamCount} OR c.last_name ILIKE $${countParamCount} OR c.email ILIKE $${countParamCount} OR s.name ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (status !== 'all') {
      countParamCount++;
      countQuery += ` AND a.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (priority !== 'all') {
      countParamCount++;
      countQuery += ` AND a.priority = $${countParamCount}`;
      countParams.push(priority);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      applications: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get application by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // If user is staff, get their staff_id and check permissions
    let staffId = null;
    let shouldFilterByStaff = false;
    if (userRole === 'staff') {
      const staffResult = await pool.query(
        'SELECT id FROM staff WHERE user_id = $1',
        [userId]
      );
      if (staffResult.rows.length > 0) {
        staffId = staffResult.rows[0].id;
        // Check if staff has applications.view permission
        const hasViewPermission = await hasPermission(userId, userRole, 'applications.view');
        if (!hasViewPermission) {
          shouldFilterByStaff = true;
        }
      }
    }

    const result = await pool.query(
      `SELECT a.*, c.first_name, c.last_name, c.email, c.phone, s.name as service_name, 
              CONCAT(st.first_name, ' ', st.last_name) as staff_name,
              u_agent.name as agent_name
       FROM applications a
       LEFT JOIN customers c ON a.customer_id = c.id
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN staff st ON a.staff_id = st.id
       LEFT JOIN users u_agent ON a.agent_user_id = u_agent.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = result.rows[0];

    // If user is customer, only allow viewing their own applications
    if (userRole === 'customer') {
      const custResult = await pool.query('SELECT id FROM customers WHERE user_id = $1', [userId]);
      if (custResult.rows.length === 0 || application.customer_id !== custResult.rows[0].id) {
        return res.status(403).json({ error: 'Access denied. This application is not yours.' });
      }
    }

    // If staff doesn't have view permission, check if application is assigned to them
    if (shouldFilterByStaff && application.staff_id !== staffId) {
      return res.status(403).json({ error: 'Access denied. This application is not assigned to you.' });
    }

    // If user is agent, only allow viewing their own applications
    if (userRole === 'agent' && application.agent_user_id !== userId) {
      return res.status(403).json({ error: 'Access denied. This application is not assigned to you.' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new application
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    let {
      customer_id,
      service_id,
      staff_id,
      status = 'draft',
      priority = 'normal',
      documents,
      notes,
      estimated_completion_date,
      selected_tier_name
    } = req.body;

    // Customer (portal self-service): use their linked customer record and set source to self-applied
    if (userRole === 'customer') {
      if (!service_id) {
        return res.status(400).json({ error: 'service_id is required' });
      }
      const custResult = await pool.query('SELECT id FROM customers WHERE user_id = $1', [userId]);
      if (custResult.rows.length === 0) {
        return res.status(400).json({ error: 'No customer profile linked to your account. Please contact support.' });
      }
      customer_id = custResult.rows[0].id;
      staff_id = null;
      status = 'draft';
      estimated_completion_date = null;
    }

    // For agents, force status to 'draft' and ignore estimated_completion_date; set agent_user_id
    const effectiveStatus = userRole === 'agent' ? 'draft' : status;
    const effectiveEstimatedDate = userRole === 'agent' ? null : estimated_completion_date;
    const agentUserId = userRole === 'agent' ? userId : null;
    const applicationSource = userRole === 'customer' ? 'self-applied' : (userRole === 'agent' ? 'agent' : 'staff');

    const insertQuery = `INSERT INTO applications (customer_id, service_id, staff_id, agent_user_id, application_source, status, priority, documents, notes, estimated_completion_date, selected_tier_name)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                         RETURNING *`;
    const insertParams = [customer_id, service_id, staff_id, agentUserId, applicationSource, effectiveStatus, priority, documents || null, notes || null, effectiveEstimatedDate, selected_tier_name && String(selected_tier_name).trim() ? String(selected_tier_name).trim() : null];

    const result = await pool.query(insertQuery, insertParams);
    const application = result.rows[0];

    // Send SMS notification to customer (and agent if applicable)
    try {
      // Get customer details for SMS
      const customerResult = await pool.query(
        'SELECT first_name, last_name, phone FROM customers WHERE id = $1',
        [application.customer_id]
      );
      const serviceResult = await pool.query(
        'SELECT name FROM services WHERE id = $1',
        [service_id]
      );

      if (customerResult.rows.length > 0 && serviceResult.rows.length > 0) {
        const customer = customerResult.rows[0];
        const service = serviceResult.rows[0];
        const customerName = `${customer.first_name} ${customer.last_name}`.trim();
        
        // Check if application was created by an agent
        let agentPhone = null;
        let agentName = null;
        
        if (application.agent_user_id) {
          // Get agent details from users table
          const agentResult = await pool.query(
            'SELECT name, phone FROM users WHERE id = $1',
            [application.agent_user_id]
          );
          
          if (agentResult.rows.length > 0) {
            agentName = agentResult.rows[0].name;
            agentPhone = agentResult.rows[0].phone;
          }
        }
        
        // Send SMS to customer (and agent if applicable)
        // Send asynchronously (don't block the response)
        smsService.notifyApplicationCreated(
          customer.phone,
          customerName,
          application.id,
          service.name,
          agentPhone,  // Will be null if not created by agent
          agentName    // Will be null if not created by agent
        ).catch(err => {
          console.error('Failed to send application created SMS:', err);
          // Don't fail the request if SMS fails
        });
      }
    } catch (smsError) {
      console.error('Error sending application created SMS:', smsError);
      // Don't fail the request if SMS fails
    }

    // Send real-time notification
    try {
      if (customerResult.rows.length > 0 && serviceResult.rows.length > 0) {
        const customer = customerResult.rows[0];
        const service = serviceResult.rows[0];
        const customerName = `${customer.first_name} ${customer.last_name}`.trim();
        
        const notification = notificationService.createNotification(
          'success',
          'New Application Created',
          `Application #${application.id} for ${customerName} (${service.name}) has been created`,
          { applicationId: application.id, customerId: customer_id, serviceId: service_id }
        );

        // Notify admin and staff
        notificationService.notifyRole('admin', notification);
        notificationService.notifyRole('staff', notification);

        // If created by agent, notify the agent
        if (application.agent_user_id) {
          notificationService.notifyUser(application.agent_user_id, notification);
        }
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.status(201).json({
      message: 'Application created successfully',
      application: application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update application
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    if (userRole === 'customer') {
      return res.status(403).json({ error: 'Customers cannot update applications. Contact support for changes.' });
    }
    const { id } = req.params;
    const {
      customer_id,
      service_id,
      staff_id,
      status,
      priority,
      documents,
      notes,
      estimated_completion_date,
      actual_completion_date
    } = req.body;

    // Get current application data to check status change and get customer info
    const currentAppResult = await pool.query(
      'SELECT status, estimated_completion_date, customer_id, service_id, agent_user_id FROM applications WHERE id = $1',
      [id]
    );
    
    if (currentAppResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const currentApp = currentAppResult.rows[0];
    const oldStatus = currentApp.status;
    let effectiveStatus = status;

    // If user is an agent, prevent them from changing the status (status is
    // controlled by staff/admin) and estimated completion date.
    if (userRole === 'agent') {
      effectiveStatus = currentApp.status;
      // Override estimated_completion_date in body with existing value
      req.body.estimated_completion_date = currentApp.estimated_completion_date;
    }

    const result = await pool.query(
      `UPDATE applications SET 
       customer_id = $1, service_id = $2, staff_id = $3, status = $4, priority = $5,
       documents = $6, notes = $7, estimated_completion_date = $8, actual_completion_date = $9,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [customer_id, service_id, staff_id, effectiveStatus, priority, documents, notes, 
       estimated_completion_date, actual_completion_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updatedApplication = result.rows[0];
    const newStatus = updatedApplication.status;

    // Send SMS notification if status changed (async, don't wait for it)
    if (oldStatus !== newStatus && (newStatus === 'submitted' || newStatus === 'under_review' || newStatus === 'approved' || newStatus === 'rejected')) {
      try {
        // Get customer and service details for SMS
        const customerResult = await pool.query(
          'SELECT first_name, last_name, phone FROM customers WHERE id = $1',
          [currentApp.customer_id]
        );
        const serviceResult = await pool.query(
          'SELECT name FROM services WHERE id = $1',
          [currentApp.service_id]
        );

        if (customerResult.rows.length > 0 && serviceResult.rows.length > 0) {
          const customer = customerResult.rows[0];
          const service = serviceResult.rows[0];
          const customerName = `${customer.first_name} ${customer.last_name}`.trim();
          
          // Check if application was created by an agent
          let agentPhone = null;
          let agentName = null;
          
          if (currentApp.agent_user_id) {
            // Get agent details from users table
            const agentResult = await pool.query(
              'SELECT name, phone FROM users WHERE id = $1',
              [currentApp.agent_user_id]
            );
            
            if (agentResult.rows.length > 0) {
              agentName = agentResult.rows[0].name;
              agentPhone = agentResult.rows[0].phone;
            }
          }
          
          // Send SMS to customer (and agent if applicable)
          // Send asynchronously (don't block the response)
          smsService.notifyApplicationStatusChange(
            customer.phone,
            customerName,
            id,
            oldStatus,
            newStatus,
            service.name,
            agentPhone,  // Will be null if not created by agent
            agentName    // Will be null if not created by agent
          ).catch(err => {
            console.error('Failed to send application status change SMS:', err);
            // Don't fail the request if SMS fails
          });
        }

        // Send real-time notification
        try {
          const statusLabels = {
            'draft': 'Draft',
            'submitted': 'Submitted',
            'under_review': 'Under Review',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'pending': 'Pending'
          };

          const notification = notificationService.createNotification(
            newStatus === 'approved' ? 'success' : newStatus === 'rejected' ? 'error' : 'info',
            'Application Status Updated',
            `Application #${id} for ${customerName} status changed from ${statusLabels[oldStatus] || oldStatus} to ${statusLabels[newStatus] || newStatus}`,
            { applicationId: id, customerId: currentApp.customer_id, oldStatus, newStatus }
          );

          // Notify admin and staff
          notificationService.notifyRole('admin', notification);
          notificationService.notifyRole('staff', notification);

          // If created by agent, notify the agent
          if (currentApp.agent_user_id) {
            notificationService.notifyUser(currentApp.agent_user_id, notification);
          }
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }
      } catch (smsError) {
        console.error('Error sending application status change SMS:', smsError);
        // Don't fail the request if SMS fails
      }
    }

    res.json({
      message: 'Application updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete application
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Customers cannot delete applications.' });
    }
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM applications WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get application statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent
      FROM applications
    `);

    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




