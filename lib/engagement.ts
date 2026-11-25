/**
 * Chapter 01 — "The Brief Table" scenario.
 *
 * One real engagement, five calls. The copy lives in the CMS
 * (`home.brief.scenario`); this module is the typed contract, the shipped
 * default and the validator used by the server action.
 *
 * Numbers, client details, quote and case link are NOT stored here — the
 * component derives them from the project named by `projectSlug`, so a case
 * study only has one source of truth.
 */

export type BriefArtifactKind = "note" | "position" | "crest" | "flow" | "film" | "case" | "image";

export type BriefMetric = { value: string; label: string };

export type BriefArtifact = {
  kind: BriefArtifactKind;
  title: string;
  caption: string;
  /** Bullet lines used by the `note` and `flow` artifacts. */
  items: string[];
  /** Used by the `image` artifact. */
  src: string;
};

export type BriefOption = {
  id: string;
  label: string;
  hint: string;
  /** Why this path was not the one we took. */
  verdict: string;
  /** Exactly one option per stage is the call Zoolyum actually made. */
  chosen: boolean;
};

export type BriefStage = {
  id: string;
  stage: string;
  verb: string;
  question: string;
  options: BriefOption[];
  reveal: {
    label: string;
    title: string;
    body: string;
    artifact: BriefArtifact;
    metric: BriefMetric;
  };
};

export type BriefScenario = {
  version: number;
  projectSlug: string;
  briefNo: string;
  briefTitle: string;
  situation: string;
  stages: BriefStage[];
  summary: { title: string; body: string };
};

const ARTIFACT_KINDS: BriefArtifactKind[] = ["note", "position", "crest", "flow", "film", "case", "image"];

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function normalizeArtifact(raw: unknown): BriefArtifact {
  const o = (raw ?? {}) as Record<string, unknown>;
  const kind = ARTIFACT_KINDS.includes(o.kind as BriefArtifactKind)
    ? (o.kind as BriefArtifactKind)
    : "note";
  return {
    kind,
    title: str(o.title),
    caption: str(o.caption),
    items: Array.isArray(o.items) ? o.items.map(str).filter(Boolean) : [],
    src: str(o.src),
  };
}

function normalizeStage(raw: unknown, index: number): BriefStage | null {
  const o = (raw ?? {}) as Record<string, unknown>;
  const optionsRaw = Array.isArray(o.options) ? o.options : [];
  if (optionsRaw.length < 2 || optionsRaw.length > 4) return null;

  let selected = -1;
  const options: BriefOption[] = optionsRaw.map((entry, i) => {
    const opt = (entry ?? {}) as Record<string, unknown>;
    const chosen = opt.chosen === true;
    if (chosen && selected === -1) selected = i;
    return {
      id: str(opt.id) || `option-${i + 1}`,
      label: str(opt.label),
      hint: str(opt.hint),
      verdict: str(opt.verdict),
      chosen: false,
    };
  });
  if (selected === -1) return null;
  options[selected].chosen = true;

  if (options.some((option) => option.label === "")) return null;

  const reveal = (o.reveal ?? {}) as Record<string, unknown>;
  const metric = (reveal.metric ?? {}) as Record<string, unknown>;

  return {
    id: str(o.id) || `stage-${index + 1}`,
    stage: str(o.stage),
    verb: str(o.verb),
    question: str(o.question),
    options,
    reveal: {
      label: str(reveal.label),
      title: str(reveal.title),
      body: str(reveal.body),
      artifact: normalizeArtifact(reveal.artifact),
      metric: { value: str(metric.value), label: str(metric.label) },
    },
  };
}

/** Returns a fully normalised scenario, or null when the shape is unusable. */
export function parseBriefScenario(raw: unknown): BriefScenario | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const stagesRaw = Array.isArray(o.stages) ? o.stages : [];
  if (stagesRaw.length !== 5) return null;

  const stages: BriefStage[] = [];
  for (let i = 0; i < stagesRaw.length; i += 1) {
    const stage = normalizeStage(stagesRaw[i], i);
    if (!stage) return null;
    stages.push(stage);
  }

  const projectSlug = str(o.projectSlug);
  if (projectSlug === "") return null;
  if (stages.some((stage) => stage.stage === "" || stage.question === "" || stage.reveal.body === "")) {
    return null;
  }

  const summary = (o.summary ?? {}) as Record<string, unknown>;

  return {
    version: 1,
    projectSlug,
    briefNo: str(o.briefNo) || "01",
    briefTitle: str(o.briefTitle),
    situation: str(o.situation),
    stages,
    summary: { title: str(summary.title), body: str(summary.body) },
  };
}

