# Lovy-tech Calendar Backend

This is the backend API for the Lovy-tech Calendar application. It provides functionality to connect to Google Calendar and iCal feeds, fetch events, and store them in a PostgreSQL database.

## Features

- Connect to Google Calendar via OAuth2
- Import events from iCal feeds
- Store calendar events in PostgreSQL
- Sync events periodically
- RESTful API for calendar and event management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Google Cloud Platform account (for Google Calendar API)

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd server
   npm install
   ```
3. Create a `.env` file in the server directory with the following variables:
   ```
   # Server Configuration
   PORT=5000

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=lovy_tech_calendar
   DB_USER=postgres
   DB_PASSWORD=postgres

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

   # JWT Secret for Authentication
   JWT_SECRET=your_jwt_secret_key
   ```
4. Set up the database:
   ```
   npm run setup-db
   ```
5. Start the server:
   ```
   npm run dev
   ```

## Google Calendar API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
   - Set the authorized redirect URI to `http://localhost:5000/api/auth/google/callback`
5. Copy the Client ID and Client Secret to your `.env` file

## API Endpoints

### Calendars

- `GET /api/calendars` - Get all calendars
- `GET /api/calendars/:id` - Get calendar by ID
- `POST /api/calendars` - Create a new calendar
- `PUT /api/calendars/:id` - Update a calendar
- `DELETE /api/calendars/:id` - Delete a calendar
- `POST /api/calendars/:id/sync` - Sync events for a specific calendar
- `POST /api/calendars/sync/all` - Sync events for all calendars
- `GET /api/calendars/auth/google` - Get Google Calendar auth URL
- `GET /api/calendars/auth/google/callback` - Handle Google Calendar auth callback
- `POST /api/calendars/ical/connect` - Connect an iCal feed

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/calendar/:calendarId` - Get events for a specific calendar
- `GET /api/events/date-range` - Get events by date range
- `GET /api/events/today` - Get events for today
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/search` - Search events

## Database Schema

### Calendars

- `id` - Primary key
- `provider` - Calendar provider (google, ical)
- `accountEmail` - Email associated with the calendar account
- `calendarIdentifier` - Google calendarId or iCal URL
- `displayName` - User-friendly name for the calendar
- `color` - Color code for the calendar
- `accessToken` - OAuth access token
- `refreshToken` - OAuth refresh token
- `tokenExpiry` - Expiration date of the access token
- `syncToken` - Token for incremental sync
- `lastSynced` - Last time the calendar was synced
- `isActive` - Whether the calendar is active

### Events

- `id` - Primary key
- `calendarId` - Foreign key to the Calendar table
- `sourceEventId` - Unique ID from the source
- `title` - Event title
- `description` - Event description
- `location` - Event location
- `organizer` - Event organizer
- `organizerEmail` - Email of the organizer
- `organizerName` - Name of the organizer
- `startTime` - Event start time
- `endTime` - Event end time
- `isAllDay` - Whether the event is an all-day event
- `attendees` - Array of attendee emails
- `status` - Event status
- `recurrence` - Recurrence rule for recurring events
- `color` - Color code for the event
- `lastUpdated` - Last time the event was updated
- `metadata` - Additional metadata for the event

### Event Attendees

- `id` - Primary key
- `eventId` - Foreign key to the Event table
- `email` - Email of the attendee
- `name` - Name of the attendee
- `responseStatus` - Response status
- `optional` - Whether the attendee is optional
- `comment` - Attendee comment
- `metadata` - Additional metadata for the attendee

## Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with hot reloading
- `npm run setup-db` - Set up the PostgreSQL database
- `npm run sync-calendars` - Sync all calendars manually

## Periodic Sync

To set up periodic syncing of calendar events, you can use a cron job:

```bash
# Run the sync script every hour
0 * * * * cd /path/to/server && npm run sync-calendars
```

## License

MIT
