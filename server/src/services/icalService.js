const axios = require('axios');
const ical = require('node-ical');
const { Calendar, Event } = require('../models');

// Fetch iCal feed from URL
const fetchIcalFeed = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching iCal feed:', error);
    throw error;
  }
};

// Parse iCal feed
const parseIcalFeed = async (icalData) => {
  try {
    const events = await ical.parseICS(icalData);
    return events;
  } catch (error) {
    console.error('Error parsing iCal feed:', error);
    throw error;
  }
};

// Process and store events from iCal feed
const processAndStoreIcalEvents = async (calendarId, events) => {
  try {
    const calendarRecord = await Calendar.findByPk(calendarId);
    if (!calendarRecord) {
      throw new Error(`Calendar with ID ${calendarId} not found`);
    }

    const processedEvents = [];

    // Process each event
    for (const [uid, event] of Object.entries(events)) {
      // Skip non-VEVENT items (like VTIMEZONE)
      if (event.type !== 'VEVENT') {
        continue;
      }

      // Skip cancelled events
      if (event.status === 'CANCELLED') {
        // Find and delete the event if it exists
        const existingEvent = await Event.findOne({
          where: {
            calendarId,
            sourceEventId: uid
          }
        });
        
        if (existingEvent) {
          await existingEvent.destroy();
        }
        
        continue;
      }

      // Extract start and end times
      const startTime = event.start;
      const endTime = event.end || new Date(startTime.getTime() + 3600000); // Default to 1 hour if no end time
      
      // Extract organizer information
      let organizer = null;
      let organizerEmail = null;
      let organizerName = null;
      
      if (event.organizer) {
        // Handle different formats of organizer
        if (typeof event.organizer === 'string') {
          organizer = event.organizer;
          // Try to extract email from mailto: format
          const emailMatch = event.organizer.match(/mailto:([^>]+)/i);
          if (emailMatch) {
            organizerEmail = emailMatch[1];
          }
        } else if (typeof event.organizer === 'object') {
          organizerEmail = event.organizer.val;
          organizerName = event.organizer.params?.CN;
          organizer = organizerName ? `${organizerName} <${organizerEmail}>` : organizerEmail;
        }
      }

      // Extract attendees
      const attendees = [];
      if (event.attendee) {
        // Handle single attendee
        if (!Array.isArray(event.attendee)) {
          event.attendee = [event.attendee];
        }
        
        // Process each attendee
        for (const attendee of event.attendee) {
          if (typeof attendee === 'string') {
            // Extract email from mailto: format
            const emailMatch = attendee.match(/mailto:([^>]+)/i);
            if (emailMatch) {
              attendees.push(emailMatch[1]);
            } else {
              attendees.push(attendee);
            }
          } else if (typeof attendee === 'object') {
            attendees.push(attendee.val.replace('mailto:', ''));
          }
        }
      }

      // Prepare event data
      const eventData = {
        calendarId,
        sourceEventId: uid,
        title: event.summary,
        description: event.description,
        location: event.location,
        organizer,
        organizerEmail,
        organizerName,
        startTime,
        endTime,
        isAllDay: !event.start.hasOwnProperty('dateTime'),
        status: event.status || 'confirmed',
        recurrence: event.rrule ? event.rrule.toString() : null,
        attendees,
        lastUpdated: new Date(),
        metadata: {
          dtstamp: event.dtstamp,
          created: event.created,
          lastModified: event.lastModified,
          sequence: event.sequence,
          transparency: event.transparency,
          url: event.url
        }
      };

      // Upsert the event (insert if not exists, update if exists)
      const [eventRecord, created] = await Event.upsert(eventData);
      processedEvents.push(eventRecord);
      
      // Process attendees in detail if needed
      // This would involve using the EventAttendee model
      // Omitted for brevity but would follow a similar pattern
    }

    // Update the calendar's lastSynced timestamp
    await calendarRecord.update({
      lastSynced: new Date()
    });

    return processedEvents;
  } catch (error) {
    console.error('Error processing and storing iCal events:', error);
    throw error;
  }
};

// Sync iCal calendar events
const syncIcalCalendar = async (calendarId) => {
  try {
    const calendarRecord = await Calendar.findByPk(calendarId);
    if (!calendarRecord) {
      throw new Error(`Calendar with ID ${calendarId} not found`);
    }

    if (calendarRecord.provider !== 'ical') {
      throw new Error(`Calendar with ID ${calendarId} is not an iCal calendar`);
    }

    // Fetch and parse the iCal feed
    const icalData = await fetchIcalFeed(calendarRecord.calendarIdentifier);
    const events = await parseIcalFeed(icalData);
    
    // Process and store the events
    const processedEvents = await processAndStoreIcalEvents(calendarId, events);
    
    return {
      success: true,
      count: processedEvents.length
    };
  } catch (error) {
    console.error('Error syncing iCal calendar:', error);
    throw error;
  }
};

module.exports = {
  fetchIcalFeed,
  parseIcalFeed,
  processAndStoreIcalEvents,
  syncIcalCalendar
};
