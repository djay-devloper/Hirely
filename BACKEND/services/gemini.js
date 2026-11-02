const DEFAULT_GENERATION_MODEL = "gemini-3.1-flash-lite";
const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const MAX_TRANSIENT_RETRIES = 1;
const GEMINI_REQUEST_TIMEOUT_MS = 30000;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const getApiKey = () => {
    if (!process.env.GEMINI_API_KEY) {
        const error = new Error("Gemini is not configured. Add GEMINI_API_KEY to the backend environment.");
        error.status = 503;
        throw error;
    }
    return process.env.GEMINI_API_KEY;
};

const requestGemini = async (model, method, body) => {
    const apiKey = getApiKey();
    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}`);

    for (let attempt = 0; attempt <= MAX_TRANSIENT_RETRIES; attempt += 1) {
        let response;
        try {
            response = await fetch(url, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "x-goog-api-key":apiKey
                },
                body:JSON.stringify(body),
                signal:AbortSignal.timeout(GEMINI_REQUEST_TIMEOUT_MS)
            });
        } catch (cause) {
            const timedOut = cause?.name === "TimeoutError" || cause?.name === "AbortError";
            const error = new Error(timedOut
                ? "Gemini took too long to respond. Please try again."
                : "Unable to reach Gemini. Check the backend connection and try again.");
            error.status = timedOut ? 504 : 502;
            error.cause = cause;
            throw error;
        }

        const result = await response.json().catch(() => null);
        if (response.ok) return result;

        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_TRANSIENT_RETRIES) {
            const retryAfterSeconds = Number(response.headers.get("retry-after"));
            const delay = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
                ? Math.min(retryAfterSeconds * 1000, 2000)
                : 500;
            await wait(delay);
            continue;
        }

        const messages = {
            401:"Gemini rejected the API key. Check GEMINI_API_KEY in the backend environment.",
            403:"Gemini access is forbidden. Verify the API key and Gemini API access.",
            404:"The configured Gemini model was not found. Check GEMINI_MODEL or GEMINI_EMBEDDING_MODEL."
        };
        const upstreamMessage = result?.error?.message;
        const error = new Error(messages[response.status] || (
            typeof upstreamMessage === "string" && upstreamMessage.trim()
                ? upstreamMessage.trim().slice(0, 300)
                : response.status === 429
                    ? "Gemini rate limit reached. Please try again later."
                    : "Gemini could not process this request. Please try again later."
        ));
        error.status = response.status === 429 ? 429 : response.status >= 500 ? 503 : 502;
        throw error;
    }
};

const generationModel = () => process.env.GEMINI_MODEL || DEFAULT_GENERATION_MODEL;
const embeddingModel = () => process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;

export const generateGeminiJson = async ({ systemInstruction, contents, responseSchema, maxOutputTokens = 3000 }) => {
    const result = await requestGemini(generationModel(), "generateContent", {
        systemInstruction:{ parts:[{ text:systemInstruction }] },
        contents,
        generationConfig:{
            responseMimeType:"application/json",
            responseSchema,
            maxOutputTokens
        }
    });
    const text = result?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!text) {
        const error = new Error("Gemini returned an empty response. Please try again.");
        error.status = 502;
        throw error;
    }

    try {
        return JSON.parse(text);
    } catch (cause) {
        const error = new Error("Gemini returned a response that could not be read. Please try again.");
        error.status = 502;
        error.cause = cause;
        throw error;
    }
};

export const embedGeminiTexts = async (texts, taskType) => {
    if (!texts.length) return [];
    const model = embeddingModel();
    const result = await requestGemini(model, "batchEmbedContents", {
        requests:texts.map((text) => ({
            model:`models/${model}`,
            content:{ parts:[{ text }] },
            taskType,
            outputDimensionality:EMBEDDING_DIMENSIONS
        }))
    });
    const embeddings = result?.embeddings;
    if (!Array.isArray(embeddings) || embeddings.length !== texts.length) {
        const error = new Error("Gemini returned incomplete search embeddings. Please try again.");
        error.status = 502;
        throw error;
    }
    return embeddings.map((item) => item.values);
};

export const getEmbeddingModelName = embeddingModel;
