const router = require('express').Router();
const qrCtrl = require('../controllers/vietqr.controller');

router.get('/generate', qrCtrl.generateVietQR);

module.exports = router;
