// Mallard study design process — 20-minute deck for clinical research leaders.
// Design system copied from AskMallardCRODeck20260825b.pptx (same fonts, colours, geometry).
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5, as the template
pres.author = "Juleon Rabbani";
pres.title = "Mallard: how a study design plan is made";

// palette (from the template)
const C = {
  ink: "16202B", green: "0F4C43", deep: "0A3831", mint: "8FC3B5", mintSoft: "BFD8D2", mintText: "4E8C7E",
  card: "EEF3F2", cardSoft: "F7FAF9", muted: "5A6B7A", muted2: "556975", gold: "D9AC5A", goldInk: "3A2A08",
  bronze: "9A6B0F", white: "FFFFFF", paleText: "E8F1EF", nameText: "7FA79F", red: "9B3324", rule: "DDE6E4",
};
const H = "Cambria", B = "Calibri", M = "Consolas";

function title(slide, text, sub) {
  slide.background = { color: C.white };
  slide.addText(text, { x: 0.62, y: 0.42, w: 11.9, h: 0.72, fontFace: H, fontSize: 34, bold: true, color: C.ink, isTextBox: true, margin: 0, valign: "middle" });
  if (sub) slide.addText(sub, { x: 0.62, y: 1.16, w: 11.9, h: 0.4, fontFace: B, fontSize: 15, color: C.muted, isTextBox: true, margin: 0, valign: "middle" });
}
function band(slide, text, y = 6.28) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 12.13, h: 0.66, fill: { color: C.card }, line: { color: C.card } });
  slide.addText(text, { x: 0.86, y, w: 11.6, h: 0.66, fontFace: B, fontSize: 14.5, color: C.ink, isTextBox: true, margin: 0, valign: "middle" });
}
function circle(slide, x, y, n, d = 0.42, fill = C.green, ink = C.white, fs = 15) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill } });
  slide.addText(String(n), { x, y, w: d, h: d, fontFace: B, fontSize: fs, bold: true, color: ink, align: "center", valign: "middle", isTextBox: true, margin: 0 });
}
function legendDot(slide, x, y, color, label, w = 3.2) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.07, w: 0.13, h: 0.13, fill: { color }, line: { color } });
  slide.addText(label, { x: x + 0.2, y, w, h: 0.28, fontFace: B, fontSize: 11.5, color: C.muted2, isTextBox: true, margin: 0, valign: "middle" });
}
function stepCard(slide, x, y, w, label, head, body, opts = {}) {
  const hh = opts.headH || 1.08, bh = opts.bodyH || 2.55;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: hh, fill: { color: C.green }, line: { color: C.green }, rectRadius: 0.08 });
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y + hh - 0.12, w, h: 0.12, fill: { color: C.green }, line: { color: C.green } });
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: y + hh, w, h: bh, fill: { color: C.cardSoft }, line: { color: C.cardSoft }, rectRadius: 0.08 });
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y + hh, w, h: 0.1, fill: { color: C.cardSoft }, line: { color: C.cardSoft } });
  slide.addText(label, { x: x + 0.18, y: y + 0.11, w: w - 0.36, h: 0.22, fontFace: M, fontSize: 9.5, bold: true, color: C.mint, isTextBox: true, margin: 0 });
  slide.addText(head, { x: x + 0.18, y: y + 0.32, w: w - 0.36, h: hh - 0.42, fontFace: H, fontSize: opts.headSize || 19, bold: true, color: C.white, isTextBox: true, margin: 0, valign: "top" });
  slide.addText(body, { x: x + 0.16, y: y + hh + 0.14, w: w - 0.32, h: bh - 0.28, fontFace: B, fontSize: opts.bodySize || 9, color: C.ink, isTextBox: true, margin: 0, valign: "top", paraSpaceAfter: 4 });
}
const rich = (pairs, fs = 9, leadColor = C.green) => pairs.flatMap(([lead, text], i) => [
  { text: (lead ? "●  " + lead : ""), options: { bold: true, color: leadColor, fontSize: fs, breakLine: true } },
  { text, options: { color: C.ink, fontSize: fs, breakLine: i < pairs.length - 1, paraSpaceAfter: 6 } },
]);

