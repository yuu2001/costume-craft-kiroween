# Design: CostumeCraft planner

## Overview

CostumeCraft is a single static page. `js/engine.js` owns the catalog and the selection rules. `js/app.js` owns the form, rendering, `localStorage`, print, and the optional polish call. GitHub Pages serves the repository root from `main`.

```text
form state + variation + locks
        |
        v
CostumeEngine.generatePlan
        |
        +--> concept score (occasion, then vibes)
        +--> motif from the vibe cycle
        +--> materials filtered by skill and budget
        +--> steps from the chosen materials
        +--> three alternatives (pocket, sibling, motif twist)
        |
        v
DOM render (textContent only) --> localStorage
        |
        +--> optional POST to the visitor's own model endpoint
             (rewrites name + brief only)
```

## Data

A plan object carries:

- `conceptName`, `epithet`, `characterBrief`, `why`
- `occasion`, `vibes`, `skill`, `budget`, `wearer`, `notes`, `variant`
- `palette` as `{ name, hex }` pairs
- `materials[]` with `id`, `name`, `cost`, `tier`, `where`, `note`, `how`
- `steps[]` with `title`, `detail`, `minutes`
- `estimatedCost`, `budgetFit` (`under`, `on`, or `stretch`), `totalMinutes`
- `alternatives[]` with `title`, `blurb`, `estimatedCost`, and an `apply` payload that can be fed back into `generatePlan`
- `input`, the normalized request, so a saved plan can refill the form

Concepts live in the `CONCEPTS` catalog, three per occasion. Motifs live in `MOTIFS`, one per vibe. The flagship names are covered by `tests/engine.test.js`.

## Budget and skill

Essentials are always included. Note extras are included next, up to two. Signatures and flourishes are included only while the running total fits the budget and the visitor's skill is at least the item's `minSkill`. Pocket edition skips everything except essentials.

## Safety

Occasion copy is appended to every brief. Mask notes are rewritten per occasion. A small denylist (`sword`, `gun`, `blood`, and related words) blocks prop generation. The engine does not return build instructions for those requests.

## Persistence

`costumecraft.plan.v1` stores `{ version, savedAt, plan, checks }`. `costumecraft.llm.v1` stores the optional key only when the visitor asks to remember it. Clearing the plan does not need to clear the key. Forgetting the key removes only the key record.

## Polish

The endpoint must be `https`, or `http` on `localhost` / `127.0.0.1`. The client posts to `{base}/chat/completions` unless the base already ends in that path. The request times out at 12 seconds. A newer generate cancels the older request.

## Deploy

No bundler. `python3 -m http.server` is enough locally. Production is GitHub Pages on branch `main`, folder `/`. `.nojekyll` is present so Jekyll does not hide files. Paths in the HTML are relative.

## Out of scope

Accounts, sharing links, a hosted model, payments, and user-uploaded photos.
