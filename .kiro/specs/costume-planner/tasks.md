# Tasks: CostumeCraft planner

The spec is implemented on `main`. These tasks are the checklist a later Kiro pass should keep green.

- [x] Build the deterministic generator in `js/engine.js` with four occasions, twelve concepts, and twelve motifs.
- [x] Cover flagship names, budget trimming, kids and office face rules, note extras, the weapon refusal, variations, the pocket alternative, and the text export in `tests/engine.test.js`.
- [x] Build the one-page UI: occasion, vibes, budget, skill, wearer, notes, plan, checklist, steps, alternatives, copy, and print.
- [x] Save and restore the last plan, including packed checkboxes, in `localStorage`.
- [x] Add optional prose polish that cannot rewrite the checklist.
- [x] Write the about section and the README so the Kiro steering, spec, and hook are visible.
- [x] Keep `/.kiro` tracked and serve the site from the repository root on GitHub Pages.

Verification for a later change:

1. `npm test`
2. Open the page, generate a kids plan and an office plan, and read the safety line.
3. Reload and confirm the plan is still there.
4. Print preview and confirm the form is gone.
