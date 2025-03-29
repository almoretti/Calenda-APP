/**
 * Event API client for interacting with the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all events
 * @param {Object} options Query options (startDate, endDate, limit, offset)
 * @returns {Promise<Array>} Array of events
 */
export const fetchEvents = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (options.startDate) {
      queryParams.append('startDate', options.startDate);
    }
    
    if (options.endDate) {
      queryParams.append('endDate', options.endDate);
    }
    
    if (options.limit) {
      queryParams.append('limit', options.limit);
    }
    
    if (options.offset) {
      queryParams.append('offset', options.offset);
    }
    
    const url = `${API_BASE_URL}/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching events: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Fetch an event by ID
 * @param {number} id Event ID
 * @returns {Promise<Object>} Event object
 */
export const fetchEventById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching event: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch events for a specific calendar
 * @param {number} calendarId Calendar ID
 * @param {Object} options Query options (startDate, endDate, limit, offset)
 * @returns {Promise<Array>} Array of events
 */
export const fetchCalendarEvents = async (calendarId, options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (options.startDate) {
      queryParams.append('startDate', options.startDate);
    }
    
    if (options.endDate) {
      queryParams.append('endDate', options.endDate);
    }
    
    if (options.limit) {
      queryParams.append('limit', options.limit);
    }
    
    if (options.offset) {
      queryParams.append('offset', options.offset);
    }
    
    const url = `${API_BASE_URL}/events/calendar/${calendarId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching calendar events: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching events for calendar ${calendarId}:`, error);
    throw error;
  }
};

/**
 * Fetch events by date range
 * @param {string} startDate Start date (ISO string)
 * @param {string} endDate End date (ISO string)
 * @returns {Promise<Array>} Array of events
 */
export const fetchEventsByDateRange = async (startDate, endDate) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate
    });
    
    const response = await fetch(`${API_BASE_URL}/events/date-range?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Error fetching events by date range: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events by date range:', error);
    throw error;
  }
};

/**
 * Fetch events for today
 * @returns {Promise<Array>} Array of events
 */
export const fetchTodayEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/today`);
    if (!response.ok) {
      throw new Error(`Error fetching today's events: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching today\'s events:', error);
    throw error;
  }
};

/**
 * Fetch upcoming events
 * @param {number} days Number of days to look ahead (default: 7)
 * @param {number} limit Maximum number of events to return (default: 10)
 * @returns {Promise<Array>} Array of events
 */
export const fetchUpcomingEvents = async (days = 7, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      days,
      limit
    });
    
    const response = await fetch(`${API_BASE_URL}/events/upcoming?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Error fetching upcoming events: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

/**
 * Search events
 * @param {string} query Search query
 * @returns {Promise<Array>} Array of matching events
 */
export const searchEvents = async (query) => {
  try {
    const queryParams = new URLSearchParams({
      query
    });
    
    const response = await fetch(`${API_BASE_URL}/events/search?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Error searching events: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
};
