import test from "node:test";
import assert from "node:assert/strict";
import { matchesPreferences } from "../utils/jobAlerts.js";
import { parseSalaryMin } from "../utils/salary.js";

const job = {
    title:"Frontend Engineer",
    description:"Build React interfaces",
    requirements:["React", "Accessibility"],
    location:"Bangalore",
    jobType:"Full Time",
    experienceLevel:"0-2 Years",
    salary:"12 LPA",
    salaryMin:12
};

test("job alerts match keywords without case sensitivity", () => {
    assert.equal(matchesPreferences({ keyword:"REACT" }, job), true);
    assert.equal(matchesPreferences({ keyword:"Go developer" }, job), false);
});

test("job alerts require every configured filter to match", () => {
    assert.equal(matchesPreferences({
        locations:["Bangalore"],
        jobTypes:["Full Time"],
        experienceLevels:["0-2 Years"],
        minSalary:10,
        maxSalary:15
    }, job), true);
    assert.equal(matchesPreferences({ locations:["Mumbai"], jobTypes:[], experienceLevels:[] }, job), false);
    assert.equal(matchesPreferences({ minSalary:13 }, job), false);
});

test("salary parsing supports decimal LPA values and safely rejects unknown values", () => {
    assert.equal(parseSalaryMin("₹ 8.5 LPA"), 8.5);
    assert.equal(parseSalaryMin("10-15 LPA"), 10);
    assert.equal(parseSalaryMin("Competitive"), undefined);
});
