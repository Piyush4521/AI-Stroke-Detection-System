const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const backendRootDir = path.join(__dirname, "../..");
const storageRootDir = path.join(backendRootDir, "storage");
const uploadsDir = path.join(storageRootDir, "uploads");
const masksDir = path.join(storageRootDir, "masks");

function ensureStorageDirectories() {
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.mkdirSync(masksDir, { recursive: true });
}

function createStoredFileName(originalName) {
    const extension = path.extname(originalName || "").toLowerCase() || ".png";
    return `${Date.now()}-${randomUUID()}${extension}`;
}

function buildPublicBaseUrl(req) {
    return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

function buildStorageUrl(req, folderName, fileName) {
    return `${buildPublicBaseUrl(req)}/storage/${folderName}/${fileName}`;
}

function deleteFileIfExists(filePath) {
    if (filePath) {
        fs.unlink(filePath, () => {});
    }
}

module.exports = {
    backendRootDir,
    storageRootDir,
    uploadsDir,
    masksDir,
    ensureStorageDirectories,
    createStoredFileName,
    buildPublicBaseUrl,
    buildStorageUrl,
    deleteFileIfExists
};
