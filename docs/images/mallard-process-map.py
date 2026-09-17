"""Swimlane process map of every investigator decision in Mallard.

Lanes: I = investigator inputs and decisions, L = stochastic LLM drafting and review,
C = deterministic code (gates, calculators, checks). Time runs left to right. The map is
emitted as one SVG per phase panel; edges that cross panels use lettered off-page connectors.
"""
import html, json, sys

LANES = [("I", "Investigator\ninputs and decisions"), ("L", "Stochastic LLMs\ndraft and review"), ("C", "Deterministic code\ngates, calculators, checks")]
LANE_IDX = {k: i for i, (k, _) in enumerate(LANES)}
CW, LH, NW, NH = 236, 268, 196, 104       # column width, lane height, node width, node height
LEFT, TOP, HEAD = 96, 96, 46              # lane label gutter, top offset, phase header height
FONT = 15

# ---- nodes: (id, lane, col, shape, text) --------------------------------------------------
# shapes: start, end, input (parallelogram), task, decision, doc
N = [
 ("start","I",1,"start","Start: describe the study in plain language or upload a file"),
 ("phi","C",1,"task","Strip PHI on upload and again at Generate; report categories and counts only"),
 ("ctx","I",2,"input","Answer 9 context fields: use, deliverable, horizon, data state, source, funding, team, analyst, design lead"),
 ("ctxgate","C",2,"decision","All 9 answered? (\"Not sure yet\" counts)"),
 ("aimsL","L",3,"task","Suggest up to 3 aims, alternatives and a hypothesis, with bracketed placeholders"),
 ("aims","I",3,"input","Edit aims; fill placeholders; set role per aim; state intended claim"),
 ("conf","I",4,"decision","Any aim confirmatory?"),
 ("hyp","I",5,"input","Write the hypothesis (multiplicity fields become required later)"),
 ("check","L",5,"task","Aims check: findings on scope, causal wording, missing details"),
 ("disp","I",6,"decision","Apply the finding, keep mine with a written reason, or skip?"),
 ("lit","L",6,"task","Literature scan: emit PubMed queries, never citation text"),
 ("pub","C",6,"task","Resolve each query against PubMed; refuse a summary citing an unretrieved record"),
 ("qgate","C",7,"decision","Phase 1 gate: 1 to 3 aims, each with a role, claim and hypothesis if confirmatory?"),
 # phase 2 feasibility, phase 3 design inputs and the brief
 ("feas","I",8,"input","Answer 7 feasibility questions: population, permissions, collection, variables, counts, consistency, resources"),
 ("varmap","L",8,"task","Variable map suggested on request from the answers; never an adjustment set"),
 ("basis","I",9,"decision","Basis for each answer: checked result, planning assumption, or a task for someone?"),
 ("fgate","C",9,"decision","Phase 2 gate: every row has a basis, a result and, for a task, an owner?"),
 ("inputsL","L",10,"task","Fill missing answers from earlier steps: hypothesis, claim, estimand starting points"),
 ("vars","I",11,"input","Define the estimand (6 fields); each variable (9 fields), its role per aim, measurement settings, relationships"),
 ("varL","L",11,"task","Suggest variables and reasons; unquoted phrases refused; no adjustment set"),
 ("brief","L",12,"task","Draft the preliminary design brief: design, typed estimand, conditions with record checks, alternatives, sizing method"),
 ("brev","L",13,"task","Anthropic and OpenAI review; worst case merged; brief re-emitted whole"),
 ("bchk","C",13,"task","Brief estimand and evidence-level checks; blocking findings feed the revision"),
 # phase 3 design decision and gate
 ("approve","I",14,"decision","Approve the recommended design, or pick one of up to 3 alternatives?"),
 ("conflict","C",15,"decision","Typed context contradicts the design? (data in hand vs randomised; deadline vs prospective)"),
 ("cans","I",15,"input","Answer the conflict: which statement is true"),
 ("cond","I",16,"decision","Each design condition, now a feasibility row: confirmed, need to check, or not available?"),
 ("dgate","C",17,"decision","Phase 3 gate: estimand complete, variables complete, measurement valid, no confounder that is also a mediator?"),
 ("dconfirm","I",18,"task","Confirm the design; a change preview shows what later work it affects"),
 # phase 4 build and draft
 ("build","I",19,"task","Press Build study from confirmed decisions"),
 ("credit","C",19,"decision","Signed in, plan credit available, study step first?"),
 ("s3","L",20,"task","Draft the study: population, design fit, endpoints, provenance, data collection; ask up to 3 questions"),
 ("qa","I",20,"input","Answer the model's questions; answers pinned as facts, \"not sure\" never pinned"),
 ("schk","C",20,"task","Deterministic checks and repair loop on the study draft"),
 ("draft","I",21,"task","Press Draft analyses for all active aims"),
 ("s4","L",21,"task","Draft each aim's analysis contract, sizing method token, exhibits, code scope; propose multiplicity and accrual; ask 1 question"),
 ("rev","L",22,"task","Two reviewers with 7 safety verdicts; one guarded patch; adjudicator judges, never edits"),
 ("checks","C",22,"decision","37 checks: sizing, analysis, diagram and exhibits contradict the estimand?"),
 ("withhold","C",23,"task","Headline N withheld everywhere; warn and block findings shown with the plan"),
 ("req","I",23,"decision","Data the analysis needs beyond the map: add to the map, or remove from the analysis with a note?"),
 ("contract","I",24,"input","Analysis contract (8 fields), sizing assumptions (8 fields), calculator inputs; press Calculate, then Record this result"),
 ("calc","C",24,"task","Recompute N from typed inputs, 17 methods; none or simulation give no number"),
 # phase 4 shared decisions, revision and gate
 ("mult","I",25,"decision","Any confirmatory aim? If so, set multiplicity: family, method, sizing implication"),
 ("counts","I",26,"input","Count reconciliation: unit, required, cap, available, source, sizing approach per row"),
 ("cgate","C",26,"decision","Available count established, or a provisional caveat carried into the package?"),
 ("edit","I",27,"decision","Changed a confirmed decision? Save without regenerating, or save and update affected sections?"),
 ("stale","C",27,"task","Dependency map marks affected generated work stale; unaffected work preserved; library code withheld"),
 ("regen","L",28,"task","Update affected analyses: regenerate only the stale aims and sections"),
 ("hold","C",28,"task","Result held pending with a diff; refused if the decisions changed meanwhile"),
 ("accept","I",29,"decision","Accept or discard the generated changes?"),
 ("agate","C",30,"decision","Phase 4 gate: contract, sizing result with source, multiplicity, requests and counts resolved?"),
 # phase 5 and 6
 ("execpress","I",31,"task","Press Draft execution for all active aims"),
 ("s5","L",31,"task","Draft operations, governance, tasks, timeline and budget justification"),
 ("exec","I",32,"input","Execution fields, governance pathway, tasks with owners, timeline, costs, currency"),
 ("ready","I",33,"decision","Readiness: ready, conditional, or infeasible?"),
 ("egate","C",33,"decision","Phase 5 gate: dates ordered, no dependency cycles, every cost priced or marked not established?"),
 ("want","I",34,"decision","Request the written package? Request code, and in which languages?"),
 ("s67","L",34,"task","On request: written package with PubMed-resolved references; code per language, never executed"),
 ("final","I",35,"input","Edit written drafts if needed; name the reconciler; review summary with limitations; code disposition"),
 ("fgate2","C",35,"decision","Phase 6 gate: written package current, no open review comments, nothing pending?"),
 ("export","C",36,"doc","Export: text, HTML, Word or ZIP, with gate status, assumptions, stale dependencies and review record"),
 ("end","I",36,"end","End: study package delivered for a statistician and the IRB to check"),
]
# ---- edges: (src, dst, label) -------------------------------------------------------------
E = [
 ("start","phi",""), ("phi","ctx",""), ("ctx","ctxgate",""), ("ctxgate","ctx","no"), ("ctxgate","aimsL","yes"),
 ("aimsL","aims",""), ("aims","conf",""), ("conf","hyp","yes"), ("conf","disp","no"), ("hyp","check",""), ("check","disp",""),
 ("disp","lit",""), ("lit","pub",""), ("pub","qgate",""), ("qgate","aims","no"), ("qgate","feas","yes"),
 ("feas","varmap","on request"), ("varmap","feas",""), ("feas","basis",""), ("basis","fgate",""), ("fgate","feas","no"), ("fgate","inputsL","yes"),
 ("inputsL","vars",""), ("varL","vars",""), ("vars","brief",""), ("brief","brev",""), ("brev","bchk",""), ("bchk","approve",""),
 ("approve","brief","alternative, free"), ("approve","conflict","approve"), ("conflict","cans","yes"), ("cans","conflict",""), ("conflict","cond","no"),
 ("cond","dgate",""), ("dgate","vars","no"), ("dgate","dconfirm","yes"), ("dconfirm","build",""),
 ("build","credit",""), ("credit","s3","yes"), ("s3","qa",""), ("s3","schk",""), ("schk","draft",""), ("qa","draft",""),
 ("draft","s4",""), ("s4","rev",""), ("rev","checks",""), ("checks","withhold","yes"), ("checks","req","no"), ("withhold","req",""),
 ("req","contract",""), ("contract","calc","calculate"), ("calc","contract","result"), ("contract","mult",""), ("mult","counts",""), ("counts","cgate",""),
 ("cgate","edit",""), ("edit","stale","either"), ("stale","regen","update"), ("regen","hold",""), ("hold","accept",""),
 ("accept","agate","accept or discard"), ("edit","agate","no change"), ("agate","contract","no"), ("agate","execpress","yes"),
 ("execpress","s5",""), ("s5","exec",""), ("exec","ready",""), ("ready","egate",""), ("egate","exec","no"), ("egate","want","yes"),
 ("want","s67","yes"), ("want","final","no"), ("s67","final",""), ("final","fgate2",""), ("fgate2","final","no"), ("fgate2","export","yes"), ("export","end",""),
]
PANELS = [
 ("A", "Study context, and Phase 1: question and aims", 1, 7),
 ("B", "Phase 2: feasibility, then Phase 3: estimand, variables and the design brief", 8, 13),
 ("C", "Phase 3: design decision and gate", 14, 18),
 ("D", "Phase 4: build the study and draft the analyses", 19, 24),
 ("E", "Phase 4: shared decisions, revision and the analysis gate", 25, 30),
 ("F", "Phase 5 execution and Phase 6 finalisation", 31, 36),
]
NODES = {n[0]: n for n in N}

