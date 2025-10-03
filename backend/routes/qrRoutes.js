const express = require("express");
const router = express.Router();
const { generateQR, getAllQRData } = require("../controllers/qrController");

router.post("/generate", generateQR);
router.get("/all", getAllQRData);

module.exports = router;
