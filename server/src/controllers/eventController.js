const { Event, Calendar, EventAttendee } = require('../models');
const calendarService = require('../services/calendarService');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const { startDate, endDate, limit, offset } = req.query;
    
    const options = {
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0
    };
    
    const events = await calendarService.getAllEvents(options);
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get events for a specific calendar
const getCalendarEvents = async (req, res) => {
  try {
    const { calendarId } = req.params;
    const { startDate, endDate, limit, offset } = req.query;
    
    const options = {
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0
    };
    
    const events = await calendarService.getCalendarEvents(calendarId, options);
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting calendar events:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id, {
      include: [
        { model: Calendar },
        { model: EventAttendee }
      ]
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get events by date range
const getEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const events = await Event.findAll({
      where: {
        startTime: { $gte: start },
        endTime: { $lte: end }
      },
      include: [
        { model: Calendar, where: { isActive: true } }
      ],
      order: [['startTime', 'ASC']]
    });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting events by date range:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get events for today
const getTodayEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const events = await Event.findAll({
      where: {
        startTime: { $gte: today },
        endTime: { $lt: tomorrow }
      },
      include: [
        { model: Calendar, where: { isActive: true } }
      ],
      order: [['startTime', 'ASC']]
    });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting today events:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;
    
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + parseInt(days));
    
    const events = await Event.findAll({
      where: {
        startTime: { $gte: now },
        endTime: { $lte: future }
      },
      include: [
        { model: Calendar, where: { isActive: true } }
      ],
      order: [['startTime', 'ASC']],
      limit: parseInt(limit)
    });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    res.status(500).json({ error: error.message });
  }
};

// Search events
const searchEvents = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const events = await Event.findAll({
      where: {
        $or: [
          { title: { $iLike: `%${query}%` } },
          { description: { $iLike: `%${query}%` } },
          { location: { $iLike: `%${query}%` } },
          { organizer: { $iLike: `%${query}%` } }
        ]
      },
      include: [
        { model: Calendar, where: { isActive: true } }
      ],
      order: [['startTime', 'ASC']]
    });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEvents,
  getCalendarEvents,
  getEventById,
  getEventsByDateRange,
  getTodayEvents,
  getUpcomingEvents,
  searchEvents
};
