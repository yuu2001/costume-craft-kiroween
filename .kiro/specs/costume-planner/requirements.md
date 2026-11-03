# Requirements: CostumeCraft planner

## Requirement 1: Plan from a brief

**User story:** As a person with a party, a cosplay, a kids' event, or an office day, I want a costume plan from the occasion, the vibe, the budget, and my DIY skill, so that I can shop and build without inventing the whole idea myself.

#### Acceptance criteria

1. WHEN a visitor chooses an occasion, zero to three vibes, a budget, and a skill level, THEN the app SHALL write a plan without a server.
2. WHEN the same inputs are submitted again, THEN the concept name, brief, materials, steps, cost, and alternatives SHALL match the earlier plan.
3. WHEN the visitor asks for another variation, THEN the plan SHALL change and SHALL stay on the same occasion.
4. IF the notes include markup, THEN the app SHALL strip angle brackets before they appear in the plan.

## Requirement 2: Plan contents

**User story:** As a visitor, I want a concept I can picture, a list I can buy, and steps I can follow, so that the page is useful the night I need it.

#### Acceptance criteria

1. THEN each plan SHALL include a concept name, a character brief, a materials checklist with a cost and a source on every line, ordered DIY steps, one estimated cost, and three alternatives.
2. THEN the estimated cost SHALL equal the sum of the listed material costs.
3. WHEN the budget is too small for the optional pieces, THEN those pieces SHALL be dropped before essentials, and the plan SHALL say when the remaining list still stretches the budget.
4. WHEN a visitor chooses the pocket alternative, THEN the resulting plan SHALL be essentials only and SHALL not cost more than the fuller plan.

## Requirement 3: Safety lines

**User story:** As a parent or a coworker, I want the planner to refuse costumes that are unsafe or unusable for the occasion, so that a kids' or office plan is actually wearable.

#### Acceptance criteria

1. WHEN the occasion is kids, THEN the brief SHALL keep the face visible and SHALL avoid small detachable pieces.
2. WHEN the occasion is office, THEN the brief SHALL keep the face visible for a video call and SHALL avoid floor-length hazards.
3. IF the notes ask for a mask, THEN kids and office plans SHALL substitute face paint, glasses, or a brow piece instead of a full-face cover.
4. IF the notes ask for a weapon or blood, THEN the app SHALL NOT add that prop and SHALL say the request was not built.

## Requirement 4: Saved plan and print

**User story:** As a visitor, I want the last plan to still be there when I come back, and I want a paper checklist, so that I can shop away from the form.

#### Acceptance criteria

1. WHEN a plan is generated, THEN the app SHALL save it in `localStorage`.
2. WHEN the page is opened again in the same browser, THEN the form and the plan SHALL be restored.
3. WHEN the visitor prints, THEN the form and the site chrome SHALL be hidden and the checklist and steps SHALL remain.
4. WHEN a checklist box is checked, THEN that packed state SHALL be saved with the plan.

## Requirement 5: Optional prose polish

**User story:** As a visitor who already has a model key, I want the prose rewritten without losing the shopping list, so that I can experiment without breaking the costs.

#### Acceptance criteria

1. WHILE no key is stored, THEN the app SHALL still generate a complete plan.
2. IF polish is enabled and the request fails, THEN the app SHALL keep the on-device brief and SHALL say that polish failed.
3. WHEN polish succeeds, THEN only the concept name and the character brief MAY change.
4. THEN the key SHALL stay in this browser and SHALL NOT be written into the saved plan.

## Requirement 6: Kiro project files

**User story:** As a judge or a later agent, I want the product contract in `/.kiro`, so that the app can be changed without losing the demo rules.

#### Acceptance criteria

1. THEN the repository SHALL contain steering docs, a spec, and at least one agent hook under `/.kiro`.
2. THEN `/.kiro` SHALL NOT be listed in `.gitignore`.
3. THEN the README and the in-page about section SHALL explain how those Kiro files relate to the planner.
