const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { createIzin, checkIzin, listPending, approval, listToday } = require("../controllers/izinController");

// storage untuk bukti
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "backend", "public", "uploads", "izin"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || "");
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("bukti"), createIzin);
router.get("/check", checkIzin);
router.get("/pending", listPending);
router.post("/approval", approval);
router.get("/today", listToday);

module.exports = router;


