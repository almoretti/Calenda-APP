const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

// Calendar routes
router.get('/', calendarController.getAllCalendars);
router.get('/:id', calendarController.getCalendarById);
router.post('/', calendarController.createCalendar);
router.put('/:id', calendarController.updateCalendar);
router.delete('/:id', calendarController.deleteCalendar);

// Sync routes
router.post('/:id/sync', calendarController.syncCalendarEvents);
router.post('/sync/all', calendarController.syncAllCalendars);

// Google Calendar auth routes
router.get('/auth/google', calendarController.getGoogleAuthUrl);
router.get('/auth/google/callback', calendarController.handleGoogleAuthCallback);

// iCal routes
router.post('/ical/connect', calendarController.connectIcalFeed);

module.exports = router;
