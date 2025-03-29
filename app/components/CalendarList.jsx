"use client";

import { useState, useEffect } from 'react';
import { fetchCalendars, syncCalendarEvents, deleteCalendar } from '@/app/api/calendarApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw } from 'lucide-react';

/**
 * Component for displaying a list of calendars
 */
export default function CalendarList({ onCalendarSelect }) {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncingCalendars, setSyncingCalendars] = useState({});

  /**
   * Fetch calendars on component mount
   */
  useEffect(() => {
    loadCalendars();
  }, []);

  /**
   * Load calendars from the API
   */
  const loadCalendars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchCalendars();
      setCalendars(data);
    } catch (error) {
      console.error('Error loading calendars:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sync events for a calendar
   */
  const handleSync = async (calendarId) => {
    try {
      setSyncingCalendars(prev => ({ ...prev, [calendarId]: true }));
      
      await syncCalendarEvents(calendarId);
      
      // Reload calendars to get updated lastSynced timestamp
      await loadCalendars();
    } catch (error) {
      console.error(`Error syncing calendar ${calendarId}:`, error);
      setError(error.message);
    } finally {
      setSyncingCalendars(prev => ({ ...prev, [calendarId]: false }));
    }
  };

  /**
   * Delete a calendar
   */
  const handleDelete = async (calendarId) => {
    if (!window.confirm('Are you sure you want to delete this calendar?')) {
      return;
    }
    
    try {
      await deleteCalendar(calendarId);
      
      // Remove calendar from state
      setCalendars(prev => prev.filter(calendar => calendar.id !== calendarId));
    } catch (error) {
      console.error(`Error deleting calendar ${calendarId}:`, error);
      setError(error.message);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  /**
   * Get provider badge color
   */
  const getProviderColor = (provider) => {
    switch (provider) {
      case 'google':
        return 'bg-blue-500';
      case 'ical':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading calendars...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error: {error}
        <Button onClick={loadCalendars} className="ml-2">Retry</Button>
      </div>
    );
  }

  if (calendars.length === 0) {
    return <div className="text-center py-4">No calendars found. Connect a calendar to get started.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {calendars.map(calendar => (
        <Card key={calendar.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium truncate">
                {calendar.displayName}
              </CardTitle>
              <Badge className={`${getProviderColor(calendar.provider)} text-white`}>
                {calendar.provider}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="text-sm text-gray-500 truncate">
              {calendar.accountEmail || calendar.calendarIdentifier}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Last synced: {formatDate(calendar.lastSynced)}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSync(calendar.id)}
              disabled={syncingCalendars[calendar.id]}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${syncingCalendars[calendar.id] ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCalendarSelect && onCalendarSelect(calendar)}
              >
                View Events
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(calendar.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
