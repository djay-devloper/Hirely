const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

export const buildJobEmbeddingText = (job) => [
    job.title,
    job.experienceLevel,
    job.jobType,
    job.location,
    ...(job.requirements || []),
    String(job.description || "").slice(0, 4000)
].filter(Boolean).join("\n").slice(0, 6000);

export const cosineSimilarity = (left, right) => {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length === 0 || left.length !== right.length) return 0;
    let dot = 0;
    let leftMagnitude = 0;
    let rightMagnitude = 0;
    for (let index = 0; index < left.length; index += 1) {
        const leftValue = Number(left[index]);
        const rightValue = Number(right[index]);
        if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) return 0;
        dot += leftValue * rightValue;
        leftMagnitude += leftValue * leftValue;
        rightMagnitude += rightValue * rightValue;
    }
    if (leftMagnitude === 0 || rightMagnitude === 0) return 0;
    return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
};

export const isExactSourceQuote = (quote, source) => {
    const normalizedQuote = normalizeText(quote);
    return normalizedQuote.length > 0 && normalizeText(source).includes(normalizedQuote);
};

export const validateMatchAnalysis = (analysis, jobs, resumeText) => {
    const validJobIds = new Set(jobs.map((job) => String(job._id)));
    const jobById = new Map(jobs.map((job) => [String(job._id), job]));
    const matches = Array.isArray(analysis?.matches) ? analysis.matches : [];

    return matches
        .filter((match) => validJobIds.has(String(match.jobId)))
        .map((match) => {
            const job = jobById.get(String(match.jobId));
            const requirements = Array.isArray(match.requirements) ? match.requirements : [];
            const analyzedRequirements = new Map(requirements
                .filter((item) => (job.requirements || []).includes(item.requirement))
                .map((item) => [item.requirement, item]));
            return {
                jobId:String(match.jobId),
                explanation:String(match.explanation || "").slice(0, 1000),
                requirements:(job.requirements || []).map((requirement) => {
                    const item = analyzedRequirements.get(requirement);
                    return {
                        requirement,
                        status:["supported", "partial", "not_evidenced"].includes(item?.status) ? item.status : "not_evidenced",
                        resumeEvidence:isExactSourceQuote(item?.resumeEvidence, resumeText) ? item.resumeEvidence : "",
                        jobEvidence:isExactSourceQuote(item?.jobEvidence, `${job.description}\n${(job.requirements || []).join("\n")}`)
                            ? item.jobEvidence
                            : ""
                    };
                }),
                suggestions:Array.isArray(match.suggestions)
                    ? match.suggestions.filter((item) => typeof item === "string").slice(0, 4).map((item) => item.slice(0, 400))
                    : []
            };
        });
};
