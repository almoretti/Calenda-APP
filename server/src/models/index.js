const { sequelize } = require('../config/database');
const Calendar = require('./Calendar');
const Event = require('./Event');
const EventAttendee = require('./EventAttendee');

// Define any additional relationships here if needed

// Function to sync all models with the database
const syncModels = async (force = false) => {
  try {
    // Use alter: true instead of force: true to update existing tables without dropping them
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
};

module.exports = {
  sequelize,
  Calendar,
  Event,
  EventAttendee,
  syncModels
};
