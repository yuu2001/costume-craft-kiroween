---
inclusion: fileMatch
fileMatchPattern: "index.html"
---

# Frontend

The UI is one page: `index.html`, `css/styles.css`, and `js/app.js`. No build step.

- English copy. Dark, print-friendly, usable at 320px wide. No horizontal scrolling.
- Occasion, vibe chips (max three), budget, and skill are real controls with `aria-pressed` state. Do not replace them with a free-text-only prompt.
- Render plan text with `textContent`. Never inject the wearer name, notes, or model output with `innerHTML`.
- Palette colors may be applied only when the value is a `#rrggbb` hex from the engine.
- Print hides the form, the header, and the about section. The checklist and the steps remain.
- The about section must keep a plain explanation of how `/.kiro` steering, the spec, and the engine hook fit together.
- Fonts may come from a CDN. The layout has to stay readable if those fonts do not load.
