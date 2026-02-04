const pool = require('../config/database');

const NEW_PERMISSIONS = [
  { name: 'View Website', code: 'website.view', description: 'View website management (pages, slider, blog, jobs)', category: 'Website' },
  { name: 'Update Website', code: 'website.update', description: 'Edit website content, slider, blog posts, and job posts', category: 'Website' },
  { name: 'View Job Applications', code: 'job_applications.view', description: 'View and manage job applications (careers)', category: 'Website' },
  { name: 'View Agents', code: 'agents.view', description: 'View agents list and their application stats', category: 'Agents' },
  { name: 'View Agent Requests', code: 'agent_applications.view', description: 'View and manage agent registration requests', category: 'Agents' },
];

async function addWebsiteAgentsPermissions() {
  try {
    console.log('Adding website and agents permissions...');

    for (const perm of NEW_PERMISSIONS) {
      const existing = await pool.query(
        'SELECT id FROM permissions WHERE code = $1',
        [perm.code]
      );
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO permissions (name, code, description, category)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (code) DO NOTHING`,
          [perm.name, perm.code, perm.description, perm.category]
        );
        console.log('Added permission:', perm.code);
      } else {
        console.log('Permission already exists:', perm.code);
      }
    }

    // Grant new permissions to admin role (so they appear as assignable and admin keeps access via role)
    const adminRole = 'admin';
    for (const perm of NEW_PERMISSIONS) {
      const permRow = await pool.query('SELECT id FROM permissions WHERE code = $1', [perm.code]);
      if (permRow.rows.length === 0) continue;
      const permId = permRow.rows[0].id;
      const existing = await pool.query(
        'SELECT id FROM role_permissions WHERE role = $1 AND permission_id = $2',
        [adminRole, permId]
      );
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO role_permissions (role, permission_id, granted)
           VALUES ($1, $2, true)
           ON CONFLICT (role, permission_id) DO NOTHING`,
          [adminRole, permId]
        );
        console.log('Granted', perm.code, 'to admin');
      }
    }

    console.log('Website and agents permissions setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding permissions:', error);
    process.exit(1);
  }
}

addWebsiteAgentsPermissions();
