import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, scanApi } from "../lib/api";

function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

export default function DashboardPage({ user, token, onLogout, healthStatus }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [scans, setScans] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingScans, setIsLoadingScans] = useState(true);
    const [feedback, setFeedback] = useState({
        tone: "",
        message: "Your scan history will appear here after the first upload."
    });
    const [latestScan, setLatestScan] = useState(null);

    useEffect(() => {
        async function loadScans() {
            setIsLoadingScans(true);

            try {
                const response = await scanApi.list(token);
                setScans(response.scans);
                setLatestScan(response.scans[0] || null);
            } catch (error) {
                setFeedback({
                    tone: "error",
                    message: error.message
                });
            } finally {
                setIsLoadingScans(false);
            }
        }

        loadScans();
    }, [token]);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl("");
            return undefined;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const predictionTone = useMemo(() => {
        if (!latestScan) {
            return "";
        }

        return latestScan.prediction === "Stroke" ? "stroke" : "normal";
    }, [latestScan]);

    async function handleUploadSubmit(event) {
        event.preventDefault();

        if (!selectedFile) {
            setFeedback({
                tone: "error",
                message: "Please choose a CT scan image before submitting."
            });
            return;
        }

        setIsUploading(true);
        setFeedback({
            tone: "loading",
            message: "Uploading image and waiting for the Python model to finish analysis..."
        });

        try {
            const response = await scanApi.create(token, selectedFile);
            const nextScan = response.scan;

            setScans((currentScans) => [nextScan, ...currentScans]);
            setLatestScan(nextScan);
            setSelectedFile(null);
            setFeedback({
                tone: "success",
                message: `Analysis complete. Prediction: ${nextScan.prediction}`
            });
        } catch (error) {
            setFeedback({
                tone: "error",
                message: error.message
            });
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <main className="dashboard-shell">
            <header className="dashboard-header">
                <div>
                    <p className="eyebrow">Secure Scan Workspace</p>
                    <h1>Welcome, {user.name}</h1>
                    <p className="lead">
                        Upload a CT image, let the model analyze it, and keep a traceable history of results per account.
                    </p>
                </div>

                <div className="header-actions">
                    <span className={`pill ${healthStatus === "Online" ? "pill-success" : "pill-muted"}`}>
                        API {healthStatus}
                    </span>
                    <button className="ghost-button" type="button" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <section className="dashboard-grid">
                <form className="upload-card" onSubmit={handleUploadSubmit}>
                    <div className="card-heading">
                        <h2>Upload New Scan</h2>
                        <p>Accepted formats: JPG, JPEG, PNG</p>
                    </div>

                    <label className="upload-dropzone">
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                        />
                        <span className="upload-badge">CT</span>
                        <strong>{selectedFile ? selectedFile.name : "Choose a CT scan image"}</strong>
                        <span>
                            The backend stores the upload, runs your ML model, and saves the result in MongoDB.
                        </span>
                    </label>

                    <button className="primary-button" type="submit" disabled={isUploading}>
                        {isUploading ? "Analyzing..." : "Analyze Scan"}
                    </button>

                    <div className={`feedback-banner ${feedback.tone ? `is-${feedback.tone}` : ""}`}>
                        {feedback.message}
                    </div>

                    <div className="mini-grid">
                        <div className="mini-card">
                            <p className="mini-label">Backend URL</p>
                            <p className="mini-value">{API_BASE_URL}</p>
                        </div>
                        <div className="mini-card">
                            <p className="mini-label">Stored Scans</p>
                            <p className="mini-value">{scans.length}</p>
                        </div>
                    </div>
                </form>

                <section className="results-card">
                    <div className="card-heading">
                        <h2>Latest Result</h2>
                        <p>
                            {latestScan
                                ? `Saved ${formatDate(latestScan.createdAt)}`
                                : "Upload a scan to see the first result."}
                        </p>
                    </div>

                    <div className="result-panels">
                        <article className="image-panel">
                            <p className="panel-label">Input Scan</p>
                            {previewUrl || latestScan ? (
                                <img
                                    src={previewUrl || latestScan.inputImageUrl}
                                    alt="Input CT scan"
                                    className="scan-image"
                                />
                            ) : (
                                <div className="panel-placeholder">Selected scan preview will appear here.</div>
                            )}
                        </article>

                        <article className="image-panel">
                            <p className="panel-label">Predicted Mask</p>
                            {latestScan ? (
                                <img
                                    src={latestScan.maskImageUrl}
                                    alt="Predicted lesion mask"
                                    className="scan-image"
                                />
                            ) : (
                                <div className="panel-placeholder">Generated mask will appear here.</div>
                            )}
                        </article>
                    </div>

                    <div className="prediction-strip">
                        <span className="mini-label">Prediction</span>
                        <strong className={`prediction-value ${predictionTone}`}>
                            {latestScan ? latestScan.prediction : "Waiting for analysis"}
                        </strong>
                    </div>
                </section>
            </section>

            <section className="history-card">
                <div className="card-heading">
                    <h2>Scan History</h2>
                    <p>Your account-specific upload history from MongoDB.</p>
                </div>

                {isLoadingScans ? (
                    <div className="history-empty">Loading previous scans...</div>
                ) : scans.length === 0 ? (
                    <div className="history-empty">No scans yet. Upload your first CT scan to create history.</div>
                ) : (
                    <div className="history-grid">
                        {scans.map((scan) => (
                            <article key={scan.id} className="history-item">
                                <div className="history-preview">
                                    <img src={scan.inputImageUrl} alt={scan.originalFileName} className="scan-image" />
                                </div>
                                <div className="history-content">
                                    <p className="history-title">{scan.originalFileName}</p>
                                    <p className="history-meta">{formatDate(scan.createdAt)}</p>
                                    <p className={`history-prediction ${scan.prediction === "Stroke" ? "stroke" : "normal"}`}>
                                        {scan.prediction}
                                    </p>
                                    <a href={scan.maskImageUrl} target="_blank" rel="noreferrer" className="history-link">
                                        Open mask image
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
