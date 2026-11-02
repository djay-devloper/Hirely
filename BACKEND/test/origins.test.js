import test from "node:test";
import assert from "node:assert/strict";
import { getAllowedOrigins } from "../utils/origins.js";

test("development allows local frontend origins and configured origins", () => {
    const origins = getAllowedOrigins({
        frontendUrls:"https://hirely.example.com",
        isProduction:false
    });

    assert.equal(origins.has("http://localhost:5173"), true);
    assert.equal(origins.has("https://hirely.example.com"), true);
});

test("production only allows explicitly configured origins", () => {
    const origins = getAllowedOrigins({
        frontendUrls:"https://hirely.example.com, https://hirely-preview.vercel.app",
        isProduction:true
    });

    assert.deepEqual([...origins], [
        "https://hirely.example.com",
        "https://hirely-preview.vercel.app"
    ]);
});

test("production requires a configured frontend origin", () => {
    assert.throws(
        () => getAllowedOrigins({ isProduction:true }),
        /FRONTEND_URLS must contain the exact deployed frontend origin/
    );
});

test("frontend origins reject paths, credentials, and insecure production URLs", () => {
    assert.throws(
        () => getAllowedOrigins({ frontendUrls:"https://hirely.example.com/path" }),
        /must be origins without paths/
    );
    assert.throws(
        () => getAllowedOrigins({ frontendUrls:"https://user:pass@hirely.example.com" }),
        /must be origins without paths/
    );
    assert.throws(
        () => getAllowedOrigins({ frontendUrls:"http://hirely.example.com", isProduction:true }),
        /must use HTTPS in production/
    );
    assert.throws(
        () => getAllowedOrigins({ frontendUrls:"https://hirely.example.com/", isProduction:true }),
        /must be origins without paths/
    );
});
