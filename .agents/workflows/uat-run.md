---
description: Execute the PlateMyDay mobile User Acceptance Testing (UAT) plan with dynamic file resolution
---

# PlateMyDay UAT Execution Workflow

This workflow instructs the agent on how to properly execute the extensive User Acceptance Testing (UAT) suite for PlateMyDay, dynamically finding the latest plan and report.

1. **Find Latest Files**: Use your tools (like `list_dir`) to look in the `/Users/raviautar/workspace/platemyday/uat/` directory. Identify the highest numbered `UAT_PLAN-run-*.md` and `UAT_REPORT-run-*.md` files.
2. **Review the Plan & Old Report**: Read the latest UAT plan to understand the test cases (e.g. 50+ items). Also read the latest UAT report to identify previously found issues (Bugs, UX issues) that need verifying.
3. **Environment Check**: Ensure the local development server is presumed running at `http://localhost:3001` (unless the user specifies a different URL). Do not start the server yourself unless explicitly requested.
4. **Execute Subagent**: Call the `browser_subagent` tool with the following explicit instructions in the `Task` description:
   - "Navigate to http://localhost:3001 and execute the UAT test cases defined in the latest plan file you just read."
   - "CRITICAL: You MUST resize your browser viewport to a mobile dimension (e.g., width 390, height 844) before starting any tests."
   - "Test all cases in the plan, specifically focusing on the listed edge cases (e.g., long strings, rapid clicks, missing constraints, blank inputs). Do NOT test the premium/upgrade flows."
   - "CRITICAL: Explicitly verify if the issues marked as Bugs or UX Issues in the OLD report are still present or have been fixed."
   - "If you encounter a hard blocker (like a generic app crash), attempt to refresh and move to the next category."
   - "Return a detailed, categorized Markdown report of all Errors, UX Bugs, and Features/Improvements found during this session, clearly separating 'Verified Fixes' from 'New/Existing Issues'."
5. **Create New Report**: Once the `browser_subagent` completes and returns its detailed report, create a brand NEW report file by incrementing the version number (e.g., if the old was `UAT_REPORT-run-2.md`, create `UAT_REPORT-run-3.md`). Save the exact markdown content into this new file. DO NOT overwrite the old report.
6. **Create New Plan (Optional)**: If the user requests expanding the plan, write a NEW plan file (e.g. `UAT_PLAN-run-something.md`) rather than overwriting the old one.
7. **Notify the User**: Review the major blockers found in the report and use `notify_user` to present the findings to the user, providing paths to the newly created files.
