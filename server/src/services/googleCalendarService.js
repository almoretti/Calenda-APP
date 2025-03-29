const { google } = require('googleapis');
const { Calendar, Event } = require('../models');

// Create OAuth2 client
const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// Generate authentication URL
const getAuthUrl = () => {
  const oauth2Client = createOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Force to get refresh token
  });
};

// Exchange code for tokens
const getTokensFromCode = async (code) => {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Get user info from Google
const getUserInfo = async (tokens) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  });
  
  const userInfo = await oauth2.userinfo.get();
  return userInfo.data;
};

// List user's calendars
const listCalendars = async (calendarId) => {
  try {
    const calendarRecord = await Calendar.findByPk(calendarId);
    if (!calendarRecord) {
      throw new Error(`Calendar with ID ${calendarId} not found`);
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: calendarRecord.accessToken,
      refresh_token: calendarRecord.refreshToken,
      expiry_date: calendarRecord.tokenExpiry ? new Date(calendarRecord.tokenExpiry).getTime() : null
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.calendarList.list();
    
    return response.data.items;
  } catch (error) {
    console.error('Error listing calendars:', error);
    throw error;
  }
};

// Fetch events from Google Calendar
const fetchEvents = async (calendarId, options = {}) => {
  try {
    const calendarRecord = await Calendar.findByPk(calendarId);
    if (!calendarRecord) {
      throw new Error(`Calendar with ID ${calendarId} not found`);
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: calendarRecord.accessToken,
      refresh_token: calendarRecord.refreshToken,
      expiry_date: calendarRecord.tokenExpiry ? new Date(calendarRecord.tokenExpiry).getTime() : null
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Set up parameters for the events.list call
    const params = {
      calendarId: calendarRecord.calendarIdentifier,
      maxResults: options.maxResults || 2500,
      singleEvents: true,
      orderBy: 'startTime',
      ...options
    };

    // Use syncToken if available for incremental sync
    if (calendarRecord.syncToken && !options.fullSync) {
      params.syncToken = calendarRecord.syncToken;
    } else {
      // If no syncToken or full sync requested, use time bounds
      const timeMin = options.timeMin || new Date();
      const timeMax = options.timeMax || new Date(timeMin);
      timeMax.setMonth(timeMax.getMonth() + 3); // Default to 3 months ahead
      
      params.timeMin = timeMin.toISOString();
      params.timeMax = timeMax.toISOString();
    }

    // Fetch events
    const response = await calendar.events.list(params);
    const events = response.data.items;
    const nextSyncToken = response.data.nextSyncToken;

    // Update the calendar's syncToken
    if (nextSyncToken) {
      await calendarRecord.update({
        syncToken: nextSyncToken,
        lastSynced: new Date()
      });
    }

    return {
      events,
      nextSyncToken
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    
    // Handle expired syncToken
    if (error.code === 410) {
      // Sync token expired, clear it and try again with full sync
      await calendarRecord.update({ syncToken: null });
      return fetchEvents(calendarId, { ...options, fullSync: true });
    }
    
    throw error;
  }
};

// Process and store events from Google Calendar
const processAndStoreEvents = async (calendarId, events) => {
  try {
    for (const event of events) {
      // Skip cancelled events
      if (event.status === 'cancelled') {
        // Find and delete the event if it exists
        const existingEvent = await Event.findOne({
          where: {
            calendarId,
            sourceEventId: event.id
          }
        });
        
        if (existingEvent) {
          await existingEvent.destroy();
        }
        
        continue;
      }
      
      // Prepare event data
      const eventData = {
        calendarId,
        sourceEventId: event.id,
        title: event.summary,
        description: event.description,
        location: event.location,
        organizer: event.organizer ? `${event.organizer.displayName || ''} <${event.organizer.email}>`.trim() : null,
        organizerEmail: event.organizer ? event.organizer.email : null,
        organizerName: event.organizer ? event.organizer.displayName : null,
        startTime: event.start.dateTime || event.start.date,
        endTime: event.end.dateTime || event.end.date,
        isAllDay: !event.start.dateTime,
        status: event.status,
        recurrence: event.recurrence ? event.recurrence.join('\n') : null,
        color: event.colorId,
        lastUpdated: new Date(),
        metadata: {
          htmlLink: event.htmlLink,
          iCalUID: event.iCalUID,
          created: event.created,
          updated: event.updated,
          creator: event.creator,
          transparency: event.transparency,
          visibility: event.visibility,
          sequence: event.sequence,
          etag: event.etag
        }
      };
      
      // Extract attendees
      if (event.attendees && event.attendees.length > 0) {
        eventData.attendees = event.attendees.map(attendee => 
          attendee.email || `${attendee.displayName || 'Unknown'}`
        );
      }
      
      // Upsert the event (insert if not exists, update if exists)
      const [eventRecord, created] = await Event.upsert(eventData);
      
      // Process attendees in detail if needed
      // This would involve using the EventAttendee model
      // Omitted for brevity but would follow a similar pattern
    }
  } catch (error) {
    console.error('Error processing and storing events:', error);
    throw error;
  }
};

// Sync calendar events
const syncCalendarEvents = async (calendarId, options = {}) => {
  try {
    const { events } = await fetchEvents(calendarId, options);
    await processAndStoreEvents(calendarId, events);
    return { success: true, count: events.length };
  } catch (error) {
    console.error('Error syncing calendar events:', error);
    throw error;
  }
};

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  getUserInfo,
  listCalendars,
  fetchEvents,
  processAndStoreEvents,
  syncCalendarEvents
};
