const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/:nisn', attendanceController.getRiwayatByNISN);
router.get('/rekap/:kelas', attendanceController.getRekapByKelas);
module.exports = router;
