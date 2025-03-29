"use client";

import { useState, useEffect } from 'react';
import { fetchCalendarEvents } from '@/app/api/eventApi';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

/**
 * Component for displaying a list of events for a calendar
 */
export default function EventList({ calendarId, startDate, endDate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  /**
   * Fetch events when calendarId, startDate, or endDate changes
   */
  useEffect(() => {
    if (calendarId) {
      loadEvents();
    }
  }, [calendarId, startDate, endDate]);

  /**
   * Load events from the API
   */
  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const options = {};
      
      if (startDate) {
        options.startDate = startDate;
      }
      
      if (endDate) {
        options.endDate = endDate;
      }
      
      const data = await fetchCalendarEvents(calendarId, options);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  /**
   * Format time for display
   */
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Handle event click
   */
  const handleEventClick = (event) => {
    setSelectedEvent(event === selectedEvent ? null : event);
  };

  if (loading) {
    return <div className="text-center py-4">Loading events...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error: {error}
        <Button onClick={loadEvents} className="ml-2">Retry</Button>
      </div>
    );
  }

  if (events.length === 0) {
    return <div className="text-center py-4">No events found for the selected calendar and date range.</div>;
  }

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = formatDate(event.startTime);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(eventsByDate).map(([date, dateEvents]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-lg font-medium">{date}</h3>
          
          <div className="space-y-2">
            {dateEvents.map(event => (
              <Card 
                key={event.id} 
                className={`overflow-hidden cursor-pointer transition-all ${selectedEvent === event ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleEventClick(event)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">
                      {event.title || 'Untitled Event'}
                    </CardTitle>
                    {event.isAllDay ? (
                      <Badge className="bg-purple-500 text-white">All Day</Badge>
                    ) : (
                      <div className="text-sm text-gray-500">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                {selectedEvent === event && (
                  <CardContent className="pb-2 space-y-2">
                    {event.description && (
                      <div className="text-sm">
                        {event.description}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.isAllDay ? 'All Day' : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.startTime)}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-1 col-span-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                      
                      {event.organizer && (
                        <div className="flex items-center gap-1 col-span-2">
                          <Users className="h-4 w-4" />
                          Organizer: {event.organizerName || event.organizer}
                        </div>
                      )}
                      
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Attendees: {event.attendees.length}
                          </div>
                          <div className="text-xs text-gray-400 ml-5">
                            {event.attendees.slice(0, 3).join(', ')}
                            {event.attendees.length > 3 && ` and ${event.attendees.length - 3} more`}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
