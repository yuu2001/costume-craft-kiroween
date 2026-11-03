(function () {
  var engine = window.CostumeEngine;
  var PLAN_KEY = "costumecraft.plan.v1";
  var LLM_KEY = "costumecraft.llm.v1";

  var form = document.getElementById("planner-form");
  var planRoot = document.getElementById("plan");
  var empty = document.getElementById("empty");
  var budget = document.getElementById("budget");
  var budgetOut = document.getElementById("budget-out");
  var budgetTier = document.getElementById("budget-tier");
  var vibeHint = document.getElementById("vibe-hint");
  var polishStatus = document.getElementById("polish-status");
  var result = document.getElementById("result");

  var variant = 0;
  var locks = null;
  var current = null;
  var checks = {};
  var polishAbort = null;
  var polishToken = 0;

  if (!engine) {
    empty.querySelector("h2").textContent = "The planner script did not load.";
    return;
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selected(selector, attr) {
    var node = document.querySelector(selector + '[aria-pressed="true"]');
    return node ? node.getAttribute(attr) : "";
  }

  function pressedValues(selector, attr) {
    return Array.prototype.map.call(
      document.querySelectorAll(selector + '[aria-pressed="true"]'),
      function (node) {
        return node.getAttribute(attr);
      }
    );
  }

  function setPressed(selector, attr, value) {
    document.querySelectorAll(selector).forEach(function (node) {
      node.setAttribute("aria-pressed", node.getAttribute(attr) === value ? "true" : "false");
    });
  }

  function setVibes(ids) {
    document.querySelectorAll("[data-vibe]").forEach(function (node) {
      node.setAttribute("aria-pressed", ids.indexOf(node.getAttribute("data-vibe")) !== -1 ? "true" : "false");
    });
    vibeHint.textContent = ids.length >= 3 ? "Three is the maximum. Turn one off to change the mix." : "Choose up to three.";
  }

  function tierLabel(amount) {
    if (amount <= 25) return "Shoestring. Closet first, then one shop stop.";
    if (amount <= 60) return "Clever. Enough for a silhouette and a signature piece.";
    if (amount <= 120) return "Statement. Room for structure, dye, or a small light.";
    return "Spectacle. The list can keep the flourishes.";
  }

  function syncBudget(amount) {
    var value = String(amount);
    budget.value = value;
    budgetOut.textContent = "$" + value;
    budgetTier.textContent = tierLabel(Number(value));
    document.querySelectorAll("[data-budget]").forEach(function (node) {
      node.setAttribute("aria-pressed", node.getAttribute("data-budget") === value ? "true" : "false");
    });
  }

  function readForm() {
    return {
      occasion: selected("[data-occasion]", "data-occasion") || "party",
      vibes: pressedValues("[data-vibe]", "data-vibe"),
      budget: Number(budget.value),
      skill: selected("[data-skill]", "data-skill") || "beginner",
      wearer: $("#wearer").value,
      notes: $("#notes").value,
      variant: variant,
      forceConceptId: locks && locks.forceConceptId,
      forceMotifId: locks && locks.forceMotifId,
      essentialsOnly: Boolean(locks && locks.essentialsOnly),
    };
  }

  function applyInput(input) {
    variant = input.variant || 0;
    locks = input.forceConceptId || input.forceMotifId || input.essentialsOnly
      ? {
          forceConceptId: input.forceConceptId,
          forceMotifId: input.forceMotifId,
          essentialsOnly: input.essentialsOnly,
        }
      : null;
    setPressed("[data-occasion]", "data-occasion", input.occasion || "party");
    setVibes(input.vibes || []);
    syncBudget(input.budget || 40);
    setPressed("[data-skill]", "data-skill", input.skill || "beginner");
    $("#wearer").value = input.wearer || "";
    $("#notes").value = input.notes || "";
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function fitCopy(fit) {
    if (fit === "stretch") return "Stretches the budget";
    if (fit === "on") return "On budget";
    return "Under budget";
  }

  function renderPlan(savedLabel) {
    var plan = current;
    planRoot.replaceChildren();
    if (!plan) {
      planRoot.hidden = true;
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    planRoot.hidden = false;

    var printHead = el("p", "print-only", "CostumeCraft");
    var tools = el("div", "plan-tools");
    var kicker = el("div", "kicker-row");
    kicker.append(
      el("span", "kicker", plan.occasionLabel),
      el("span", "kicker", plan.vibeLabels.length ? plan.vibeLabels.join(" · ") : "Open vibe"),
      el("span", "kicker", plan.skillLabel),
      el("span", "kicker", plan.edition === "Pocket" ? "Pocket edition" : "Full build")
    );
    if (variant > 0) kicker.append(el("span", "kicker", "Variation " + (variant + 1)));

    var name = el("h2", "concept-name", plan.conceptName);
    name.id = "concept-name";
    name.tabIndex = -1;
    var epithet = el("p", "epithet", plan.epithet);
    var brief = el("p", "brief", plan.characterBrief);
    var why = el("p", "why", plan.why);

    var palette = el("div", "palette");
    plan.palette.forEach(function (swatch) {
      var dot = el("span", "swatch");
      if (/^#[0-9a-f]{6}$/i.test(swatch.hex)) dot.style.background = swatch.hex;
      var label = el("span", "swatch-name", swatch.name);
      palette.append(dot, label);
    });

    var stats = el("div", "stat-row");
    stats.append(
      stat("Estimate", "$" + plan.estimatedCost),
      stat("Budget", "$" + plan.budget),
      stat("Time", "About " + plan.totalMinutes + " min"),
      el("span", "fit fit-" + plan.budgetFit, fitCopy(plan.budgetFit))
    );
    var badge = el(
      "span",
      "badge",
      plan.polished ? "Brief polished with your key" : "On-device brief"
    );
    stats.append(badge);

    var actions = el("div", "plan-actions no-print");
    actions.append(
      button("Another variation", function () {
        locks = null;
        variant += 1;
        craft();
      }),
      button("Copy plan", copyPlan),
      button("Print", function () {
        window.print();
      }),
      button("Clear saved plan", clearSaved)
    );

    var columns = el("div", "columns");
    columns.append(renderMaterials(plan), renderSteps(plan));
    var alts = renderAlternatives(plan);
    var saved = el("p", "hint no-print", savedLabel || "Saved in this browser.");

    tools.append(kicker);
    planRoot.append(printHead, tools, name, epithet, brief, why, palette, stats, actions, columns, alts, saved);
  }

  function stat(label, value) {
    var node = el("span", "stat");
    node.append(document.createTextNode(label + " "), el("strong", null, value));
    return node;
  }

  function button(label, onClick) {
    var node = el("button", "ghost", label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }

  function renderMaterials(plan) {
    var wrap = el("div");
    var packed = plan.materials.filter(function (item) {
      return checks[item.id];
    }).length;
    var head = el("div", "materials-head");
    head.append(el("h3", null, "Materials"), el("span", "hint", packed + " of " + plan.materials.length + " packed"));
    var list = el("ul", "materials");
    plan.materials.forEach(function (item) {
      var li = el("li", "material" + (checks[item.id] ? " is-packed" : ""));
      var label = document.createElement("label");
      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = Boolean(checks[item.id]);
      box.addEventListener("change", function () {
        checks[item.id] = box.checked;
        li.classList.toggle("is-packed", box.checked);
        head.querySelector(".hint").textContent =
          plan.materials.filter(function (entry) { return checks[entry.id]; }).length +
          " of " +
          plan.materials.length +
          " packed";
        persist("Checklist updated in this browser.");
      });
      var text = el("span");
      text.append(
        el("span", "item-name", item.name),
        el("span", "meta", "$" + item.cost + " · " + item.whereLabel + (item.note ? " · " + item.note : ""))
      );
      label.append(box, text);
      li.append(label);
      list.append(li);
    });
    wrap.append(head, list);
    return wrap;
  }

  function renderSteps(plan) {
    var wrap = el("div");
    wrap.append(el("h3", null, "DIY steps"));
    var list = el("ol", "steps");
    plan.steps.forEach(function (step, index) {
      var li = el("li", "step");
      var copy = el("div");
      copy.append(el("strong", null, step.title), el("span", "meta", step.minutes + " min"), el("p", null, step.detail));
      li.append(el("span", "step-no", String(index + 1)), copy);
      list.append(li);
    });
    wrap.append(list);
    return wrap;
  }

  function renderAlternatives(plan) {
    var wrap = el("div");
    wrap.append(el("h3", null, "Alternatives"));
    var list = el("div", "alts");
    plan.alternatives.forEach(function (alt) {
      var card = el("article", "alt");
      card.append(
        el("span", "kicker", alt.kicker),
        el("h3", null, alt.title),
        el("p", null, alt.blurb),
        el("span", "meta", "About $" + alt.estimatedCost)
      );
      var use = button("Use this version", function () {
        applyInput(alt.apply);
        locks = {
          forceConceptId: alt.apply.forceConceptId,
          forceMotifId: alt.apply.forceMotifId,
          essentialsOnly: alt.apply.essentialsOnly,
        };
        variant = alt.apply.variant || 0;
        craft();
      });
      card.append(use);
      list.append(card);
    });
    wrap.append(list);
    return wrap;
  }

  function persist(label) {
    if (!current) return;
    var record = {
      version: 1,
      savedAt: new Date().toISOString(),
      plan: current,
      checks: checks,
    };
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify(record));
    } catch (error) {
      label = "This browser blocked local save. The plan is still on screen.";
    }
    var hint = planRoot.querySelector(".hint.no-print");
    if (hint && label) hint.textContent = label;
  }

  function craft() {
    current = engine.generatePlan(readForm());
    checks = {};
    renderPlan("Saved in this browser.");
    persist("Saved in this browser.");
    var name = document.getElementById("concept-name");
    if (name && window.matchMedia("(max-width: 900px)").matches) {
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (name) name.focus({ preventScroll: true });
    polish(current);
  }

  function copyPlan() {
    if (!current) return;
    var text = engine.planToText(current);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          persist("Copied the plan.");
        },
        function () {
          fallbackCopy(text);
        }
      );
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    persist("Copied the plan.");
  }

  function clearSaved() {
    current = null;
    checks = {};
    locks = null;
    variant = 0;
    try {
      localStorage.removeItem(PLAN_KEY);
    } catch (error) {
      /* The in-memory plan is already cleared. */
    }
    renderPlan();
  }

  function restore() {
    var raw = null;
    try {
      raw = localStorage.getItem(PLAN_KEY);
    } catch (error) {
      return;
    }
    if (!raw) return;
    try {
      var record = JSON.parse(raw);
      if (!record.plan || !record.plan.conceptName) return;
      current = record.plan;
      checks = record.checks || {};
      applyInput(record.plan.input || {});
      renderPlan("Restored from this browser.");
    } catch (error) {
      localStorage.removeItem(PLAN_KEY);
    }
  }

  function readLlmForm() {
    return {
      enabled: $("#polish-enabled").checked,
      base: $("#llm-base").value.trim() || "https://api.openai.com/v1",
      model: $("#llm-model").value.trim() || "gpt-4o-mini",
      key: $("#llm-key").value.trim(),
      remember: $("#llm-remember").checked,
    };
  }

  function loadLlm() {
    var raw = null;
    try {
      raw = localStorage.getItem(LLM_KEY);
    } catch (error) {
      return;
    }
    if (!raw) {
      $("#llm-base").value = "https://api.openai.com/v1";
      $("#llm-model").value = "gpt-4o-mini";
      return;
    }
    try {
      var saved = JSON.parse(raw);
      $("#polish-enabled").checked = Boolean(saved.enabled);
      $("#llm-base").value = saved.base || "https://api.openai.com/v1";
      $("#llm-model").value = saved.model || "gpt-4o-mini";
      $("#llm-key").value = saved.key || "";
      $("#llm-remember").checked = Boolean(saved.key);
    } catch (error) {
      localStorage.removeItem(LLM_KEY);
    }
  }

  function storeLlm() {
    var cfg = readLlmForm();
    try {
      if (cfg.remember && cfg.key) {
        localStorage.setItem(
          LLM_KEY,
          JSON.stringify({ enabled: cfg.enabled, base: cfg.base, model: cfg.model, key: cfg.key })
        );
      } else {
        localStorage.removeItem(LLM_KEY);
      }
    } catch (error) {
      polishStatus.textContent = "This browser did not store the key. Polish can still run once.";
    }
  }

  function chatUrl(base) {
    var url;
    try {
      url = new URL(base);
    } catch (error) {
      return null;
    }
    var local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) return null;
    var path = url.pathname.replace(/\/$/, "");
    if (!/\/chat\/completions$/.test(path)) path += "/chat/completions";
    url.pathname = path;
    url.search = "";
    url.hash = "";
    return url.toString();
  }

  function polish(plan) {
    storeLlm();
    var cfg = readLlmForm();
    polishStatus.textContent = "";
    if (!cfg.enabled) return;
    if (!cfg.key) {
      polishStatus.textContent = "Add a key to polish the prose. The on-device plan is already saved.";
      return;
    }
    var endpoint = chatUrl(cfg.base);
    if (!endpoint) {
      polishStatus.textContent = "Use an https model address, or http://localhost.";
      return;
    }
    if (polishAbort) polishAbort.abort();
    polishAbort = new AbortController();
    var token = ++polishToken;
    polishStatus.textContent = "Polishing the brief…";
    var timeout = setTimeout(function () {
      polishAbort.abort();
    }, 12000);
    fetch(endpoint, {
      method: "POST",
      signal: polishAbort.signal,
      headers: {
        Authorization: "Bearer " + cfg.key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "Rewrite only the costume name and brief. Return JSON with keys conceptName and characterBrief. Keep the same idea, budget, and every safety sentence. Do not add weapons, blood, or a full-face covering. conceptName under 70 characters. characterBrief under 700 characters.",
          },
          {
            role: "user",
            content: JSON.stringify({
              conceptName: plan.conceptName,
              characterBrief: plan.characterBrief,
              occasion: plan.occasion,
              budget: plan.budget,
              materials: plan.materials.map(function (item) {
                return item.name;
              }),
            }),
          },
        ],
      }),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("The model request failed (" + response.status + ").");
        return response.json();
      })
      .then(function (data) {
        if (token !== polishToken || current !== plan) return;
        var content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        var parsed = parseModelJson(content);
        if (!parsed) throw new Error("The model did not return a usable brief.");
        if (parsed.conceptName && parsed.conceptName.length <= 70) plan.conceptName = parsed.conceptName;
        if (parsed.characterBrief && parsed.characterBrief.length <= 700) plan.characterBrief = parsed.characterBrief;
        plan.polished = true;
        renderPlan("Polished brief saved in this browser.");
        persist("Polished brief saved in this browser.");
        polishStatus.textContent = "The prose was polished. The checklist is unchanged.";
      })
      .catch(function (error) {
        if (token !== polishToken) return;
        if (error && error.name === "AbortError") {
          polishStatus.textContent = "Polish timed out. Showing the on-device brief.";
          return;
        }
        polishStatus.textContent = (error && error.message) || "Polish failed. Showing the on-device brief.";
      })
      .finally(function () {
        clearTimeout(timeout);
      });
  }

  function parseModelJson(content) {
    if (!content) return null;
    var text = String(content).trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try {
      var value = JSON.parse(text);
      return {
        conceptName: typeof value.conceptName === "string" ? value.conceptName.trim() : "",
        characterBrief: typeof value.characterBrief === "string" ? value.characterBrief.trim() : "",
      };
    } catch (error) {
      return null;
    }
  }

  document.getElementById("occasions").addEventListener("click", function (event) {
    var button = event.target.closest("[data-occasion]");
    if (!button) return;
    setPressed("[data-occasion]", "data-occasion", button.getAttribute("data-occasion"));
  });

  document.getElementById("vibes").addEventListener("click", function (event) {
    var button = event.target.closest("[data-vibe]");
    if (!button) return;
    var on = button.getAttribute("aria-pressed") === "true";
    if (!on && pressedValues("[data-vibe]", "data-vibe").length >= 3) {
      vibeHint.textContent = "Three is the maximum. Turn one off to change the mix.";
      return;
    }
    button.setAttribute("aria-pressed", on ? "false" : "true");
    var count = pressedValues("[data-vibe]", "data-vibe").length;
    vibeHint.textContent = count >= 3 ? "Three is the maximum. Turn one off to change the mix." : "Choose up to three.";
  });

  document.getElementById("skills").addEventListener("click", function (event) {
    var button = event.target.closest("[data-skill]");
    if (!button) return;
    setPressed("[data-skill]", "data-skill", button.getAttribute("data-skill"));
  });

  budget.addEventListener("input", function () {
    syncBudget(budget.value);
  });

  document.getElementById("presets").addEventListener("click", function (event) {
    var button = event.target.closest("[data-budget]");
    if (!button) return;
    syncBudget(button.getAttribute("data-budget"));
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    locks = null;
    variant = 0;
    craft();
  });

  document.getElementById("example").addEventListener("click", function () {
    showExample("Example plan, saved in this browser.");
    polish(current);
    var name = document.getElementById("concept-name");
    if (name) name.focus({ preventScroll: true });
  });

  document.getElementById("forget-key").addEventListener("click", function () {
    $("#llm-key").value = "";
    $("#llm-remember").checked = false;
    try {
      localStorage.removeItem(LLM_KEY);
    } catch (error) {
      /* Nothing stored. */
    }
    polishStatus.textContent = "The saved key is gone.";
  });

  function showExample(label) {
    applyInput({
      occasion: "party",
      vibes: ["spooky", "glam"],
      budget: 45,
      skill: "beginner",
      wearer: "Mina",
      notes: "a short cape",
      variant: 0,
    });
    locks = null;
    variant = 0;
    current = engine.generatePlan(readForm());
    checks = {};
    renderPlan(label);
    persist(label);
  }

  syncBudget(budget.value);
  loadLlm();
  restore();
  if (!current) showExample("Example plan, saved in this browser.");
})();
