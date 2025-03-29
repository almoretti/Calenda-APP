const { Client } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Supabase database configuration
const dbConfig = {
  host: process.env.SUPABASE_DB_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.SUPABASE_DB_PORT || process.env.DB_PORT || 5432,
  user: process.env.SUPABASE_DB_USER || process.env.DB_USER || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres',
  database: process.env.SUPABASE_DB_NAME || process.env.DB_NAME || 'postgres',
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
};

// Verify Supabase connection and setup
const setupDatabase = async () => {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database');

    // Check if tables exist and create them if needed
    // This is handled by Sequelize in the models/index.js file
    // when the application starts, so we don't need to do it here

    console.log('Supabase database connection verified successfully');
  } catch (error) {
    console.error('Error connecting to Supabase database:', error);
    throw error;
  } finally {
    await client.end();
    console.log('Disconnected from Supabase PostgreSQL database');
  }
};

// Run the script
setupDatabase()
  .then(() => {
    console.log('Supabase database setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Supabase database setup failed:', error);
    process.exit(1);
  });
