# CostumeCraft

An AI-assisted Halloween and costume planner that turns an occasion, a vibe, and a budget into a costume brief, a shopping checklist, and DIY steps.

**Live demo:** https://yuu2001.github.io/costume-craft-kiroween/

The plan is written in the browser. The same answers always produce the same costume, so the demo works with no account, no API key, and no network after the page has loaded.

## What you can do

- Choose an occasion: party, cosplay, kids, or office.
- Add up to three vibes, a budget, and a DIY skill level.
- Optionally name the wearer and a piece that has to be included (a hat, a short cape, glasses, and similar).
- Get a concept name, a character brief, a priced materials checklist, DIY steps, an estimated cost, and three alternatives.
- Save the last plan in this browser, check off materials as you pack them, copy the plan, or print a paper checklist.
- Optionally polish the prose with your own OpenAI-compatible key. The checklist and the prices stay on the deterministic engine. The key never leaves this browser except for that request, and it is not required.

Kids plans keep the face visible and skip small detachable pieces. Office plans stay camera-ready. Notes that ask for weapons or blood are not turned into props.

## Run it locally

No install and no build.

```bash
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/

The engine tests use Node and no extra packages:

```bash
npm test
```

## GitHub Pages

The site is published from the `main` branch, folder `/` (the repository root). The public URL is:

https://yuu2001.github.io/costume-craft-kiroween/

Pages settings, if you need to turn them back on: **Settings → Pages → Deploy from a branch → `main` → `/ (root)`**. `.nojekyll` is included so Jekyll does not hide project files. Links to CSS and scripts are relative, which is what a project site on `github.io` needs.

## How this was built with Kiro

CostumeCraft is spec-driven, and the contract lives in [`/.kiro`](./.kiro) so Kiro (and any later agent) can change the planner without dropping the demo rules.

| Path | What it keeps true |
| --- | --- |
| `.kiro/steering/product.md` | Always-on product rules: static site, deterministic plans, the plan shape, kids and office safety, no required API key. |
| `.kiro/steering/generator.md` | Rules for `js/engine.js`: scoring, budget trimming, note extras, and the flagship names the tests pin. |
| `.kiro/steering/frontend.md` | Rules for the one-page UI: accessible controls, `textContent` rendering, print behavior, relative URLs. |
| `.kiro/specs/costume-planner/requirements.md` | User stories and acceptance criteria for the planner, the saved plan, polish, and the Kiro files themselves. |
| `.kiro/specs/costume-planner/design.md` | Data flow from the form through `generatePlan` to `localStorage` and the optional model call. |
| `.kiro/specs/costume-planner/tasks.md` | The implementation checklist and how to re-check it. |
| `.kiro/hooks/check-plan-shape.kiro.hook` | When the generator or its tests change, ask the agent to run `npm test` and confirm the plan shape. |
| `.kiro/hooks/review-pages-readme.kiro.hook` | When the README or the page changes, ask the agent to keep the Pages URL and the Kiro explanation accurate. |

`/.kiro` is not in `.gitignore`. The in-page **About** section tells the same story for someone who only has the demo open.

The generator itself is a template and rule engine: twelve costume bases (three per occasion), twelve vibe motifs, and a budget/skill filter. That is the whole "model" the demo needs. The optional key is a polish pass on top of a plan that already stands on its own.

## Layout

```text
index.html          one-page app
css/styles.css      dark, print, and small-screen styles
js/engine.js        deterministic costume plans
js/app.js           form, render, storage, optional polish
tests/engine.test.js
.kiro/              Kiro steering, spec, and hooks
```

## License

[MIT](LICENSE) © 2026 yuu2001
