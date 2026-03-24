# Crossfire V2 — claude.md

## Project Overview

**Name:** Crossfire (formerly: Innovera Debate Engine)
**Purpose:** A tool that simulates a structured debate between a consulting client (Red Team) and an Innovera consultant (Blue Team) by having two LLMs critique and defend a deliverable document. The goal is to stress-test Innovera's outputs before they reach the real client.

**Core metaphor:** A skeptical C-Suite executive reviews your deliverable and pushes back on everything weak, vague, or unsupported. The Innovera team defends. You observe the entire exchange and walk away knowing exactly what to fix, what to defend, and what to escalate.

### What this produces
1. **Executive dashboard** — a verdict-first view of every issue, sorted by severity, with expand-to-detail
2. **Debate transcript** — the full paired exchange, useful for understanding reasoning
3. **Revised document** — the deliverable rewritten with all accepted changes applied

The dashboard is the primary output. The transcript and revised doc are secondary views.

### What this is NOT
- Not a general chatbot or co-pilot
- Not a document editor — it critiques documents, it doesn't rewrite them inline
- Not a fact-checker (though it may surface factual concerns)

---

## V2 Scope

V2 is a **UI-only rewrite**. The backend (orchestrator, prompts, API route, types, schemas) is stable and stays as-is. The goal is to replace the current round-based transcript view with an executive dashboard that a C-Suite audience would find polished, scannable, and credible.

### What changes in V2
- The entire right-panel output UI: components, layout, information hierarchy
- The tab structure: Dashboard (new primary) | Transcript (redesigned) | Revised Output (existing)
- Component file structure under `components/`

### What does NOT change in V2
- `lib/` — orchestrator, prompts, types, schemas, openrouter, models, derive, search, utils, lenses, export
- `app/api/debate/route.ts` — API route and streaming logic
- `app/layout.tsx` — root layout
- Left panel input components — DocumentInput, ContextPanel, ModelSelector, DebateControls
- Data types and JSON structures — no backend schema changes

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router) | TypeScript throughout |
| Styling | Tailwind CSS | Minimal custom CSS |
| LLM Routing | OpenRouter API | Multi-model support via single API |
| Search (optional) | Tavily or Perplexity API | Triggered sparingly when Red Team flags factual claims |
| Deployment | Vercel | Edge functions for streaming |
| Package Manager | pnpm | Preferred |
| State | React state + URL params | No database needed — sessions are ephemeral |

---

## Architecture (unchanged from V1)

### High-Level Flow

```
User Input (document + context config)
    ↓
Debate Orchestrator (server-side API route)
    ↓
┌─── Round Loop (1..N) ──────────────────────────────┐
│                                                      │
│  Red Team LLM  →  Structured Critique (JSON)         │
│       ↓                                              │
│  [Optional] Web search for flagged factual claims    │
│       ↓                                              │
│  Blue Team LLM →  Point-by-Point Response (JSON)     │
│       ↓                                              │
│  Resolution Check (tag resolved items)               │
│       ↓                                              │
│  Feed unresolved items + context → next round        │
│                                                      │
└──────────────────────────────────────────────────────┘
    ↓
Output Generation
  ├── Executive Dashboard (transformed from debate data)
  ├── Debate Transcript (full structured exchange)
  └── Revised Document (LLM-rewritten with accepted changes)
```

---

## V2 UI Design — Executive Dashboard

### Design Philosophy

**Priority order for design decisions:**
1. **Visual polish** — this must look like a premium, purpose-built tool, not a prototype. Clean typography, restrained color, generous whitespace, precise alignment. The C-Suite audience judges credibility by visual quality before they read a single word.
2. **Speed of comprehension** — a user should be able to scan the entire output in 30 seconds and know: is the document ready, what's the worst problem, and how many things need fixing.
3. **Depth on demand** — rich detail exists for every issue, but it's hidden behind expand/collapse. The default view is dense and scannable; the expanded view is thorough.
4. **Actionability** — every issue should have a clear "what to do about it" attached.

### Layout — Overall Page Structure

Single-page app. Two panels on desktop, stacked on mobile. This is unchanged from V1.

**Left Panel (~35% width, min 380px, max 480px): Input & Config**
Unchanged from V1. Contains DocumentInput, ContextPanel, ModelSelector, DebateControls.