// ---------------------------------------------------------------- 1. title (dark)
{
  const s = pres.addSlide(); s.background = { color: C.deep };
  s.addText("How Mallard turns a question into a study design plan", { x: 0.8, y: 1.3, w: 10.8, h: 1.6, fontFace: H, fontSize: 44, bold: true, color: C.white, isTextBox: true, margin: 0, valign: "top" });
  s.addText("Models draft and review. Deterministic code decides what may be printed.", { x: 0.8, y: 3.05, w: 9.5, h: 0.6, fontFace: B, fontSize: 17, color: C.mintSoft, isTextBox: true, margin: 0 });
  s.addText("WHAT THIS TALK COVERS", { x: 0.8, y: 4.2, w: 6, h: 0.3, fontFace: B, fontSize: 11, bold: true, color: C.mintText, isTextBox: true, margin: 0 });
  s.addText([
    { text: "The seven steps from a plain-language question to a plan", options: { bullet: true, breakLine: true } },
    { text: "What it asks for that a general chatbot does not, and why that lowers the risk of statistical malpractice", options: { bullet: true, breakLine: true } },
    { text: "Who decides what: the investigator, the models, and the code", options: { bullet: true, breakLine: true } },
    { text: "Where it does not yet help", options: { bullet: true } },
  ], { x: 0.85, y: 4.6, w: 9.4, h: 1.7, fontFace: B, fontSize: 16, color: C.paleText, isTextBox: true, margin: 0, paraSpaceAfter: 6 });
  s.addText("Juleon Rabbani, DrPH  ·  17 September 2026", { x: 8.2, y: 6.7, w: 4.5, h: 0.3, fontFace: B, fontSize: 11, color: C.nameText, align: "right", isTextBox: true, margin: 0 });
  s.addNotes("One minute. State the framing line once: models draft and review, code decides what may be printed. Everything that follows is that sentence unpacked. Say early that this is a planning aid for a statistician and an IRB to check, not a replacement for either.");
}