def wrap(text, width=21):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + (1 if cur else 0) > width:
            lines.append(cur); cur = w
        else:
            cur = (cur + " " + w) if cur else w
    if cur: lines.append(cur)
    return lines

def panel_of(col):
    for pid, _, a, b in PANELS:
        if a <= col <= b: return pid
    return None

def esc(s): return html.escape(s, quote=True)

CROSS = [(s, d) for s, d, _ in E if panel_of(NODES[s][2]) != panel_of(NODES[d][2])]

def render(pid, title, c0, c1):
    ncols = c1 - c0 + 1
    W = max(1500, LEFT + ncols * CW + 130)
    H = TOP + HEAD + len(LANES) * LH + 30
    out = []
    out.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif" font-size="{FONT}">')
    out.append('<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#2B3A35"/></marker></defs>')
    out.append(f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>')
    out.append(f'<text x="{LEFT}" y="34" font-size="22" font-weight="700" fill="#121A17">Panel {pid}. {esc(title)}</text>')
    out.append(f'<text x="{LEFT}" y="56" font-size="14" fill="#5F6B66">Time runs left to right. Parallelogram = investigator input · diamond = decision · rectangle = process · rounded = start or end · page shape = output.</text>')
    out.append(f'<text x="{LEFT}" y="76" font-size="14" fill="#5F6B66">Numbered circles continue on the next panel. Investigator inputs are tagged I1 to I11 and decisions D1 to D11, in the order they are made; plain rectangles in the investigator lane are presses.</text>')
    # lanes
    fills = ["#F4F8F6", "#FBF6EC", "#F1F3F7"]
    strokes = ["#0F6B5B", "#B07A16", "#3A4A78"]
    for i, (k, label) in enumerate(LANES):
        y = TOP + HEAD + i * LH
        out.append(f'<rect x="{LEFT}" y="{y}" width="{ncols*CW}" height="{LH}" fill="{fills[i]}" stroke="#CDD4D0"/>')
        out.append(f'<rect x="{LEFT-88}" y="{y}" width="88" height="{LH}" fill="{strokes[i]}" stroke="#CDD4D0"/>')
        ls = label.split("\n")
        cx, cy = LEFT - 44, y + LH / 2
        out.append(f'<g transform="translate({cx},{cy}) rotate(-90)">')
        out.append(f'<text text-anchor="middle" fill="#FFFFFF" font-weight="700" font-size="16" y="-6">{esc(ls[0])}</text>')
        out.append(f'<text text-anchor="middle" fill="#FFFFFF" font-size="12.5" y="14">{esc(ls[1])}</text></g>')
    # header band
    out.append(f'<rect x="{LEFT}" y="{TOP}" width="{ncols*CW}" height="{HEAD}" fill="#E8EEEA" stroke="#CDD4D0"/>')
    out.append(f'<text x="{LEFT + ncols*CW/2}" y="{TOP+29}" text-anchor="middle" font-size="16" font-weight="700" fill="#0F6B5B">{esc(title)}</text>')

    def center(nid):
        _, lane, col, _, _ = NODES[nid]
        return LEFT + (col - c0) * CW + CW / 2, TOP + HEAD + LANE_IDX[lane] * LH + LH / 2

    CHAN.clear(); TAGS.clear(); CONN.clear()
    # edges first (under nodes)
    conn_letters = {}
    letter_iter = iter("abcdefghijklmnopqrstuvwxyz")
    # deterministic letters for cross-panel edges (global numbering by edge order)
    for idx, (s, d, lab) in enumerate(E):
        sc, dc = NODES[s][2], NODES[d][2]
        s_in = c0 <= sc <= c1; d_in = c0 <= dc <= c1
        if not s_in and not d_in: continue
        letter = None
        if not (s_in and d_in):
            letter = str(CROSS.index((s, d)) + 1)
        if s_in and d_in:
            draw_edge(out, s, d, lab, center)
        elif s_in:  # leaves this panel
            x, y = center(s); sw = NW/2 + (12 if NODES[s][3] == "decision" else 0); sh = NH/2 + (22 if NODES[s][3] == "decision" else 0)
            k = CONN.get(('out', s), 0); CONN[('out', s)] = k + 1
            if sc == c1:
                yy = y + k * 34; ex = x + sw + 22
                out.append(f'<line x1="{x+sw}" y1="{yy}" x2="{ex}" y2="{yy}" stroke="#2B3A35" stroke-width="1.6" marker-end="url(#arr)"/>')
                out.append(f'<circle cx="{ex+16}" cy="{yy}" r="14" fill="#FFFFFF" stroke="#2B3A35" stroke-width="1.6"/><text x="{ex+16}" y="{yy+5}" text-anchor="middle" font-size="14" font-weight="700">{letter}</text>')
                if lab: out.append(f'<text x="{ex+34}" y="{yy+5}" font-size="12.5" fill="#3B4743" paint-order="stroke" stroke="#FFFFFF" stroke-width="4">{esc(lab)}</text>')
            else:
                cx = x - 40 - k * 34; ty = y - sh - 22
                out.append(f'<line x1="{cx}" y1="{y-sh}" x2="{cx}" y2="{ty}" stroke="#2B3A35" stroke-width="1.6" marker-end="url(#arr)"/>')
                out.append(f'<circle cx="{cx}" cy="{ty-16}" r="14" fill="#FFFFFF" stroke="#2B3A35" stroke-width="1.6"/><text x="{cx}" y="{ty-11}" text-anchor="middle" font-size="14" font-weight="700">{letter}</text>')
                if lab: out.append(f'<text x="{cx+18}" y="{ty-11}" font-size="12.5" fill="#3B4743" paint-order="stroke" stroke="#FFFFFF" stroke-width="4">{esc(lab)}</text>')
        else:  # arrives in this panel
            x, y = center(d); dw = NW/2 + (12 if NODES[d][3] == "decision" else 0); dh = NH/2 + (22 if NODES[d][3] == "decision" else 0)
            k = CONN.get(('in', d), 0); CONN[('in', d)] = k + 1
            if dc == c0:
                sx = x - dw - 22; yy = y + k * 34
                out.append(f'<circle cx="{sx-16}" cy="{yy}" r="14" fill="#FFFFFF" stroke="#2B3A35" stroke-width="1.6"/><text x="{sx-16}" y="{yy+5}" text-anchor="middle" font-size="14" font-weight="700">{letter}</text>')
                out.append(f'<line x1="{sx}" y1="{yy}" x2="{x-dw}" y2="{yy}" stroke="#2B3A35" stroke-width="1.6" marker-end="url(#arr)"/>')
            else:
                cx = x + 40 + k * 34; ty = y - dh - 22
                out.append(f'<circle cx="{cx}" cy="{ty-16}" r="14" fill="#FFFFFF" stroke="#2B3A35" stroke-width="1.6"/><text x="{cx}" y="{ty-11}" text-anchor="middle" font-size="14" font-weight="700">{letter}</text>')
                out.append(f'<line x1="{cx}" y1="{ty}" x2="{cx}" y2="{y-dh+(10 if NODES[d][3]=="decision" else 0)}" stroke="#2B3A35" stroke-width="1.6" marker-end="url(#arr)"/>')
    # nodes
    di = ii = 0
    for nid, lane, col, shape, text in sorted(N, key=lambda n: n[2]):
        if lane != "I": continue
        if shape == "decision": di += 1; TAGS[center(nid)] = f"D{di}"
        elif shape == "input": ii += 1; TAGS[center(nid)] = f"I{ii}"
    for nid, lane, col, shape, text in N:
        if not (c0 <= col <= c1): continue
        x, y = center(nid)
        draw_node(out, x, y, shape, text, lane)
    out.append('</svg>')
    return "\n".join(out)

TAGS = {}
def draw_node(out, x, y, shape, text, lane):
    w, h = NW, NH
    tag = TAGS.get((x, y))
    if shape == "decision": w, h = NW + 24, NH + 44
    if shape == "doc": h = NH + 22
    stroke = {"I": "#0F6B5B", "L": "#B07A16", "C": "#3A4A78"}[lane]
    fill = "#FFFFFF"
    if shape == "decision":
        out.append(f'<polygon points="{x},{y-h/2} {x+w/2},{y} {x},{y+h/2} {x-w/2},{y}" fill="#FFF7E6" stroke="{stroke}" stroke-width="1.8"/>')
    elif shape == "input":
        k = 14
        out.append(f'<polygon points="{x-w/2+k},{y-h/2} {x+w/2},{y-h/2} {x+w/2-k},{y+h/2} {x-w/2},{y+h/2}" fill="{fill}" stroke="{stroke}" stroke-width="1.8"/>')
    elif shape in ("start", "end"):
        out.append(f'<rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" rx="{h/2}" fill="{stroke}" stroke="{stroke}" stroke-width="1.8"/>')
    elif shape == "doc":
        out.append(f'<path d="M{x-w/2},{y-h/2} H{x+w/2} V{y+h/2-10} Q{x+w/4},{y+h/2-22} {x},{y+h/2-8} T{x-w/2},{y+h/2-10} Z" fill="#EEF5F2" stroke="{stroke}" stroke-width="1.8"/>')
    else:
        out.append(f'<rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="1.8"/>')
    lines = wrap(text, 20 if shape == "decision" else 23)
    if shape == "decision" and len(lines) > 5: lines = wrap(text, 25)
    if shape != "decision" and len(lines) > 6: lines = wrap(text, 26)
    fs = FONT - (1 if len(lines) > 4 else 0) - (1 if len(lines) > 5 else 0) - (1 if len(lines) > 6 else 0)
    lh = fs + 3
    y0 = y - (len(lines) - 1) * lh / 2
    color = "#FFFFFF" if shape in ("start", "end") else "#121A17"
    for i, ln in enumerate(lines):
        out.append(f'<text x="{x}" y="{y0 + i*lh + fs*0.35}" text-anchor="middle" font-size="{fs}" fill="{color}">{esc(ln)}</text>')
    if tag:
        ty = y - h/2 - 8
        out.append(f'<rect x="{x-w/2}" y="{ty-15}" width="34" height="20" rx="4" fill="{stroke}"/><text x="{x-w/2+17}" y="{ty}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#FFFFFF">{tag}</text>')

CHAN = {}
CONN = {}
def draw_edge(out, s, d, lab, center):
    sx, sy = center(s); dx, dy = center(d)
    sl, dl = NODES[s][1], NODES[d][1]; scol, dcol = NODES[s][2], NODES[d][2]
    sdec, ddec = NODES[s][3] == "decision", NODES[d][3] == "decision"
    sh = NH/2 + (22 if sdec else 0) + (11 if NODES[s][3] == "doc" else 0)
    dh = NH/2 + (22 if ddec else 0) + (11 if NODES[d][3] == "doc" else 0)
    sw = NW/2 + (12 if sdec else 0)
    dw = NW/2 + (12 if ddec else 0)
    stroke = '#2B3A35'
    if sl == dl:
        if dcol == scol + 1:
            path = f'M{sx+sw},{sy} L{dx-dw},{dy}'; lx, ly = sx + sw + 4, sy - 8
        elif dcol > scol:
            ch = sy - LH/2 + 24
            path = f'M{sx},{sy-sh} L{sx},{ch} L{dx},{ch} L{dx},{dy-dh}'; lx, ly = sx + 8, ch - 6
        else:
            ch = sy + LH/2 - 20
            path = f'M{sx},{sy+sh} L{sx},{ch} L{dx},{ch} L{dx},{dy+dh}'; lx, ly = sx + 8, ch - 6
    else:
        down = LANE_IDX[dl] > LANE_IDX[sl]
        adjacent = abs(LANE_IDX[dl] - LANE_IDX[sl]) == 1
        if scol == dcol:
            off = 14 if down else -14
            y1 = sy + sh if down else sy - sh; y2 = dy - dh if down else dy + dh
            path = f'M{sx+off},{y1} L{dx+off},{y2}'; lx, ly = sx + off + 6, y1 + (y2 - y1) * 0.3 + 4
        else:
            bidx = LANE_IDX[sl] + (1 if down else 0)
            key = (bidx, min(scol, dcol), max(scol, dcol))
            k = CHAN.get(bidx, 0); CHAN[bidx] = k + 1
            boundary = TOP + HEAD + bidx * LH + (-12, 0, 12)[k % 3]
            y1 = sy + sh if down else sy - sh
            if adjacent:
                y2 = dy - dh if down else dy + dh
                path = f'M{sx},{y1} L{sx},{boundary} L{dx},{boundary} L{dx},{y2}'
            else:
                gx = dx + dw + 16; ox = dx + 34
                if down:
                    yy = dy - dh - 16
                    path = f'M{sx},{y1} L{sx},{boundary} L{gx},{boundary} L{gx},{yy} L{ox},{yy} L{ox},{dy-dh+ (10 if ddec else 0)}'
                else:
                    yy = dy + dh + 16
                    path = f'M{sx},{y1} L{sx},{boundary} L{gx},{boundary} L{gx},{yy} L{ox},{yy} L{ox},{dy+dh- (10 if ddec else 0)}'
            lx, ly = (sx + dx) / 2 - 12, boundary - 6
    out.append(f'<path d="{path}" fill="none" stroke="{stroke}" stroke-width="1.6" marker-end="url(#arr)"/>')
    if lab:
        out.append(f'<text x="{lx}" y="{ly}" font-size="12.5" fill="#3B4743" paint-order="stroke" stroke="#FFFFFF" stroke-width="4">{esc(lab)}</text>')

if __name__ == "__main__":
    for pid, title, a, b in PANELS:
        svg = render(pid, title, a, b)
        open(f"map_{pid}.svg", "w").write(svg)
        print(pid, title, "cols", a, b, len(svg))
    # decision count for the doc
    dec = [n for n in N if n[3] == "decision" and n[1] == "I"]
    inp = [n for n in N if n[3] == "input" and n[1] == "I"]
    print("investigator decisions", len(dec), "investigator inputs", len(inp))
