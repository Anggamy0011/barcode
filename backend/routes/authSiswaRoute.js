const express = require("express");
const router = express.Router();
const controller = require("../controllers/authSiswaController");
const { getAllSiswa } = require("../controllers/siswaController");

router.post("/register", controller.registerSiswa);
router.post("/login", controller.loginSiswa);

router.get("/", getAllSiswa);

module.exports = router;
