const express = require('express');
const router = express.Router();
const controller = require('../controllers/authGuruController');

router.post('/register', controller.registerGuru);
router.post('/login', controller.loginGuru);

module.exports = router;