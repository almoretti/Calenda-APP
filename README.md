# Calenda APP

A modern calendar application for managing events and schedules.

## Features

- Create and manage multiple calendars
- Add, edit, and delete events
- Connect with Google Calendar
- Import events from iCal files
- View events in different calendar views (day, week, month)
- Set reminders and notifications for events
- Invite attendees to events

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (via Sequelize ORM)
- **Authentication**: JWT

## Project Structure

- `/app`: Next.js frontend application
  - `/components`: React components
  - `/api`: API client functions
  - `/calendar`: Calendar page
- `/components`: Shared UI components
- `/server`: Backend server
  - `/src/controllers`: API controllers
  - `/src/models`: Database models
  - `/src/routes`: API routes
  - `/src/services`: Business logic services

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/almoretti/Calenda-APP.git
   cd Calenda-APP
   ```

2. Install dependencies:
   ```
   npm install
   cd server
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the server directory
   - Add your database credentials and other configuration

4. Start the development servers:
   ```
   # Start the backend server
   cd server
   npm run dev
   
   # In a separate terminal, start the frontend
   cd ..
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## License

MIT
