const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
require('dotenv').config();

const qrRoutes = require("./routes/qrRoutes");
const attendanceRoutes = require("./routes/attendance");
const scanQR = require("./routes/scanRoute");
const logger = require("./middleware/logger");
const authGuruRoutes = require('./routes/authGuruRoute');
const authSiswaRoutes = require('./routes/authSiswaRoute');
const predictRoute = require('./routes/predictRoute');
const izinRoute = require('./routes/izinRoute');
const { getLocalIP } = require('./utils/getApi');
const { startAutoAbsentJob } = require('./jobs/autoAbsent');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(logger);


// Routes
app.use("/api/qr", qrRoutes);
app.use("/api/scan", scanQR);
app.use("/api/attendance", attendanceRoutes);
app.use('/api/guru', authGuruRoutes);
app.use('/api/siswa', authSiswaRoutes);
app.use('/api/predict', predictRoute);
app.use('/api/izin', izinRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log(`🚀 Server running at:`);
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → http://${ip}:${PORT}`);
});

// Start background job for auto absence marking
startAutoAbsentJob();