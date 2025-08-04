const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");

router.post("/predict", (req, res) => {
  const inputData = JSON.stringify(req.body);

  // Pastikan path absolut agar tidak error
  const pythonScriptPath = path.join(__dirname, "../randomforest/predict.py");

  const py = spawn("python", [pythonScriptPath, inputData]);

  let result = "";
  let errorOutput = "";

  py.stdout.on("data", (data) => {
    result += data.toString();
  });

  py.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  py.on("close", (code) => {
    if (code === 0) {
      try {
        const parsedResult = JSON.parse(result);
        res.json({ prediction: parsedResult });
      } catch (e) {
        res.json({ prediction: result.trim() }); // fallback jika bukan JSON
      }
    } else {
      console.error("Python error:", errorOutput);
      res.status(500).json({ error: "Python script error", details: errorOutput });
    }
  });
});

module.exports = router;
