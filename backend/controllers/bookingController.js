const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  const { name, phone, hostId, date, time, purpose, source } = req.body;

  try {
    // Check for conflicts
    const existing = await Booking.findOne({ hostId, date, time });
    if (existing) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    const booking = new Booking({
      name,
      phone,
      hostId,
      date,
      time,
      purpose,
      source
    });

    await booking.save();
    
    // Mock WhatsApp Notification
    console.log(`📱 WhatsApp: Booking confirmed for ${name} at ${time} on ${date}`);

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  const { hostId, date } = req.query;
  const allSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  try {
    const booked = await Booking.find({ hostId, date }).select('time');
    const bookedTimes = booked.map(b => b.time);
    const availableSlots = allSlots.filter(s => !bookedTimes.includes(s));
    
    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.searchBooking = async (req, res) => {
  const { phone } = req.query;

  try {
    const booking = await Booking.findOne({ phone }).sort({ createdAt: -1 });
    if (!booking) {
      return res.status(404).json({ message: 'No booking found for this number' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
