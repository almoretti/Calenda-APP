const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Calendar = require('./Calendar');

const Event = sequelize.define('Events', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  calendarId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Calendar,
      key: 'id'
    },
    comment: 'Foreign key to the Calendar table'
  },
  sourceEventId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Unique ID from the source (Google event ID or ICS UID)'
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Event title'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Event description'
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Event location'
  },
  organizer: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Event organizer (email or name <email>)'
  },
  organizerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Email of the organizer'
  },
  organizerName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Name of the organizer'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Event start time with timezone'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Event end time with timezone'
  },
  isAllDay: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether the event is an all-day event'
  },
  attendees: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
    comment: 'Array of attendee emails'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Event status (confirmed, tentative, cancelled)'
  },
  recurrence: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Recurrence rule for recurring events'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Color code for the event'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Last time the event was updated'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional metadata for the event'
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['calendarId', 'sourceEventId']
    },
    {
      fields: ['startTime']
    },
    {
      fields: ['endTime']
    }
  ],
  // Disable automatic pluralization
  freezeTableName: true
});

// Define the relationship between Calendar and Event
Calendar.hasMany(Event, { foreignKey: 'calendarId', onDelete: 'CASCADE' });
Event.belongsTo(Calendar, { foreignKey: 'calendarId' });

module.exports = Event;
