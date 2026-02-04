const pool = require('../config/database');

/**
 * All permissions used by the app (menus and features).
 * Run: node backend/scripts/seed-all-permissions.js
 */
const ALL_PERMISSIONS = [
  // Applications
  { name: 'View Applications', code: 'applications.view', description: 'View visa/document applications', category: 'Applications' },
  { name: 'Create Applications', code: 'applications.create', description: 'Create new applications', category: 'Applications' },
  { name: 'Edit Applications', code: 'applications.edit', description: 'Edit applications', category: 'Applications' },
  { name: 'Delete Applications', code: 'applications.delete', description: 'Delete applications', category: 'Applications' },
  // Customers
  { name: 'View Customers', code: 'customers.view', description: 'View customers', category: 'Customers' },
  { name: 'Create Customers', code: 'customers.create', description: 'Create customers', category: 'Customers' },
  { name: 'Edit Customers', code: 'customers.edit', description: 'Edit customers', category: 'Customers' },
  { name: 'Delete Customers', code: 'customers.delete', description: 'Delete customers', category: 'Customers' },
  // Visitors
  { name: 'View Visitors', code: 'visitors.view', description: 'View visitors', category: 'Visitors' },
  { name: 'Create Visitors', code: 'visitors.create', description: 'Create visitors', category: 'Visitors' },
  { name: 'Edit Visitors', code: 'visitors.edit', description: 'Edit visitors', category: 'Visitors' },
  { name: 'Delete Visitors', code: 'visitors.delete', description: 'Delete visitors', category: 'Visitors' },
  // Visits
  { name: 'View Visits', code: 'visits.view', description: 'View visits', category: 'Visits' },
  { name: 'Create Visits', code: 'visits.create', description: 'Create visits', category: 'Visits' },
  { name: 'Edit Visits', code: 'visits.edit', description: 'Edit visits', category: 'Visits' },
  { name: 'Delete Visits', code: 'visits.delete', description: 'Delete visits', category: 'Visits' },
  // Appointments
  { name: 'View Appointments', code: 'appointments.view', description: 'View appointments', category: 'Appointments' },
  { name: 'Create Appointments', code: 'appointments.create', description: 'Create appointments', category: 'Appointments' },
  { name: 'Edit Appointments', code: 'appointments.edit', description: 'Edit appointments', category: 'Appointments' },
  { name: 'Delete Appointments', code: 'appointments.delete', description: 'Delete appointments', category: 'Appointments' },
  // Staff
  { name: 'View Staff', code: 'staff.view', description: 'View staff', category: 'Staff' },
  { name: 'Create Staff', code: 'staff.create', description: 'Create staff', category: 'Staff' },
  { name: 'Edit Staff', code: 'staff.edit', description: 'Edit staff', category: 'Staff' },
  { name: 'Delete Staff', code: 'staff.delete', description: 'Delete staff', category: 'Staff' },
  // Service Categories
  { name: 'View Service Categories', code: 'service_categories.view', description: 'View service categories', category: 'Service Categories' },
  { name: 'Create Service Categories', code: 'service_categories.create', description: 'Create service categories', category: 'Service Categories' },
  { name: 'Edit Service Categories', code: 'service_categories.edit', description: 'Edit service categories', category: 'Service Categories' },
  { name: 'Delete Service Categories', code: 'service_categories.delete', description: 'Delete service categories', category: 'Service Categories' },
  // Services
  { name: 'View Services', code: 'services.view', description: 'View services', category: 'Services' },
  { name: 'Create Services', code: 'services.create', description: 'Create services', category: 'Services' },
  { name: 'Edit Services', code: 'services.edit', description: 'Edit services', category: 'Services' },
  { name: 'Delete Services', code: 'services.delete', description: 'Delete services', category: 'Services' },
  // Reports
  { name: 'View Reports', code: 'reports.view', description: 'View reports', category: 'Reports' },
  { name: 'Export Reports', code: 'reports.export', description: 'Export reports', category: 'Reports' },
  // Documents
  { name: 'View Documents', code: 'documents.view', description: 'View documents', category: 'Documents' },
  { name: 'Upload Documents', code: 'documents.upload', description: 'Upload documents', category: 'Documents' },
  { name: 'Download Documents', code: 'documents.download', description: 'Download documents', category: 'Documents' },
  { name: 'Delete Documents', code: 'documents.delete', description: 'Delete documents', category: 'Documents' },
  // Users
  { name: 'View Users', code: 'users.view', description: 'View users', category: 'Users' },
  { name: 'Create Users', code: 'users.create', description: 'Create users', category: 'Users' },
  { name: 'Edit Users', code: 'users.edit', description: 'Edit users', category: 'Users' },
  { name: 'Delete Users', code: 'users.delete', description: 'Delete users', category: 'Users' },
  { name: 'Manage User Permissions', code: 'users.manage_permissions', description: 'Assign permissions to users', category: 'Users' },
  // Agents
  { name: 'View Agents', code: 'agents.view', description: 'View agents list and application stats', category: 'Agents' },
  { name: 'View Agent Requests', code: 'agent_applications.view', description: 'View and manage agent registration requests', category: 'Agents' },
  // Website
  { name: 'View Website', code: 'website.view', description: 'View website management (pages, slider, blog, jobs)', category: 'Website' },
  { name: 'Update Website', code: 'website.update', description: 'Edit website content, slider, blog, job posts', category: 'Website' },
  { name: 'View Job Applications', code: 'job_applications.view', description: 'View and manage job applications (careers)', category: 'Website' },
  // Settings
  { name: 'View Settings', code: 'settings.view', description: 'View application settings', category: 'Settings' },
  { name: 'Update Settings', code: 'settings.update', description: 'Update application settings', category: 'Settings' },
  // Permissions (admin-only)
  { name: 'Create Permissions', code: 'permissions.create', description: 'Create permissions', category: 'Permissions' },
  { name: 'Update Permissions', code: 'permissions.update', description: 'Update permissions', category: 'Permissions' },
  { name: 'Delete Permissions', code: 'permissions.delete', description: 'Delete permissions', category: 'Permissions' },
  { name: 'Manage Role Permissions', code: 'roles.manage_permissions', description: 'Assign permissions to roles', category: 'Permissions' },
];

async function seedAllPermissions() {
  try {
    console.log('Seeding all permissions...');

    // Ensure permissions table has name and category columns
    await pool.query('ALTER TABLE permissions ADD COLUMN IF NOT EXISTS name VARCHAR(255)');
    await pool.query('ALTER TABLE permissions ADD COLUMN IF NOT EXISTS category VARCHAR(100)');

    for (const perm of ALL_PERMISSIONS) {
      await pool.query(
        `INSERT INTO permissions (name, code, description, category)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           category = EXCLUDED.category`,
        [perm.name, perm.code, perm.description, perm.category]
      );
      console.log('  ', perm.code);
    }

    // Grant all permissions to admin role
    const adminRole = 'admin';
    const allPerms = await pool.query('SELECT id, code FROM permissions');
    for (const p of allPerms.rows) {
      await pool.query(
        `INSERT INTO role_permissions (role, permission_id, granted)
         VALUES ($1, $2, true)
         ON CONFLICT (role, permission_id) DO UPDATE SET granted = true`,
        [adminRole, p.id]
      );
    }
    console.log('Granted all permissions to admin role.');

    console.log('Done. Total permissions:', allPerms.rows.length);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding permissions:', error);
    process.exit(1);
  }
}

seedAllPermissions();
