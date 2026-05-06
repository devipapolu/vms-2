const Room = require('../models/Room');

const DEMO_ROOMS = [
  { _id: 'r1', name: 'Conference Room A', location: '1st Floor', status: 'available' },
  { _id: 'r2', name: 'Meeting Cabin 101', location: 'Ground Floor', status: 'occupied' },
  { _id: 'r3', name: 'MD Cabin Private', location: 'Top Floor', status: 'available' },
  { _id: 'r4', name: 'Discussion Pod 2', location: '2nd Floor', status: 'available' },
];

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    console.warn('⚠️  MongoDB offline, returning demo rooms');
    res.json(DEMO_ROOMS);
  }
};

exports.getEmptyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'available' });
    res.json(rooms);
  } catch (err) {
    res.json(DEMO_ROOMS.filter(r => r.status === 'available'));
  }
};
