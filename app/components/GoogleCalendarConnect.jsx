"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getGoogleAuthUrl } from '@/app/api/calendarApi';

/**
 * Component for connecting to Google Calendar
 */
export default function GoogleCalendarConnect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle connect button click
   */
  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get Google auth URL
      const { authUrl } = await getGoogleAuthUrl();
      
      // Redirect to Google auth page
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button 
        onClick={handleConnect} 
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⟳</span>
            Connecting...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="h-5 w-5"
            >
              <path
                fill="currentColor"
                d="M12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20Zm0-8Zm-4 3h8v-6h-3V6h-2v3H8v6Z"
              />
            </svg>
            Connect Google Calendar
          </>
        )}
      </Button>
      
      {error && (
        <div className="text-red-500 text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
}