/** Human-readable reason for the server action to reject a save. */
export function validateBriefScenario(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return "The brief scenario must be an object.";
  const o = raw as Record<string, unknown>;
  if (str(o.projectSlug) === "") return "Choose a case study for the brief.";
  const stages = Array.isArray(o.stages) ? o.stages : [];
  if (stages.length !== 5) return "The brief needs exactly five calls.";

  for (let i = 0; i < stages.length; i += 1) {
    const stage = (stages[i] ?? {}) as Record<string, unknown>;
    const label = str(stage.stage) || `Call ${i + 1}`;
    if (str(stage.question) === "") return `${label}: add the question.`;
    const options = Array.isArray(stage.options) ? stage.options : [];
    if (options.length < 2) return `${label}: at least two options are required.`;
    if (options.length > 4) return `${label}: four options maximum.`;
    const chosen = options.filter((option) => (option as Record<string, unknown>)?.chosen === true);
    if (chosen.length !== 1) return `${label}: mark exactly one option as "what we did".`;
    if (options.some((option) => str((option as Record<string, unknown>)?.label) === "")) {
      return `${label}: every option needs a label.`;
    }
    const reveal = (stage.reveal ?? {}) as Record<string, unknown>;
    if (str(reveal.body) === "") return `${label}: add the reveal copy.`;
  }

  return null;
}

