const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const aiModelDir = path.join(__dirname, "../../../ai-model");
const pythonCommand = process.env.PYTHON_COMMAND || "python";
const predictionTimeoutMs = Number(process.env.PREDICTION_TIMEOUT_MS || 120000);

function createPredictionError(error, stderr = "") {
    const predictionError = new Error("Prediction failed");
    predictionError.statusCode = error.killed ? 504 : 500;
    predictionError.details = error.killed
        ? `Prediction timed out after ${predictionTimeoutMs} ms`
        : (stderr || error.message).trim();

    return predictionError;
}

function runPrediction(inputImagePath, maskOutputPath) {
    return new Promise((resolve, reject) => {
        try {
            execFile(
                pythonCommand,
                ["predict.py", inputImagePath, maskOutputPath],
                {
                    cwd: aiModelDir,
                    timeout: predictionTimeoutMs,
                    maxBuffer: 10 * 1024 * 1024
                },
                (error, stdout, stderr) => {
                    if (error) {
                        return reject(createPredictionError(error, stderr));
                    }

                    const prediction = stdout
                        .split(/\r?\n/)
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .at(-1);

                    if (!prediction) {
                        const emptyOutputError = new Error("Prediction output was empty");
                        emptyOutputError.statusCode = 500;
                        return reject(emptyOutputError);
                    }

                    if (!fs.existsSync(maskOutputPath)) {
                        const maskMissingError = new Error("Prediction mask was not created");
                        maskMissingError.statusCode = 500;
                        return reject(maskMissingError);
                    }

                    resolve({ prediction });
                }
            );
        } catch (error) {
            reject(createPredictionError(error));
        }
    });
}

module.exports = {
    aiModelDir,
    pythonCommand,
    predictionTimeoutMs,
    runPrediction
};
