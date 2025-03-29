const calendarService = require('../services/calendarService');
const googleCalendarService = require('../services/googleCalendarService');

// Get all calendars
const getAllCalendars = async (req, res) => {
  try {
    const calendars = await calendarService.getAllCalendars();
    res.status(200).json(calendars);
  } catch (error) {
    console.error('Error getting calendars:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get calendar by ID
const getCalendarById = async (req, res) => {
  try {
    const { id } = req.params;
    const calendar = await calendarService.getCalendarById(id);
    
    if (!calendar) {
      return res.status(404).json({ error: 'Calendar not found' });
    }
    
    res.status(200).json(calendar);
  } catch (error) {
    console.error('Error getting calendar:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create calendar
const createCalendar = async (req, res) => {
  try {
    const calendarData = req.body;
    const calendar = await calendarService.createCalendar(calendarData);
    res.status(201).json(calendar);
  } catch (error) {
    console.error('Error creating calendar:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update calendar
const updateCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    const calendarData = req.body;
    const calendar = await calendarService.updateCalendar(id, calendarData);
    res.status(200).json(calendar);
  } catch (error) {
    console.error('Error updating calendar:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete calendar
const deleteCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    await calendarService.deleteCalendar(id);
    res.status(200).json({ message: 'Calendar deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar:', error);
    res.status(500).json({ error: error.message });
  }
};

// Sync calendar events
const syncCalendarEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const options = req.body;
    const result = await calendarService.syncCalendarEvents(id, options);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error syncing calendar events:', error);
    res.status(500).json({ error: error.message });
  }
};

// Sync all calendars
const syncAllCalendars = async (req, res) => {
  try {
    const options = req.body;
    const results = await calendarService.syncAllCalendars(options);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error syncing all calendars:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Google Calendar auth URL
const getGoogleAuthUrl = (req, res) => {
  try {
    const authUrl = googleCalendarService.getAuthUrl();
    res.status(200).json({ authUrl });
  } catch (error) {
    console.error('Error getting Google auth URL:', error);
    res.status(500).json({ error: error.message });
  }
};

// Handle Google Calendar auth callback
const handleGoogleAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    const calendar = await calendarService.connectGoogleCalendar(code);
    res.status(200).json(calendar);
  } catch (error) {
    console.error('Error handling Google auth callback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Connect iCal feed
const connectIcalFeed = async (req, res) => {
  try {
    const { url, displayName } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'iCal URL is required' });
    }
    
    const calendar = await calendarService.connectIcalFeed(url, displayName);
    res.status(201).json(calendar);
  } catch (error) {
    console.error('Error connecting iCal feed:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCalendars,
  getCalendarById,
  createCalendar,
  updateCalendar,
  deleteCalendar,
  syncCalendarEvents,
  syncAllCalendars,
  getGoogleAuthUrl,
  handleGoogleAuthCallback,
  connectIcalFeed
};