// ---------------------------------------------------------------- 2. the numbers
{
  const s = pres.addSlide();
  title(s, "A plan is never the output of one model", "Four numbers that describe the process, all read from the deployed code");
  const tiles = [
    ["7", "steps, built in the order a study develops, with the design settled first"],
    ["2", "independent model reviewers, Anthropic and OpenAI, merged worst case"],
    ["37", "deterministic checks: 17 estimand rules and 20 validators"],
    ["7", "check codes that withhold the sample size outright, never with a warning under it"],
  ];
  tiles.forEach(([n, t], i) => {
    const x = 0.62 + i * 3.05;
    s.addShape(pres.shapes.RECTANGLE, { x, w: 2.85, y: 1.9, h: 2.75, fill: { color: C.card }, line: { color: C.card } });
    s.addText(n, { x: x + 0.2, y: 2.05, w: 2.45, h: 1.2, fontFace: H, fontSize: 66, bold: true, color: C.green, isTextBox: true, margin: 0, valign: "middle" });
    s.addText(t, { x: x + 0.2, y: 3.3, w: 2.45, h: 1.45, fontFace: B, fontSize: 13, color: C.ink, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addText("Two model reviews run only where a wrong answer does the most harm: the design brief and the analysis step. The deterministic checks run on every step, and no model can overrule them.", { x: 0.62, y: 5.0, w: 12.0, h: 0.8, fontFace: B, fontSize: 14, color: C.muted, isTextBox: true, margin: 0 });
  band(s, "If the sizing method does not fit what the study measures, the number is withheld rather than shown with a caveat.");
  s.addNotes("Ninety seconds. The point is the division of labour, not the counts. Models supply the reasoning; code supplies the discipline. The last line is the one sentence to remember.");
}

// ---------------------------------------------------------------- 3. seven steps
{
  const s = pres.addSlide();
  title(s, "The plan is built in the order a study develops", "A free design brief first, then six plan steps; one credit is spent at step 3");
  legendDot(s, 0.62, 1.63, C.bronze, "Reviewed by two model labs");
  legendDot(s, 3.6, 1.63, C.green, "Deterministic checks only", 3.4);
  legendDot(s, 6.7, 1.63, C.gold, "Investigator answers questions here", 4);
  const steps = [
    ["STEP 1", "Question and data", "What am I asking, has it been answered, what records do I have?", "Free. Nothing generated.", C.green, 0],
    ["STEP 2", "Design brief", "The design and why, the typed estimand, the conditions it depends on, the alternatives.", "Free. Two-lab review.", C.bronze, 2],
    ["STEP 3", "Patients and data", "Who is in, what is measured, where the records come from, who must say yes.", "Spends the credit. Sign-in required.", C.green, 3],
    ["STEP 4", "Analysis and how many", "How the numbers are compared, and how many patients that takes.", "Two-lab review, corrective pass, adjudication.", C.bronze, 1],
    ["STEP 5", "Approvals, team, cost", "Who approves, what it costs, what to do on Monday.", "Runs on its own after step 4.", C.green, 0],
    ["STEP 6", "Write-up", "Abstract, methods paragraph, background with PubMed-resolved references.", "On request.", C.green, 0],
    ["STEP 7", "Code", "Runnable code in the investigator's software, never executed by Mallard.", "On request.", C.green, 0],
  ];
  const w = 1.62, gap = 0.13, y = 2.2;
  steps.forEach(([lab, head, ask, how, dot, q], i) => {
    const x = 0.62 + i * (w + gap);
    stepCard(s, x, y, w, lab, head, [], { headH: 1.15, bodyH: 2.35, headSize: 14 });
    s.addText([
      { text: ask, options: { color: C.ink, fontSize: 9.5, breakLine: true, paraSpaceAfter: 6 } },
      { text: how, options: { color: C.green, fontSize: 9.5, bold: true } },
    ], { x: x + 0.14, y: y + 1.3, w: w - 0.28, h: 1.6, fontFace: B, isTextBox: true, margin: 0, valign: "top" });
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.14, y: y + 3.2, w: 0.13, h: 0.13, fill: { color: dot }, line: { color: dot } });
    if (q) s.addText(`${q} question${q > 1 ? "s" : ""} asked`, { x: x + 0.34, y: y + 3.13, w: w - 0.4, h: 0.28, fontFace: M, fontSize: 8, bold: true, color: C.bronze, isTextBox: true, margin: 0, valign: "middle" });
  });
  band(s, "Each step drafts only its own sections. The investigator's answers are pinned as facts no later step can overwrite, and re-running a step marks everything after it stale.");
  s.addNotes("Two minutes. Walk the row left to right. Stress that the design decision is made first and separately, because a plan built on the wrong design is wrong throughout, and that the investigator approves it before a credit is spent. Steps 6 and 7 are on request so a power justification does not carry an unwanted abstract.");
}

// ---------------------------------------------------------------- 4. what it collects
{
  const s = pres.addSlide();
  title(s, "What it asks for that a general chatbot does not", "Typed facts the code can hold the plan to, not free text a model fills from its priors");
  const cards = [
    ["Context governs feasibility, never validity", "Nine typed fields: use, deadline, data state and source, funding, team roles, who analyses. Resources decide whether a method is reachable; they never make a weaker method acceptable. A test fails if any prompt says \"simplest analysis\" or \"in a spreadsheet\"."],
    ["Data state against the chosen design", "Records already in hand against a randomised or prospective design is a blocking conflict. Generate stays disabled until the investigator says which statement is true."],
    ["Aims with a role and a claim", "Each aim is primary confirmatory, secondary confirmatory or exploratory, with an intended claim. A confirmatory aim requires a hypothesis and makes multiplicity fields mandatory. Placeholders are bracketed, never invented."],
    ["A typed estimand", "Target, population, exposure, comparator, outcome, summary measure, time horizon, assignment mechanism, clustering, repeated measures, competing events. Seventeen rules compare sizing, analysis and figures to it."],
    ["Variables with roles, timing and missingness", "Outcome, exposure, confounder, mediator, effect modifier, selection factor. A variable that is both confounder and mediator blocks. The map refuses to choose an adjustment set for you."],
    ["Feasibility with a basis, counts reconciled", "Every answer is a checked result or a planning assumption with an owner. A record count is never treated as evidence of power, and a count not yet established carries a caveat into the package."],
  ];
  cards.forEach(([h, t], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.62 + col * 4.02, y = 1.8 + row * 2.25, w = 3.85, hh = 2.12;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: hh, fill: { color: C.card }, line: { color: C.card } });
    s.addText(h, { x: x + 0.22, y: y + 0.14, w: w - 0.44, h: 0.62, fontFace: B, fontSize: 14, bold: true, color: C.green, isTextBox: true, margin: 0, valign: "top" });
    s.addText(t, { x: x + 0.22, y: y + 0.8, w: w - 0.44, h: hh - 0.9, fontFace: B, fontSize: 10.5, color: C.ink, isTextBox: true, margin: 0, valign: "top" });
  });
  band(s, "A chatbot can be prompted to ask all of this. It cannot refuse to print a number when the answers contradict each other.", 6.35);
  s.addNotes("Three minutes; this is the slide the audience came for. Pick two cards to say out loud: context never changes validity, and the typed estimand. The closing band is the argument: the safeguard is not the questions but the refusal that follows from typed answers.");
}

