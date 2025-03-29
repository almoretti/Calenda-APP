const { Calendar, Event } = require('../models');
const googleCalendarService = require('./googleCalendarService');
const icalService = require('./icalService');

// Create a new calendar
const createCalendar = async (calendarData) => {
  try {
    const calendar = await Calendar.create(calendarData);
    return calendar;
  } catch (error) {
    console.error('Error creating calendar:', error);
    throw error;
  }
};

// Get all calendars
const getAllCalendars = async () => {
  try {
    const calendars = await Calendar.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    return calendars;
  } catch (error) {
    console.error('Error getting calendars:', error);
    throw error;
  }
};

// Get calendar by ID
const getCalendarById = async (id) => {
  try {
    const calendar = await Calendar.findByPk(id);
    return calendar;
  } catch (error) {
    console.error('Error getting calendar:', error);
    throw error;
  }
};

// Update calendar
const updateCalendar = async (id, calendarData) => {
  try {
    const calendar = await Calendar.findByPk(id);
    if (!calendar) {
      throw new Error(`Calendar with ID ${id} not found`);
    }
    
    await calendar.update(calendarData);
    return calendar;
  } catch (error) {
    console.error('Error updating calendar:', error);
    throw error;
  }
};

// Delete calendar
const deleteCalendar = async (id) => {
  try {
    const calendar = await Calendar.findByPk(id);
    if (!calendar) {
      throw new Error(`Calendar with ID ${id} not found`);
    }
    
    await calendar.destroy();
    return { success: true };
  } catch (error) {
    console.error('Error deleting calendar:', error);
    throw error;
  }
};

// Sync calendar events
const syncCalendarEvents = async (calendarId, options = {}) => {
  try {
    const calendar = await Calendar.findByPk(calendarId);
    if (!calendar) {
      throw new Error(`Calendar with ID ${calendarId} not found`);
    }
    
    let result;
    
    // Dispatch to the appropriate service based on provider
    switch (calendar.provider) {
      case 'google':
        result = await googleCalendarService.syncCalendarEvents(calendarId, options);
        break;
      case 'ical':
        result = await icalService.syncIcalCalendar(calendarId);
        break;
      default:
        throw new Error(`Unsupported calendar provider: ${calendar.provider}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error syncing calendar events:', error);
    throw error;
  }
};

// Sync all calendars
const syncAllCalendars = async (options = {}) => {
  try {
    const calendars = await Calendar.findAll({
      where: { isActive: true }
    });
    
    const results = [];
    
    for (const calendar of calendars) {
      try {
        const result = await syncCalendarEvents(calendar.id, options);
        results.push({
          calendarId: calendar.id,
          provider: calendar.provider,
          success: true,
          count: result.count
        });
      } catch (error) {
        console.error(`Error syncing calendar ${calendar.id}:`, error);
        results.push({
          calendarId: calendar.id,
          provider: calendar.provider,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error syncing all calendars:', error);
    throw error;
  }
};

// Get events for a specific calendar
const getCalendarEvents = async (calendarId, options = {}) => {
  try {
    const { startDate, endDate, limit, offset } = options;
    
    const whereClause = { calendarId };
    
    if (startDate) {
      whereClause.startTime = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      whereClause.endTime = { $lte: new Date(endDate) };
    }
    
    const events = await Event.findAll({
      where: whereClause,
      order: [['startTime', 'ASC']],
      limit: limit || 100,
      offset: offset || 0
    });
    
    return events;
  } catch (error) {
    console.error('Error getting calendar events:', error);
    throw error;
  }
};

// Get all events across all calendars
const getAllEvents = async (options = {}) => {
  try {
    const { startDate, endDate, limit, offset } = options;
    
    const whereClause = {};
    
    if (startDate) {
      whereClause.startTime = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      whereClause.endTime = { $lte: new Date(endDate) };
    }
    
    const events = await Event.findAll({
      where: whereClause,
      include: [{ model: Calendar, where: { isActive: true } }],
      order: [['startTime', 'ASC']],
      limit: limit || 100,
      offset: offset || 0
    });
    
    return events;
  } catch (error) {
    console.error('Error getting all events:', error);
    throw error;
  }
};

// Connect Google Calendar
const connectGoogleCalendar = async (code) => {
  try {
    // Exchange code for tokens
    const tokens = await googleCalendarService.getTokensFromCode(code);
    
    // Get user info
    const userInfo = await googleCalendarService.getUserInfo(tokens);
    
    // Create calendar record
    const calendar = await createCalendar({
      provider: 'google',
      accountEmail: userInfo.email,
      calendarIdentifier: 'primary', // Default to primary calendar
      displayName: `${userInfo.name}'s Calendar`,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: new Date(tokens.expiry_date)
    });
    
    // Sync calendar events
    await syncCalendarEvents(calendar.id);
    
    return calendar;
  } catch (error) {
    console.error('Error connecting Google Calendar:', error);
    throw error;
  }
};

// Connect iCal feed
const connectIcalFeed = async (url, displayName) => {
  try {
    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('webcal://')) {
      throw new Error('Invalid iCal URL');
    }
    
    // Convert webcal:// to https://
    const normalizedUrl = url.replace(/^webcal:\/\//i, 'https://');
    
    // Create calendar record
    const calendar = await createCalendar({
      provider: 'ical',
      calendarIdentifier: normalizedUrl,
      displayName: displayName || 'iCal Calendar'
    });
    
    // Sync calendar events
    await syncCalendarEvents(calendar.id);
    
    return calendar;
  } catch (error) {
    console.error('Error connecting iCal feed:', error);
    throw error;
  }
};

module.exports = {
  createCalendar,
  getAllCalendars,
  getCalendarById,
  updateCalendar,
  deleteCalendar,
  syncCalendarEvents,
  syncAllCalendars,
  getCalendarEvents,
  getAllEvents,
  connectGoogleCalendar,
  connectIcalFeed
};
