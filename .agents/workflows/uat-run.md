---
description: Execute the PlateMyDay mobile User Acceptance Testing (UAT) plan
---

# PlateMyDay UAT Execution Workflow

This workflow instructs the agent on how to properly execute the extensive User Acceptance Testing (UAT) suite for PlateMyDay.

1. **Review the Plan**: Read the current UAT plan located at `/Users/raviautar/workspace/platemyday/uat/UAT_PLAN.md` to understand the extensive test cases (25+ items).
2. **Environment Check**: Ensure the local development server is presumed running at `http://localhost:3001` (unless the user specifies a different URL). Do not start the server yourself unless explicitly requested.
3. **Execute Subagent**: Call the `browser_subagent` tool with the following explicit instructions in the `Task` description:
   - "Navigate to http://localhost:3001 and execute the UAT test cases defined in `/Users/raviautar/workspace/platemyday/uat/UAT_PLAN.md`."
   - "CRITICAL: You MUST resize your browser viewport to a mobile dimension (e.g., width 390, height 844) before starting any tests."
   - "Test as many of the 25+ cases as possible, specifically focusing on the listed edge cases (e.g., long strings, rapid clicks, missing constraints, blank inputs). Do NOT test the premium/upgrade flows."
   - "If you encounter a hard blocker (like a generic app crash), attempt to refresh and move to the next category."
   - "Return a detailed, categorized Markdown report of all Errors, UX Bugs, and Features/Improvements found during this session."
4. **Save the Report**: Once the `browser_subagent` completes and returns its detailed report, save or append that exact markdown content into `/Users/raviautar/workspace/platemyday/uat/UAT_REPORT.md` (or a timestamped file like `UAT_REPORT_LATEST.md`).
5. **Notify the User**: Review the major blockers found in the report and use `notify_user` to present the findings to the user.