/** The shipped engagement. Seeded into the CMS; editable from there. */
export const BRIEF_DEFAULT: BriefScenario = {
  version: 1,
  projectSlug: "apex-academy",
  briefNo: "01",
  briefTitle: "Admission season, eight weeks out.",
  situation:
    "A school with strong results and zero distinction. Parents cannot tell it apart from five competitors on the same road, and the admission window opens in eight weeks.",
  stages: [
    {
      id: "discover",
      stage: "Discover",
      verb: "Read",
      question: "Apex has strong results and no distinction. What do you read first?",
      options: [
        {
          id: "competitors",
          label: "The five competitors on the same road",
          hint: "Start with the category's claims.",
          verdict: "Every one of them led with results. Matching them would have added a sixth identical voice.",
          chosen: false,
        },
        {
          id: "admission-office",
          label: "The admission office",
          hint: "Start with the moment the decision happens.",
          verdict:
            "This is where the gap showed: parents were not comparing results, they were reading the school's culture.",
          chosen: true,
        },
        {
          id: "campus",
          label: "The campus itself",
          hint: "Start with the experience you already have.",
          verdict: "The campus was strong. The story around it wasn't. A better brochure would not have fixed that.",
          chosen: false,
        },
      ],
      reveal: {
        label: "What we did",
        title: "The brief wasn't a design problem.",
        body:
          "Five schools on the same road claimed the same results. Results were table stakes. What parents were actually choosing was a culture — and Apex's discipline was reading as distance.",
        artifact: {
          kind: "note",
          title: "The category read",
          caption: "Five competitors. One claim. No distinction.",
          items: ["All five led with results", "No one owned a culture", "Discipline read as distance"],
          src: "",
        },
        metric: { value: "", label: "" },
      },
    },
    {
      id: "strategize",
      stage: "Strategize",
      verb: "Choose",
      question: "What should Apex claim?",
      options: [
        {
          id: "results",
          label: "The best results in Dhaka",
          hint: "Lead with the scoreboard.",
          verdict: "True, and already claimed by every competitor. It could not create distinction.",
          chosen: false,
        },
        {
          id: "earned",
          label: "A school that earns its discipline",
          hint: "Lead with the culture parents already feel.",
          verdict: "This was the open ground: strict, but on the child's side. True, defensible, and hard to copy.",
          chosen: true,
        },
        {
          id: "caring",
          label: "The most caring teachers",
          hint: "Lead with warmth.",
          verdict: "Warmth alone would have contradicted the culture parents already trusted.",
          chosen: false,
        },
      ],
      reveal: {
        label: "What we did",
        title: "Earned achievement.",
        body:
          "We named the culture 'earned achievement' — strict, but on your child's side. It was already true inside the school; the brand just had to say it plainly. No competitor could copy it without changing how they teach.",
        artifact: {
          kind: "position",
          title: "Earned achievement",
          caption: "Strict, but on your child's side.",
          items: [],
          src: "",
        },
        metric: { value: "", label: "" },
      },
    },
    {
      id: "design",
      stage: "Design",
      verb: "Build",
      question: "What should carry the claim first?",
      options: [
        {
          id: "crest",
          label: "A new crest",
          hint: "Start with the mark.",
          verdict: "The crest mattered, but a mark alone cannot explain a culture.",
          chosen: false,
        },
        {
          id: "journey",
          label: "The admission journey",
          hint: "Start where parents decide.",
          verdict: "The right place, but the journey only works if the identity says the same thing.",
          chosen: false,
        },
        {
          id: "system",
          label: "All three, as one system",
          hint: "Mark, journey and content together.",
          verdict: "The crest, the microsite and the films were built as one argument. That is what made it stick.",
          chosen: true,
        },
      ],
      reveal: {
        label: "What we did",
        title: "One argument, three surfaces.",
        body:
          "The crest was rebuilt as a mark of earned achievement. The admission microsite answered parent anxiety in three steps instead of a form graveyard. The identity and the journey said the same thing, in the same order.",
        artifact: {
          kind: "flow",
          title: "Three-step admission",
          caption: "Ask. Answer. Apply.",
          items: ["Ask: the parent's real question", "Answer: proof, not promises", "Apply: one short form"],
          src: "",
        },
        metric: { value: "", label: "" },
      },
    },
    {
      id: "launch",
      stage: "Launch",
      verb: "Ship",
      question: "Where does admission season start?",
      options: [
        {
          id: "billboard",
          label: "A billboard campaign",
          hint: "Buy attention at scale.",
          verdict: "Reach without proof. Parents had heard the claims before.",
          chosen: false,
        },
        {
          id: "parent-stories",
          label: "Parent stories",
          hint: "Let families do the persuading.",
          verdict: "Films cut to the questions parents actually ask, then a microsite built to convert.",
          chosen: true,
        },
        {
          id: "discount",
          label: "A fee discount",
          hint: "Compete on price.",
          verdict: "A discount would have taught parents to wait for the next one.",
          chosen: false,
        },
      ],
      reveal: {
        label: "What we did",
        title: "Parents persuaded. The funnel converted.",
        body:
          "We filmed parents answering the questions every parent asks, then put the three-step enquiry behind the film. The stories carried the promise; the microsite made it easy to act.",
        artifact: {
          kind: "film",
          title: "Parent stories",
          caption: "Cut to the questions parents actually ask.",
          items: [],
          src: "",
        },
        metric: { value: "", label: "" },
      },
    },
    {
      id: "grow",
      stage: "Grow",
      verb: "Defend",
      question: "What do you protect as you grow?",
      options: [
        {
          id: "crest",
          label: "The crest",
          hint: "Guard the mark.",
          verdict: "The mark is an asset, not the standard. New programmes can use it and still break the promise.",
          chosen: false,
        },
        {
          id: "promise",
          label: "The promise",
          hint: "Guard what earned achievement means.",
          verdict: "Every new programme has to pass the same test: does this feel like earned achievement?",
          chosen: true,
        },
        {
          id: "price",
          label: "The price",
          hint: "Guard the premium.",
          verdict: "Price follows the promise. Protecting the number before the meaning is backwards.",
          chosen: false,
        },
      ],
      reveal: {
        label: "What we did",
        title: "The promise is the standard.",
        body:
          "Every new programme, campaign and intake has to pass one test: does this feel like earned achievement? The brand stays the same as the school grows.",
        artifact: {
          kind: "case",
          title: "Apex Academy",
          caption: "From one campus among many to the school parents talk about.",
          items: [],
          src: "",
        },
        metric: { value: "+42%", label: "Enrollment growth" },
      },
    },
  ],
  summary: {
    title: "That was one engagement.",
    body: "Five calls. One position. The numbers followed.",
  },
};
