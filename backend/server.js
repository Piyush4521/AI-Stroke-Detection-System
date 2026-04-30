const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();

// =========================
// 🔹 MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());

// Serve output mask file
app.use("/outputs", express.static(path.join(__dirname, "../ai-model")));

// =========================
// 🔹 FILE UPLOAD SETUP
// =========================
const upload = multer({
    dest: "uploads/"
});

// =========================
// 🔹 TEST ROUTE (OPTIONAL)
// =========================
app.get("/", (req, res) => {
    res.send("🚀 AI Stroke Detection Backend Running");
});

// =========================
// 🔹 PREDICT ROUTE
// =========================
app.post("/predict", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    // Run Python script
    exec(`python ../ai-model/predict.py ${filePath}`, (error, stdout, stderr) => {

        // Delete uploaded file after processing (cleanup)
        fs.unlink(filePath, () => {});

        if (error) {
            console.error("Python Error:", stderr);
            return res.status(500).json({ error: stderr });
        }

        const prediction = stdout.trim();

        res.json({
            success: true,
            prediction: prediction,
            mask_url: "http://localhost:5000/outputs/output_mask.png"
        });
    });
});

// =========================
// 🔹 START SERVER
// =========================
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🔥 Server running on http://localhost:${PORT}`);
});