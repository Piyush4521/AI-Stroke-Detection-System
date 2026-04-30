const mongoose = require("mongoose");

const defaultMongoUri = "mongodb://127.0.0.1:27017/ai-stroke-detection-system";

const readyStateLabels = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
};

async function connectDatabase() {
    const mongoUri = process.env.MONGODB_URI || defaultMongoUri;

    await mongoose.connect(mongoUri);

    return mongoUri;
}

function getDatabaseStatus() {
    return readyStateLabels[mongoose.connection.readyState] || "unknown";
}

module.exports = {
    connectDatabase,
    defaultMongoUri,
    getDatabaseStatus
};
