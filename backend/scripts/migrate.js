const pool = require('../config/database');

const createTables = async () => {
  try {
    console.log('Creating database tables...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        department VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        avatar VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Service Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES service_categories(id),
        pricing_tiers JSONB,
        requirements TEXT[],
        is_active BOOLEAN DEFAULT true,
        success_rate DECIMAL(5,2) DEFAULT 0,
        total_applications INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table (base definition)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        date_of_birth DATE,
        nationality VARCHAR(100),
        passport_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure newer customer fields exist (for production DBs created before these fields were added)
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS gender VARCHAR(20)`);
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS occupation VARCHAR(255)`);
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(255)`);
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(255)`);
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS country VARCHAR(255)`);
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255)`);
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20)`);
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT`);
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'`);
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS agent_user_id INTEGER REFERENCES users(id)`);

    // Applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        service_id INTEGER REFERENCES services(id),
        staff_id INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'draft',
        priority VARCHAR(20) DEFAULT 'normal',
        documents JSONB,
        notes TEXT,
        estimated_completion_date DATE,
        actual_completion_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Visitors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        purpose VARCHAR(255),
        visit_date DATE NOT NULL,
        visit_time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled',
        staff_member VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Visits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        visit_type VARCHAR(255) NOT NULL,
        visit_date DATE NOT NULL,
        visit_time TIME NOT NULL,
        duration VARCHAR(50),
        status VARCHAR(50) DEFAULT 'scheduled',
        staff_member VARCHAR(255),
        location VARCHAR(255),
        purpose TEXT,
        outcome TEXT,
        follow_up_required BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        service VARCHAR(255) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        staff_member VARCHAR(255),
        location VARCHAR(255),
        notes TEXT,
        reminder_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Staff table (extended users table)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        position VARCHAR(255),
        department VARCHAR(100),
        hire_date DATE,
        salary VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        location VARCHAR(255),
        working_hours VARCHAR(100),
        total_applications INTEGER DEFAULT 0,
        current_workload VARCHAR(50) DEFAULT 'low',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reports table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        period VARCHAR(50),
        filters JSONB,
        data JSONB,
        generated_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Documents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size BIGINT NOT NULL,
        category VARCHAR(100),
        description TEXT,
        application_id INTEGER REFERENCES applications(id),
        customer_id INTEGER REFERENCES customers(id),
        uploaded_by INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Document categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Permissions & access control tables (used by permissions middleware)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        description TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
        granted BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role, permission_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
        granted BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, permission_id)
      )
    `);

    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

