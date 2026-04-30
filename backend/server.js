const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const {
    connectDatabase,
    defaultMongoUri,
    getDatabaseStatus
} = require("./src/config/database");

const {
    ensureStorageDirectories,
    storageRootDir
} = require("./src/utils/storage");

const {
    pythonCommand,
    predictionTimeoutMs
} = require("./src/utils/inference");

const authRoutes = require("./src/routes/authRoutes");
const scanRoutes = require("./src/routes/scanRoutes");

const {
    notFoundHandler,
    errorHandler
} = require("./src/middleware/errorMiddleware");

const app = express();

const frontendDistDir = path.join(__dirname, "../frontend/dist");

const PORT = Number(process.env.PORT || 5000);

const maxUploadSizeMb = Number(
    process.env.MAX_UPLOAD_SIZE_MB || 10
);


// =========================
// 🔹 INITIAL SETUP
// =========================
ensureStorageDirectories();

app.set("trust proxy", true);

app.use(cors());

app.use(express.json());

app.use(
    "/storage",
    express.static(storageRootDir)
);


// =========================
// 🔹 ROOT ROUTE
// =========================
app.get("/", (req, res) => {
    res.json({
        message: "AI Stroke Detection Backend API",
        frontend: fs.existsSync(frontendDistDir)
            ? "/app"
            : "frontend build not found"
    });
});


// =========================
// 🔹 HEALTH ROUTE
// =========================
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        database_status: getDatabaseStatus(),
        database_uri:
            process.env.MONGODB_URI || defaultMongoUri,
        python_command: pythonCommand,
        max_upload_size_mb: maxUploadSizeMb,
        prediction_timeout_ms: predictionTimeoutMs
    });
});


// =========================
// 🔹 API ROUTES
// =========================
app.use("/api/auth", authRoutes);

app.use("/api/scans", scanRoutes);


// =========================
// 🔹 FRONTEND ROUTE
// =========================
if (fs.existsSync(frontendDistDir)) {

    app.use(
        "/app",
        express.static(frontendDistDir)
    );

    app.get(/^\/app(?:\/.*)?$/, (req, res) => {
        res.sendFile(
            path.join(frontendDistDir, "index.html")
        );
    });
}


// =========================
// 🔹 ERROR HANDLERS
// =========================
app.use(notFoundHandler);

app.use(errorHandler);


// =========================
// 🔹 START SERVER
// =========================
async function startServer() {

    await connectDatabase();

    app.listen(PORT, () => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );
    });
}

startServer().catch((error) => {

    console.error(
        "Failed to start server:",
        error.message
    );

    process.exit(1);
});