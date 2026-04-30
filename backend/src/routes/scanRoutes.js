const express = require("express");
const {
    handleScanUpload,
    createScan,
    getUserScans,
    getScanById
} = require("../controllers/scanController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getUserScans);
router.get("/:scanId", protect, getScanById);
router.post("/", protect, handleScanUpload, createScan);

module.exports = router;
