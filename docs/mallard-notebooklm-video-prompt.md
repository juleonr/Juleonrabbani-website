# NotebookLM Video Overview prompt: Mallard in three minutes

Paste the block under "Prompt" into the Customize box of NotebookLM's Video Overview
after adding the sources listed first. The prompt is written for the September 2026
build of Ask Mallard (six-phase workspace, build 2026-09-17p).

## Sources to add to the notebook

1. Google Doc "Mallard Study Design Process" (the current version, not the two marked superseded).
2. "Mallard Study Design Process - leaders deck.pptx" (upload the file; the six process-map panels are slides 8 to 13).
3. Website pages, added as URLs: https://askmallard.com (home), the About page and the Learn landing page.

Keep the notebook to these sources. Extra sources dilute the focus on what changed.

## Prompt

```text
Make a short overview video of Ask Mallard (askmallard.com), about three minutes,
for clinical research leaders and investigators who plan studies but are not
statisticians. Speak plainly, at a measured pace, and prefer the process diagrams
and the swimlane panels from the sources over new illustrations.

Frame it as "what Mallard is, and what changed this month". Use this structure:

1. The problem (20 seconds). A general chatbot will write a confident study plan
   from whatever it is given. It fills gaps from its priors, and nothing stops it
   printing a sample size it cannot justify.

2. What Mallard is (30 seconds). A guided workspace that turns a research question
   into a study design and analysis plan. A plan is never the output of one model:
   two independent model reviews, an adjudicator that judges but never edits, then
   deterministic code (37 checks, 17 sizing calculators pinned against R) that can
   refuse to print a headline number. The investigator confirms every gate.

3. What is new: the six-phase workspace (60 seconds). This is the main change to
   the website. Walk the six phases in order: question and aims; feasibility;
   design, where the aim, hypothesis, estimand and variables are settled BEFORE
   the design brief is drafted; build the study and draft the analyses, two
   separate presses; execution, which runs on request rather than automatically;
   and deliverables. Each phase ends in a gate the investigator confirms, and
   nothing downstream can generate until the gate before it is confirmed. Show
   the six process-map panels or the six-phase diagram while you do this.

4. What is new: revision without silent regeneration (30 seconds). Editing a
   confirmed decision now shows an impact preview. The investigator chooses
   "save without regenerating" or "save and update affected sections". Affected
   work is marked stale, only that work is regenerated, and the regenerated
   result waits as a pending change until it is accepted or discarded.

5. Who decides what (20 seconds). Use the three-lane view: investigator inputs
   and decisions, stochastic language models that draft and review, deterministic
   code that gates, calculates and checks. Nothing reaches the export without
   passing the third lane. Mention that typed inputs (context, feasibility rows,
   estimand fields, counts) are what let the code hold the plan to the answers.

6. Where it does not yet help, and the close (20 seconds). Say clearly that every
   output is a draft for a statistician and an IRB, that plan quality has not been
   independently evaluated, and that the Learn library and the About page explain
   the method. End by pointing to the shared "Mallard Study Design Process"
   document for the full process map and the appendix of every decision.

Rules:
- Use only facts that appear in the sources. Do not invent user numbers, accuracy
  figures, customer names, pricing, or timelines.
- Do not describe per-stage credits as live; the sources say the plan credit is
  spent once when the study is built.
- Do not say external design review is part of the guided flow; it is legacy only.
- Do not call the output advice or a finished protocol. Call it a draft plan.
- Name phases and gates the way the sources do. Do not rename them.
- Keep on-screen text short: one line per phase, one line per lane.
```

## After it renders

Check the video against these three points before sharing it. Each is a place a
video generator tends to drift from the sources.

- The six phases are named in the source order, and the design brief is drafted
  after the estimand and variables, not before.
- Build study and draft analyses are described as two presses, and execution as
  on request.
- No number appears that is not in the sources (37 checks, 17 calculators, six
  phases, eleven investigator decisions, three lanes).