**Right Panel (~65% width): Output**
This is the part that changes completely. Three tabs:
1. **Dashboard** (default, new) — verdict bar + issue list
2. **Transcript** (redesigned) — paired Red/Blue cards per objection
3. **Revised output** (unchanged) — rewritten document

### Tab Bar

Segmented button group, top-right of the output panel. Not underline-tabs — a pill/segment style:
- Three segments: "Dashboard" | "Transcript" | "Revised output"
- Active segment: solid dark fill, white text
- Inactive: transparent, muted text
- "Revised output" disabled (grayed) until rewrite completes
- Left of the tab bar: "Crossfire" brand mark + client context label (e.g., "Samsung — Exec summary")

Below the tab bar, aligned right: Export buttons (JSON, Markdown) — only visible when debate is complete.

---

### Dashboard Tab (Primary View)

This is the most important UI in the entire app. Everything below is described in render order, top to bottom.

#### 1. Verdict Bar

A single horizontal bar at the top of the dashboard. Background: `bg-secondary` surface. Rounded corners. Contains:

- **Status dot** (10px circle) — color encodes overall readiness:
  - Green: "Ready — all issues resolved" (all items resolved, none critical/high)
  - Amber: "Needs revision — N critical/high issues" (has unresolved or critical items)
  - Red: "Not ready — critical gaps remain" (has escalated items or unresolved critical)
- **Verdict text** (15px, weight 500) — a single sentence summarizing readiness. Examples:
  - "Needs revision — 2 critical gaps, 5 high-severity issues"
  - "Ready with minor fixes — 8 items resolved, 2 cosmetic"
  - "Not ready — 3 items escalated for leadership discussion"
- **Meta text** (12px, muted) — right-aligned: "2 rounds, 14 objections, 10 fixes proposed"

The verdict is computed client-side from the debate data. Logic:
- If any item is `escalated` → Red dot, "Not ready"
- If any `critical` or `high` item is `unresolved` → Amber dot, "Needs revision"
- If all items are `resolved` and no `critical` items exist → Green dot, "Ready with minor fixes"
- Otherwise → Amber dot, "Needs revision"

#### 2. Stats Row

Four metric cards in a grid (4 columns on desktop, 2x2 on mobile). Each card:
- Background: `bg-secondary` surface, no border, rounded-md
- Large number (22px, weight 500) — colored by meaning
- Small label below (11px, muted)

Cards:
| Label | Value | Color |
|-------|-------|-------|
| Objections | total count | default text |
| Resolved | count | green-700 |
| Unresolved | count | amber-700 |
| Escalated | count | purple-700 |

#### 3. Filter Pills

A horizontal row of pill buttons for filtering the issue list by category. Default: "All" is active.

- "All" — always first
- Then one pill per category that has items, with count: "Gap (5)", "Error (3)", "Disagreement (3)", "Clarification (2)", "Cosmetic (1)"
- Active pill: solid dark fill, white text
- Inactive: transparent, thin border, muted text
- Clicking a pill filters the list below. "All" resets.

#### 4. Issue List

This is the core of the dashboard. A vertical list of every objection across all rounds, displayed as **compact rows** that expand on click.

**Default sort:** Severity descending (critical first, then high, medium, low). Within the same severity, unresolved/escalated items sort before resolved.

