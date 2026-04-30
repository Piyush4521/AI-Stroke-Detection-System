import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { systemApi } from "./lib/api";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
    const {
        user,
        token,
        isBootstrapping,
        login,
        register,
        logout
    } = useAuth();
    const [healthStatus, setHealthStatus] = useState("Checking...");

    useEffect(() => {
        async function loadHealthStatus() {
            try {
                await systemApi.health();
                setHealthStatus("Online");
            } catch (error) {
                setHealthStatus("Offline");
            }
        }

        loadHealthStatus();
    }, []);

    if (isBootstrapping) {
        return (
            <main className="loading-shell">
                <div className="loading-card">
                    <p className="eyebrow">Preparing Workspace</p>
                    <h1>Loading your session...</h1>
                </div>
            </main>
        );
    }

    return user ? (
        <DashboardPage
            user={user}
            token={token}
            onLogout={logout}
            healthStatus={healthStatus}
        />
    ) : (
        <AuthPage
            onLogin={login}
            onRegister={register}
            healthStatus={healthStatus}
        />
    );
}
