export const parseSalaryMin = (salary) => {
    const value = String(salary || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
    return value ? Number(value[0]) : undefined;
};
