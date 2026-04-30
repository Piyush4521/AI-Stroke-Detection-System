const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        originalFileName: {
            type: String,
            required: true
        },
        inputFileName: {
            type: String,
            required: true
        },
        maskFileName: {
            type: String,
            required: true
        },
        prediction: {
            type: String,
            enum: ["Normal", "Stroke"],
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        fileSize: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Scan", scanSchema);
