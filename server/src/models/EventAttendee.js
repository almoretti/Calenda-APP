const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Event = require('./Event');

const EventAttendee = sequelize.define('EventAttendees', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Event,
      key: 'id'
    },
    comment: 'Foreign key to the Event table'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Email of the attendee'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Name of the attendee'
  },
  responseStatus: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Response status (accepted, declined, tentative, needs_action)'
  },
  optional: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether the attendee is optional'
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Attendee comment'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional metadata for the attendee'
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['eventId', 'email']
    }
  ],
  // Disable automatic pluralization
  freezeTableName: true
});

// Define the relationship between Event and EventAttendee
Event.hasMany(EventAttendee, { foreignKey: 'eventId', onDelete: 'CASCADE' });
EventAttendee.belongsTo(Event, { foreignKey: 'eventId' });

module.exports = EventAttendee;
