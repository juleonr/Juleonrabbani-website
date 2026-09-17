# Mallard Study Design Process

Source of truth: https://claude.ai/code/artifact/fab5d454-18b6-441c-958b-9bb8b57ec877 (living copy; this file is a Markdown export).

2026-09-17 · Juleon Rabbani

## Purpose and scope

This document describes how [Ask Mallard](https://askmallard.com) takes a clinician from a plain-language study description to a study design plan it is willing to print, and what it asks along the way that a general-purpose chatbot does not. It is written from the Ask-Mallard source code and its project documentation as of 17 September 2026, and it reports only what the app does today. Where Mallard does not yet help, the Limitations section says so rather than describing a feature that may come later.

Mallard's own framing is the useful one: models draft and review, and deterministic code decides what may be printed. A plan is never the output of a single model. Since September 2026 the investigator works in a six-phase study workspace, the default entry for every new study: question and aims, feasibility, design confirmation, analysis and sizing, execution and budget, finalise and export. Each phase ends in a gate the investigator confirms, a later decision can reopen an earlier one, and a fixed set of non-AI statistical checks runs on every generated section and can withhold a sample size the plan cannot justify. Mallard states that it is a planning aid for a qualified person to check, not a substitute for a biostatistician or an IRB.

The audience for this document is an investigator, a program director or a statistician deciding whether the process is trustworthy, and a developer deciding what to build next. Appendix A lists every decision the investigator makes before a final plan and how each one changes the recommended plan.

## The process from question to plan

A valid plan is built in a six-phase workspace, with the design settled in a free brief inside Phase 3 and the single plan credit spent when the study is built in Phase 4. Every phase ends in a gate the investigator confirms after a preview of what the confirmation changes, and nothing downstream is drafted from a gate that is not confirmed. The seven generation steps of the underlying pipeline still exist, but they are now jobs the workspace calls at the right phase: the design brief, the study build, the per-aim analysis, execution, the written package and code.

```mermaid
flowchart TD
  A[Study context: 5 screens<br/>9 typed fields, PHI stripped] --> P1[Phase 1 Question and aims<br/>aims suggested, aims check, literature scan]
  P1 --> P2[Phase 2 Feasibility<br/>7 questions, basis per answer, variable map]
  P2 --> P3[Phase 3 Design confirmation<br/>estimand and variables, then the free brief]
  P3 --> G{Approve the design?<br/>context conflict gate}
  G -- alternative, free --> P3
  G -- confirmed --> P4a[Phase 4 Build the study<br/>plan credit spent here]
  P4a --> P4b[Phase 4 Draft analyses per aim<br/>two-lab review, 37 checks]
  P4b --> D{Investigator settles contract,<br/>sizing, multiplicity, counts}
  D -- edit a decision --> R[Update affected sections<br/>result held for acceptance]
  R --> D
  D -- gate confirmed --> P5[Phase 5 Execution and budget<br/>drafted on request]
  P5 --> P6[Phase 6 Finalise and export<br/>write-up and code on request]
  P6 --> X[Export with gate status,<br/>assumptions and review record]
```

Read top to bottom: the brief loop inside Phase 3 is free and repeatable, the credit is spent once when the study is built, the revision loop in Phase 4 regenerates only what an edit touched and holds the result until the investigator accepts it, and execution, the write-up and code are drafted only when asked for.

| Phase | The investigator settles | The models generate | The code gates | Cost |
| --- | --- | --- | --- | --- |
| Study context | The question or an uploaded document, and nine typed context fields | Nothing | PHI stripped on entry; all fields answered | Free |
| 1. Question and aims | One to three aims with a role and an intended claim, a hypothesis for each confirmatory aim, a ruling on every aims-check finding | Suggested aims, alternatives and hypotheses; the aims check; PubMed queries for the literature scan | Queries resolved against PubMed; a summary citing an unretrieved record is refused; the Phase 1 gate | Free |
| 2. Feasibility | Seven answers, each with a basis, a result and an owner | The variable map, on request | The Phase 2 gate: every row has a basis and a result | Free |
| 3. Design confirmation | The estimand, every variable with its role and measurement, then the design itself, and each design condition | Starting points from earlier answers, suggested variables, and the preliminary design brief with conditions and up to three alternatives, reviewed by two labs | Brief estimand checks; the context conflict gate; the Phase 3 gate | Free, within a monthly brief allowance |
| 4. Analysis and sizing | Data requests, the analysis contract, sizing assumptions and calculator inputs, the recorded result, multiplicity, reconciliation and counts | The study build, then each aim's analysis, sizing method, exhibits and code scope, with multiplicity and accrual proposals; regeneration of stale sections | Sign-in and the plan credit; deterministic checks on the study; the 37 checks and the withheld headline; the pending-result guard; the Phase 4 gate | One plan credit at the study build; later steps ride on it, each re-runnable once per version |
| 5. Execution and budget | Execution fields, governance, tasks, timeline, costs and readiness | Operations, governance, tasks, timeline and budget justification, on request | Dates ordered, no dependency cycles, costs priced or marked not established; infeasible blocks the phase | Covered by the credit |
| 6. Finalise and export | Written-draft edits, the reconciler, the review summary, the code disposition and languages | The written package and code per language, on request | The Phase 6 gate; the export with gate status, assumptions, stale dependencies and review record | Covered by the credit; code once per language |

Four properties of this order matter for validity. The estimand and the variables are defined before the design is recommended, so the brief is drafted against a stated target rather than inventing one. The design is confirmed before anything downstream is drafted, because a plan built on the wrong design is wrong throughout. Each generation job drafts only its own sections and may not rewrite a confirmed decision, and the investigator's answers to the model's questions are pinned as facts no later job can overwrite. Editing a confirmed decision marks the generated work that depends on it stale, so a changed population or analysis cannot leave a sample size that was computed for the old one.

Sources: the aims-based workspace specification (docs/specs/aims-based-plan-workspace-2026-09-08.md), the workspace modules (src/workspaceFlow.js, src/workspaceRevision.js, src/aimsAnalysis.js, src/WorkspacePanel.jsx), the step definitions (src/steps.js) and the deployed pipeline description (docs/pipeline/pipeline.html, build 2026-09-17p). The per-stage credit model in src/credits.js is implemented but not activated in production.

## What Mallard collects that a general model does not

The difference is not the questions but their type. A general chatbot reads free text, fills gaps from its priors, and answers the same question with a weaker method if the asker sounds under-resourced. Mallard asks for typed facts, refuses to invent what was not supplied, and lets those facts govern what the deterministic layer will allow to print. The rule at the head of every context block is that context governs feasibility, never validity: the simplest defensible method comes from the question, and resources only decide whether it is reachable.

| What Mallard collects | The malpractice it guards against | What changes in the plan |
| --- | --- | --- |
| Eight typed context fields: primary use, deliverable, horizon, data state, data source, funding, team roles, who runs the analysis, plus who leads the design | Letting the investigator's software or team size choose the method. A test fails if any prompt says "simplest valid analysis" or "completed in spreadsheet" | Funding and a full team can only route the draft to a stronger model. The write-up sections follow the primary use. A novice analyst gets SPSS steps plus R and plain-register prose |
| Data state compared against the brief's typed assignment mechanism | Planning a randomised or prospective study on records already in hand, or the reverse | Four typed conflicts, three of them blocking, disable Generate until the investigator answers which is true |
| Deadline as two fields: a duration and what must exist by then, with a typed "study must finish" flag | Sizing a three-year cohort for a six-month results deadline, or refusing a study that only needs a proposal by then | A six-month results deadline against a prospective design blocks; a six-month proposal deadline does not |
| Team roles by name, nine of them, and a report of who is missing | A plan that assumes a statistician nobody has | The support sentence names the gap; "full" support means a statistician plus someone who handles the data |
| Aims with a role (primary confirmatory, secondary confirmatory, exploratory), an intended claim, and a hypothesis required for confirmatory aims | Confirmatory claims built on exploratory analyses, and hypotheses written after the results | A deferred aim is excluded from generation and gates. Multiplicity fields become required once any confirmatory aim exists |
| Aims drafted with bracketed placeholders, never invented facts, and a causal aim never reworded as an association | A follow-up window or comparator the model made up, or a causal question silently downgraded | The investigator fills every placeholder; an override of the aims check needs a written reason |
| A typed estimand, defined by the investigator before the design is recommended: target, population, exposure, comparator, outcome and its type, summary measure, time horizon, framing, unit of inference, assignment mechanism, clustering, repeated measures, competing events | A sample-size formula, analysis and figure that each answer a different question | Seventeen estimand rules compare sizing, analysis and exhibits to the typed fields. A contradiction withholds the headline number everywhere |
| Every variable with a role per aim (outcome, exposure, confounder, mediator, effect modifier, selection factor, design, descriptive), measurement format, timing, source, availability, missingness and an owner | Adjusting for a mediator, adjusting for a variable measured after exposure, and an analysis that needs a variable nobody records | A variable that is both confounder and mediator is a blocking contradiction. The diagram is labelled a proposed structure. The variable map explicitly refuses to choose an adjustment set |
| Missing data assumption-first: the mechanism is named before a method | Multiple imputation chosen by default, when it is right under MAR and wrong under several plausible alternatives | A method named with no assumption behind it warns; a plausible MNAR mechanism calls for a delta or tipping-point sensitivity |
| A feasibility interview with a basis for each answer: checked result or planning assumption, and a named owner | Treating a guessed record count as evidence of power | Answers are planning prompts, never evidence. Tasks with owners block the design decision until closed |
| Design conditions from the brief, each with a record-level check, a numeric threshold and the design to switch to if it fails | Assuming the conditions a design depends on rather than testing them | Each condition lands as a feasibility row answered Confirmed, Need to check or Not available |
| Count reconciliation with availability typed as entered or not yet established, and a sizing approach per row: calculated minimum, planning cap, census or fixed sample | Reporting that entered counts "meet their requirement" when the count was typed to get past a gate | A count not yet established carries a provisional caveat into the printed package |
| Sizing inputs typed per method, with a record of which inputs the investigator supplied versus defaulted, and a required literature source | A power calculation whose inputs are unlabelled assumptions | The app recomputes the number from the inputs. Editing an input clears the recorded result until the investigator recalculates and records it again |
| Multiplicity: the family, the method and its sizing implication | Several confirmatory comparisons at an unadjusted alpha | Required whenever a confirmatory aim exists |
| An analysis contract per aim: primary analysis, alternatives, selection rationale, covariates, missing data, sensitivity analyses, subgroups, analysis population | Choosing the analysis after seeing the data | All eight fields are required before analysis and sizing are confirmed; a subgroups field that prespecifies nothing still counts as untested effect modification |
| A decision record with dependencies: every edit to a confirmed decision is previewed with the generated work it affects, and a revision after the analysis records its reason and whether outcomes had been inspected | Silent rewrites of a plan after the data are in, and regenerated sections that no longer match the decisions they came from | Affected work is marked stale, unaffected work is preserved, a regenerated result is held for acceptance with a diff, and a result whose decisions changed mid-generation is refused |
| Investigator answers to the model's own questions, pinned as facts | A later step quietly overwriting what the investigator said | Pinned facts are re-emitted verbatim into every later step; "not sure" is deliberately not pinned |
| Citations as PubMed queries, never text | Fabricated references | Each query is resolved live; a record that does not exist cannot appear, and a found record is marked as needing confirmation that it supports the use |
| Protected health information stripped on upload and again at Generate | Identifiers reaching a model or a saved plan | Warnings report categories and counts only; study periods, doses and codes survive |

A general model can be prompted to ask any of these questions. What it cannot do is refuse to print a number when the answers contradict each other, and that refusal is the part of Mallard that reduces malpractice risk rather than merely documenting it.

Sources: src/context.js, src/workspaceFlow.js, src/aimsAnalysis.js, src/variablePlanning.js, src/variableMeasurement.js, src/feasibilityInterview.js, src/countReconciliation.js, src/estimand.js, src/steps.js and the statistical-correctness rules in CLAUDE.md of the Ask-Mallard repository.

## The feedback loop: review, checks and revision

A generated section is never accepted as drafted. It passes through two independent model reviews, one guarded corrective revision, an adjudicator that judges but never edits, and then the deterministic layer, which alone decides what may be printed. The investigator closes the loop by editing a decision, updating the sections that depend on it, and accepting or discarding what comes back.

```mermaid
flowchart TD
  A[Draft the job<br/>only its own sections] --> B[Anthropic reviewer<br/>ranked issues + 7 safety verdicts]
  A --> C[OpenAI reviewer<br/>ranked issues + 7 safety verdicts]
  B --> D[Merge worst case<br/>unanswered domain = unknown]
  C --> D
  D -- needs fix --> E[One corrective patch<br/>own keys only, guarded]
  D -- clean --> F
  E --> F[Repair truncated sections<br/>batches, then subfields]
  F --> G[Adjudicator re-reads final plan<br/>judge, never editor, 90 s]
  G --> H[37 deterministic checks<br/>17 estimand rules + 20 validators]
  H -- contradiction in 7 codes --> I[Headline sample size withheld<br/>screen, memo, HTML, docx]
  H -- warn or block --> J[Findings shown with the plan<br/>plan still renders]
  G -- residual affects analysis --> K[Status: needs statistical review]
  I --> L{Investigator edits a decision,<br/>or accepts or discards a result}
  J --> L
  K --> L
  L -- update affected sections --> A
  L -- gates confirmed --> M[Six workspace gates<br/>then export with review record]
```

Read top to bottom: the two reviews are the only concurrent step, the deterministic layer sits below every model and cannot be overruled by one, and the loop back to a draft is driven by the investigator's decision edits and explicit acceptance, not by the models re-trying.

**Two model reviews, merged worst case.** Each reviewer returns a capped list of ranked issues plus a verdict on seven safety domains: design matches question, estimand matches analysis, sizing matches design and estimand and analysis, clustering handled, randomisation claims supported, missing data coherent, causal adjustment coherent. The domains are answered outside the issue budget because a ranking drops whatever came fifth without saying so. An unanswered domain is recorded as unknown, never as pass, and a concern reaches the revision even without an issue slot. Only the design brief and the analysis step get this review; every other step gets the repair pass and the deterministic checks.

**One guarded revision.** The corrective pass is a patch of changed keys, filtered to the step's own sections. A patch that changes a field's type, truncates a string, empties a section, or invents a reviewer response is dropped, and a revision that comes back thinner than the draft is rejected with the reason recorded. On the brief, the deterministic estimand checks feed the revision directly and the brief is re-emitted whole, because mutual consistency is the product.

**The deterministic layer has the last word.** The checks read the typed estimand, the sizing method, the recommended analysis, the diagram and the rendered exhibits, and compare them to each other. The validators the code runs include:

- Sizing against the estimand, the analysis and the design: a superiority formula under a non-inferiority framing, an events-per-variable floor for a prediction model, an individual-level formula for a clustered design, a closed form for mediation.
- Fabricated results: a stated power or sample size under a sizing method that performed no calculation is blocked.
- Causal structure: a variable listed as both confounder and mediator blocks, an exposure level in the adjustment set warns, a listed effect modifier with no interaction or subgroup analysis warns.
- Inference: cluster-robust or GEE inference with under 15 clusters and no small-sample method blocks, under 30 warns; randomisation inference on a typed non-randomised design warns.
- Missing data: a method with no MCAR, MAR or MNAR assumption named warns, as does imputation named alongside a complete-case primary analysis.
- Consistency: code that fits a model the methods never name blocks, a confirmatory analysis also listed as exploratory blocks, an RCT citing STROBE instead of CONSORT warns, and every sizing input without a provenance row warns.

**What failing looks like.** The plan is never blanked or regenerated by the checks, because a false positive that shows a blank screen destroys work a paid credit bought. Findings are severity-ranked and always rendered. Four consequences follow, in increasing weight.

| Outcome | Trigger | What the investigator sees |
| --- | --- | --- |
| Warning | Any warn-level finding | A banner above the plan, and the finding named inline in the audit's consistency row in every export |
| Block | Any block-level finding | The same banner, red, headed "This plan contradicts itself" |
| Headline withheld | One of seven headline-suppressing codes, or an unresolved reviewer point typed as affecting the sample size | No sample-size number anywhere; the panel says whether the reason is a contradiction, an open review point, or that no formula fits |
| Needs statistical review | An unresolved reviewer point affecting the primary analysis | A status carried to the screen, memo, audit and library card; the analysis stays visible |

**Closing the loop.** Since the workspace, the loop back to the models is a decision edit, not a free-text request. Editing a confirmed decision opens a preview: the old and new values, the generated work the change affects through a typed dependency map (assembly to analysis to sizing to exhibits to write-up and code; the confirmatory family to sizing; reconciliation to execution and write-up), and the work that is preserved. The investigator may save without regenerating, which marks the affected sections stale and withholds library code references until they are updated, or save and update the affected sections, which regenerates only the stale aims and sections. A regenerated result is held pending with a diff against the current content and is accepted or discarded explicitly; a result whose decisions changed while it was generating is refused, and every accepted or discarded result is kept in a generated-revision history beside the decision history, which records the reason for a revision and whether outcomes had been inspected. Separately, the guided workspace holds six gates, from question through feasibility, design, analysis and execution to finalisation, and each is confirmed only when its typed fields are complete and free of privacy findings. Finalisation additionally requires a named human reconciler, a review summary that states remaining limitations, a recorded code disposition and no open review comments. An external analysis review can be recorded against a canonical copy of the analysis decisions and goes stale if any of them change.

Sources: src/validate.js, src/estimand.js, src/pipeline.js, src/fixup.js, src/workspaceFlow.js, src/workspaceDeliverables.js, netlify/functions/consult-work-background.js and docs/pipeline/pipeline.html in the Ask-Mallard repository.

## Process map: who decides what

The investigator makes 11 typed inputs, 11 decisions and 4 presses on the way to an exported study package, and none of them is acted on by a model alone. The map below follows the six-phase workspace and places every activity in one of three lanes: the investigator, who supplies facts, presses for generation and chooses; the stochastic language models, which draft and review and whose output varies from run to run; and the deterministic code, whose gates and checks are the only reproducible part of the process and the only path to the export. Read each panel left to right; a numbered circle continues on another panel, and the tags I1 to I11 and D1 to D11 index the table at the end of this section.

Shapes follow the usual process-mapping convention: a parallelogram is data the investigator enters, a diamond is a decision, a rectangle is a process step, a rounded shape is the start or end, and the page shape is an output.

![Panel A. Study context and Phase 1](images/mallard-process-map-A.png)

Panel A. The study description and the nine context fields are typed before any model call. The model proposes aims with placeholders; the investigator fills them, sets each aim's role, and rules on the aims check. The code strips identifiers, resolves citations against PubMed and holds the Phase 1 gate.

![Panel B. Phase 2 feasibility, then the estimand, variables and brief](images/mallard-process-map-B.png)

Panel B. Feasibility answers carry a basis and an owner before Phase 2 confirms. Phase 3 then starts from the estimand and the variables, with the model filling starting points and suggesting variables but never an adjustment set, and only then drafts the preliminary design brief, reviewed by two labs and checked by code.

![Panel C. Phase 3 design decision and gate](images/mallard-process-map-C.png)

Panel C. The investigator approves the brief's design or picks an alternative, which re-runs the brief free. The conflict gate compares the typed context with the chosen design and refuses to proceed until the investigator says which statement is true. The brief's conditions become feasibility rows to answer, and the Phase 3 gate is deterministic.

![Panel D. Phase 4 build the study and draft the analyses](images/mallard-process-map-D.png)

Panel D. Two presses drive Phase 4: Build study, which spends the plan credit and drafts the population and data specification, and Draft analyses, which drafts each aim's contract, sizing method and exhibits under two-lab review and the 37 checks. The model's questions come back as pinned facts, and the investigator fills the contract, sizing assumptions and calculator inputs and records the result.

![Panel E. Phase 4 shared decisions, revision and the analysis gate](images/mallard-process-map-E.png)

Panel E. Multiplicity and count reconciliation are investigator decisions the analysis gate then verifies. An edit to a confirmed decision is previewed with its downstream impact; saving marks affected work stale, updating regenerates only the stale sections, and the result is held with a diff until the investigator accepts or discards it.

![Panel F. Phase 5 execution and Phase 6 finalisation](images/mallard-process-map-F.png)

Panel F. Execution is drafted on the investigator's press, not automatically. Readiness, the request for a written package and code, and finalisation are investigator decisions; the Phase 6 gate requires the written package to be current and no open review comments before the code assembles the export.

| Tag | What the investigator supplies or decides | Panel | Acted on next by |
| --- | --- | --- | --- |
| I1 | Nine context fields | A | Code: all-answered gate; models: prompt context |
| I2 | Aims edited, placeholders filled, role and intended claim per aim | A | Investigator D1; code: Phase 1 gate |
| D1 | Any aim confirmatory? | A | Investigator I3; later D7 |
| I3 | Hypothesis for each confirmatory aim | A | Model: aims check |
| D2 | Apply each aims-check finding, keep own wording with a reason, or skip | A | Model: literature scan |
| I4 | Seven feasibility answers | B | Investigator D3; model: variable map on request |
| D3 | Basis per answer: checked result, planning assumption or task | B | Code: Phase 2 gate; a task blocks design until closed |
| I5 | Estimand, variables, roles, measurement settings, relationships | B | Model: the preliminary design brief |
| D4 | Approve the recommended design or pick an alternative | C | Model: brief re-run if alternative; code: conflict gate if approved |
| I6 | Answer to a context conflict | C | Code: conflict gate re-run |
| D5 | Each design condition confirmed, to check, or not available | C | Code: Phase 3 gate, then the investigator's design confirmation |
| I7 | Answers to the model's questions at the study build | D | Models: pinned facts in every later job |
| D6 | Data beyond the map: add to the map or remove from the analysis | D | Investigator I8 |
| I8 | Analysis contract, sizing assumptions, calculator inputs, recorded result | D | Code: recompute N; the 37 checks |
| D7 | Multiplicity family, method and sizing implication, if any aim is confirmatory | E | Investigator I9 |
| I9 | Count reconciliation rows | E | Code: established or provisional |
| D8 | After an edit: save without regenerating, or save and update affected sections | E | Code: stale marking; models: regeneration of stale sections |
| D9 | Accept or discard the generated changes | E | Code: Phase 4 gate |
| I10 | Execution fields, governance, tasks, timeline, costs | F | Investigator D10 |
| D10 | Readiness: ready, conditional or infeasible | F | Code: Phase 5 gate; infeasible blocks the phase |
| D11 | Request the written package and code, and in which languages | F | Models: written package and code on request |
| I11 | Written-draft edits, reconciler, review summary, code disposition | F | Code: Phase 6 gate and export |

The four presses are Build study, Draft analyses, Draft execution and the on-request written package and code. The map is generated from a node list in the repository (docs/images/mallard-process-map.py) so it can be regenerated when the flow changes; the SVG sources sit beside the PNGs.

## Where Mallard does not yet help

Mallard sizes fifteen design families deterministically, describes many more without a number, and says nothing useful about a further group. Its own methods page lists the refusals: IRB determinations, final interpretation of results, a sample size it cannot justify, replacing collaborators, and citations written from memory. The gaps below are taken from the code, the Learn library and the roadmap notes, not inferred.

**Design families by what the engine can do**

| Coverage | Design families | What the investigator gets |
| --- | --- | --- |
| Deterministic calculator, pinned against R | Two means (exact noncentral t), paired means, one mean, two proportions, one proportion, correlation, log-rank, logistic events-per-variable floor, linear subjects-per-variable floor, diagnostic accuracy precision, kappa precision, k-group ANOVA, single-proportion precision with clustering, cross-sectional stepped wedge (power only), interrupted time series (simulated power only), non-inferiority of two proportions | A headline number or power figure, recomputed by the app from typed inputs, with the assumptions printed |
| Described, deliberately not sized | Cluster-randomised and staggered rollouts, closed-cohort or incomplete stepped wedge, mediation, repeated-measures and longitudinal models, difference-in-differences, recurrent events, complex surveys beyond one proportion | The method is named and the plan says a simulation is required; no number is printed, and a stated power under this route is blocked as fabricated |
| Named method, no closed form in the catalog | Matched or nested case-control (Dupont 1988), prediction-model development and validation (Riley criteria), equivalence, non-inferiority on a mean or time-to-event | The method and its inputs are named in prose; the headline is empty |
| Learn page only, no plan or sizing support | Qualitative, systematic review and meta-analysis, economic evaluation, case series, regression discontinuity, control charts, network and diagnostic-accuracy meta-analysis | Explanation and a statement that Mallard does not run or size it |
| Keyword only, raises complexity and nothing else | Adaptive, interim and group-sequential, Bayesian, joint and multistate models, latent-variable models, MNAR, synthetic control, target-trial emulation, crossover, factorial | The study routes to the stronger drafting model; no dedicated design or sizing path exists |
| Not covered anywhere | Platform, basket and umbrella trials, SMART and adaptive treatment strategies, micro-randomised trials, dose-finding, diagnostic impact studies | Nothing beyond a possible complexity keyword |

**Known partial coverage stated on the page**

- Multi-arm trials scale a per-arm number by the arm count for two-means designs only. For proportions and time-to-event outcomes the figure covers one comparison, and Mallard does not choose a multiplicity adjustment.
- The paired calculation is continuous-only. A binary paired outcome, mixed one-site and two-site participants, or more than two sites per person are not sized.
- The one-proportion calculation is single-stage. The roadmap records as a confirmed gap that nothing stops it being used for a Simon two-stage design.
- Diagnostic accuracy sizes one test's precision, not a paired comparison of two tests.
- The non-inferiority calculator sizes one analysis with no dropout inflation and no per-protocol allowance.
- The stepped-wedge and interrupted-time-series engines return power, not a sample size, and both state what they do not model: small-cluster inference and closed cohorts for the former, serial autocorrelation for the latter.

**Limits of the checks themselves**

- The deterministic checks confirm that a plan named the right method. They cannot confirm the method was applied correctly, that its assumptions hold, or that the plan is good.
- Model review by two labs runs only on the design brief and the analysis step. Every other step gets a repair pass and the fixed checks.
- The corrective revision is adjudicated, never enforced: an unresolved reviewer point withholds the sample size or marks the plan as needing statistical review, but nothing else is blanked.
- No deterministic rule covers interim analyses, alpha spending or group-sequential boundaries. They raise the complexity level and are judged by the reviewers and the audit's multiplicity item only. Multiplicity itself is a workspace gate requirement and an audit item, not a validator.
- Outcome and exposure timing has no plan-level deterministic check. It is enforced as a required field per variable at the design gate and judged by the reviewers.
- The evaluation is run by the person who built the tool, on scenarios that person chose. No independent evaluation has been carried out, and there is no outcome evidence that studies planned with Mallard are better studies.
- An evaluation record from 6 September 2026 measured the write-up step failing to parse on roughly half of eight attempts. Nothing in the tree records a fix, and this document did not re-measure the current rate.
- Generated code is never executed by Mallard, and every export says so. The code library's SAS and Stata entries are not executed in its own continuous integration either.
- There is no capability registry: which designs are sized, described or refused is documented in prose and tested nowhere as one list. The roadmap proposes one and marks it not implemented.

**Operational limits an investigator will notice**

- Signed out, nothing is saved. The design brief is never exported, saved or filed at any tier.
- Feasibility answers are planning prompts, never evidence that the records exist. Mallard has no access to the investigator's data, so every record-level check in the brief is something a data programmer runs later.
- Reference verification confirms a PubMed record exists and says the investigator must confirm it supports the use. It does not read the paper.
- The budget engine uses illustrative US placeholder salary rates capped at the NIH ceiling and asks for every figure to be replaced.
- The per-stage credit model in the code, where each generated stage carries its own price and confirmation, is not activated in production. The live rule is one plan credit at the study build, with later stages riding on it and one free re-run each.
- The owner's 16 September walkthrough feedback is a specification only: default assumptions for unchecked feasibility answers, a redrawn causal map and simpler phase confirmations are not in the app yet.

Sources: the public methods page (public/methods.html), the sizing catalog and schema prompt (src/schema.js, src/estimand.js), the four sizing modules, the Learn content, and docs/reviews/learn-priority-roadmap-2026-09-14.md, which states that nothing in it is approved for implementation.

## Appendix A: every decision before a final plan

The guided flow puts these decisions to the investigator in the order below, and a later phase cannot be confirmed until the earlier one is. Every context field accepts "Not sure yet", which counts as answered and contributes nothing to the prompt. The right-hand column states what the choice changes, taken from the code that reads it.

**A1. Study context, asked before any model call**

| Decision | Options | How it changes the plan |
| --- | --- | --- |
| Your question | Free text, or a PDF, Word, text, Markdown or CSV upload up to 10 MB, 50 pages and 50,000 characters | The whole plan. Identifiers are stripped before the text enters the app |
| Primary use, up to two | Grant or funding proposal; protocol or IRB submission; power and sample-size justification; data feasibility work-up | Selects the write-up sections: a grant adds abstract, significance, innovation and background; a protocol adds abstract and background; power and feasibility add nothing beyond the summary and methods paragraph |
| Deliverable | Proposal; interim results; final results; complete study | Carries the "study must finish" flag. A results or completion deadline within 12 months against a prospective or randomised design is a blocking conflict; a proposal deadline is not |
| Horizon | 1, 3, 6, 12, 30 or 54 months | Sets a target date used by the conflict check and by the design table's fit badges, such as "takes years to an answer" |
| Data state, multi-select | To be collected; source identified; collection in progress; raw data in hand; analysis-ready dataset | Raw or ready data against a randomised or prospective design blocks Generate until answered. An analysis-ready dataset skips acquisition only, never cohort construction, definitions, missingness or QC |
| Data source, multi-select | Care records; registry; public dataset; linked data; primary collection | Two or more sources attach the linkage guidance, which asks whether the records are actually joined rather than assuming linkage |
| Funding | Unfunded; under 50k; 50k to 150k; 150k to 500k; 500k and above; or a custom amount in USD | Routes the draft to the strongest model at the top level, or at the substantial level with a full team. It can only route up. The brief is told to right-size the design to the level, and the plan grades its own funding fit; when unstated, the over- or under-scoped note is suppressed |
| Team roles, multi-select | Just me; statistician; analyst; coordinator; data manager; regulatory; clinical; trainee; qualitative researcher | The support sentence names who is present and who is missing. "Full" support means a statistician plus an analyst or data manager and, with funding, routes up. Capacity never licenses a more elaborate analysis |
| Who runs the analysis | Myself, new to this; myself, comfortable; a collaborator; a core team | Sets the prose register: technical only for the comfortable self-analyst. A novice gets SPSS, JASP or jamovi steps plus R at the code step; otherwise the chosen language or R |
| Who leads the design | Myself, basic; myself, experienced; a collaborator; a core team | Feeds the design table's fit badges, such as "needs a statistician, and you are working alone" |

**A2. Question and aims**

| Decision | Options | How it changes the plan |
| --- | --- | --- |
| Aims, one to three | Free text up to 3,000 characters each, drafted by the model with bracketed placeholders the investigator fills | Each active aim gets its own analysis contract, sizing, result shells and code. A causal aim is never reworded as an association |
| Role per aim | Primary confirmatory; secondary confirmatory; exploratory | Any confirmatory aim makes the multiplicity family, method and sizing implication required, and a confirmatory hypothesis mandatory |
| Hypothesis | Free text; required when the role is confirmatory | The model never replaces a hypothesis the investigator wrote |
| Intended claim | Free text, required | Read by the reviewers to judge whether the design and evidence level can support it |
| Defer an aim | Yes or no | A deferred aim is excluded from generation and from every gate |
| Aims-check disposition | Apply; keep mine, with a written reason; skip | An override without a reason is refused. Open findings are marked skipped on Continue |
| Literature scan | A PubMed query up to 600 characters and 3, 5 or 8 references to show | Records the search and its verified records; a summary citing an unretrieved record or judging a gap from titles alone is refused |

**A3. Feasibility interview, one basis per answer**

| Decision | Options | How it changes the plan |
| --- | --- | --- |
| Can the team identify the people or records | Existing-source query; manual chart screening; recruit or collect new; I don't know yet | Shapes the population and data-collection sections and the data-team request sheet |
| Permissions needed | Approved extract; custodian or research office; approval to recruit; external agreement or linkage | Feeds the oversight and governance sections |
| How information is collected | Structured extract; manual review; new survey, measurement or assessment; combination | Feeds the variable map prompt and the collection-tools section |
| Variables | Opens the variable planner (A4) | See A4 |
| Are enough people or records available | Aggregate counts from a feasibility query; estimate still to check; not requested yet | Never used to infer power. Counts are reconciled later against the sizing result |
| Are key measurements recorded consistently | Completeness checked; need a pilot extract; expect missing or inconsistent | Shapes the missing-data plan and quality checks |
| Who can do the collection and is the timeline realistic | Team and time available; need a workload and cost estimate; need more people, time or funding | Feeds execution readiness and the budget |
| Basis for each answer | Checked result; planning assumption; plus a result and an owner | A task with an owner blocks the design decision until closed; an assumption is carried into the exports as an assumption |
| Each design condition from the brief | Confirmed; need to check; not available, with what confirmed it or what must change | A condition that cannot be met points to the alternative design the brief named for that case |

**A4. Design confirmation**

| Decision | Options | How it changes the plan |
| --- | --- | --- |
| Starting points | Fill missing hypothesis, claim and estimand answers from earlier steps, on request | Suggestions stay editable and never overwrite an answer already given |
| The estimand, six fields | Population; exposure; comparator; outcome; time horizon; summary measure, each free text, with "Not applicable" allowed with a reason | Defined before the brief is drafted. Governs sizing, analysis and figures through the estimand rules; the summary measure decides which sizing methods are admissible |
| Each variable, nine fields | Name; role; definition; source; timing; coding; availability; missingness; owner | All nine are required per variable at the gate. Timing and coding are rewritten from the structured measurement settings |
| Role per variable per aim | Outcome; exposure; predictor; candidate confounder; mediator; effect modifier; selection factor; design; descriptive; uncertain | Exposure and outcome pre-fill the estimand. The confounder list is the adjustment set, a confounder must be measurable before exposure, and a variable that is both confounder and mediator blocks. The map never chooses the adjustment set |
| Measurement settings | Format from ten types; answer choices with codes; unit, minimum and maximum; time point from seven; window; selection rule from ten; source location from twelve; recording status; optional condition on a parent answer | Feeds the data dictionary, REDCap instrument, chart-review workbook and code bindings. Changed settings re-open review |
| Collection method per variable | Not decided; electronic record extract; chart or document review; survey; new measurement; linked external dataset; derived; combination | Combination reveals whether chart review is included |
| Relationships between variables | May influence; candidate predictor of; measured before; relationship uncertain, each with a reason | Drawn as the proposed causal diagram the investigator must confirm |
| Medical codes | Code system and candidate codes per variable | Carried into the data request and dictionary |
| The design | Generate the preliminary recommendation, then take the brief's design or one of up to three alternatives, each shown with evidence level, effort, feasibility and resource profile | Selecting an alternative re-runs the brief pinned to it, free. The chosen design is pinned into every later prompt and the reviewers judge execution, not the choice. A plan may depart from it only when the design is genuinely untenable, and must say so in its first sentence |
| The brief's conditions | Each lands as a feasibility row: confirmed; need to check; not available, with what confirmed it or what must change | A condition that cannot be met points to the alternative design the brief named for that case; rows from a design not chosen stop gating |
| Context conflict answers | Per conflict, for example: the data are in hand, analyse them; I am planning a new study; both, this analyses a completed randomised study | Generate stays disabled until every blocking conflict is answered; the third answer suppresses the collected-data conflicts for a secondary analysis |
| Confirm the design | Confirm after a preview of the change and the later work it affects | Sets the Phase 3 gate; any later change to these decisions marks the design as needing update. An external design review can be recorded only in the legacy flow |

**A5. Analysis and sizing**

| Decision | Options | How it changes the plan |
| --- | --- | --- |
| Build the study | Press Build study from confirmed decisions; sign-in required | Spends the plan credit and drafts the population, design fit, endpoints, provenance and data collection under deterministic checks. Up to three questions may come back to be answered as pinned facts |
| Draft the analyses | Press Draft analyses for all active aims | Drafts each aim's analysis contract, sizing method, exhibits and code scope, with multiplicity and accrual proposals, under two-lab review and the 37 checks. One question may come back |
| Data the analysis needs beyond the map | Add to the map; remove from the analysis, with a note | Each request must be resolved before the gate confirms; a removal with a note is carried into the next generation so the item is not requested again |
| Analysis contract per aim, eight fields | Primary analysis; alternatives; selection rationale; covariates; missing data; sensitivity analyses; subgroups; analysis population | All required. A subgroups field that prespecifies nothing still counts as untested effect modification if modifiers are listed |
| Sizing assumptions, eight fields plus the result | Goal; provenance; limitations; population relationship; attrition; missingness; follow-up; correlation | Every sizing input needs a provenance row or it warns; an assumed input labelled as evidence warns |
| Sizing method | One of 17 method tokens proposed by the model from the estimand, including two means, two proportions, paired, log-rank, events per variable, diagnostic precision, kappa precision, ANOVA, clustered proportion precision, stepped wedge, interrupted time series, non-inferiority proportions, simulation and none | The app recomputes the number from the inputs. Simulation and none produce no number by design; a token the estimand rules reject withholds the headline |
| Calculator inputs and the recorded result | Method-specific inputs; press Calculate, then Record this result | The result is the investigator's own statement and the gate requires it; editing an input clears it |
| Result shells | Table 2 layout and the example figure | Checked against the estimand: a figure that contradicts the summary measure warns |
| Multiplicity, when any aim is confirmatory | Family; method; sizing implication, with the draft's suggestion usable in empty fields only | Required at the analysis gate; the audit passes only when a method is named or the plan argues why it declines to adjust |
| Reconciliation | Shared and nested populations, accrual, events or cases, clusters or specimens, follow-up, attrition and missingness, correlation, feasibility conclusion, source | The feasibility conclusion must begin with "feasible" only once every constraint is reconciled; the draft never proposes it |
| Count reconciliation per row | Population; unit from participants, records, pairs, events, cases, non-cases, clusters or specimens; required; cap; available; source; sizing approach from calculated minimum, fixed planning cap, census or fixed already-collected sample; whether the available count is established | A count not yet established carries a deterministic provisional caveat into the package. A method with no required minimum accepts a census |
| Edit a confirmed decision | Save without regenerating; or save and update affected sections | Either marks the affected generated work stale; only the second regenerates, and only the stale aims and sections |
| Generated changes | Accept or discard the pending result, shown as a diff | Acceptance records a revised draft, not scientific confirmation; a result whose decisions changed meanwhile cannot be accepted |
| External analysis review | Reviewer, date and summary; optional in the guided flow | Recorded against the analysis decisions and stale if they change |
| Confirm the analysis | Confirm after the preview; generated text that predates the decisions stays marked for update | The principal biostatistician checkpoint. Confirming records the decisions and does not regenerate text |

**A6. Execution and budget**

| Decision | Options | How it changes the plan |
| --- | --- | --- |
| Execution fields | Assembly; eligibility flow; collection tools; reliability; quality checks; go or no-go | All required before confirmation |
| Governance | Likely pathway, institutional questions, source of the determination; status pending or confirmed | Mallard never states that a study is exempt; the IRB decides |
| Tasks | Requested result; owner; status open, in progress, blocked or done; due date; blocked decisions; result | Open tasks appear as unresolved items in every export |
| Timeline | Activity; owner; start and due dates; dependencies | Dates are validated and ordered; dependency cycles are refused |
| Costs | Item; priced or not established; owner; quantity; unit cost; source; currency and justification | Unpriced items are carried as unresolved. Salaries are illustrative and capped at the NIH ceiling |
| Readiness | Ready; conditional; infeasible, with a rationale and confirmation tasks | Infeasible marks the execution phase blocked |

**A7. Finalisation and export**

| Decision | Options | How it changes the plan |
| --- | --- | --- |
| Reconciler and review summary | A named person and a summary including remaining limitations | Required to complete the deliverables gate |
| Code disposition and languages | Reviewed draft or not requested; R, Python, SAS, Stata; SPSS steps for a novice analyst | One code file per aim per language, each stamped as never executed by Mallard |
| Write-up and code steps | Requested or not | Exports name what was not generated so an absent section reads as a choice |
| Export format | Text; linked HTML; Word; full artifact ZIP with manifest, decisions, data dictionary and code | Every format carries the audit table, gate status, assumptions and the review record |

**A8. Questions the model asks back**

| When | How many | How it changes the plan |
| --- | --- | --- |
| With the design brief | Up to two, each with why it matters and a default | Answers sharpen the brief before the credit is spent |
| At the study build | Up to three, shown with the generated plan reference | Answers are pinned as facts and re-emitted verbatim into every later step. "Not sure" is never pinned |
| At the analysis draft | One | Same pinning rule |

Sources: src/context.js, src/guidedSidebar.js, src/GuidedStudyStart.jsx, src/GuidedAims.jsx, src/feasibilityInterview.js, src/workspaceFlow.js, src/variablePlanning.js, src/variableMeasurement.js, src/variableMap.js, src/aimsAnalysis.js, src/countReconciliation.js, src/workspaceExecution.js, src/workspaceDeliverables.js and src/steps.js in the Ask-Mallard repository.
