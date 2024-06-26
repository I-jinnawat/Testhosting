const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  list,
  Event,
  createEvent,
  confirmBooking,
  bookingEdit,
  updateEvent,
  deleteBooking,
  deleteEvent,
} = require('../Controllers/booking');

router.get('/booking', auth, list);
router.get('/booking-edit/:id', auth, bookingEdit);
router.get('/events', Event);
router.post('/events', auth, createEvent);
router.post('/events/:id', auth, updateEvent);
router.post('/booking-delete/:id', auth, deleteBooking);
router.get('/force-approve/:id', auth, confirmBooking);
router.delete('/events/:id', auth, deleteEvent);
module.exports = router;
