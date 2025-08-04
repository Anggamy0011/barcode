const express = require("express");
const router = express.Router();
const { scanQR } = require("../controllers/scanController");

router.post("/qr", scanQR);

module.exports = router;
