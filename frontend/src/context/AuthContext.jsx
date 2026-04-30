import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../lib/api";

const AuthContext = createContext(null);
const storageKey = "ai-stroke-auth-token";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem(storageKey));
    const [user, setUser] = useState(null);
    const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));

    useEffect(() => {
        async function loadCurrentUser() {
            if (!token) {
                setUser(null);
                setIsBootstrapping(false);
                return;
            }

            try {
                const response = await authApi.getCurrentUser(token);
                setUser(response.user);
            } catch (error) {
                localStorage.removeItem(storageKey);
                setToken(null);
                setUser(null);
            } finally {
                setIsBootstrapping(false);
            }
        }

        loadCurrentUser();
    }, [token]);

    async function register(formData) {
        const response = await authApi.register(formData);
        localStorage.setItem(storageKey, response.token);
        setToken(response.token);
        setUser(response.user);
    }

    async function login(formData) {
        const response = await authApi.login(formData);
        localStorage.setItem(storageKey, response.token);
        setToken(response.token);
        setUser(response.user);
    }

    function logout() {
        localStorage.removeItem(storageKey);
        setToken(null);
        setUser(null);
    }

    const value = useMemo(
        () => ({
            token,
            user,
            isBootstrapping,
            register,
            login,
            logout
        }),
        [token, user, isBootstrapping]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