const insertSampleData = async () => {
  try {
    console.log('Inserting sample data...');

    // Insert sample service categories
    await pool.query(`
      INSERT INTO service_categories (name, description) VALUES
      ('Document', 'Document-related services including passport, birth certificate, and ID applications'),
      ('Education', 'Educational services including school and university applications'),
      ('Travel', 'Travel-related services including visa applications and travel insurance'),
      ('Business', 'Business services including registration and permit applications')
      ON CONFLICT DO NOTHING
    `);

    // Insert sample services
    await pool.query(`
      INSERT INTO services (name, description, category_id, pricing_tiers, requirements, success_rate, total_applications) VALUES
      ('Passport Application', 'Complete passport application service including document preparation and submission', 1, 
       '[{"name": "Regular", "price": "$150.00", "duration": "2-3 weeks", "isDefault": true}, {"name": "Express", "price": "$250.00", "duration": "1 week", "isDefault": false}]',
       '{"Birth Certificate", "ID Card", "Passport Photos", "Application Form"}', 95.0, 45),
      ('Visa Application', 'Tourist and business visa application assistance', 3,
       '[{"name": "Standard", "price": "$200.00", "duration": "3-4 weeks", "isDefault": true}, {"name": "Express", "price": "$350.00", "duration": "1-2 weeks", "isDefault": false}]',
       '{"Passport", "Bank Statements", "Travel Itinerary", "Hotel Booking"}', 92.0, 28)
      ON CONFLICT DO NOTHING
    `);

    // Insert sample staff
    await pool.query(`
      INSERT INTO staff (first_name, last_name, email, phone, position, department, hire_date, salary, status, location, working_hours, total_applications, current_workload) VALUES
      ('Sarah', 'Wilson', 'sarah@visalink.com', '+1 (555) 111-2222', 'Senior Consultant', 'Consultation', '2023-01-15', '$65,000', 'active', 'Main Office', '9:00 AM - 5:00 PM', 45, 'medium'),
      ('Mike', 'Johnson', 'mike@visalink.com', '+1 (555) 333-4444', 'Document Specialist', 'Documentation', '2023-03-20', '$55,000', 'active', 'Main Office', '8:30 AM - 4:30 PM', 32, 'high'),
      ('Lisa', 'Davis', 'lisa@visalink.com', '+1 (555) 555-6666', 'Customer Service Rep', 'Customer Service', '2023-06-10', '$45,000', 'active', 'Main Office', '9:00 AM - 6:00 PM', 28, 'low')
      ON CONFLICT (email) DO NOTHING
    `);

    // Insert sample customers
    await pool.query(`
      INSERT INTO customers (first_name, last_name, email, phone, address, nationality, passport_number) VALUES
      ('John', 'Doe', 'john@example.com', '+1 (555) 123-4567', '123 Main St, City, State', 'American', 'A12345678'),
      ('Jane', 'Smith', 'jane@example.com', '+1 (555) 234-5678', '456 Oak Ave, City, State', 'Canadian', 'C87654321'),
      ('Alice', 'Johnson', 'alice@example.com', '+1 (555) 111-2222', '789 Pine St, City, State', 'British', 'B11223344')
      ON CONFLICT (email) DO NOTHING
    `);

    // Insert sample visitors
    await pool.query(`
      INSERT INTO visitors (first_name, last_name, email, phone, purpose, visit_date, visit_time, status, staff_member, notes) VALUES
      ('Alice', 'Johnson', 'alice@example.com', '+1 (555) 111-2222', 'Consultation', '2024-01-15', '10:00:00', 'completed', 'Sarah Wilson', 'Interested in visa application'),
      ('Bob', 'Smith', 'bob@example.com', '+1 (555) 333-4444', 'Document Submission', '2024-01-14', '14:00:00', 'scheduled', 'Mike Johnson', 'Bringing passport documents'),
      ('Carol', 'Davis', 'carol@example.com', '+1 (555) 555-6666', 'Follow-up', '2024-01-13', '11:30:00', 'no-show', 'Lisa Davis', 'Application status inquiry')
      ON CONFLICT DO NOTHING
    `);

    // Insert sample visits
    await pool.query(`
      INSERT INTO visits (customer_name, customer_email, visit_type, visit_date, visit_time, duration, status, staff_member, location, purpose, outcome, follow_up_required) VALUES
      ('John Doe', 'john@example.com', 'Consultation', '2024-01-15', '10:00:00', '60 minutes', 'completed', 'Sarah Wilson', 'Office - Room A', 'Visa application consultation', 'Application submitted successfully', false),
      ('Jane Smith', 'jane@example.com', 'Document Review', '2024-01-14', '14:00:00', '30 minutes', 'completed', 'Mike Johnson', 'Office - Room B', 'Passport document verification', 'Documents approved', true),
      ('Mike Johnson', 'mike@example.com', 'Follow-up', '2024-01-13', '11:30:00', '45 minutes', 'scheduled', 'Lisa Davis', 'Office - Room A', 'Application status update', '', false)
      ON CONFLICT DO NOTHING
    `);

    // Insert sample appointments
    await pool.query(`
      INSERT INTO appointments (customer_name, customer_email, customer_phone, service, appointment_date, appointment_time, duration, status, staff_member, location, notes, reminder_sent) VALUES
      ('John Doe', 'john@example.com', '+1 (555) 123-4567', 'Visa Consultation', '2024-01-16', '10:00:00', '60 minutes', 'confirmed', 'Sarah Wilson', 'Office - Room A', 'First-time visa applicant', true),
      ('Jane Smith', 'jane@example.com', '+1 (555) 234-5678', 'Document Review', '2024-01-16', '14:00:00', '30 minutes', 'pending', 'Mike Johnson', 'Office - Room B', 'Bringing passport and birth certificate', false),
      ('Mike Johnson', 'mike@example.com', '+1 (555) 345-6789', 'Application Submission', '2024-01-17', '09:00:00', '45 minutes', 'confirmed', 'Lisa Davis', 'Office - Room A', 'Final submission of visa application', true)
      ON CONFLICT DO NOTHING
    `);

    console.log('Sample data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

const runMigration = async () => {
  try {
    await createTables();
    await insertSampleData();
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigration();
}

module.exports = { createTables, insertSampleData };




