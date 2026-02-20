# PlateMyDay Detailed UAT Plan (Mobile-Only)

## Overview
This document defines an extensive suite of User Acceptance Testing (UAT) journeys for PlateMyDay. The target environment is a **mobile-sized screen** (e.g., 390x844 or 320x658) on `http://localhost:3001`. Do NOT test the premium/upgrade flows.

## Test Cases (25+ Paths & Edge Cases)

### Category 1: Onboarding & Landing
1. **TC-01: Standard Onboarding** — Complete the features carousel normally, verifying text readability and image alignment on mobile viewing.
2. **TC-02: Bypass Flow** — Click "Continue without account". Verify no hard blocks or console warnings appear.
3. **TC-03: Interrupted State** — Start onboarding, navigate midway, refresh the page. Verify state preservation or graceful reset.
4. **TC-04: Extreme Small Screen** — Render onboarding on 320px width (e.g., iPhone SE). Verify "About" button and text do not overlap.

### Category 2: Preferences Constraints
5. **TC-05: Empty Preferences** — Deselect all predefined diets, clear the custom diet, and save. Verify the app correctly defaults to an open diet.
6. **TC-06: Maximum Preferences** — Select every available predefined dietary preference at once. Save and verify UI wrapping and save success.
7. **TC-07: Custom Diet Stress** — Enter a 250-character continuous string in the custom diet field. Verify it doesn't break page layout or hide the "Save" action.
8. **TC-08: Rapid Toggling** — Rapidly select and deselect preferences within 5 seconds. Check for race conditions in saving and visual overlapping of toast notifications.
9. **TC-09: Immediate Week Start Change** — Change "Week Start" day. Navigate immediately to the Meal Plan and verify the UI updates instantly without requiring a manual refresh.
10. **TC-10: Error Boundary Recovery** — If saving preferences triggers a Next.js error overlay, attempt to dismiss it and continue navigating without reloading the page.

### Category 3: Recipe Generation
11. **TC-11: Blank Prompt** — Click "Generate Recipe" with zero selected ingredients and empty description. Verify prompt validation prevents submission.
12. **TC-12: Nonsense Prompt** — Enter `asdfghjkl` into description and generate. Observe the fallback AI behavior and UI presentation.
13. **TC-13: Massive Ingredient List** — Manually type/select 35+ ingredients into quick-add. Verify if generation times out or completes successfully.
14. **TC-14: Invalid Dietary Injection** — Ask the recipe generator for a high-meat meal despite "Vegan" preferences being saved globally. See if system constraints apply.

### Category 4: Recipe Library & Editing
15. **TC-15: Long Drawer UI** — Open a generated recipe and click "Edit". Scroll down to the "Save Changes" button. Test the usability of the long drawer format on mobile.
16. **TC-16: Empty Content Save** — During the "Edit Recipe" flow, delete the recipe title and all instructions. Try to save. Verify validation error responses.
17. **TC-17: Keyboard Obscuration** — Open the search bar in the Recipe Library, trigger the virtual keyboard. Verify search results are scrollable and not permanently hidden.
18. **TC-18: Ghost Deletion** — Delete a recipe. Ensure it disappears immediately, the list rerenders smoothly, and the user is redirected correctly out of the detail view.

### Category 5: Meal Plan Execution
19. **TC-19: Contradictory Generation** — Set hyper-restrictive preferences (e.g., "Carnivore" + "Vegan") and generate a weekly plan. Check the UI fallback mechanisms.
20. **TC-20: Rapid Swapping** — Generate a plan, then rapidly click the "Swap" button on a specific meal 6-8 times concurrently. Check for duplicated state or overlapped API calls.
21. **TC-21: Mobile Empty States** — Clear the entire meal plan. Interact with the SVG doodles/guides. Ensure they are accessible on mobile without horizontal scrolling.
22. **TC-22: Long Titles** — Inject or generate a meal with a 150-character title. Observe how WeekView handles text wrapping (`truncate` or `line-clamp`).

### Category 6: Shopping & Extras
23. **TC-23: Async Shopping List Merging** — Add 3 single pantry items. Regenerate the weekly meal plan. Verify the new recipe ingredients nicely merge with the manual 3 pantry items.
24. **TC-24: Heavy Shopping List Render** — View a shopping list containing 100+ items. Verify scrolling performance and checkbox toggling latency on mobile.

### Category 7: Network & Edge Handling
25. **TC-25: Offline Simulation** — Start AI generation, then simulate network disconnection in DevTools. Check for a localized, non-crashing error boundary.
26. **TC-26: 404 Routing** — Navigate to `http://localhost:3001/thisisabaddomain`. Ensure the 404 page is styled correctly for mobile with a back-link to `/`.
27. **TC-27: Cross-Tab Sync** — Open the app in two simulated tabs. Add a pantry item in Tab A, check if Tab B reflects it on focus (dependent on SWR/React Query config).
