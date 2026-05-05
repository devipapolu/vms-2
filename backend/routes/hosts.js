const express = require('express');
const router = express.Router();
const hostController = require('../controllers/hostController');

router.get('/', hostController.getAllHosts);
router.get('/status/:hostId', hostController.getHostStatus);

module.exports = router;
