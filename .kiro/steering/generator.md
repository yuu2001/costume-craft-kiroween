---
inclusion: fileMatch
fileMatchPattern: "js/engine.js"
---

# Plan generator

`js/engine.js` is the creative system of record. The UI is a client of `CostumeEngine.generatePlan` and `CostumeEngine.planToText`.

- Score concepts by occasion first, then by vibe overlap. Variation `0` must keep the highest-scoring concept for that occasion. Later variations may change the motif, then a nearby concept, and must stay on the same occasion.
- Select materials in this order: essentials, note-driven extras, signatures that still fit the budget, flourishes that still fit the budget. Skill level filters by `minSkill`.
- Pocket edition is essentials only. It is one of the three alternatives.
- Notes may add at most two soft extras (hat, cape, wings, glasses, boots, gloves, battery light, or a face-visible substitute for a mask). If a note asks for a weapon or blood, do not add a prop. Say so in the brief instead.
- Keep dollar amounts as integers. Do not invent a second cost that disagrees with the checklist.
- `npm test` must pass after any edit to this file. The tests pin the flagship names: Grave-lantern Doorway Phantom, Hearth Pumpkin Page, Name-tag Desk Cryptid, and Low-orbit Signal Warden.
