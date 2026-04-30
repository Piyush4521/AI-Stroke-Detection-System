const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

export const API_BASE_URL = configuredBaseUrl || "http://localhost:5000";

async function request(endpoint, options = {}) {
    const {
        method = "GET",
        body,
        token,
        headers = {}
    } = options;

    const requestHeaders = { ...headers };
    const requestOptions = {
        method,
        headers: requestHeaders
    };

    if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
    }

    if (body instanceof FormData) {
        requestOptions.body = body;
    } else if (body !== undefined) {
        requestHeaders["Content-Type"] = "application/json";
        requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message = typeof payload === "string"
            ? payload
            : payload.message
                ? payload.details
                    ? `${payload.message}: ${payload.details}`
                    : payload.message
                : payload.error || "Request failed";
        throw new Error(message);
    }

    return payload;
}

export const authApi = {
    register(formData) {
        return request("/api/auth/register", {
            method: "POST",
            body: formData
        });
    },
    login(formData) {
        return request("/api/auth/login", {
            method: "POST",
            body: formData
        });
    },
    getCurrentUser(token) {
        return request("/api/auth/me", { token });
    }
};

export const scanApi = {
    list(token) {
        return request("/api/scans", { token });
    },
    create(token, file) {
        const formData = new FormData();
        formData.append("image", file);

        return request("/api/scans", {
            method: "POST",
            token,
            body: formData
        });
    }
};

export const systemApi = {
    health() {
        return request("/health");
    }
};
