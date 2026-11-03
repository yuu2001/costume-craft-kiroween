/*
 * CostumeCraft plan engine.
 *
 * Deterministic on purpose: the same occasion, vibes, budget, skill, notes,
 * and variation always return the same plan. The demo does not need a network
 * or an API key. An optional browser-side polish step may rewrite the prose
 * later; it must not change this checklist, the costs, or the steps.
 *
 * The catalog and the selection rules are the contract in
 * .kiro/specs/costume-planner.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) root.CostumeEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const OCCASIONS = {
    party: {
      label: "Party",
      promise: "Readable across a crowded room",
      safety:
        "Leave room to walk, dance, and fit through a doorway, and keep hems off the floor.",
    },
    cosplay: {
      label: "Cosplay",
      promise: "A character you can explain in one sentence",
      safety:
        "The silhouette should be recognizable in a photo taken from ten feet away, and you should still be able to walk a convention floor.",
    },
    kids: {
      label: "Kids",
      promise: "Soft, cool, and easy to take off",
      safety:
        "Keep the face visible, skip small detachable pieces, and make sure an adult handles any glue or sharp tools.",
    },
    office: {
      label: "Office",
      promise: "Still comfortable in a meeting",
      safety:
        "Keep the face visible, keep the floor clear, and make the loudest piece easy to take off for a video call.",
    },
  };

  const SKILLS = {
    beginner: {
      label: "Beginner",
      hint: "Glue, scissors, safety pins",
      voice: "Every step is glue, scissors, safety pins, or something already in the closet.",
    },
    intermediate: {
      label: "Intermediate",
      hint: "Hand sewing, simple structure",
      voice: "A needle and thread show up, but nothing needs a sewing machine.",
    },
    advanced: {
      label: "Advanced",
      hint: "Patterning, dye, small lights",
      voice: "This version earns its shape with structure, dye, or a small light.",
    },
  };

  const SKILL_RANK = { beginner: 0, intermediate: 1, advanced: 2 };

  const VIBES = [
    { id: "spooky", label: "Spooky" },
    { id: "glam", label: "Glam" },
    { id: "funny", label: "Funny" },
    { id: "vintage", label: "Vintage" },
    { id: "futuristic", label: "Futuristic" },
    { id: "cozy", label: "Cozy" },
    { id: "regal", label: "Regal" },
    { id: "chaotic", label: "Chaotic" },
    { id: "elegant", label: "Elegant" },
    { id: "neon", label: "Neon" },
    { id: "woodland", label: "Woodland" },
    { id: "nautical", label: "Nautical" },
  ];

  const PALETTE_HEX = {
    ink: "#241833",
    ember: "#ff7a2f",
    bone: "#f3e6d0",
    soot: "#2c262b",
    gold: "#e6c27a",
    oxblood: "#7a2e3a",
    sequin: "#f2c14e",
    violet: "#6e4b8a",
    blush: "#e7a0b4",
    cream: "#f6efe4",
    moss: "#7ea86a",
    fern: "#1f3d32",
    cocoa: "#6b4634",
    signal: "#7ec8c3",
    night: "#141826",
    copper: "#c47a4a",
    paper: "#efe4d2",
    tide: "#1f4d5c",
    foam: "#d7ece8",
    amber: "#e8a317",
    lilac: "#c7b4e3",
    denim: "#2f3e56",
    citrus: "#f0d15a",
    rose: "#c45b78",
  };

  const WHERE_LABEL = {
    closet: "Already own",
    thrift: "Thrift",
    craft: "Craft store",
    drugstore: "Drugstore",
    hardware: "Hardware",
  };

  function motifItem(partial) {
    return Object.assign(
      {
        tier: "signature",
        minSkill: "beginner",
        where: "craft",
      },
      partial
    );
  }

  const MOTIFS = {
    spooky: {
      label: "Spooky",
      adj: "Grave-lantern",
      sentence: "Use one practical warm light and a small black feather cluster, not a scream mask.",
      accent: "The spooky accent stays quiet: smoke-colored cloth, not a scream mask.",
      palette: ["ink", "ember", "bone"],
      item: motifItem({
        name: "Tea light in a jar, plus three black craft feathers",
        short: "lantern and feathers",
        cost: 5,
        note: "Cluster the feathers on one side only. The jar stays in a hand or a pocket, never on a hem.",
        how: "Glue three black feathers to one side of the collar or badge. Carry a battery tea light in a small jar so the glow is real and cool to the touch.",
      }),
    },
    glam: {
      label: "Glam",
      adj: "Sequined",
      sentence: "One dense patch of shine beats a costume that glitters everywhere.",
      accent: "The glam accent is one place the light can catch, not shine on every surface.",
      palette: ["sequin", "violet", "blush"],
      item: motifItem({
        name: "Sequin trim or an iron-on sequin patch",
        short: "sequin patch",
        cost: 6,
        note: "A cuff, a lapel, or a mask edge. Not the whole outfit.",
        how: "Attach sequin trim along one edge only: a cuff, a collar, or a sash. Fabric glue is enough if you let it dry flat.",
      }),
    },
    funny: {
      label: "Funny",
      adj: "Name-tag",
      sentence: "The joke should be readable in a name tag or a label, without a punchline that needs explaining twice.",
      accent: "The funny accent should be readable at a glance, then get out of the way.",
      palette: ["citrus", "denim", "cream"],
      item: motifItem({
        name: "Cardstock name tag and a bold marker",
        short: "name tag",
        cost: 3,
        where: "drugstore",
        note: "Write the character's job, not a paragraph.",
        how: "Cut a name tag, write the character's title in thick letters, and pin it where a coworker or a host will actually read it.",
      }),
    },
    vintage: {
      label: "Vintage",
      adj: "Sepia",
      sentence: "Age one cloth edge with tea so the piece looks kept, not chewed.",
      accent: "The vintage accent should feel kept and handled, not chewed up.",
      palette: ["cocoa", "paper", "oxblood"],
      item: motifItem({
        name: "Black tea and a scrap of lace or cotton",
        short: "tea-stained trim",
        cost: 4,
        where: "drugstore",
        note: "Stain a trim, not your best shirt, unless you mean to.",
        how: "Soak lace or a cotton strip in strong black tea, let it dry flat, then stitch or safety-pin it to a cuff.",
      }),
    },
    futuristic: {
      label: "Futuristic",
      adj: "Low-orbit",
      sentence: "A pale panel and a simple geometric mark read as equipment, not as a logo pile.",
      accent: "The futuristic accent is a clean edge, as if the piece was issued.",
      palette: ["night", "signal", "bone"],
      item: motifItem({
        name: "White foam sheet or poster board panel",
        short: "panel",
        cost: 5,
        note: "One chest panel or bracer. Keep corners smooth.",
        how: "Cut a single rectangle with clipped corners, edge it with dark tape, and pin it on like issued gear. Sand or tape any sharp corner before it is worn.",
      }),
    },
    cozy: {
      label: "Cozy",
      adj: "Hearth",
      sentence: "Warm texture does the work: knit, felt, or a blanket you already like.",
      accent: "The cozy accent is warmth you would actually want to wear.",
      palette: ["cocoa", "amber", "cream"],
      item: motifItem({
        name: "Felt scraps or a knit scarf you already own",
        short: "warm texture",
        cost: 4,
        note: "If the scarf is already yours, treat the cost as zero at the register and keep the $4 as backup felt.",
        how: "Drape a knit scarf, or cut simple felt shapes and glue them to a paper backing so they do not curl. For a kids' costume, an adult does the glue.",
      }),
    },
    regal: {
      label: "Regal",
      adj: "Wax-seal",
      sentence: "A gold accent and a straight posture line beat a plastic crown.",
      accent: "The regal accent is one gold note and a straighter line.",
      palette: ["gold", "oxblood", "ink"],
      item: motifItem({
        name: "Gold wax-seal stickers or gold ribbon",
        short: "gold seal",
        cost: 4,
        note: "Stickers are the beginner path. Ribbon is the version you can tie.",
        how: "Place three gold seals in a short column, or tie a gold ribbon as a sash. Stop at three. More starts to look like wrapping paper.",
      }),
    },
    chaotic: {
      label: "Chaotic",
      adj: "Mismatched",
      sentence: "Mismatch one pair on purpose: two socks, two buttons, or a collar from another shirt.",
      accent: "The chaotic accent is a single mismatch. The rest of the costume stays coherent.",
      palette: ["ember", "lilac", "denim"],
      item: motifItem({
        name: "Safety pins and one contrasting button or sock",
        short: "mismatch",
        cost: 3,
        where: "closet",
        note: "Cost stays low because this should come from a drawer.",
        how: "Pin one contrasting piece where it is obvious: a mismatched cuff, a bright sock over tights, or a button that does not match the placket.",
      }),
    },
    elegant: {
      label: "Elegant",
      adj: "Calligraphy",
      sentence: "A clean line of black cloth plus one written or drawn mark looks considered.",
      accent: "The elegant accent keeps the palette quiet.",
      palette: ["bone", "ink", "gold"],
      item: motifItem({
        name: "Black archival pen and a cream card or cuff",
        short: "lettered mark",
        cost: 4,
        where: "drugstore",
        note: "A short word. A motto, a house name, or the character's title.",
        how: "Letter one short word on a cream card or along a cuff. Practice on scrap first. If the line wobbles, cover it with a thin black ribbon and letter the card instead.",
      }),
    },
    neon: {
      label: "Neon",
      adj: "After-hours",
      sentence: "Glow tape on an edge is brighter, and cheaper, than a full light-up suit.",
      accent: "The neon accent is an edge that still reads in a dark room.",
      palette: ["night", "citrus", "rose"],
      item: motifItem({
        name: "Glow tape or a short string of battery LEDs",
        short: "glow edge",
        cost: 7,
        note: "Tape is the reliable version. LEDs are optional and should be battery, not plug-in.",
        how: "Press glow tape along one collar edge, cuff, or panel border. If you add battery LEDs, tape the pack inside a pocket and keep wires off the skin.",
      }),
    },
    woodland: {
      label: "Woodland",
      adj: "Moss-crown",
      sentence: "Leaves, felt moss, or a paper fern read clearly and stay soft.",
      accent: "The woodland accent is soft and botanical, not a pile of props.",
      palette: ["fern", "moss", "copper"],
      item: motifItem({
        name: "Green felt, paper leaves, or a fabric vine",
        short: "leaf collar",
        cost: 5,
        note: "Soft edges only. No wire that can poke.",
        how: "Cut a short collar of leaves from felt or paper and attach it to a soft headband or a neckline. Round every point. For kids, stitch or glue it down so it cannot come off in a hand.",
      }),
    },
    nautical: {
      label: "Nautical",
      adj: "Storm-glass",
      sentence: "Rope, a stripe, and a small compass mark do more than a full sailor suit.",
      accent: "The nautical accent reads as weather and navigation.",
      palette: ["tide", "foam", "copper"],
      item: motifItem({
        name: "Cotton rope or white ribbon, plus a paper compass",
        short: "rope and compass",
        cost: 5,
        where: "hardware",
        note: "Ribbon is the soft substitute if rope feels too bulky.",
        how: "Belt the waist with cotton rope or white ribbon and pin a hand-drawn compass at the hip. Tape the rope ends so they do not unravel.",
      }),
    },
  };

  const EXTRA_MOTIFS = {
    party: ["glam", "cozy", "chaotic"],
    cosplay: ["futuristic", "regal", "vintage"],
    kids: ["cozy", "funny", "woodland"],
    office: ["elegant", "funny", "vintage"],
  };

  function material(partial) {
    return partial;
  }

  const CONCEPTS = [
    {
      id: "doorway-phantom",
      occasions: ["party"],
      vibes: ["spooky", "elegant", "vintage"],
      baseName: "Doorway Phantom",
      role: "the guest who looks like the house sent someone to open the door",
      read: "a tall dark column, a stiff collar, and one warm metallic mark",
      palette: ["soot", "gold", "oxblood"],
      opener:
        "Press the darkest clothes you own so the body of the costume is a clean column before you add a single craft piece.",
      finale:
        "Stand in a doorway with the hall light behind you. If the collar reads and you can still dance, stop adding things.",
      materials: [
        material({
          name: "Dark top and trousers or a long skirt you can move in",
          short: "dark base",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "This is the foundation. Spend the budget on the silhouette, not a new black shirt.",
          how: "Choose clothes you can sit and walk in. Steam or press them so the cape has a smooth base.",
        }),
        material({
          name: "Long black outer layer (robe, duster, or maxi)",
          short: "outer layer",
          cost: 14,
          tier: "essential",
          minSkill: "beginner",
          where: "thrift",
          note: "It should close with a tie, buttons, or pins so you are not holding it shut.",
          how: "Thrift a black robe, duster, or maxi dress. Shorten a dangerous hem with safety pins on the inside.",
        }),
        material({
          name: "Poster board and black fabric for a stand collar",
          short: "stand collar",
          cost: 6,
          tier: "essential",
          minSkill: "beginner",
          where: "craft",
          note: "About three inches tall. Tall enough to read, short enough to turn your head.",
          how: "Cut a collar band from poster board, wrap it in black fabric, and pin it into the neckline. Cover the raw board edge with tape before it touches skin.",
        }),
        material({
          name: "Shoulder-length cheesecloth or tulle veil",
          short: "veil",
          cost: 4,
          tier: "signature",
          minSkill: "beginner",
          where: "craft",
          note: "Stop at the shoulders so it never crosses the mouth while you talk.",
          how: "Gather the veil at two points and pin it behind the collar. It frames the face. It does not cover it.",
        }),
        material({
          name: "Black gloves",
          short: "gloves",
          cost: 5,
          tier: "flourish",
          minSkill: "intermediate",
          where: "thrift",
          note: "Optional once the collar already reads.",
          how: "If the gloves are too long, fold the cuff once and tack it with a few stitches.",
        }),
      ],
    },
    {
      id: "disco-banshee",
      occasions: ["party"],
      vibes: ["glam", "neon", "chaotic", "funny"],
      baseName: "Disco Banshee",
      role: "the friend who arrived as both the party and the warning about the party",
      read: "a pale layer, one slash of shine, and hair or fabric that moves when you dance",
      palette: ["violet", "sequin", "blush"],
      opener:
        "Start with the most comfortable all-black or all-white outfit you can dance in for two hours.",
      finale:
        "Film a three-second spin in the darkest corner of the room. If the shiny edge flashes once, the costume is finished.",
      materials: [
        material({
          name: "Comfortable monochrome outfit you can dance in",
          short: "dance base",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "Sneakers are allowed. This is a party, not a fitting.",
          how: "Pick the outfit you would wear if the costume layer came off at midnight.",
        }),
        material({
          name: "Sheer white or silver scarf",
          short: "sheer scarf",
          cost: 6,
          tier: "essential",
          minSkill: "beginner",
          where: "thrift",
          note: "Long enough to trail an arm, not the floor.",
          how: "Safety-pin the scarf to one shoulder seam so it streams when you move and does not slide into your drink.",
        }),
        material({
          name: "Ribbon or fabric for a quick sash",
          short: "sash",
          cost: 4,
          tier: "signature",
          minSkill: "beginner",
          where: "craft",
          note: "Tie it so the knot sits at the side, not the front of your knees.",
          how: "Tie the sash at the natural waist and pin the knot. Clip the ends above the ankle.",
        }),
        material({
          name: "Clip-in tinsel or a metallic hair piece",
          short: "hair flash",
          cost: 5,
          tier: "flourish",
          minSkill: "intermediate",
          where: "drugstore",
          note: "One clip. A whole wig is a different project.",
          how: "Clip the tinsel where your hair already has volume. Skip it if it pulls.",
        }),
      ],
    },
    {
      id: "lantern-host",
      occasions: ["party"],
      vibes: ["cozy", "regal", "woodland"],
      baseName: "Lantern Host",
      role: "the person guests look for when they want to know where the good snacks are",
      read: "a warm wrap, a small light, and a gold or leaf-colored accent",
      palette: ["amber", "cocoa", "fern"],
      opener: "Choose a layer you would actually host in. Comfort is the character.",
      finale:
        "Hold the light at chest height and check a photo. Warm face, visible eyes, no cord on the floor.",
      materials: [
        material({
          name: "Knit layer or jacket in brown, rust, or cream",
          short: "host layer",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "A cardigan is a complete costume base if the details are specific.",
          how: "Press the collar and empty the pockets so the costume details have somewhere to live.",
        }),
        material({
          name: "Battery lantern or a jar tea light",
          short: "lantern",
          cost: 8,
          tier: "essential",
          minSkill: "beginner",
          where: "hardware",
          note: "Battery only. No open flame on a costume.",
          how: "Use a battery lantern small enough for one hand. Tie a short ribbon to the handle so it looks kept, not borrowed from the garage.",
        }),
        material({
          name: "Wide fabric belt or a thrift sash",
          short: "belt",
          cost: 5,
          tier: "signature",
          minSkill: "beginner",
          where: "thrift",
          note: "This creates the waist so the knit layer does not read as pajamas.",
          how: "Belt the layer at the waist. If the belt is plain, the motif item goes on the buckle line.",
        }),
        material({
          name: "Felt leaves or a thrift silk flower",
          short: "flower",
          cost: 4,
          tier: "flourish",
          minSkill: "intermediate",
          where: "craft",
          note: "One bloom at the belt is the stop point.",
          how: "Stitch the flower to the belt so it survives a hug. Glue is the backup if the belt is not sewable.",
        }),
      ],
    },
    {
      id: "archive-oracle",
      occasions: ["cosplay"],
      vibes: ["vintage", "elegant", "spooky"],
      baseName: "Archive Oracle",
      role: "an original character who files the future in paper and ink",
      read: "a long coat, a labeled folio, and cuffs that look handled",
      palette: ["paper", "ink", "cocoa"],
      opener:
        "Build the scholar first. The strange part is only a folio and a marked cuff.",
      finale:
        "Close the folio and walk ten feet from a friend. If they can tell you are carrying an archive, the build is done.",
      materials: [
        material({
          name: "Long coat, cardigan, or shirt-dress in a muted color",
          short: "coat",
          cost: 16,
          tier: "essential",
          minSkill: "beginner",
          where: "thrift",
          note: "Knee length or longer. Neutral colors photograph as costume faster than logos.",
          how: "Thrift the longest plain coat you can move your arms in. Remove loud tags and loose belts you will not use.",
        }),
        material({
          name: "Two sheets of cream cardstock and black ribbon",
          short: "folio",
          cost: 5,
          tier: "essential",
          minSkill: "beginner",
          where: "craft",
          note: "This is the prop. It should close.",
          how: "Fold cardstock into a folio, tie the spine with black ribbon, and letter a short title on the cover. Put nothing heavy inside.",
        }),
        material({
          name: "White shirt you already own",
          short: "shirt",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "Cuffs should show past the coat by about an inch.",
          how: "Roll or extend the cuffs so they become the place the motif mark will sit.",
        }),
        material({
          name: "Ink pen for margin marks",
          short: "pen",
          cost: 3,
          tier: "signature",
          minSkill: "beginner",
          where: "drugstore",
          note: "Also a useful real pen for the day.",
          how: "Draw three short ticks on the cuff or folio. They should look like a catalog system, not doodles.",
        }),
        material({
          name: "Tea-dyed handkerchief",
          short: "handkerchief",
          cost: 3,
          tier: "flourish",
          minSkill: "advanced",
          where: "closet",
          note: "Dye a scrap, not a favorite.",
          how: "Soak a white scrap in black tea, dry it, and tuck it into the folio as a bookmark.",
        }),
      ],
    },
    {
      id: "signal-warden",
      occasions: ["cosplay"],
      vibes: ["futuristic", "neon", "nautical"],
      baseName: "Signal Warden",
      role: "an original character who keeps a night route from going dark",
      read: "a hard chest panel, a pale stripe, and one light along an edge",
      palette: ["night", "signal", "foam"],
      opener: "Use dark plain clothes so the panel is the character, not the logos on a tee.",
      finale:
        "Turn the room light off once. The edge should still describe the shoulders.",
      materials: [
        material({
          name: "Dark fitted layer without visible logos",
          short: "base layer",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "Long sleeves help if the panel is sleeveless-looking.",
          how: "Pick a dark shirt you can lift your arms in. The panel will ride on the chest, so the neckline should be simple.",
        }),
        material({
          name: "Poster board or craft foam chest panel",
          short: "chest panel",
          cost: 6,
          tier: "essential",
          minSkill: "beginner",
          where: "craft",
          note: "About the size of a large book. Bigger fights backpack straps.",
          how: "Cut a rectangle with clipped corners, pad the back with fabric, and strap it on with ribbon over the shoulders. Tape every raw edge.",
        }),
        material({
          name: "White or silver tape for a signal stripe",
          short: "stripe",
          cost: 4,
          tier: "signature",
          minSkill: "beginner",
          where: "hardware",
          note: "One stripe down the panel, or one band on a sleeve.",
          how: "Lay a single straight stripe. Use a ruler. A crooked stripe reads as a mistake, not as weather.",
        }),
        material({
          name: "Clear vinyl or a thrift belt for straps",
          short: "straps",
          cost: 4,
          tier: "signature",
          minSkill: "intermediate",
          where: "thrift",
          note: "The panel has to survive walking.",
          how: "Attach two shoulder straps and one waist strap. Walk a hallway before you call it done.",
        }),
        material({
          name: "Battery LED coin lights",
          short: "coin lights",
          cost: 8,
          tier: "flourish",
          minSkill: "advanced",
          where: "hardware",
          note: "Two lights are plenty.",
          how: "Tape coin lights to the panel edge with the switch reachable. No wire crosses the neck.",
        }),
      ],
    },
    {
      id: "thorn-knight",
      occasions: ["cosplay"],
      vibes: ["regal", "woodland", "glam"],
      baseName: "Thorn Knight",
      role: "an original knight whose armor is grown, not forged",
      read: "a leaf-shaped chest piece, a sash, and a soft crown of points",
      palette: ["fern", "gold", "oxblood"],
      opener: "A plain dark outfit is the armor under the armor. Do not start by buying metallic fabric.",
      finale:
        "Raise one arm as if you are holding a banner. If the chest piece stays put, the straps are right.",
      materials: [
        material({
          name: "Dark clothes with long lines",
          short: "dark clothes",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "Boots you can walk in matter more than a toy sword. This build does not include a weapon.",
          how: "Use dark pants and a dark top. Set aside anything with a sport logo.",
        }),
        material({
          name: "Craft foam or poster board for a leaf chest piece",
          short: "chest piece",
          cost: 8,
          tier: "essential",
          minSkill: "beginner",
          where: "craft",
          note: "A single leaf plate, not a full suit.",
          how: "Cut a leaf wider than your ribcage, round every tip, cover the back with fabric, and strap it on. No point should be stiff enough to jab.",
        }),
        material({
          name: "Wide ribbon sash",
          short: "sash",
          cost: 4,
          tier: "signature",
          minSkill: "beginner",
          where: "craft",
          note: "Color can carry the house or the court.",
          how: "Cross the sash from shoulder to hip and stitch or pin the overlap so it cannot unwind.",
        }),
        material({
          name: "Soft headband and felt points",
          short: "crown",
          cost: 5,
          tier: "signature",
          minSkill: "intermediate",
          where: "craft",
          note: "Points stay short, under two inches, and soft.",
          how: "Glue felt triangles to a headband with an adult on the glue if this is for a child. Curve them so they lean, not stab.",
        }),
        material({
          name: "Acrylic paint for a vein line",
          short: "vein line",
          cost: 4,
          tier: "flourish",
          minSkill: "advanced",
          where: "craft",
          note: "One color. Let it dry before it is worn.",
          how: "Paint a single vein from the stem of the leaf plate to the tip. Dry it flat overnight.",
        }),
      ],
    },
    {
      id: "pumpkin-page",
      occasions: ["kids"],
      vibes: ["cozy", "funny", "woodland"],
      baseName: "Pumpkin Page",
      role: "a storybook pumpkin who has a job, a stem hat, and somewhere to be",
      read: "an orange belly, a green stem, and a face that is still your kid's face",
      palette: ["ember", "moss", "cream"],
      opener:
        "Use soft clothes they already like. If they will not wear it on a normal day, they will not wear it for a parade.",
      finale:
        "Have them sit, reach up, and pull the costume off once in a rehearsal. If any of that is a fight, simplify.",
      materials: [
        material({
          name: "Orange, rust, or brown sweats they already wear",
          short: "soft sweats",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "Comfort is not optional on a kids' costume.",
          how: "Pick a soft set that survives sitting on the floor. Empty the pockets.",
        }),
        material({
          name: "Orange felt belly panel",
          short: "belly panel",
          cost: 6,
          tier: "essential",
          minSkill: "beginner",
          where: "craft",
          note: "Big enough to read, light enough to forget.",
          how: "Cut a circle or a rounded square. An adult glues or stitches it to the front of the shirt so a child cannot pull it free.",
        }),
        material({
          name: "Green felt stem on a soft hat or headband",
          short: "stem hat",
          cost: 5,
          tier: "essential",
          minSkill: "beginner",
          where: "craft",
          note: "The stem is stuffed felt, not cardboard tube.",
          how: "Roll green felt into a short stem, stitch it closed, and sew it to a beanie or soft headband. No pins left in the hat.",
        }),
        material({
          name: "Washable face-paint stick, two colors",
          short: "face paint",
          cost: 6,
          tier: "signature",
          minSkill: "beginner",
          where: "drugstore",
          note: "Cheeks and a nose. Eyes and mouth stay easy to wipe and fully visible.",
          how: "An adult paints two round cheeks and a small nose. Skip designs that cover the eyes. Pack wipes.",
        }),
        material({
          name: "Fabric leaves at the shoulders",
          short: "leaf shoulders",
          cost: 4,
          tier: "flourish",
          minSkill: "intermediate",
          where: "craft",
          note: "Stitch them down. Loose leaves become litter.",
          how: "An adult stitches two soft leaves to the shoulders. Tug-test them.",
        }),
      ],
    },
    {
      id: "moon-moth",
      occasions: ["kids"],
      vibes: ["elegant", "glam", "spooky"],
      baseName: "Moon Moth",
      role: "a pale moth who is gentle in pictures and easy to hug",
      read: "soft wings, a light cape, and antennae that bend instead of poke",
      palette: ["cream", "lilac", "gold"],
      opener: "Wings are the costume. Everything else should feel like ordinary soft clothes.",
      finale:
        "Ask them to hug a grown-up. If the wings bend and stay on, the scale is right.",
      materials: [
        material({
          name: "Pale shirt and leggings or sweats",
          short: "pale clothes",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "Layers they can cool down in.",
          how: "Choose breathable clothes. Wings trap heat, so skip a heavy coat underneath.",
        }),
        material({
          name: "Felt or fleece wings on a ribbon harness",
          short: "soft wings",
          cost: 10,
          tier: "essential",
          minSkill: "beginner",
          where: "craft",
          note: "Shorter than their arm span. No wire.",
          how: "Cut two simple wing shapes from felt. An adult sews them to a ribbon that crosses the chest and ties at the waist. Round every tip.",
        }),
        material({
          name: "Pipe-cleaner-free antennae: stuffed ribbon on a headband",
          short: "soft antennae",
          cost: 4,
          tier: "essential",
          minSkill: "beginner",
          where: "craft",
          note: "If it can poke an eye, it does not go on a child.",
          how: "Sew two short stuffed ribbon stalks to a soft headband. They should flop. Test them against your own cheek.",
        }),
        material({
          name: "Pale cape or a large scarf",
          short: "cape",
          cost: 6,
          tier: "signature",
          minSkill: "beginner",
          where: "thrift",
          note: "Optional if the wings are already clear.",
          how: "Pin the scarf at the shoulders with covered stitches, not open safety pins.",
        }),
        material({
          name: "Pearl buttons or paper moons",
          short: "moon marks",
          cost: 3,
          tier: "flourish",
          minSkill: "intermediate",
          where: "craft",
          note: "Sew them. Do not glue loose buttons onto a child's costume.",
          how: "An adult sews three pale buttons or felt moons onto one wing.",
        }),
      ],
    },
    {
      id: "star-boat-captain",
      occasions: ["kids"],
      vibes: ["nautical", "futuristic", "neon"],
      baseName: "Star-boat Captain",
      role: "a small captain whose boat sails a night sky instead of a harbor",
      read: "a soft hat, a stripe, and a paper boat or compass they can hold",
      palette: ["tide", "citrus", "foam"],
      opener: "Navy or white clothes from their drawer beat a scratchy costume suit.",
      finale:
        "Let them carry the paper boat while they walk and sit. If they drop it, it should not break into sharp bits.",
      materials: [
        material({
          name: "Navy, white, or striped clothes they like",
          short: "crew clothes",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "A striped tee is already half the costume.",
          how: "Pick the set they will not argue about. Comfort wins over accuracy.",
        }),
        material({
          name: "Soft captain hat or a folded paper hat on a headband",
          short: "soft hat",
          cost: 6,
          tier: "essential",
          minSkill: "beginner",
          where: "craft",
          note: "If you fold paper, tape every edge and mount it on a soft band.",
          how: "Use a soft hat if you have one. Otherwise fold cardstock, tape all edges, and staple it to a headband with the metal covered in tape.",
        }),
        material({
          name: "White ribbon rank stripe",
          short: "rank stripe",
          cost: 3,
          tier: "signature",
          minSkill: "beginner",
          where: "craft",
          note: "One stripe on a cuff or a sash.",
          how: "An adult stitches or fabric-glues a white stripe to one cuff.",
        }),
        material({
          name: "Paper boat reinforced with tape",
          short: "paper boat",
          cost: 2,
          tier: "signature",
          minSkill: "beginner",
          where: "closet",
          note: "A held prop, not something pinned to the face.",
          how: "Fold a paper boat, tape the seams, and draw three stars on the sail. No pins.",
        }),
        material({
          name: "Glow tape on the hat brim",
          short: "brim glow",
          cost: 5,
          tier: "flourish",
          minSkill: "intermediate",
          where: "craft",
          note: "A thin strip only.",
          how: "Press one strip of glow tape along the brim edge after the hat is stable.",
        }),
      ],
    },
    {
      id: "desk-cryptid",
      occasions: ["office"],
      vibes: ["funny", "spooky", "chaotic"],
      baseName: "Desk Cryptid",
      role: "a coworker who is slightly too prepared with a field guide to office wildlife",
      read: "normal work clothes, a sighting badge, and one small un-human detail",
      palette: ["denim", "moss", "cream"],
      opener: "Wear a real work outfit. The costume is a layer you can take off before a client call.",
      finale:
        "Sit at a desk and type a sentence. If the costume touches the keyboard, it is too much.",
      materials: [
        material({
          name: "Your normal work outfit",
          short: "work outfit",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "If it would get a comment on a random Tuesday, save it for a party costume instead.",
          how: "Dress for the actual office. The plan adds labels and one soft oddity, not a new wardrobe.",
        }),
        material({
          name: "Laminated or sleeved sighting badge",
          short: "badge",
          cost: 2,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "A paper badge in a sleeve you already have.",
          how: "Write 'Field note: desk cryptid, mostly harmless' on cardstock and slip it into a badge sleeve under your real ID, or beside it if policy requires the real badge to stay readable.",
        }),
        material({
          name: "Soft felt horns or ears on a thin headband",
          short: "soft horns",
          cost: 5,
          tier: "signature",
          minSkill: "beginner",
          where: "craft",
          note: "Short and floppy. Easy to pull off for a meeting.",
          how: "Glue two small felt shapes to a headband and let them dry before they touch hair. Keep them under two inches.",
        }),
        material({
          name: "Odd-colored cardigan or scarf",
          short: "odd layer",
          cost: 10,
          tier: "signature",
          minSkill: "beginner",
          where: "thrift",
          note: "This is the removable layer.",
          how: "Thrift one cardigan in a color you would not wear to a board review. It comes off in one motion.",
        }),
        material({
          name: "Blank sticker labels for a mug",
          short: "mug label",
          cost: 3,
          tier: "flourish",
          minSkill: "intermediate",
          where: "drugstore",
          note: "Label the mug, not anyone else's.",
          how: "Write 'specimen mug' on a label and put it on your own cup.",
        }),
      ],
    },
    {
      id: "meeting-regent",
      occasions: ["office"],
      vibes: ["regal", "elegant", "vintage"],
      baseName: "Meeting Regent",
      role: "a monarch whose court is a calendar and whose crown is a lapel pin",
      read: "a sharp work outfit, a sash you can hide, and one gold mark",
      palette: ["ink", "gold", "bone"],
      opener: "Tailoring does more than velvet. Use the nicest work clothes you already have.",
      finale:
        "Join a video preview. Your face is clear, and the sash can disappear below the frame.",
      materials: [
        material({
          name: "The sharpest work outfit you own",
          short: "work outfit",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "Pressed. That is the regal part people actually notice.",
          how: "Press the collar and the front. Empty the pockets.",
        }),
        material({
          name: "Thin ribbon sash in gold, burgundy, or black",
          short: "thin sash",
          cost: 4,
          tier: "essential",
          minSkill: "beginner",
          where: "craft",
          note: "Narrow enough to hide under a blazer.",
          how: "Pin a narrow sash from shoulder to hip, under the jacket if you need to look ordinary on camera.",
        }),
        material({
          name: "Gold pin, wax seal sticker, or brooch",
          short: "gold pin",
          cost: 5,
          tier: "signature",
          minSkill: "beginner",
          where: "thrift",
          note: "One pin. A crown is the wrong scale for a meeting.",
          how: "Place a single gold mark on the lapel. If it is a sticker, press it onto a card you can remove.",
        }),
        material({
          name: "Cream pocket square or printed handkerchief",
          short: "pocket square",
          cost: 0,
          tier: "signature",
          minSkill: "intermediate",
          where: "closet",
          note: "Skip if your outfit has no pocket. Do not safety-pin it to a sweater.",
          how: "Fold a straight line. The fold should look calm, not like a costume flower.",
        }),
        material({
          name: "Fountain pen or any dark pen you like",
          short: "pen",
          cost: 0,
          tier: "flourish",
          minSkill: "advanced",
          where: "closet",
          note: "A real tool is a better prop than plastic jewelry.",
          how: "Carry the pen in the breast pocket or notebook. It is in the costume because you will actually use it.",
        }),
      ],
    },
    {
      id: "quiet-comet",
      occasions: ["office"],
      vibes: ["futuristic", "cozy", "neon"],
      baseName: "Quiet Comet",
      role: "a visitor from a calmer timeline who still has a standup to attend",
      read: "everyday clothes, a pale collar mark, and a tiny glow that switches off",
      palette: ["night", "signal", "lilac"],
      opener: "If the costume cannot survive a sweater and a laptop bag, it is a party costume. Scale it down.",
      finale: "Flip the glow off. What remains should still look like you, on purpose.",
      materials: [
        material({
          name: "Comfortable office layers in black, grey, or cream",
          short: "office layers",
          cost: 0,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "The clothes are not the joke. The mark is.",
          how: "Wear what you would wear to a real day at work.",
        }),
        material({
          name: "Pale collar tab cut from cardstock",
          short: "collar tab",
          cost: 2,
          tier: "essential",
          minSkill: "beginner",
          where: "closet",
          note: "A small tab behind the collar, removable.",
          how: "Cut a small rounded tab, letter a tiny star on it, and pin it inside the collar so only a crescent shows.",
        }),
        material({
          name: "Soft knit in an unusual pale color",
          short: "pale knit",
          cost: 12,
          tier: "signature",
          minSkill: "beginner",
          where: "thrift",
          note: "Optional second layer for offices that run cold.",
          how: "Thrift a pale cardigan with no logo. It is the comet's tail only because the color is slightly off for you.",
        }),
        material({
          name: "One battery coin light in a pocket",
          short: "pocket light",
          cost: 4,
          tier: "flourish",
          minSkill: "intermediate",
          where: "hardware",
          note: "It has to switch off for meetings.",
          how: "Drop a coin light into a shirt pocket. Tape it only if the pocket is deep enough that the light cannot fall onto the desk.",
        }),
      ],
    },
  ];

  const NOTE_ITEMS = [
    {
      re: /\b(hats?|caps?|beanies?|crowns?)\b/i,
      item: {
        name: "Hat, cap, or soft crown from your note",
        short: "noted hat",
        cost: 6,
        tier: "signature",
        minSkill: "beginner",
        where: "thrift",
        note: "Added because your note asked for a hat or crown.",
        how: "Use a hat you can take off with one hand. If it is a crown, make it from felt or paper with rounded points, not stiff spikes.",
      },
    },
    {
      re: /\b(capes?|cloaks?)\b/i,
      item: {
        name: "Short cape or cloak from your note",
        short: "noted cape",
        cost: 8,
        tier: "signature",
        minSkill: "beginner",
        where: "thrift",
        note: "Added because your note asked for a cape. Kept above the ankles.",
        how: "Use a short cape, a large scarf, or a half-yard of fabric pinned at the shoulders. Hem it so it clears the floor.",
      },
    },
    {
      re: /\b(wings?)\b/i,
      item: {
        name: "Soft wings from your note",
        short: "noted wings",
        cost: 10,
        tier: "signature",
        minSkill: "beginner",
        where: "craft",
        note: "Felt or fabric only. No wire frames in this planner.",
        how: "Cut soft wings and attach them with a ribbon harness. Round the tips and tug-test the straps.",
      },
    },
    {
      re: /\b(glasses|spectacles|sunglasses)\b/i,
      item: {
        name: "Glasses from your note",
        short: "noted glasses",
        cost: 4,
        tier: "signature",
        minSkill: "beginner",
        where: "thrift",
        note: "Clear lenses keep the face readable.",
        how: "Use costume glasses with the lenses left in, or your own frames. Do not cover the eyes with opaque material.",
      },
    },
    {
      re: /\b(boots?)\b/i,
      item: {
        name: "Boots you can actually walk in",
        short: "noted boots",
        cost: 0,
        tier: "signature",
        minSkill: "beginner",
        where: "closet",
        note: "Added from your note. New boots are a poor costume spend if you have to break them in tonight.",
        how: "Wear the most costume-adjacent boots you can still commute in. Polish or wipe them. Do not buy a heel you cannot dance in.",
      },
    },
    {
      re: /\b(gloves?)\b/i,
      item: {
        name: "Gloves from your note",
        short: "noted gloves",
        cost: 5,
        tier: "signature",
        minSkill: "beginner",
        where: "thrift",
        note: "Pick a pair you can take off to eat or type.",
        how: "Thrift gloves in the palette color. If they are long, fold the cuff once.",
      },
    },
    {
      re: /\b(lights?|leds?|glow|lanterns?)\b/i,
      item: {
        name: "Battery light from your note",
        short: "noted light",
        cost: 6,
        tier: "signature",
        minSkill: "beginner",
        where: "hardware",
        note: "Battery light only. No open flame and no plug-in cord.",
        how: "Add one battery tea light or coin light where a hand can reach the switch. Tape wires away from skin.",
      },
    },
  ];

  const MASK_ITEM = {
    kids: {
      name: "Soft face paint instead of a mask",
      short: "open face",
      cost: 5,
      tier: "signature",
      minSkill: "beginner",
      where: "drugstore",
      note: "Your note asked for a mask. For a kids' costume the face stays visible, so this is paint, not a cover.",
      how: "An adult adds a small painted mark on the cheeks. Eyes, nose, and mouth stay clear. Pack wipes.",
    },
    office: {
      name: "Glasses or a brow piece instead of a mask",
      short: "open face",
      cost: 4,
      tier: "signature",
      minSkill: "beginner",
      where: "thrift",
      note: "Your note asked for a mask. An office costume keeps the face camera-ready.",
      how: "Use glasses or a small paper shape pinned at the hairline. You should still be recognizable on a video call.",
    },
    party: {
      name: "Half mask that leaves the mouth free",
      short: "half mask",
      cost: 6,
      tier: "signature",
      minSkill: "beginner",
      where: "craft",
      note: "A half mask, because you still need to talk, drink water, and be recognized.",
      how: "Cut a half mask from card, cover it in fabric, and tie it with ribbon. The mouth and chin stay clear. Smooth every edge.",
    },
    cosplay: {
      name: "Half mask with a clear eye line",
      short: "half mask",
      cost: 7,
      tier: "signature",
      minSkill: "beginner",
      where: "craft",
      note: "Built as a half mask so the eyes stay easy to see in photos.",
      how: "Cut a half mask, pad the inside, and check that you can see your feet while walking. No full-face cover in this plan.",
    },
  };

  const UNSAFE_NOTE = /\b(blood|gore|gory|knife|knives|gun|guns|sword|swords|weapon|weapons|rifle|pistol|blade|dagger)\b/i;

  function hashString(value) {
    let h = 2166136261;
    const text = String(value);
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function cleanText(value, max) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max);
  }

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function cloneMaterial(source, index) {
    return {
      id: slug(source.short || source.name) + "-" + index,
      name: source.name,
      short: source.short || source.name,
      cost: Math.max(0, Math.round(Number(source.cost) || 0)),
      tier: source.tier,
      minSkill: source.minSkill,
      where: source.where,
      whereLabel: WHERE_LABEL[source.where] || "Shop",
      note: source.note || "",
      how: source.how || "Attach it so it stays comfortable and does not drag on the floor.",
    };
  }

  function sumCost(list) {
    return list.reduce(function (total, item) {
      return total + item.cost;
    }, 0);
  }

  function skillAllows(minSkill, skill) {
    return SKILL_RANK[minSkill] <= SKILL_RANK[skill];
  }

  function normalize(input) {
    const source = input || {};
    const occasion = OCCASIONS[source.occasion] ? source.occasion : "party";
    const vibes = [];
    const incoming = Array.isArray(source.vibes) ? source.vibes : [];
    incoming.forEach(function (vibe) {
      if (MOTIFS[vibe] && vibes.indexOf(vibe) === -1 && vibes.length < 3) {
        vibes.push(vibe);
      }
    });
    let budget = Number(source.budget);
    if (!Number.isFinite(budget)) budget = 40;
    budget = Math.round(Math.min(500, Math.max(5, budget)));
    const skill = SKILLS[source.skill] ? source.skill : "beginner";
    const variant = Math.max(0, Math.round(Number(source.variant) || 0));
    return {
      occasion: occasion,
      vibes: vibes,
      budget: budget,
      skill: skill,
      wearer: cleanText(source.wearer, 40),
      notes: cleanText(source.notes, 160),
      variant: variant,
      forceConceptId: source.forceConceptId || null,
      forceMotifId: MOTIFS[source.forceMotifId] ? source.forceMotifId : null,
      essentialsOnly: Boolean(source.essentialsOnly),
    };
  }

  function scoreConcept(concept, input) {
    if (concept.occasions.indexOf(input.occasion) === -1) return -1;
    if (!input.vibes.length) return 3;
    let score = 1;
    input.vibes.forEach(function (vibe, index) {
      if (concept.vibes.indexOf(vibe) !== -1) {
        score += index === 0 ? 3 : 2;
      }
    });
    return score;
  }

  function rankConcepts(input) {
    return CONCEPTS.map(function (concept) {
      return { concept: concept, score: scoreConcept(concept, input) };
    })
      .filter(function (row) {
        return row.score >= 0;
      })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return hashString(a.concept.id + ":" + input.variant) - hashString(b.concept.id + ":" + input.variant);
      });
  }

  function motifCycle(input, concept) {
    const cycle = [];
    function push(id) {
      if (MOTIFS[id] && cycle.indexOf(id) === -1) cycle.push(id);
    }
    input.vibes.forEach(push);
    if (!cycle.length) concept.vibes.forEach(push);
    (EXTRA_MOTIFS[input.occasion] || []).forEach(push);
    return cycle;
  }

  function pickConcept(ranked, input) {
    if (input.forceConceptId) {
      const forced = ranked.filter(function (row) {
        return row.concept.id === input.forceConceptId;
      })[0];
      if (forced) return forced;
    }
    const topScore = ranked[0].score;
    const top = ranked.filter(function (row) {
      return row.score >= topScore - 0;
    });
    const window = top.length >= 2 ? top : ranked.slice(0, Math.min(3, ranked.length));
    if (input.variant % 2 === 0) {
      return window[(input.variant / 2) % window.length];
    }
    return window[Math.floor(input.variant / 2) % window.length];
  }

  function pickMotifId(input, concept) {
    if (input.forceMotifId) return input.forceMotifId;
    const cycle = motifCycle(input, concept);
    const offset = input.variant % 2 === 0 ? 0 : Math.ceil(input.variant / 2);
    return cycle[offset % cycle.length];
  }

  function noteMaterials(input) {
    if (!input.notes || UNSAFE_NOTE.test(input.notes)) return [];
    const found = [];
    if (/\b(masks?)\b/i.test(input.notes)) {
      found.push(MASK_ITEM[input.occasion]);
    }
    NOTE_ITEMS.forEach(function (entry) {
      if (found.length >= 2) return;
      if (entry.re.test(input.notes)) found.push(entry.item);
    });
    return found.slice(0, 2);
  }

  function selectMaterials(concept, motif, input) {
    const pool = concept.materials
      .filter(function (item) {
        return skillAllows(item.minSkill, input.skill);
      })
      .map(function (item) {
        return cloneMaterial(item, 0);
      });
    const essentials = pool.filter(function (item) {
      return item.tier === "essential";
    });
    const signatures = pool.filter(function (item) {
      return item.tier === "signature";
    });
    const flourishes = pool.filter(function (item) {
      return item.tier === "flourish";
    });
    const extras = [];
    if (!input.essentialsOnly && skillAllows(motif.item.minSkill, input.skill)) {
      extras.push(cloneMaterial(motif.item, 0));
    }
    if (!input.essentialsOnly) {
      noteMaterials(input).forEach(function (item) {
        if (skillAllows(item.minSkill, input.skill)) extras.push(cloneMaterial(item, 0));
      });
    }

    const chosen = essentials.slice();
    if (!input.essentialsOnly) {
      extras.forEach(function (item) {
        chosen.push(item);
      });
      signatures.forEach(function (item) {
        if (sumCost(chosen) + item.cost <= input.budget) chosen.push(item);
      });
      flourishes.forEach(function (item) {
        if (sumCost(chosen) + item.cost <= input.budget) chosen.push(item);
      });
    }

    const dropped = pool.length + (input.essentialsOnly ? 0 : 1) - chosen.length;
    chosen.forEach(function (item, index) {
      item.id = slug(item.short) + "-" + index;
    });
    return {
      materials: chosen,
      dropped: Math.max(0, dropped),
    };
  }

  function budgetFit(spend, budget, dropped) {
    if (spend > budget) return "stretch";
    if (dropped > 0 || spend >= Math.round(budget * 0.75)) return "on";
    return "under";
  }

  function paletteOf(names) {
    return names.map(function (name) {
      return { name: name, hex: PALETTE_HEX[name] || "#f6efe4" };
    });
  }

  function buildSteps(concept, materials, skill) {
    const minutesFor = skill === "beginner" ? 12 : skill === "intermediate" ? 16 : 20;
    const steps = [
      {
        title: "Lay out the base",
        detail: concept.opener,
        minutes: 10,
      },
    ];
    const flourishes = [];
    materials.forEach(function (item) {
      if (item.cost === 0 && item.tier === "essential") return;
      if (item.tier === "flourish") {
        flourishes.push(item);
        return;
      }
      steps.push({
        title: "Make the " + item.short,
        detail: item.how,
        minutes: minutesFor,
      });
    });
    if (flourishes.length) {
      steps.push({
        title: "Add the small finishes",
        detail: flourishes
          .map(function (item) {
            return item.how;
          })
          .join(" "),
        minutes: 10,
      });
    }
    steps.push({
      title: "Fit and photo test",
      detail: concept.finale,
      minutes: 10,
    });
    return steps;
  }

  function secondaryMotif(input, motifId, concept) {
    const cycle = motifCycle(input, concept);
    const fromUser = input.vibes.filter(function (id) {
      return id !== motifId && cycle.indexOf(id) !== -1;
    })[0];
    return fromUser ? MOTIFS[fromUser] : null;
  }

  function whyText(input, concept, motif) {
    const occasion = OCCASIONS[input.occasion].label;
    const matched = input.vibes.filter(function (id) {
      return concept.vibes.indexOf(id) !== -1;
    });
    if (!input.vibes.length) {
      return (
        occasion +
        " leads the choice. No vibe was selected, so " +
        concept.baseName +
        " is the default for that kind of night, styled as " +
        motif.label.toLowerCase() +
        "."
      );
    }
    if (!matched.length) {
      return (
        occasion +
        " still sets the rules. The " +
        motif.label.toLowerCase() +
        " styling is a variation on " +
        concept.baseName +
        ", which is the closest base for this occasion."
      );
    }
    const labels = matched.map(function (id) {
      return MOTIFS[id].label.toLowerCase();
    });
    const pretty = labels.map(function (label, index) {
      return index === 0 ? label.charAt(0).toUpperCase() + label.slice(1) : label;
    });
    const list = pretty.length === 1 ? pretty[0] : pretty.slice(0, -1).join(", ") + " and " + pretty[pretty.length - 1];
    return (
      occasion +
      " sets the constraints. " +
      list +
      (labels.length === 1 ? " overlaps with " : " overlap with ") +
      concept.baseName +
      ", so that is the base and " +
      motif.label.toLowerCase() +
      " leads the styling."
    );
  }

  function writeBrief(input, concept, motif, secondary, spend, fit) {
    const who = input.wearer
      ? "Designed for " + input.wearer + "."
      : "Designed for whoever is wearing it.";
    const mood = secondary
      ? "The lead mood is " + motif.label.toLowerCase() + ", with a " + secondary.label.toLowerCase() + " accent."
      : "The lead mood is " + motif.label.toLowerCase() + ".";
    const money =
      fit === "stretch"
        ? "The list lands at $" +
          spend +
          ", which stretches a $" +
          input.budget +
          " budget, so start with the closet pieces and thrift the largest layer."
        : "The shopping list is aimed at about $" + spend + " of a $" + input.budget + " budget.";
    const noteLine = !input.notes
      ? ""
      : UNSAFE_NOTE.test(input.notes)
        ? "The note asked for a prop this planner will not build. The same story is carried with color, cloth, and soft shapes."
        : "You asked to include this: " + input.notes + ".";
    return [
      concept.baseName + " is " + concept.role + ".",
      "From across a room it should read as " + concept.read + ".",
      mood,
      input.essentialsOnly
        ? "This pocket edition keeps the base silhouette and leaves the extra styling for a later pass."
        : motif.sentence,
      secondary ? secondary.accent : "",
      OCCASIONS[input.occasion].safety,
      SKILLS[input.skill].voice,
      money,
      who,
      noteLine,
    ]
      .filter(Boolean)
      .join(" ");
  }

  function makeApply(input, overrides) {
    return {
      occasion: input.occasion,
      vibes: input.vibes.slice(),
      budget: input.budget,
      skill: input.skill,
      wearer: input.wearer,
      notes: input.notes,
      variant: input.variant,
      forceConceptId: overrides.forceConceptId || null,
      forceMotifId: overrides.forceMotifId || null,
      essentialsOnly: Boolean(overrides.essentialsOnly),
    };
  }

  function buildAlternatives(input, concept, motif, ranked) {
    const alternatives = [];
    const pocketInput = Object.assign({}, input, {
      essentialsOnly: true,
      forceConceptId: concept.id,
      forceMotifId: motifIdOf(motif),
    });
    const pocket = composePlan(pocketInput).plan;
    alternatives.push({
      kicker: "Leaner build",
      title: "Pocket " + concept.baseName,
      blurb: "Essentials only. Same character, fewer stops.",
      estimatedCost: pocket.estimatedCost,
      apply: makeApply(input, {
        essentialsOnly: true,
        forceConceptId: concept.id,
        forceMotifId: motifIdOf(motif),
      }),
    });

    const sibling = ranked.filter(function (row) {
      return row.concept.id !== concept.id;
    })[0];
    if (sibling) {
      const siblingInput = Object.assign({}, input, {
        essentialsOnly: false,
        forceConceptId: sibling.concept.id,
        forceMotifId: null,
      });
      const siblingPlan = composePlan(siblingInput).plan;
      alternatives.push({
        kicker: "Different character",
        title: siblingPlan.conceptName,
        blurb: sibling.concept.role.charAt(0).toUpperCase() + sibling.concept.role.slice(1) + ".",
        estimatedCost: siblingPlan.estimatedCost,
        apply: makeApply(input, {
          essentialsOnly: false,
          forceConceptId: sibling.concept.id,
          forceMotifId: null,
        }),
      });
    }

    const cycle = motifCycle(input, concept).filter(function (id) {
      return id !== motifIdOf(motif);
    });
    const twistId = cycle[0] || motifIdOf(motif);
    const twistInput = Object.assign({}, input, {
      essentialsOnly: false,
      forceConceptId: concept.id,
      forceMotifId: twistId,
    });
    const twist = composePlan(twistInput).plan;
    alternatives.push({
      kicker: "Same role, new styling",
      title: twist.conceptName,
      blurb: MOTIFS[twistId].sentence,
      estimatedCost: twist.estimatedCost,
      apply: makeApply(input, {
        essentialsOnly: false,
        forceConceptId: concept.id,
        forceMotifId: twistId,
      }),
    });

    return alternatives.slice(0, 3);
  }

  function motifIdOf(motif) {
    const ids = Object.keys(MOTIFS);
    for (let i = 0; i < ids.length; i += 1) {
      if (MOTIFS[ids[i]] === motif) return ids[i];
    }
    return ids[0];
  }

  function generatePlan(rawInput) {
    const built = composePlan(rawInput);
    built.plan.alternatives = buildAlternatives(built.input, built.concept, built.motif, built.ranked);
    return built.plan;
  }

  function composePlan(rawInput) {
    const input = normalize(rawInput);
    const ranked = rankConcepts(input);
    const chosen = pickConcept(ranked, input);
    const concept = chosen.concept;
    const motif = MOTIFS[pickMotifId(input, concept)];
    const secondary = input.essentialsOnly ? null : secondaryMotif(input, motifIdOf(motif), concept);
    const selection = selectMaterials(concept, motif, input);
    const materials = selection.materials;
    const spend = sumCost(materials);
    const fit = budgetFit(spend, input.budget, selection.dropped);
    const steps = buildSteps(concept, materials, input.skill);
    const totalMinutes = steps.reduce(function (total, step) {
      return total + step.minutes;
    }, 0);
    const conceptName = (input.essentialsOnly ? "Pocket " : "") + motif.adj + " " + concept.baseName;
    const plan = {
      conceptName: conceptName,
      baseName: concept.baseName,
      conceptId: concept.id,
      epithet: concept.read,
      characterBrief: writeBrief(input, concept, motif, secondary, spend, fit),
      occasion: input.occasion,
      occasionLabel: OCCASIONS[input.occasion].label,
      vibes: input.vibes.slice(),
      vibeLabels: input.vibes.map(function (id) {
        return MOTIFS[id].label;
      }),
      motifLabel: motif.label,
      skill: input.skill,
      skillLabel: SKILLS[input.skill].label,
      budget: input.budget,
      wearer: input.wearer,
      notes: input.notes,
      palette: paletteOf(motif.palette || concept.palette),
      why: whyText(input, concept, motif),
      materials: materials,
      steps: steps,
      estimatedCost: spend,
      budgetFit: fit,
      droppedCount: selection.dropped,
      totalMinutes: totalMinutes,
      edition: input.essentialsOnly ? "Pocket" : "Full",
      variant: input.variant,
      input: {
        occasion: input.occasion,
        vibes: input.vibes.slice(),
        budget: input.budget,
        skill: input.skill,
        wearer: input.wearer,
        notes: input.notes,
        variant: input.variant,
        forceConceptId: input.forceConceptId,
        forceMotifId: input.forceMotifId,
        essentialsOnly: input.essentialsOnly,
      },
      alternatives: [],
    };
    return { plan: plan, input: input, concept: concept, motif: motif, ranked: ranked };
  }

  function planToText(plan) {
    const vibe = plan.vibeLabels.length ? plan.vibeLabels.join(", ") : "No vibe selected";
    const lines = [
      plan.conceptName,
      [
        plan.occasionLabel,
        vibe,
        plan.skillLabel,
        "Budget $" + plan.budget,
        "Estimate $" + plan.estimatedCost,
      ].join(" · "),
      "",
      plan.characterBrief,
      "",
      "Why this plan",
      plan.why,
      "",
      "Materials",
    ];
    plan.materials.forEach(function (item) {
      lines.push(
        "- [ ] " +
          item.name +
          " — $" +
          item.cost +
          " — " +
          item.whereLabel +
          (item.note ? " — " + item.note : "")
      );
    });
    lines.push("", "DIY steps");
    plan.steps.forEach(function (step, index) {
      lines.push(index + 1 + ". " + step.title + " (" + step.minutes + " min)");
      lines.push(step.detail);
    });
    lines.push("", "About " + plan.totalMinutes + " minutes.", "", "Alternatives");
    plan.alternatives.forEach(function (alt) {
      lines.push("- " + alt.title + " — about $" + alt.estimatedCost + ". " + alt.blurb);
    });
    return lines.join("\n");
  }

  return {
    OCCASIONS: OCCASIONS,
    VIBES: VIBES,
    SKILLS: SKILLS,
    PALETTE_HEX: PALETTE_HEX,
    CONCEPTS: CONCEPTS,
    MOTIFS: MOTIFS,
    generatePlan: generatePlan,
    planToText: planToText,
    normalize: normalize,
  };
});
