const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/', roomController.getAllRooms);
router.get('/empty', roomController.getEmptyRooms);

module.exports = router;
