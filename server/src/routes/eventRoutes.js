const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Event routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.get('/calendar/:calendarId', eventController.getCalendarEvents);
router.get('/date-range', eventController.getEventsByDateRange);
router.get('/today', eventController.getTodayEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/search', eventController.searchEvents);

module.exports = router;
