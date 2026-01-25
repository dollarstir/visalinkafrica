const { createTables, insertSampleData } = require('./scripts/migrate');
const pool = require('./config/database');

const setupDatabase = async () => {
  try {
    console.log('Setting up VisaLink Africa database...');
    
    // Create tables
    await createTables();
    
    // Insert sample data
    await insertSampleData();
    
    console.log('Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the frontend: npm start (in the root directory)');
    console.log('3. Access the application at http://localhost:3000');
    
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;




