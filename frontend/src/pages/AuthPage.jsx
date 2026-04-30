import { useState } from "react";
import AuthForm from "../components/AuthForm";

export default function AuthPage({ onLogin, onRegister, healthStatus }) {
    const [mode, setMode] = useState("login");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData) {
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            if (mode === "login") {
                await onLogin(formData);
            } else {
                await onRegister(formData);
            }
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="page-shell">
            <section className="auth-hero">
                <div className="orb orb-left"></div>
                <div className="orb orb-right"></div>

                <div className="auth-copy">
                    <p className="eyebrow">Clinical Workflow Portal</p>
                    <h1>Upload CT scans, review predictions, and keep every report in one place.</h1>
                    <p className="lead">
                        This React dashboard connects to your Express backend and MongoDB data layer while reusing your existing Python model for classification and mask generation.
                    </p>

                    <div className="status-row">
                        <span className="pill">React Frontend</span>
                        <span className={`pill ${healthStatus === "Online" ? "pill-success" : "pill-muted"}`}>
                            Backend {healthStatus}
                        </span>
                    </div>
                </div>

                <div className="auth-panel">
                    <div className="tab-row">
                        <button
                            type="button"
                            className={mode === "login" ? "tab-button is-active" : "tab-button"}
                            onClick={() => setMode("login")}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className={mode === "register" ? "tab-button is-active" : "tab-button"}
                            onClick={() => setMode("register")}
                        >
                            Register
                        </button>
                    </div>

                    <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
                    <p className="panel-copy">
                        {mode === "login"
                            ? "Sign in to upload new scans and view previous model results."
                            : "Create an account for scan uploads, result history, and secure access."}
                    </p>

                    {errorMessage && <div className="feedback-banner is-error">{errorMessage}</div>}

                    <AuthForm
                        mode={mode}
                        onSubmit={handleSubmit}
                        isBusy={isSubmitting}
                    />
                </div>
            </section>
        </main>
    );
}
