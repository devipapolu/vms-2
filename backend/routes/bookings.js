const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/create', bookingController.createBooking);
router.get('/slots', bookingController.getAvailableSlots);
router.get('/search', bookingController.searchBooking);

module.exports = router;
