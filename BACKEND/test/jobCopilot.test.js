import test from "node:test";
import assert from "node:assert/strict";
import {
    buildJobEmbeddingText,
    cosineSimilarity,
    isExactSourceQuote,
    validateMatchAnalysis
} from "../utils/jobCopilot.js";

test("cosine similarity ranks vectors and handles invalid inputs", () => {
    assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
    assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
    assert.equal(cosineSimilarity([1, 2], [1]), 0);
    assert.equal(cosineSimilarity([1, Number.NaN], [1, 2]), 0);
});

test("job embedding text prioritizes role details and bounds long descriptions", () => {
    const text = buildJobEmbeddingText({
        title:"Engineer",
        description:"a".repeat(9000),
        requirements:["Node.js"],
        experienceLevel:"Mid-level"
    });
    assert.ok(text.includes("Engineer"));
    assert.ok(text.includes("Node.js"));
    assert.ok(text.match(/a/g).length <= 4000);
    assert.ok(text.length <= 6000);
});

test("source quote checks normalize whitespace and case", () => {
    assert.equal(isExactSourceQuote("Build scalable APIs", "Experience: build   scalable APIs"), true);
    assert.equal(isExactSourceQuote("Built scalable APIs", "Experience: build scalable APIs"), false);
});

test("match validation removes unsupported quotes and fills omitted requirements", () => {
    const jobs = [{
        _id:"0123456789abcdef01234567",
        description:"Build APIs",
        requirements:["Node.js", "Testing"]
    }];
    const result = validateMatchAnalysis({
        matches:[{
            jobId:"0123456789abcdef01234567",
            explanation:"Relevant experience.",
            requirements:[{
                requirement:"Node.js",
                status:"supported",
                resumeEvidence:"Built Node.js APIs",
                jobEvidence:"Build APIs"
            }],
            suggestions:[]
        }]
    }, jobs, "Built Node.js APIs");

    assert.equal(result[0].requirements[0].resumeEvidence, "Built Node.js APIs");
    assert.equal(result[0].requirements[0].jobEvidence, "Build APIs");
    assert.deepEqual(result[0].requirements[1], {
        requirement:"Testing",
        status:"not_evidenced",
        resumeEvidence:"",
        jobEvidence:""
    });
});
