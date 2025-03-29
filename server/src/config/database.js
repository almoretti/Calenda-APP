const { Sequelize } = require('sequelize');
require('dotenv').config();

// Supabase PostgreSQL connection
const sequelize = new Sequelize(
  process.env.SUPABASE_DB_NAME || process.env.DB_NAME,
  process.env.SUPABASE_DB_USER || process.env.DB_USER,
  process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD,
  {
    host: process.env.SUPABASE_DB_HOST || process.env.DB_HOST,
    port: process.env.SUPABASE_DB_PORT || process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // Supabase requires SSL
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      // Use the table names as defined in the models
      freezeTableName: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to Supabase PostgreSQL database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the Supabase PostgreSQL database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection
};
