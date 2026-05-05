const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

router.post('/register', visitorController.registerVisitor);
router.post('/approve', visitorController.approveVisit);
router.post('/reject', visitorController.rejectVisit);
router.post('/qr-checkin', visitorController.qrCheckIn);
router.post('/qr-checkout', visitorController.qrCheckOut);
router.get('/pass/:token', visitorController.getVisitorPassByToken);
router.get('/logs', visitorController.getVisitorLogs);
router.patch('/status', visitorController.updateVisitStatus);
router.post('/location-update', visitorController.updateVisitorLocation);

module.exports = router;