// ---------------------------------------------------------------- 5. feedback loop
{
  const s = pres.addSlide();
  title(s, "How a draft becomes a plan", "Two reviews, one guarded revision, a judge that never edits, and then the code");
  s.addImage({ path: "loop.png", x: 0.62, y: 1.7, w: 3.05, h: 4.8 });
  const items = [
    ["Two reviewers, merged worst case", "Each returns ranked issues plus a verdict on seven safety domains. An unanswered domain is unknown, never pass, and a concern reaches the revision even without an issue slot."],
    ["One guarded corrective patch", "Only the step's own sections. A patch that changes a type, truncates, empties a section or invents a reviewer response is dropped; a thinner revision is rejected."],
    ["An adjudicator that judges, never edits", "It re-reads the final plan against the reviewer issues within 90 seconds. Its verdict is shown to the reader and never rewrites the plan."],
    ["The deterministic layer has the last word", "Thirty-seven checks read the typed estimand, sizing method, analysis, diagram and exhibits and compare them. Seven codes withhold the sample size everywhere."],
    ["The investigator closes the loop", "Open findings become one form: values only they know, contradictions to reconcile, mechanical fixes. One button, one revision, one credit."],
  ];
  items.forEach(([h, t], i) => {
    const y = 1.72 + i * 0.97;
    circle(s, 4.1, y + 0.02, i + 1);
    s.addText(h, { x: 4.68, y, w: 8.0, h: 0.32, fontFace: B, fontSize: 14.5, bold: true, color: C.ink, isTextBox: true, margin: 0, valign: "middle" });
    s.addText(t, { x: 4.68, y: y + 0.33, w: 8.0, h: 0.6, fontFace: B, fontSize: 11, color: C.muted, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addNotes("Two minutes. The diagram is the same loop as the document. The thing to land is that the checks sit below every model and cannot be talked round, and that the loop back to a draft is driven by the investigator's answers, not by the models retrying.");
}

// ---------------------------------------------------------------- 6. what failing looks like
{
  const s = pres.addSlide();
  title(s, "What failing looks like", "The plan is never blanked or regenerated by the checks. Findings are ranked and always shown.");
  s.addText("OUTCOME", { x: 0.75, y: 1.8, w: 3.2, h: 0.28, fontFace: B, fontSize: 10.5, bold: true, color: C.red, isTextBox: true, margin: 0 });
  s.addText("TRIGGER", { x: 4.1, y: 1.8, w: 3.6, h: 0.28, fontFace: B, fontSize: 10.5, bold: true, color: C.green, isTextBox: true, margin: 0 });
  s.addText("WHAT THE INVESTIGATOR SEES", { x: 7.9, y: 1.8, w: 4.6, h: 0.28, fontFace: B, fontSize: 10.5, bold: true, color: C.green, isTextBox: true, margin: 0 });
  const rows = [
    ["Warning", "Any warn-level finding", "A banner above the plan, and the finding named in the audit's consistency row in every export"],
    ["Block", "Any block-level finding", "The same banner, red, headed \"This plan contradicts itself\""],
    ["Headline withheld", "One of seven headline-suppressing codes, or an unresolved reviewer point typed as affecting the sample size", "No sample-size number anywhere: screen, memo, HTML, Word. The panel says whether the reason is a contradiction, an open review point, or that no formula fits"],
    ["Needs statistical review", "An unresolved reviewer point affecting the primary analysis", "A status carried to the screen, memo, audit and library card. The analysis stays visible"],
  ];
  rows.forEach(([a, b, c], i) => {
    const y = 2.15 + i * 1.0;
    if (i % 2 === 0) s.addShape(pres.shapes.RECTANGLE, { x: 0.62, y: y - 0.08, w: 11.95, h: 0.98, fill: { color: C.card }, line: { color: C.card } });
    s.addText(a, { x: 0.75, y, w: 3.2, h: 0.85, fontFace: B, fontSize: 14, bold: true, color: C.ink, isTextBox: true, margin: 0, valign: "top" });
    s.addText(b, { x: 4.1, y, w: 3.6, h: 0.85, fontFace: B, fontSize: 11.5, color: C.ink, isTextBox: true, margin: 0, valign: "top" });
    s.addText(c, { x: 7.9, y, w: 4.6, h: 0.85, fontFace: B, fontSize: 11.5, color: C.ink, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addText("A false positive that shows a blank screen destroys work a paid credit bought. So a contradiction removes the number, not the reasoning, and the reader can see why.", { x: 0.62, y: 6.35, w: 11.9, h: 0.6, fontFace: B, fontSize: 14, bold: true, color: C.green, isTextBox: true, margin: 0 });
  s.addNotes("Ninety seconds. Leaders tend to ask what happens when it is wrong; this is the answer. Four outcomes in increasing weight. The number is what people act on, so the number is what gets withheld.");
}

// ---------------------------------------------------------------- 7. three lanes
{
  const s = pres.addSlide();
  title(s, "Who decides what", "Every activity sits in one of three lanes, and nothing reaches the export without the third");
  const lanes = [
    ["LANE 1", "The investigator", [["11 typed inputs", "Context fields, aims and hypotheses, feasibility answers, estimand and variables, analysis contract and sizing inputs, counts, execution, finalisation."], ["11 decisions", "Confirmatory or not, aims-check disposition, basis per answer, approve or alternative, each design condition, biostatistician review, multiplicity, data requests, revise, readiness, write-up and code."]]],
    ["LANE 2", "Stochastic language models", [["Draft and review", "Suggest aims, draft the brief and each step, review as two independent labs, propose one patch, adjudicate."], ["Output varies run to run", "So nothing a model writes is trusted on its own. Every draft is checked against the typed facts before it is shown."]]],
    ["LANE 3", "Deterministic code", [["11 gates and checks", "PHI stripping, context, question, feasibility, conflict, design, credit, 37 plan checks, counts, analysis, execution and finalisation gates, then the export."], ["The only reproducible lane", "Same input, same verdict, every time. It is the only path to the export and the only thing that can withhold a number."]]],
  ];
  lanes.forEach(([lab, head, body], i) => {
    const x = 0.62 + i * 4.02, w = 3.85;
    stepCard(s, x, 1.75, w, lab, head, rich(body, 12), { headH: 1.08, bodyH: 3.25, headSize: 19, bodySize: 12 });
  });
  band(s, "The one loop back from the code lane to the models is the investigator's fixup form, and it costs a credit.", 6.35);
  s.addNotes("Two minutes. This is the governance slide. The lanes are the answer to \"where is the AI in this\": it drafts and reviews; it does not decide what is printed. The full swimlane map with every decision is in the document; the next slide shows one panel of it.");
}

// ---------------------------------------------------------------- 8. process map panel
{
  const s = pres.addSlide();
  title(s, "One panel of the process map: analysis and sizing", "Parallelogram = investigator input · diamond = decision · rectangle = process · numbered circle = continues on the next panel");
  s.addImage({ path: "panelD.png", x: 0.62, y: 1.72, w: 10.3, h: 5.12 });
  s.addText([
    { text: "Read it left to right.", options: { bold: true, breakLine: true } },
    { text: "The investigator supplies the contract and presses Calculate; the code recomputes the number and runs the checks; the fixup form is the only route back to the models.", options: { breakLine: true } },
    { text: "\nFive panels cover the whole flow, tagged I1 to I11 and D1 to D11.", options: { color: C.muted } },
  ], { x: 11.1, y: 1.75, w: 1.9, h: 5.3, fontFace: B, fontSize: 10.5, color: C.ink, isTextBox: true, margin: 0, valign: "top", paraSpaceAfter: 6 });
  s.addNotes("One minute. Do not read the panel. Point at the three lanes and the fixup diamond, then move on. Offer the document for the other four panels.");
}

// ---------------------------------------------------------------- 9. the eleven decisions
{
  const s = pres.addSlide();
  title(s, "The eleven decisions an investigator makes", "In the order they are asked, and who acts on each one next");
  const D = [
    ["Any aim confirmatory?", "Investigator writes the hypothesis; multiplicity becomes required"],
    ["Aims-check finding: apply, keep with a reason, or skip", "Model runs the literature scan"],
    ["Basis per feasibility answer: checked, assumption, or task", "Code feasibility gate; a task blocks design until closed"],
    ["Approve the design, or pick an alternative", "Model re-runs the brief, free; or code runs the conflict gate"],
    ["Each design condition: confirmed, to check, or not available", "Investigator defines the estimand and variables"],
    ["Request a biostatistician design review?", "Code pins the review to the decisions; any change makes it stale"],
    ["Multiplicity family, method and sizing implication", "Code analysis gate"],
    ["Data beyond the map: add it, or remove from the analysis", "Code analysis gate"],
    ["Send the fixup form as one revision?", "Models: guarded patch and adjudication; one credit"],
    ["Readiness: ready, conditional or infeasible", "Code execution gate; infeasible blocks the phase"],
    ["Request the write-up and code, and in which languages", "Models draft steps 6 and 7 on request; code is never executed"],
  ];
  D.forEach(([d, next], i) => {
    const col = i < 6 ? 0 : 1, row = i < 6 ? i : i - 6;
    const x = 0.62 + col * 6.1, y = 1.75 + row * 0.78;
    circle(s, x, y + 0.02, `D${i + 1}`, 0.5, C.green, C.white, 10);
    s.addText(d, { x: x + 0.65, y, w: 5.3, h: 0.3, fontFace: B, fontSize: 12.5, bold: true, color: C.ink, isTextBox: true, margin: 0, valign: "middle" });
    s.addText(next, { x: x + 0.65, y: y + 0.3, w: 5.3, h: 0.42, fontFace: B, fontSize: 10.5, color: C.muted, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.72, y: 5.65, w: 5.85, h: 0.75, fill: { color: C.card }, line: { color: C.card } });
  s.addText("Eleven more items are typed inputs rather than choices: the context fields, aims, hypotheses, feasibility answers, conflict answers, estimand and variables, the model's questions, the analysis contract, counts, execution fields and finalisation.", { x: 6.9, y: 5.68, w: 5.5, h: 0.7, fontFace: B, fontSize: 10, color: C.ink, isTextBox: true, margin: 0, valign: "middle" });
  s.addNotes("Two minutes. Do not read all eleven. Name D4, D6 and D9: the design approval that gates the credit, the optional statistician review that goes stale if anything changes, and the one revision that costs a credit. Appendix A of the document gives every option and its effect.");
}

// ---------------------------------------------------------------- 10. limitations
{
  const s = pres.addSlide();
  title(s, "Where it does not yet help", "Taken from the code, the Learn library and the roadmap notes, not inferred");
  const cards = [
    ["Designs it will not size", "Cluster and stepped-wedge rollouts, mediation, repeated measures, matched case-control, prediction models, equivalence: the method is named and no number is printed. Adaptive, Bayesian, platform and SMART designs have no path at all."],
    ["The checks confirm naming, not application", "They confirm a plan named the right method. They cannot confirm it was applied correctly, that its assumptions hold, or that the plan is good. No rule covers interim analyses or alpha spending."],
    ["No independent evaluation", "The evaluation was run by the person who built the tool, on scenarios he chose. There is no outcome evidence that studies planned with it are better studies. A September evaluation record measured the write-up step failing on about half of eight attempts."],
    ["Code and citations are drafts", "Generated code is never executed, and every export says so. A reference is verified as a PubMed record, not as a claim: the investigator must confirm it supports the use."],
  ];
  cards.forEach(([h, t], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.62 + col * 6.2, y = 1.85 + row * 2.3, w = 5.85, hh = 2.1;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: hh, fill: { color: C.card }, line: { color: C.card } });
    s.addText(h, { x: x + 0.3, y: y + 0.22, w: w - 0.6, h: 0.4, fontFace: B, fontSize: 16, bold: true, color: C.green, isTextBox: true, margin: 0, valign: "middle" });
    s.addText(t, { x: x + 0.3, y: y + 0.7, w: w - 0.6, h: hh - 0.85, fontFace: B, fontSize: 12, color: C.ink, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addText("The product's own methods page lists what it refuses: IRB determinations, final interpretation of results, a sample size it cannot justify, replacing collaborators, writing citations from memory.", { x: 0.62, y: 6.5, w: 12, h: 0.5, fontFace: B, fontSize: 12, color: C.muted, isTextBox: true, margin: 0 });
  s.addNotes("Two minutes. Lead with these rather than being asked. The independent-evaluation card is the honest one and the audience will respect it. Do not soften the write-up failure rate; say it was measured on eight attempts and has not been re-measured.");
}

// ---------------------------------------------------------------- 11. close (dark)
{
  const s = pres.addSlide(); s.background = { color: C.deep };
  s.addText("What to take from this", { x: 0.8, y: 0.7, w: 11, h: 0.8, fontFace: H, fontSize: 36, bold: true, color: C.white, isTextBox: true, margin: 0 });
  const items = [
    ["The safeguard is typed inputs plus a refusal to print", "Any tool can ask good questions. Ask whether it can hold a plan to the answers, and what it does when they contradict."],
    ["Treat every output as a draft for a statistician and an IRB", "The product says so on every export. The design brief and the pinned facts are what a consultation should start from."],
    ["Independent evaluation is the open question", "The numerical core is pinned against R. Plan quality has not been independently judged, and that is the work to fund or to decline."],
  ];
  items.forEach(([h, t], i) => {
    const y = 1.95 + i * 1.32;
    circle(s, 0.85, y + 0.02, i + 1, 0.46, C.mintText, C.deep, 16);
    s.addText(h, { x: 1.55, y: y - 0.02, w: 10.5, h: 0.4, fontFace: B, fontSize: 19, bold: true, color: C.white, isTextBox: true, margin: 0, valign: "middle" });
    s.addText(t, { x: 1.55, y: y + 0.4, w: 10.5, h: 0.6, fontFace: B, fontSize: 14, color: C.mintSoft, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y: 6.15, w: 11.6, h: 0.02, fill: { color: C.mintText }, line: { color: C.mintText } });
  s.addText("Full write-up, process map and the appendix of every decision: Mallard Study Design Process (shared Google Doc).", { x: 0.85, y: 6.35, w: 11.6, h: 0.45, fontFace: B, fontSize: 15, bold: true, color: C.white, isTextBox: true, margin: 0, valign: "middle" });
  s.addNotes("Two minutes, then questions. Restate the three points. Point to the document for the five-panel map and Appendix A. Agree a next step and a date before leaving.");
}

pres.writeFile({ fileName: "Mallard Study Design Process - leaders deck.pptx" }).then((f) => console.log("wrote", f));
