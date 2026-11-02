import test from "node:test";
import assert from "node:assert/strict";
import { generateGeminiJson } from "../services/gemini.js";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.GEMINI_API_KEY;

test.after(() => {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalApiKey;
});

test("Gemini requests retry temporary service errors", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    let attempts = 0;
    globalThis.fetch = async () => {
        attempts += 1;
        if (attempts === 1) {
            return new Response(JSON.stringify({
                error:{ message:"Gemini is temporarily busy." }
            }), { status:503 });
        }
        return new Response(JSON.stringify({
            candidates:[{ content:{ parts:[{ text:'{"answer":"OK"}' }] } }]
        }), { status:200 });
    };

    const result = await generateGeminiJson({
        systemInstruction:"Return valid JSON.",
        contents:[{ role:"user", parts:[{ text:"Return OK." }] }],
        responseSchema:{
            type:"OBJECT",
            properties:{ answer:{ type:"STRING" } },
            required:["answer"]
        }
    });

    assert.deepEqual(result, { answer:"OK" });
    assert.equal(attempts, 2);
});

test("Gemini reports the upstream error after its single transient retry", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    let attempts = 0;
    globalThis.fetch = async () => {
        attempts += 1;
        return new Response(JSON.stringify({
            error:{ message:"Gemini is currently experiencing high demand." }
        }), { status:503 });
    };

    await assert.rejects(
        generateGeminiJson({
            systemInstruction:"Return valid JSON.",
            contents:[{ role:"user", parts:[{ text:"Return OK." }] }],
            responseSchema:{
                type:"OBJECT",
                properties:{ answer:{ type:"STRING" } },
                required:["answer"]
            }
        }),
        { message:"Gemini is currently experiencing high demand.", status:503 }
    );
    assert.equal(attempts, 2);
});

test("Gemini request timeouts fail promptly with an actionable message", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    let attempts = 0;
    globalThis.fetch = async () => {
        attempts += 1;
        throw new DOMException("Request exceeded timeout.", "TimeoutError");
    };

    await assert.rejects(
        generateGeminiJson({
            systemInstruction:"Return valid JSON.",
            contents:[{ role:"user", parts:[{ text:"Return OK." }] }],
            responseSchema:{
                type:"OBJECT",
                properties:{ answer:{ type:"STRING" } },
                required:["answer"]
            }
        }),
        { message:"Gemini took too long to respond. Please try again.", status:504 }
    );
    assert.equal(attempts, 1);
});
