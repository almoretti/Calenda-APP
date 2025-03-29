const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Calendar = sequelize.define('Calendars', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  provider: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'e.g., google, ical'
  },
  accountEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Email associated with the calendar account'
  },
  calendarIdentifier: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Google calendarId or ICS URL'
  },
  displayName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'User-friendly name for the calendar'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Color code for the calendar'
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'OAuth access token (encrypted)'
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'OAuth refresh token (encrypted)'
  },
  tokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Expiration date of the access token'
  },
  syncToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Token for incremental sync (Google)'
  },
  lastSynced: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time the calendar was synced'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether the calendar is active'
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['provider', 'calendarIdentifier']
    }
  ],
  // Disable automatic pluralization
  freezeTableName: true
});

module.exports = Calendar;
