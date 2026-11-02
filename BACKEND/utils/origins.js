const LOCAL_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173"
];

const parseOrigin = (value, isProduction) => {
    let url;
    try {
        url = new URL(value);
    } catch {
        throw new Error(`Invalid frontend origin in FRONTEND_URLS: ${value}`);
    }

    if (!["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.pathname !== "/" ||
        url.search ||
        url.hash ||
        value !== url.origin) {
        throw new Error(`FRONTEND_URLS entries must be origins without paths or credentials: ${value}`);
    }
    if (isProduction && url.protocol !== "https:") {
        throw new Error(`FRONTEND_URLS entries must use HTTPS in production: ${value}`);
    }
    return url.origin;
};

export const getAllowedOrigins = ({ frontendUrls = "", isProduction = false } = {}) => {
    const configuredOrigins = frontendUrls
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
        .map((origin) => parseOrigin(origin, isProduction));

    if (isProduction && configuredOrigins.length === 0) {
        throw new Error("FRONTEND_URLS must contain the exact deployed frontend origin in production.");
    }

    return new Set([
        ...(isProduction ? [] : LOCAL_ORIGINS),
        ...configuredOrigins
    ]);
};
