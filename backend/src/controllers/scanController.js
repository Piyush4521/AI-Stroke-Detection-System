const multer = require("multer");
const path = require("path");

const Scan = require("../models/Scan");
const asyncHandler = require("../utils/asyncHandler");
const {
    uploadsDir,
    masksDir,
    createStoredFileName,
    buildStorageUrl,
    deleteFileIfExists
} = require("../utils/storage");
const { runPrediction } = require("../utils/inference");

const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB || 10);
const maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;
const allowedExtensions = new Set([".jpg", ".jpeg", ".png"]);

function isAllowedImage(file) {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const mimeType = (file.mimetype || "").toLowerCase();

    return allowedExtensions.has(extension) && mimeType.startsWith("image/");
}

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => callback(null, uploadsDir),
        filename: (req, file, callback) => callback(null, createStoredFileName(file.originalname))
    }),
    limits: {
        fileSize: maxUploadSizeBytes
    },
    fileFilter: (req, file, callback) => {
        if (!isAllowedImage(file)) {
            return callback(new Error("Only JPG, JPEG, and PNG image files are allowed"));
        }

        callback(null, true);
    }
});

function handleScanUpload(req, res, next) {
    upload.single("image")(req, res, (uploadError) => {
        if (uploadError instanceof multer.MulterError && uploadError.code === "LIMIT_FILE_SIZE") {
            res.status(400);
            return next(new Error(`File too large. Max size is ${maxUploadSizeMb} MB.`));
        }

        if (uploadError) {
            res.status(400);
            return next(uploadError);
        }

        next();
    });
}

function serializeScan(scan, req) {
    return {
        id: scan._id.toString(),
        originalFileName: scan.originalFileName,
        prediction: scan.prediction,
        mimeType: scan.mimeType,
        fileSize: scan.fileSize,
        createdAt: scan.createdAt,
        inputImageUrl: buildStorageUrl(req, "uploads", scan.inputFileName),
        maskImageUrl: buildStorageUrl(req, "masks", scan.maskFileName)
    };
}

const createScan = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error("No image file uploaded");
    }

    const inputImagePath = path.resolve(req.file.path);
    const maskFileName = `${path.parse(req.file.filename).name}.png`;
    const maskImagePath = path.join(masksDir, maskFileName);

    try {
        const { prediction } = await runPrediction(inputImagePath, maskImagePath);

        const scan = await Scan.create({
            user: req.user._id,
            originalFileName: req.file.originalname,
            inputFileName: req.file.filename,
            maskFileName,
            prediction,
            mimeType: req.file.mimetype,
            fileSize: req.file.size
        });

        res.status(201).json({
            scan: serializeScan(scan, req)
        });
    } catch (error) {
        deleteFileIfExists(inputImagePath);
        deleteFileIfExists(maskImagePath);
        throw error;
    }
});

const getUserScans = asyncHandler(async (req, res) => {
    const scans = await Scan.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
        scans: scans.map((scan) => serializeScan(scan, req))
    });
});

const getScanById = asyncHandler(async (req, res) => {
    const scan = await Scan.findOne({
        _id: req.params.scanId,
        user: req.user._id
    });

    if (!scan) {
        res.status(404);
        throw new Error("Scan not found");
    }

    res.json({
        scan: serializeScan(scan, req)
    });
});

module.exports = {
    handleScanUpload,
    createScan,
    getUserScans,
    getScanById
};
