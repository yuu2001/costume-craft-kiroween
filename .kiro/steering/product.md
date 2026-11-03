---
inclusion: always
---

# CostumeCraft

CostumeCraft is a static Halloween and costume planner for Kiroween 2026. It turns an occasion, up to three vibes, a budget, and a DIY skill level into a named costume, a character brief, a priced checklist, DIY steps, and three alternatives.

## Product rules

- The app is a static site. Do not add a backend, a database, or a required API key.
- The same inputs must always produce the same plan. Determinism is the demo.
- A plan always includes `conceptName`, `characterBrief`, `materials`, `steps`, `estimatedCost`, `budgetFit`, and three `alternatives`.
- `estimatedCost` is the sum of the material line costs that are actually shown.
- Kids plans keep the face visible and avoid small detachable pieces. Office plans keep the face camera-ready and the floor clear. Do not generate weapon, blood, or gore props from the notes field.
- Optional model polish may rewrite only the concept name and the brief. It must not change materials, steps, or the estimated cost.
- The last plan is stored in `localStorage` under `costumecraft.plan.v1`. API keys, if a visitor opts in, live only under `costumecraft.llm.v1` and must never be written into the plan record or the repository.
- Keep the MIT license. Do not ignore `/.kiro`.

## Pages

GitHub Pages serves the repository root from `main`:

https://yuu2001.github.io/costume-craft-kiroween/

Asset URLs in `index.html` stay relative so the project-site path prefix keeps working.
