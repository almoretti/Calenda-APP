const dotenv = require('dotenv');
const { Calendar } = require('../models');
const calendarService = require('../services/calendarService');
const { testConnection } = require('../models');

// Load environment variables
dotenv.config({ path: '../.env' });

// Sync all calendars
const syncAllCalendars = async () => {
  try {
    // Test database connection
    await testConnection();
    console.log('Connected to database');

    // Get all active calendars
    const calendars = await Calendar.findAll({
      where: { isActive: true }
    });

    console.log(`Found ${calendars.length} active calendars to sync`);

    // Sync each calendar
    for (const calendar of calendars) {
      try {
        console.log(`Syncing calendar: ${calendar.displayName} (${calendar.provider})`);
        
        const result = await calendarService.syncCalendarEvents(calendar.id);
        
        console.log(`Successfully synced ${result.count} events for calendar ${calendar.id}`);
      } catch (error) {
        console.error(`Error syncing calendar ${calendar.id}:`, error);
        // Continue with next calendar
      }
    }

    console.log('Calendar sync completed');
  } catch (error) {
    console.error('Error syncing calendars:', error);
    throw error;
  }
};

// Run the script
syncAllCalendars()
  .then(() => {
    console.log('Calendar sync completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Calendar sync failed:', error);
    process.exit(1);
  });
