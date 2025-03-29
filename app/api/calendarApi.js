/**
 * Calendar API client for interacting with the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all calendars
 * @returns {Promise<Array>} Array of calendars
 */
export const fetchCalendars = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendars`);
    if (!response.ok) {
      throw new Error(`Error fetching calendars: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching calendars:', error);
    throw error;
  }
};

/**
 * Fetch a calendar by ID
 * @param {number} id Calendar ID
 * @returns {Promise<Object>} Calendar object
 */
export const fetchCalendarById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendars/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching calendar: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching calendar ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new calendar
 * @param {Object} calendarData Calendar data
 * @returns {Promise<Object>} Created calendar
 */
export const createCalendar = async (calendarData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarData),
    });
    if (!response.ok) {
      throw new Error(`Error creating calendar: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating calendar:', error);
    throw error;
  }
};

/**
 * Update a calendar
 * @param {number} id Calendar ID
 * @param {Object} calendarData Calendar data
 * @returns {Promise<Object>} Updated calendar
 */
export const updateCalendar = async (id, calendarData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendars/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarData),
    });
    if (!response.ok) {
      throw new Error(`Error updating calendar: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating calendar ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a calendar
 * @param {number} id Calendar ID
 * @returns {Promise<Object>} Response object
 */
export const deleteCalendar = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendars/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting calendar: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error deleting calendar ${id}:`, error);
    throw error;
  }
};

/**
 * Sync events for a calendar
 * @param {number} id Calendar ID
 * @param {Object} options Sync options
 * @returns {Promise<Object>} Sync result
 */
export const syncCalendarEvents = async (id, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendars/${id}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    if (!response.ok) {
      throw new Error(`Error syncing calendar events: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error syncing calendar ${id} events:`, error);
    throw error;
  }
};

/**
 * Get Google Calendar auth URL
 * @returns {Promise<Object>} Auth URL object
 */
export const getGoogleAuthUrl = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendars/auth/google`);
    if (!response.ok) {
      throw new Error(`Error getting Google auth URL: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting Google auth URL:', error);
    throw error;
  }
};

/**
 * Connect an iCal feed
 * @param {string} url iCal feed URL
 * @param {string} displayName Display name for the calendar
 * @returns {Promise<Object>} Created calendar
 */
export const connectIcalFeed = async (url, displayName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calendars/ical/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, displayName }),
    });
    if (!response.ok) {
      throw new Error(`Error connecting iCal feed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error connecting iCal feed:', error);
    throw error;
  }
};
