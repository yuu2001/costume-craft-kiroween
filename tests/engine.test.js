const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../js/engine.js");

function plan(overrides) {
  return engine.generatePlan(
    Object.assign(
      {
        occasion: "party",
        vibes: ["spooky", "elegant"],
        budget: 40,
        skill: "beginner",
        wearer: "",
        notes: "",
        variant: 0,
      },
      overrides || {}
    )
  );
}

test("same input returns the same plan", function () {
  const a = plan();
  const b = plan();
  assert.deepEqual(a, b);
  assert.equal(a.conceptName, "Grave-lantern Doorway Phantom");
});

test("named routes for the other occasions", function () {
  assert.equal(
    plan({ occasion: "kids", vibes: ["cozy"], budget: 30 }).conceptName,
    "Hearth Pumpkin Page"
  );
  assert.equal(
    plan({ occasion: "office", vibes: ["funny", "spooky"], budget: 35 }).conceptName,
    "Name-tag Desk Cryptid"
  );
  assert.equal(
    plan({ occasion: "cosplay", vibes: ["futuristic", "neon"], budget: 60, skill: "intermediate" }).conceptName,
    "Low-orbit Signal Warden"
  );
});

test("every occasion and skill produces a complete plan", function () {
  Object.keys(engine.OCCASIONS).forEach(function (occasion) {
    Object.keys(engine.SKILLS).forEach(function (skill) {
      const result = plan({ occasion: occasion, vibes: [], skill: skill, budget: 50 });
      assert.ok(result.conceptName.length > 3);
      assert.ok(result.characterBrief.length > 40);
      assert.ok(result.materials.length >= 2);
      assert.ok(result.steps.length >= 3);
      assert.equal(
        result.estimatedCost,
        result.materials.reduce(function (sum, item) {
          return sum + item.cost;
        }, 0)
      );
      assert.ok(["under", "on", "stretch"].indexOf(result.budgetFit) !== -1);
      assert.equal(result.alternatives.length, 3);
      assert.ok(result.characterBrief.indexOf(engine.OCCASIONS[occasion].safety) !== -1);
      const ids = result.materials.map(function (item) {
        return item.id;
      });
      assert.equal(new Set(ids).size, ids.length);
    });
  });
});

test("catalog references are internally consistent", function () {
  const ids = new Set();
  engine.CONCEPTS.forEach(function (concept) {
    assert.equal(ids.has(concept.id), false);
    ids.add(concept.id);
    assert.ok(concept.occasions.length >= 1);
    concept.vibes.forEach(function (vibe) {
      assert.ok(engine.MOTIFS[vibe], vibe);
    });
    concept.palette.forEach(function (name) {
      assert.ok(engine.PALETTE_HEX[name], name);
    });
    concept.materials.forEach(function (item) {
      assert.equal(typeof item.name, "string");
      assert.equal(typeof item.cost, "number");
      assert.ok(["essential", "signature", "flourish"].indexOf(item.tier) !== -1);
      assert.ok(engine.SKILLS[item.minSkill]);
      assert.ok(item.how.length > 10);
    });
  });
  Object.keys(engine.MOTIFS).forEach(function (id) {
    engine.MOTIFS[id].palette.forEach(function (name) {
      assert.ok(engine.PALETTE_HEX[name], name);
    });
  });
});

test("a tight budget drops optional pieces and can stretch", function () {
  const result = plan({ budget: 15 });
  const names = result.materials.map(function (item) {
    return item.name;
  });
  assert.equal(names.some(function (name) { return /veil/i.test(name); }), false);
  assert.equal(result.budgetFit, "stretch");
  assert.ok(result.estimatedCost > 15);
});

test("a generous advanced plan can include a flourish", function () {
  const result = plan({ budget: 200, skill: "advanced" });
  assert.ok(result.materials.some(function (item) { return item.tier === "flourish"; }));
  assert.ok(result.estimatedCost <= 200);
});

test("kids and office plans keep the face usable", function () {
  const child = plan({ occasion: "kids", vibes: ["glam"], notes: "please add a mask" });
  assert.match(child.characterBrief, /face visible/i);
  assert.ok(child.materials.some(function (item) { return /face paint/i.test(item.name); }));
  assert.equal(child.materials.some(function (item) { return /full-face|full face/i.test(item.name); }), false);

  const office = plan({ occasion: "office", vibes: ["elegant"], notes: "a mask would be funny" });
  assert.match(office.characterBrief, /video call/i);
  assert.ok(office.materials.some(function (item) { return /glasses or a brow/i.test(item.name); }));
});

test("a hat note becomes a checklist line and markup is stripped", function () {
  const result = plan({ notes: "must include a <hat> for the bit" });
  assert.ok(result.materials.some(function (item) { return /noted hat/i.test(item.short); }));
  assert.equal(result.notes.indexOf("<"), -1);
  assert.match(result.characterBrief, /must include a hat/i);
});

test("weapon notes are not turned into props", function () {
  const result = plan({ notes: "bring a sword and some blood" });
  const blob = JSON.stringify(result.materials).toLowerCase();
  assert.equal(blob.indexOf("sword"), -1);
  assert.equal(blob.indexOf("blood"), -1);
  assert.match(result.characterBrief, /will not build/i);
});

test("regenerate variation changes the styling without leaving the occasion", function () {
  const first = plan({ variant: 0 });
  const second = plan({ variant: 1 });
  assert.notEqual(first.conceptName, second.conceptName);
  assert.equal(second.occasion, "party");
});

test("pocket alternative is a real leaner plan", function () {
  const result = plan({ budget: 80, skill: "advanced" });
  const pocket = result.alternatives.find(function (alt) { return alt.kicker === "Leaner build"; });
  const applied = engine.generatePlan(pocket.apply);
  assert.equal(applied.edition, "Pocket");
  assert.ok(applied.estimatedCost <= result.estimatedCost);
  assert.equal(applied.materials.some(function (item) { return item.tier === "flourish"; }), false);
});

test("plain text export includes the checklist and the steps", function () {
  const result = plan({ wearer: "Mina" });
  const text = engine.planToText(result);
  assert.match(text, /Grave-lantern Doorway Phantom/);
  assert.match(text, /Materials/);
  assert.match(text, /DIY steps/);
  assert.match(text, /Mina/);
});
