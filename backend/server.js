const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/outputs", express.static(path.join(__dirname, "../ai-model")));

const upload = multer({
    dest: "uploads/"
});

app.get("/", (req, res) => {
    res.send("🚀 AI Stroke Detection Backend Running");
});

app.post("/predict", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    exec(`python ../ai-model/predict.py ${filePath}`, (error, stdout, stderr) => {
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

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🔥 Server running on http://localhost:${PORT}`);
});
