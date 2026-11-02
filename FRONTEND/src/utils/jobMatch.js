export const getJobMatch = (job, skills = []) => {
    const normalizedSkills = skills
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean);
    const requirements = (job?.requirements || [])
        .map((requirement) => String(requirement).trim())
        .filter(Boolean);
    const matchedRequirements = requirements.filter((requirement) => {
        const normalizedRequirement = requirement.toLowerCase();
        return normalizedSkills.some((skill) =>
            normalizedRequirement.includes(skill) || skill.includes(normalizedRequirement)
        );
    });
    const missingRequirements = requirements.filter((requirement) => !matchedRequirements.includes(requirement));

    return {
        percentage:requirements.length ? Math.round((matchedRequirements.length / requirements.length) * 100) : null,
        matchedRequirements,
        missingRequirements
    };
};
