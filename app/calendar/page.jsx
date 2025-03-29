"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import GoogleCalendarConnect from '@/app/components/GoogleCalendarConnect';
import IcalConnect from '@/app/components/IcalConnect';
import CalendarList from '@/app/components/CalendarList';
import EventList from '@/app/components/EventList';

export default function CalendarPage() {
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(new Date().setMonth(new Date().getMonth() + 1)) // Default to 1 month ahead
  });
  const [addCalendarOpen, setAddCalendarOpen] = useState(false);

  const handleCalendarSelect = (calendar) => {
    setSelectedCalendar(calendar);
  };

  const handleCalendarAdded = () => {
    setAddCalendarOpen(false);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendar Management</h1>
        
        <Dialog open={addCalendarOpen} onOpenChange={setAddCalendarOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Calendar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Calendar</DialogTitle>
              <DialogDescription>
                Connect to Google Calendar or add an iCal feed.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="google">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="google">Google Calendar</TabsTrigger>
                <TabsTrigger value="ical">iCal Feed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="google" className="py-4">
                <GoogleCalendarConnect />
              </TabsContent>
              
              <TabsContent value="ical" className="py-4">
                <IcalConnect onSuccess={handleCalendarAdded} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>My Calendars</CardTitle>
              <CardDescription>
                Manage your connected calendars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarList onCalendarSelect={handleCalendarSelect} />
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
              <CardDescription>
                Select a date range for events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCalendar ? (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {selectedCalendar.displayName}
                  </div>
                ) : (
                  'Events'
                )}
              </CardTitle>
              <CardDescription>
                {selectedCalendar ? (
                  `Events from ${selectedCalendar.provider} calendar`
                ) : (
                  'Select a calendar to view events'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCalendar ? (
                <EventList 
                  calendarId={selectedCalendar.id}
                  startDate={dateRange.from?.toISOString()}
                  endDate={dateRange.to?.toISOString()}
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a calendar from the list to view events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