**Each collapsed row contains, left to right:**
1. **ID** (11px, monospace, muted) — e.g., "R1-04"
2. **Severity dot** (7px circle) — critical: red, high: amber, medium: yellow-ish, low: gray
3. **Category badge** (11px pill) — colored by category:
   - gap: coral bg (#FAECE7), coral-800 text (#993C1D)
   - error: red bg (#FCEBEB), red-800 text (#A32D2D)
   - disagreement: purple bg (#EEEDFE), purple-800 text (#534AB7)
   - clarification: teal bg (#E1F5EE), teal-800 text (#0F6E56)
   - cosmetic: amber bg (#FAEEDA), amber-800 text (#854F0B)
4. **Title** (13px, single line, truncated with ellipsis) — the objection text, truncated to one line
5. **Status badge** (11px pill, right-aligned):
   - resolved: green bg (#EAF3DE), green-800 text (#3B6D11)
   - unresolved: amber bg (#FAEEDA), amber-800 text (#854F0B)
   - escalated: purple bg (#EEEDFE), purple-800 text (#534AB7)
6. **Chevron** (16px, muted) — right-pointing, rotates 90° when expanded

**Row styling:**
- No outer border on individual rows. The entire list is wrapped in a container with a thin border and rounded-lg corners.
- Rows separated by 1px divider lines (border-tertiary color).
- Hover: bg-secondary
- Cursor: pointer

**Expanded row — appears directly below the collapsed row, same background:**

Padding-left: ~64px (aligned past the ID/severity/badge area) to create visual indentation.

Contains, in order:

1. **Timeline strip** — a single line showing the lifecycle:
   - Format: "Raised R1 → Blue partial R1 → Red re-raised R2 → Blue conceded R2"
   - Style: 11px, muted, with small dots and arrow characters
   - This is assembled from the debate data by tracing the objection ID across rounds

2. **Document quote** — the exact passage from the document that was challenged
   - Style: 12px, italic, muted, with a 2px left border (border-secondary)

3. **Client objection** — Red Team's full objection text
   - Label: "Client objection" in 11px uppercase muted
   - Body: 13px, normal text

4. **Innovera response** — Blue Team's explanation
   - Label: "Innovera response" in 11px uppercase muted
   - Body: 13px, normal text

5. **Proposed change** (if responseType is fix, concede, or partial with proposedChange)
   - Label: "Proposed change" in 11px uppercase muted
   - Body: 12px, inside a bg-secondary rounded box

6. **Status note** (if unresolved or escalated)
   - A bg-secondary box with a 2px left amber/purple border (matching status color)
   - Explains why this item remains unresolved or was escalated
   - 12px text

**Data transformation for the issue list:**

The issue list is NOT a 1:1 mapping of rounds. It's a **flattened, deduplicated view across all rounds**. The transformation logic:

```typescript
// Pseudocode for building the dashboard issue list
function buildIssueList(rounds: DebateRound[]): DashboardIssue[] {
  const issues = new Map<string, DashboardIssue>();

  for (const round of rounds) {
    for (const objection of round.redTeam.objections) {
      const response = round.blueTeam.responses.find(r => r.objectionId === objection.id);

      if (issues.has(objection.id)) {
        // This objection was re-raised — update with latest response
        const existing = issues.get(objection.id)!;
        existing.timeline.push({
          round: round.roundNumber,
          redAction: 're-raised',
          blueAction: response?.responseType || 'none',
          blueStatus: response?.status || 'unresolved',
        });
        existing.latestResponse = response || existing.latestResponse;
        existing.finalStatus = response?.status || 'unresolved';
      } else {
        // New objection
        issues.set(objection.id, {
          id: objection.id,
          category: objection.category,
          severity: objection.severity,
          quote: objection.quote,
          objection: objection.objection,
          suggestedResolution: objection.suggestedResolution,
          raisedInRound: round.roundNumber,
          timeline: [{
            round: round.roundNumber,
            redAction: 'raised',
            blueAction: response?.responseType || 'none',
            blueStatus: response?.status || 'unresolved',
          }],
          latestResponse: response || null,
          finalStatus: response?.status || 'unresolved',
        });
      }
    }

    // Also check resolvedFromPrior — mark those issues as accepted
    if (round.redTeam.resolvedFromPrior) {
      for (const resolvedId of round.redTeam.resolvedFromPrior) {
        if (issues.has(resolvedId)) {
          const existing = issues.get(resolvedId)!;
          existing.timeline.push({
            round: round.roundNumber,
            redAction: 'accepted',
            blueAction: 'n/a',
            blueStatus: 'resolved',
          });
          existing.finalStatus = 'resolved';
        }
      }
    }
  }

  // Sort: severity desc, then unresolved/escalated before resolved
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const statusOrder = { escalated: 0, unresolved: 1, resolved: 2 };

  return Array.from(issues.values()).sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return statusOrder[a.finalStatus] - statusOrder[b.finalStatus];
  });
}
```

**New type for dashboard issues (add to types.ts or keep in component):**

```typescript
interface TimelineEntry {
  round: number;
  redAction: 'raised' | 're-raised' | 'accepted';
  blueAction: string; // responseType or 'none' or 'n/a'
  blueStatus: ResolutionStatus;
}

interface DashboardIssue {
  id: string;
  category: ObjectionCategory;
  severity: ObjectionSeverity;
  quote: string;
  objection: string;
  suggestedResolution?: string;
  raisedInRound: number;
  timeline: TimelineEntry[];
  latestResponse: Response | null;
  finalStatus: ResolutionStatus;
}
```

---

### Transcript Tab (Redesigned)

The transcript tab replaces the current round-based Red-then-Blue layout with **paired cards**: each objection and its response displayed together.

**Structure:**
- Grouped by round: "Round 1", "Round 2", etc. — each round is a section with a small header
- Within each round: a vertical list of paired cards
- Each paired card contains the Red objection on top, Blue response below, visually connected

**Paired card layout:**

```
┌─────────────────────────────────────────────────────┐
│  R1-01  [disagreement]  ● high                      │
│                                                      │
│  Red: "I think this overstates both customer         │
│  demand and accessibility..."                        │
│                                                      │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                                      │
│  Blue (partial → resolved):                          │
│  "You're right that 'highly accessible' overstates   │
│  the case..."                                        │
│                                                      │
│  Proposed change: [box with proposed fix]            │
└─────────────────────────────────────────────────────┘
```

**Card styling:**
- Outer card: white bg, thin border (border-tertiary), rounded-lg
- Top half (Red): no special background. Coral 2px left border on the objection quote.
- Divider: dashed 1px border-tertiary
- Bottom half (Blue): no special background. Blue 2px left border on the response.
- Response type badge (fix/defend/concede/partial/escalate) and status badge next to the Blue label

**Round header:**
- "Round 1" — 14px, weight 500, with a summary line below in 12px muted (the round's redTeam.summary)
- Between rounds: if Round 2's `resolvedFromPrior` is non-empty, show a green banner: "Red Team accepted resolution of: R1-01, R1-02, R1-05" — this provides the narrative context of items dropping off.

---

### Revised Output Tab (Unchanged)

Keep the existing `RevisedDocument` component. No changes needed.

---

### Streaming UX During Debate

While the debate is running, the right panel shows a clean loading state:

1. **Progress card** — centered in the panel, white bg, rounded-lg, padded
   - Current phase text: "Round 1: Red Team reviewing document..."
   - A subtle progress bar or spinner (not the cheesy animated dots)
   - Below: estimated time remaining or elapsed time

2. **Incremental rendering** — as each round completes:
   - The Dashboard tab populates incrementally. New issues appear in the list as each round's data arrives.
   - The tab switches to Dashboard automatically once the first round completes.
   - Subsequent rounds update the issue list: status badges change, timeline entries extend, new issues appear at the appropriate severity position.

3. **Completion** — when the debate finishes:
   - Stats and verdict bar compute their final values
   - If revised document generation starts, the "Revised output" tab shows a loading spinner
   - When complete, auto-switch to "Revised output" tab (keep current behavior)

---

### Visual Language

**Color system — categories:**
| Category | Badge bg | Badge text |
|----------|---------|-----------|
| gap | `#FAECE7` (coral-50) | `#993C1D` (coral-600) |
| error | `#FCEBEB` (red-50) | `#A32D2D` (red-600) |
| disagreement | `#EEEDFE` (purple-50) | `#534AB7` (purple-600) |
| clarification | `#E1F5EE` (teal-50) | `#0F6E56` (teal-600) |
| cosmetic | `#FAEEDA` (amber-50) | `#854F0B` (amber-600) |

**Color system — status:**
| Status | Badge bg | Badge text |
|--------|---------|-----------|
| resolved | `#EAF3DE` (green-50) | `#3B6D11` (green-600) |
| unresolved | `#FAEEDA` (amber-50) | `#854F0B` (amber-600) |
| escalated | `#EEEDFE` (purple-50) | `#534AB7` (purple-600) |

**Color system — severity dots:**
| Severity | Dot color |
|----------|----------|
| critical | `#E24B4A` (red-400) |
| high | `#EF9F27` (amber-400) |
| medium | `#BA7517` (amber-600) |
| low | `#888780` (gray-400) |

**Color system — verdict dot:**
| State | Dot color |
|-------|----------|
| Ready | `#639922` (green-400) |
| Needs revision | `#EF9F27` (amber-400) |
| Not ready | `#E24B4A` (red-400) |

**Typography:**
- All text: system sans-serif via Tailwind defaults
- Issue row title: 13px
- Badges and pills: 11px
- Body text in expanded cards: 13px, line-height 1.6
- Section labels (e.g., "Client objection"): 11px, uppercase, letter-spacing 0.04em, muted
- Monospace elements (IDs): 11px, font-mono
- Verdict text: 15px, weight 500
- Stat numbers: 22px, weight 500

**Spacing:**
- Dashboard vertical rhythm: 1rem between major sections (verdict, stats, filters, list)
- Inside expanded rows: 12px between sections
- Padding inside cards: 12px horizontal, variable vertical

---

## V2 File Structure

```
crossfire/
├── app/
│   ├── layout.tsx                      # Unchanged
│   ├── page.tsx                        # Updated: wire new output components
│   ├── api/
│   │   └── debate/
│   │       └── route.ts                # Unchanged
│   └── globals.css                     # Unchanged (or minor Tailwind additions)
├── components/
│   ├── input/                          # Moved from root — existing, unchanged
│   │   ├── DocumentInput.tsx
│   │   ├── ContextPanel.tsx
│   │   ├── ModelSelector.tsx
│   │   └── DebateControls.tsx
│   ├── dashboard/                      # NEW — all V2 dashboard components
│   │   ├── DashboardView.tsx           # Container: verdict + stats + filters + list
│   │   ├── VerdictBar.tsx              # Status dot + verdict text + meta
│   │   ├── StatsRow.tsx                # 4 metric cards
│   │   ├── FilterPills.tsx             # Category filter pills
│   │   ├── IssueList.tsx               # The issue list container
│   │   ├── IssueRow.tsx                # Single collapsed row
│   │   ├── IssueDetail.tsx             # Expanded detail (timeline, quote, objection, response, change)
│   │   └── buildIssueList.ts           # Data transformation: rounds → flat issue list
│   ├── transcript/                     # NEW — redesigned transcript
│   │   ├── TranscriptView.tsx          # Container: round sections with paired cards
│   │   ├── RoundSection.tsx            # Round header + resolved banner + card list
│   │   └── PairedCard.tsx              # Single objection + response card
│   ├── output/                         # Shared output components
│   │   ├── OutputPanel.tsx             # Tab bar + tab content switcher
│   │   ├── DebateSummary.tsx           # Existing, may simplify since Dashboard handles stats
│   │   └── RevisedDocument.tsx         # Existing, unchanged
│   ├── shared/                         # Shared UI primitives
│   │   ├── CategoryBadge.tsx           # Existing, unchanged
│   │   ├── StatusBadge.tsx             # New or refactored from CategoryBadge
│   │   ├── SeverityDot.tsx             # New — small colored dot
│   │   └── TimelineStrip.tsx           # New — renders lifecycle timeline
│   └── (old files to delete)
│       ├── DebateViewer.tsx            # Replaced by OutputPanel
│       ├── RoundCard.tsx               # Replaced by transcript/RoundSection
│       ├── ObjectionCard.tsx           # Replaced by dashboard/IssueRow + IssueDetail
│       ├── ResponseCard.tsx            # Replaced by transcript/PairedCard
│       ├── RevisionChecklist.tsx       # Functionality merged into Dashboard
│       └── EscalationBrief.tsx         # Functionality merged into Dashboard
├── lib/                                # ALL UNCHANGED
│   ├── openrouter.ts
│   ├── models.ts
│   ├── orchestrator.ts
│   ├── prompts.ts
│   ├── lenses.ts
│   ├── search.ts
│   ├── schemas.ts
│   ├── types.ts
│   ├── derive.ts
│   ├── export.ts
│   └── utils.ts
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Component Specifications

### `OutputPanel.tsx` — Tab container

Props:
```typescript
interface OutputPanelProps {
  rounds: DebateRound[];
  summary: FinalSummary | null;
  revisedDocument: RevisedDocument | null;
  isRunning: boolean;
  hasStartedDebate: boolean;
  error: string | null;
  config: { clientCompany: string; documentType: string };
  onExport: (format: 'json' | 'markdown') => void;
}
```

Behavior:
- Manages `activeTab` state: 'dashboard' | 'transcript' | 'revised'
- Default tab: 'dashboard'
- Shows empty state (Crossfire icon + instructions) when no debate has started
- Shows loading state (progress card) when debate is running and no rounds yet
- When first round arrives: renders DashboardView with available data
- When revisedDocument arrives: auto-switches to 'revised' tab
- Header bar: brand mark left, tab group center-right, export buttons far right

### `DashboardView.tsx` — Executive dashboard

Props:
```typescript
interface DashboardViewProps {
  rounds: DebateRound[];
  summary: FinalSummary | null;
  isRunning: boolean;
}
```

Behavior:
- Calls `buildIssueList(rounds)` to transform round data into flat issue list
- Computes verdict from issue list (status dot color, verdict sentence)
- Manages filter state (selected category)
- Renders: VerdictBar → StatsRow → FilterPills → IssueList

### `IssueRow.tsx` — Collapsed issue row

Props:
```typescript
interface IssueRowProps {
  issue: DashboardIssue;
  isExpanded: boolean;
  onToggle: () => void;
}
```

Renders the single-line row with ID, severity dot, category badge, truncated title, status badge, chevron. Click handler toggles expansion.

### `IssueDetail.tsx` — Expanded issue detail

Props:
```typescript
interface IssueDetailProps {
  issue: DashboardIssue;
}
```

Renders: TimelineStrip, document quote, client objection, Innovera response, proposed change (if any), status note (if unresolved/escalated).

### `PairedCard.tsx` — Transcript paired card

Props:
```typescript
interface PairedCardProps {
  objection: Objection;
  response: Response | undefined;
}
```

Renders objection on top, response on bottom, connected by dashed divider. Shows response type badge, status indicator, and proposed change.

---

## Implementation Sequence

Build in this order. Each step should result in a working (if incomplete) UI.

### Step 1: Scaffold and data layer
1. Create `components/dashboard/buildIssueList.ts` — the data transformation function
2. Create the `DashboardIssue` and `TimelineEntry` types (in the same file or in types.ts)
3. Test the transformation with the existing Samsung debate JSON data

### Step 2: Dashboard components (top-down)
1. `shared/SeverityDot.tsx` and `shared/StatusBadge.tsx` — tiny reusable primitives
2. `shared/TimelineStrip.tsx` — renders the lifecycle line
3. `dashboard/VerdictBar.tsx` — verdict computation + render
4. `dashboard/StatsRow.tsx` — 4 metric cards
5. `dashboard/FilterPills.tsx` — category pills with click handler
6. `dashboard/IssueRow.tsx` — collapsed row
7. `dashboard/IssueDetail.tsx` — expanded detail
8. `dashboard/IssueList.tsx` — list container managing expand state
9. `dashboard/DashboardView.tsx` — wires everything together

### Step 3: OutputPanel and page wiring
1. `output/OutputPanel.tsx` — tab bar + tab content
2. Update `app/page.tsx` — replace DebateViewer with OutputPanel, pass correct props
3. Test with a real debate run

### Step 4: Transcript redesign
1. `transcript/PairedCard.tsx`
2. `transcript/RoundSection.tsx`
3. `transcript/TranscriptView.tsx`
4. Wire into the Transcript tab in OutputPanel

### Step 5: Polish
1. Loading states and streaming behavior
2. Empty states
3. Mobile responsive (stacked layout, 2x2 stats grid)
4. Hover states, transitions, micro-interactions
5. Test with Samsung debate data — verify all issues render correctly
6. Test with other documents and model pairings

---

## Existing Backend Reference (Unchanged)

### Data Types (lib/types.ts)

```typescript
export type ObjectionCategory = 'clarification' | 'cosmetic' | 'gap' | 'error' | 'disagreement';
export type ObjectionSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ResponseType = 'fix' | 'defend' | 'concede' | 'partial' | 'escalate';
export type ResolutionStatus = 'resolved' | 'unresolved' | 'escalated';

export interface Objection {
  id: string;
  category: ObjectionCategory;
  severity: ObjectionSeverity;
  quote: string;
  objection: string;
  suggestedResolution?: string;
  requiresSearch?: boolean;
}

export interface Response {
  objectionId: string;
  responseType: ResponseType;
  explanation: string;
  proposedChange?: string;
  status: ResolutionStatus;
}

export interface RedTeamOutput {
  objections: Objection[];
  resolvedFromPrior?: string[];
  summary: string;
}

export interface BlueTeamOutput {
  responses: Response[];
  summary: string;
}

export interface DebateRound {
  roundNumber: number;
  redTeam: RedTeamOutput;
  blueTeam: BlueTeamOutput;
}

export interface FinalSummary {
  totalObjections: number;
  resolved: number;
  unresolved: number;
  escalated: number;
  byCategory: Record<ObjectionCategory, number>;
  topUnresolved: Objection[];
  recommendation: string;
}
```

### Streaming Events (lib/orchestrator.ts)

```typescript
export type DebateEvent =
  | { type: 'progress'; data: { round: number; phase: string } }
  | { type: 'round'; data: DebateRound }
  | { type: 'summary'; data: FinalSummary }
  | { type: 'rewrite'; data: RevisedDocument };
```

### API Route Response Format

NDJSON stream. Each line is a JSON object. Types in order:
1. `heartbeat` — keep-alive pings (every 15s)
2. `progress` — phase updates ("Round 1: Red Team reviewing...")
3. `round` — complete round data (Red + Blue)
4. `summary` — final summary stats
5. `rewrite` — revised document (last event)

The frontend reads this stream and updates state incrementally. This logic in `page.tsx` is correct and should not change. The only change is which components consume the state.

---

## Models (lib/models.ts)

```typescript
export const MODELS = {
  'opus-4.6': { id: 'anthropic/claude-opus-4-6', name: 'Claude Opus 4.6' },
  'gpt-5.4': { id: 'openai/gpt-5.4', name: 'GPT-5.4' },
  'gemini-pro-3.1': { id: 'google/gemini-pro-3.1', name: 'Gemini Pro 3.1' },
};

export const DEFAULT_PAIRING = {
  redTeam: 'gpt-5.4',
  blueTeam: 'opus-4.6',
};
```

---

## Environment Variables

```
OPENROUTER_API_KEY=sk-or-...
TAVILY_API_KEY=tvly-...          # Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ESL Mode (Unchanged)

When `eslEnabled` is true, the Red Team persona adds language-sensitivity objections. This is purely a prompt-layer feature. No UI changes needed — ESL objections appear as `cosmetic` or `clarification` category items in the dashboard like any other objection.

---

## Known Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Invalid JSON from LLM | jsonrepair + Zod + retry loop (max 2) |
| Red Team invents phantom objections | Prompt forbids it + severity calibration |
| Blue Team concedes everything | **V2 backlog: prompt tuning needed. See Resolution Bias notes below.** |
| Red Team repeats same objection | Round 2+ prompt requires new reasoning |
| Debate doesn't converge | Hard round cap + early termination |
| OpenRouter rate limits | Exponential backoff; sequential rounds = natural pacing |
| Long documents hit context limits | Large-context models + history compression |

---

## V2 Backlog: Resolution Bias (Post-UI)

**Problem:** In observed debates, Blue Team marks nearly all items as "resolved" — even when the response is "partial" or the proposed fix is vague. The Samsung debate showed 14/14 resolved, 0 unresolved, 0 escalated. Blue never uses "defend" or "escalate."

**Root causes:**
1. Blue self-assigns the `status` field — there's no independent judge
2. The Blue prompt gives detailed guidance on when to concede but generic guidance on when to defend
3. "partial" responses still get marked "resolved" even when the fix is incomplete

**Planned fixes (post-UI, separate PR):**
- Add explicit defend/escalate examples to the Blue prompt
- Consider adding a "resolution judge" — a third LLM call that reviews each Red/Blue pair and independently assigns status
- Add minimum defend/escalate quotas to the Blue prompt as a guardrail
- Raise Blue temperature from 0.4 to 0.5-0.6 to encourage less agreeable behavior

These fixes are prompt-layer only and won't require UI changes — the dashboard already handles all three status types (resolved/unresolved/escalated) visually.

---

## Testing & Quality

### Dashboard Rendering
Load the Samsung debate JSON directly in development (bypass the API) to test dashboard rendering without waiting for LLM calls. Add a `?mock=samsung` URL parameter that loads the test fixture.

### Prompt Quality Validation (unchanged from V1)
Red Team should catch things like:
- "You say we need 400 aerospace engineers — where does that number come from?"
- "Samsung Heavy Industries is a separate public entity — you can't assume cross-divisional leverage"
- "The $1,500–$2,500/kg cost penalty — current pricing or projected?"

### Convergence Health (unchanged from V1)
- Round 1: 6-10 objections
- Round 2: ~50% resolved, 1-2 new items
- Round 3: Most remaining resolved or escalated

---

## Out of Scope (V2)

- User authentication / accounts
- Database storage
- Real-time collaboration
- Custom persona templates
- PDF/DOCX input (markdown/text only)
- Cost tracking / token dashboard
- Multi-document debates
- Speed/timeout optimizations (accepted as V1 constraints for now)
- Prompt tuning for resolution bias (V2 backlog, separate from UI work)
