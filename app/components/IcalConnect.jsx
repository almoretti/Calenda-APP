"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { connectIcalFeed } from '@/app/api/calendarApi';

/**
 * Component for connecting to an iCal feed
 */
export default function IcalConnect({ onSuccess }) {
  const [url, setUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('iCal URL is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Connect iCal feed
      const calendar = await connectIcalFeed(url, displayName || 'iCal Calendar');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(calendar);
      }
      
      // Reset form
      setUrl('');
      setDisplayName('');
    } catch (error) {
      console.error('Error connecting iCal feed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ical-url">iCal URL</Label>
        <Input
          id="ical-url"
          type="url"
          placeholder="https://example.com/calendar.ics"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="display-name">Display Name (optional)</Label>
        <Input
          id="display-name"
          type="text"
          placeholder="My Calendar"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Connecting...' : 'Connect iCal Feed'}
      </Button>
      
      {error && (
        <div className="text-red-500 text-sm">
          Error: {error}
        </div>
      )}
    </form>
  );
}
