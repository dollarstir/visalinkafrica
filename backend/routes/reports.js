const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

const router = express.Router();

// Helper function to extract numeric value from price string
const extractPrice = (priceString) => {
  if (!priceString) return 0;
  // Remove $, ₵, GHS, commas, and any non-numeric characters except decimal point
  const numericString = priceString.toString()
    .replace(/GHS/gi, '') // Remove GHS (case insensitive)
    .replace(/[^0-9.]/g, ''); // Remove all non-numeric except decimal point
  const price = parseFloat(numericString);
  return isNaN(price) ? 0 : price;
};

// Get all reports
router.get('/', authenticateToken, requirePermission('reports.view'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', type = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.id, r.title, r.type, r.period, r.filters, r.data, r.created_at,
             u.name as generated_by_name
      FROM reports r
      LEFT JOIN users u ON r.generated_by = u.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (r.title ILIKE $${paramCount} OR r.type ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (type !== 'all') {
      paramCount++;
      query += ` AND r.type = $${paramCount}`;
      queryParams.push(type);
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM reports WHERE 1=1';
    const countParams = [];
    paramCount = 0;

    if (search) {
      paramCount++;
      countQuery += ` AND (title ILIKE $${paramCount} OR type ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }

    if (type !== 'all') {
      paramCount++;
      countQuery += ` AND type = $${paramCount}`;
      countParams.push(type);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      reports: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get report by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.name as generated_by_name
       FROM reports r
       LEFT JOIN users u ON r.generated_by = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report: result.rows[0] });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new report
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      type,
      period,
      filters,
      data,
      generated_by
    } = req.body;

    const result = await pool.query(
      `INSERT INTO reports (title, type, period, filters, data, generated_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, type, period, filters, data, generated_by]
    );

    res.status(201).json({
      message: 'Report created successfully',
      report: result.rows[0]
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update report
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      period,
      filters,
      data
    } = req.body;

    const result = await pool.query(
      `UPDATE reports SET 
       title = $1, type = $2, period = $3, filters = $4, data = $5
       WHERE id = $6
       RETURNING *`,
      [title, type, period, filters, data, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      message: 'Report updated successfully',
      report: result.rows[0]
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete report
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM reports WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate dashboard statistics
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
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

    // Application statistics: filter by agent if agent, by staff if staff, or show all
    let applicationQuery = `
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM applications
    `;
    let applicationParams = [];
    
    // If user is agent, only count their applications
    if (userRole === 'agent') {
      applicationQuery += ` WHERE agent_user_id = $1`;
      applicationParams.push(userId);
    }
    
    const applicationStats = await pool.query(applicationQuery, applicationParams);
    
    // For staff, also get their assigned applications count
    let myApplications = 0;
    if (userRole === 'staff' && staffId) {
      const myAppsResult = await pool.query(
        'SELECT COUNT(*) as count FROM applications WHERE staff_id = $1',
        [staffId]
      );
      myApplications = parseInt(myAppsResult.rows[0].count) || 0;
    }
    
    // Add my_applications to the result for staff
    applicationStats.rows[0].my_applications = myApplications;

    // Get visitor statistics
    const visitorStats = await pool.query(`
      SELECT 
        COUNT(*) as total_visitors,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'no-show' THEN 1 END) as no_show
      FROM visitors
    `);

    // Get appointment statistics
    const appointmentStats = await pool.query(`
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM appointments
    `);

    // Get staff statistics with dynamic workload calculation
    const staffStats = await pool.query(`
      WITH staff_workloads AS (
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
        COUNT(*) as total_staff,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_staff,
        COUNT(CASE WHEN workload = 'high' THEN 1 END) as high_workload
      FROM staff_workloads
    `);

    // Get customer statistics
    const customerStats = await pool.query(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers
      FROM customers
    `);

    // Get pending visits (visitors with status 'scheduled')
    const pendingVisits = await pool.query(`
      SELECT COUNT(*) as pending_visits
      FROM visitors
      WHERE status = 'scheduled'
    `);

    res.json({
      applications: applicationStats.rows[0],
      visitors: visitorStats.rows[0],
      appointments: appointmentStats.rows[0],
      staff: staffStats.rows[0],
      customers: customerStats.rows[0],
      pending_visits: parseInt(pendingVisits.rows[0].pending_visits) || 0
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get application statistics report
router.get('/stats/applications', authenticateToken, requirePermission('reports.view'), async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    // Calculate date range based on period
    let dateFilter = '';
    if (period === '7days') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === '30days') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '30 days'";
    } else if (period === '90days') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '90 days'";
    } else if (period === '1year') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '1 year'";
    }

    // Get applications by status
    const byStatus = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM applications a
      WHERE 1=1 ${dateFilter}
      GROUP BY status
      ORDER BY count DESC
    `);

    // Get applications by service category with pricing data for revenue calculation
    const byCategoryResult = await pool.query(`
      SELECT 
        sc.name as category,
        a.id as application_id,
        s.pricing_tiers
      FROM applications a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE 1=1 ${dateFilter}
    `);

    // Group by category and calculate revenue
    const categoryMap = {};
    byCategoryResult.rows.forEach(row => {
      // Handle NULL category - use 'Uncategorized' if category is null or empty
      const categoryName = (row.category && row.category.trim() !== '') ? row.category : 'Uncategorized';
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = { count: 0, revenue: 0 };
      }
      categoryMap[categoryName].count++;
      
      // Calculate revenue for this application
      if (row.pricing_tiers && Array.isArray(row.pricing_tiers) && row.pricing_tiers.length > 0) {
        const defaultTier = row.pricing_tiers.find(tier => tier.isDefault) || row.pricing_tiers[0];
        if (defaultTier && defaultTier.price) {
          categoryMap[categoryName].revenue += extractPrice(defaultTier.price);
        }
      }
    });
    
    console.log('Category map:', categoryMap);
    console.log('ByCategory result rows:', byCategoryResult.rows.length);

    // Convert to array format
    const byCategory = Object.keys(categoryMap).map(categoryName => ({
      category: categoryName,
      count: categoryMap[categoryName].count,
      revenue: Math.round(categoryMap[categoryName].revenue * 100) / 100
    })).sort((a, b) => b.count - a.count);

    console.log('Applications by Category:', byCategory);

    // Get monthly trend (last 6 months) with pricing data for revenue calculation
    const monthlyTrendResult = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', a.created_at), 'Mon') as month,
        DATE_TRUNC('month', a.created_at) as month_date,
        a.id,
        s.pricing_tiers
      FROM applications a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.created_at >= CURRENT_DATE - INTERVAL '6 months' ${dateFilter}
      ORDER BY DATE_TRUNC('month', a.created_at) DESC
    `);

    // Group by month and calculate revenue
    const monthlyMap = {};
    monthlyTrendResult.rows.forEach(row => {
      const month = row.month;
      if (!monthlyMap[month]) {
        monthlyMap[month] = { applications: 0, revenue: 0 };
      }
      monthlyMap[month].applications++;
      
      // Calculate revenue for this application
      if (row.pricing_tiers && Array.isArray(row.pricing_tiers) && row.pricing_tiers.length > 0) {
        const defaultTier = row.pricing_tiers.find(tier => tier.isDefault) || row.pricing_tiers[0];
        if (defaultTier && defaultTier.price) {
          monthlyMap[month].revenue += extractPrice(defaultTier.price);
        }
      }
    });

    // Convert to array and limit to 6 months
    const monthlyTrend = Object.keys(monthlyMap)
      .slice(0, 6)
      .map(month => ({
        month: month,
        applications: monthlyMap[month].applications,
        revenue: Math.round(monthlyMap[month].revenue * 100) / 100
      }));

    res.json({
      byStatus: byStatus.rows,
      byCategory: byCategory,
      monthlyTrend: monthlyTrend
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get staff performance report
router.get('/stats/staff', authenticateToken, requirePermission('reports.view'), async (req, res) => {
  try {
    // Get staff performance with applications and pricing
    const performanceResult = await pool.query(`
      SELECT 
        s.id,
        CONCAT(s.first_name, ' ', s.last_name) as name,
        a.id as application_id,
        a.status,
        sv.pricing_tiers
      FROM staff s
      LEFT JOIN applications a ON s.id = a.staff_id
      LEFT JOIN services sv ON a.service_id = sv.id
    `);

    // Group by staff and calculate metrics
    const staffMap = {};
    performanceResult.rows.forEach(row => {
      const staffId = row.id;
      const staffName = row.name || 'Unknown';
      
      if (!staffMap[staffId]) {
        staffMap[staffId] = {
          name: staffName,
          applications: 0,
          approved: 0,
          revenue: 0
        };
      }
      
      if (row.application_id) {
        staffMap[staffId].applications++;
        if (row.status === 'approved') {
          staffMap[staffId].approved++;
        }
        
        // Calculate revenue for this application
        if (row.pricing_tiers && Array.isArray(row.pricing_tiers) && row.pricing_tiers.length > 0) {
          const defaultTier = row.pricing_tiers.find(tier => tier.isDefault) || row.pricing_tiers[0];
          if (defaultTier && defaultTier.price) {
            staffMap[staffId].revenue += extractPrice(defaultTier.price);
          }
        }
      }
    });

    // Calculate success rate and format performance data
    const performance = Object.entries(staffMap).map(([staffId, staff]) => {
      const successRate = staff.applications > 0 
        ? Math.round((staff.approved / staff.applications) * 100 * 10) / 10 
        : 0;
      return {
        id: parseInt(staffId),
        name: staff.name,
        applications: staff.applications,
        success_rate: successRate,
        revenue: Math.round(staff.revenue * 100) / 100
      };
    }).sort((a, b) => b.applications - a.applications);

    // Get staff workload
    const workload = await pool.query(`
      SELECT 
        s.id,
        CONCAT(s.first_name, ' ', s.last_name) as name,
        COUNT(DISTINCT CASE WHEN a.status IN ('pending', 'under_review', 'submitted') THEN a.id END) as current,
        COUNT(DISTINCT CASE WHEN a.status = 'approved' THEN a.id END) as completed,
        COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending
      FROM staff s
      LEFT JOIN applications a ON s.id = a.staff_id
      GROUP BY s.id, s.first_name, s.last_name
      ORDER BY current DESC
    `);

    res.json({
      performance: performance,
      workload: workload.rows
    });
  } catch (error) {
    console.error('Get staff stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get revenue report
router.get('/stats/revenue', authenticateToken, requirePermission('reports.view'), async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    // Calculate date range
    let dateFilter = '';
    if (period === '7days') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === '30days') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '30 days'";
    } else if (period === '90days') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '90 days'";
    } else if (period === '1year') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '1 year'";
    }

    // Get monthly revenue (last 6 months) with actual revenue calculation
    const monthlyResult = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', a.created_at), 'Mon') as month,
        DATE_TRUNC('month', a.created_at) as month_date,
        a.id,
        s.pricing_tiers
      FROM applications a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.created_at >= CURRENT_DATE - INTERVAL '6 months' ${dateFilter}
      ORDER BY DATE_TRUNC('month', a.created_at) DESC
    `);

    // Group by month and calculate revenue
    const monthlyMap = {};
    monthlyResult.rows.forEach(row => {
      const month = row.month;
      if (!monthlyMap[month]) {
        monthlyMap[month] = { applications: 0, revenue: 0 };
      }
      monthlyMap[month].applications++;
      
      // Calculate revenue for this application
      if (row.pricing_tiers && Array.isArray(row.pricing_tiers) && row.pricing_tiers.length > 0) {
        const defaultTier = row.pricing_tiers.find(tier => tier.isDefault) || row.pricing_tiers[0];
        if (defaultTier && defaultTier.price) {
          monthlyMap[month].revenue += extractPrice(defaultTier.price);
        }
      }
    });

    // Convert to array and limit to 6 months
    const monthly = Object.keys(monthlyMap)
      .slice(0, 6)
      .map(month => ({
        month: month,
        applications: monthlyMap[month].applications,
        revenue: Math.round(monthlyMap[month].revenue * 100) / 100
      }));

    // Get revenue by service with actual revenue calculation
    const byServiceResult = await pool.query(`
      SELECT 
        s.name as service,
        a.id,
        s.pricing_tiers
      FROM applications a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE 1=1 ${dateFilter}
    `);

    // Group by service and calculate revenue
    const serviceMap = {};
    byServiceResult.rows.forEach(row => {
      const serviceName = row.service || 'Unknown';
      if (!serviceMap[serviceName]) {
        serviceMap[serviceName] = { count: 0, revenue: 0 };
      }
      serviceMap[serviceName].count++;
      
      // Calculate revenue for this application
      if (row.pricing_tiers && Array.isArray(row.pricing_tiers) && row.pricing_tiers.length > 0) {
        const defaultTier = row.pricing_tiers.find(tier => tier.isDefault) || row.pricing_tiers[0];
        if (defaultTier && defaultTier.price) {
          serviceMap[serviceName].revenue += extractPrice(defaultTier.price);
        }
      }
    });

    // Convert to array and calculate average price
    const byService = Object.keys(serviceMap).map(serviceName => {
      const data = serviceMap[serviceName];
      const avgPrice = data.count > 0 ? data.revenue / data.count : 0;
      return {
        service: serviceName,
        count: data.count,
        revenue: Math.round(data.revenue * 100) / 100,
        avgPrice: Math.round(avgPrice * 100) / 100
      };
    }).sort((a, b) => b.count - a.count);

    res.json({
      monthly: monthly,
      byService: byService
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer statistics report
router.get('/stats/customers', authenticateToken, requirePermission('reports.view'), async (req, res) => {
  try {
    // Get customer demographics (by age groups if date_of_birth is available)
    const demographics = await pool.query(`
      SELECT 
        CASE 
          WHEN date_of_birth IS NOT NULL THEN
            CASE 
              WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 18 AND 25 THEN '18-25'
              WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 26 AND 35 THEN '26-35'
              WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 36 AND 45 THEN '36-45'
              WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 46 AND 55 THEN '46-55'
              WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) > 55 THEN '55+'
              ELSE 'Unknown'
            END
          ELSE 'Unknown'
        END as age_group,
        COUNT(*) as count
      FROM customers
      GROUP BY age_group
      ORDER BY count DESC
    `);

    // Get customer retention stats
    const retention = await pool.query(`
      SELECT 
        COUNT(DISTINCT c.id) as total_customers,
        COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN c.id END) as customers_with_applications,
        COUNT(DISTINCT CASE WHEN a.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN c.id END) as new_customers_30d
      FROM customers c
      LEFT JOIN applications a ON c.id = a.customer_id
    `);

    res.json({
      demographics: demographics.rows,
      retention: retention.rows[0]
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get overview statistics
router.get('/stats/overview', authenticateToken, requirePermission('reports.view'), async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    // Calculate date range
    let dateFilter = '';
    if (period === '7days') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === '30days') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '30 days'";
    } else if (period === '90days') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '90 days'";
    } else if (period === '1year') {
      dateFilter = "AND a.created_at >= CURRENT_DATE - INTERVAL '1 year'";
    }

    // Get total applications
    const totalApps = await pool.query(`
      SELECT COUNT(*) as total FROM applications a WHERE 1=1 ${dateFilter}
    `);

    // Get total customers
    const totalCustomers = await pool.query(`
      SELECT COUNT(DISTINCT id) as total FROM customers
    `);

    // Get success rate
    const successRate = await pool.query(`
      SELECT 
        CASE 
          WHEN COUNT(*) > 0 THEN
            ROUND((COUNT(CASE WHEN status = 'approved' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 1)
          ELSE 0
        END as rate
      FROM applications a
      WHERE 1=1 ${dateFilter}
    `);

    // Get average processing time (in days)
    const avgProcessingTime = await pool.query(`
      SELECT 
        CASE 
          WHEN COUNT(*) > 0 THEN
            ROUND(AVG(EXTRACT(EPOCH FROM (actual_completion_date - created_at)) / 86400), 1)
          ELSE 0
        END as avg_days
      FROM applications a
      WHERE actual_completion_date IS NOT NULL ${dateFilter}
    `);

    // Calculate total revenue from applications and their service pricing
    const revenueResult = await pool.query(`
      SELECT 
        a.id,
        s.pricing_tiers
      FROM applications a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE 1=1 ${dateFilter}
    `);

    let totalRevenue = 0;
    revenueResult.rows.forEach(row => {
      if (row.pricing_tiers && Array.isArray(row.pricing_tiers) && row.pricing_tiers.length > 0) {
        // Get the default pricing tier or first one
        const defaultTier = row.pricing_tiers.find(tier => tier.isDefault) || row.pricing_tiers[0];
        if (defaultTier && defaultTier.price) {
          totalRevenue += extractPrice(defaultTier.price);
        }
      }
    });

    res.json({
      totalApplications: parseInt(totalApps.rows[0].total) || 0,
      totalCustomers: parseInt(totalCustomers.rows[0].total) || 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
      successRate: parseFloat(successRate.rows[0].rate) || 0,
      avgProcessingTime: parseFloat(avgProcessingTime.rows[0].avg_days) || 0
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




