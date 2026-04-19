# Memact Influence

Version: `v0.0`

Influence is the deterministic shaping-pattern engine in the Memact architecture.

It answers:

`What repeatedly shaped the direction of this thought over time?`

Influence is different from Origin. Origin looks for a possible direct source. Influence looks for repeated exposure, transitions, themes, and source trails that may have shaped the surrounding mental context.

## Pipeline Position

```text
Capture -> Inference -> Schema -> Interface / Query -> Origin + Influence
```

The current v0 engine can still analyze Capture snapshots directly for transition patterns. The redesigned direction is for Influence to consume Inference and Schema outputs at query time, while keeping compatibility with existing Capture snapshots during the migration.

## What It Does Today

- reads Capture snapshot exports
- normalizes fragmented activity labels into canonical activity types
- detects directional `A -> B` transitions
- computes transition count, `P(B | A)`, `P(B)`, lift, and confidence
- suppresses weak bidirectional noise
- attributes recurring source domains and source pages to each chain
- detects repeated trajectories such as `A -> B -> C`
- highlights persistent themes and drift signals over time
- emits JSON, reports, readable graph lines, DOT graphs, and neutral deterministic insights

## What It Should Do Next

- accept a user thought query from Interface
- consume Inference records and Schema signals
- rank shaping patterns related to the thought
- cite evidence behind each influence pattern
- avoid claiming that an influence created the thought

## Relationship To Other Engines

- Capture answers: `What did the user encounter?`
- Inference answers: `What was it about?`
- Schema answers: `What repeated mental frame may be forming?`
- Origin answers: `Did a specific source likely introduce the thought?`
- Influence answers: `What repeatedly shaped this thought's direction?`
- Interface answers: `How does the user inspect the evidence?`

## High-Signal Rules

The current transition engine keeps a chain only when it survives these checks:

- `count(A -> B) >= 3`
- `count(A) >= 5`
- the transition falls within the configured time window
- `P(B | A) > P(B)`
- the edge is directionally stronger than its reverse
- it remains in the top output set after confidence ranking

Confidence is ranked as:

```text
count(A -> B) * (P(B | A) - P(B))
```

## Terminal Quickstart

Prerequisites:

- Node.js `20+`
- npm `10+`

Install:

```powershell
npm install
```

Run validation:

```powershell
npm run check
```

Run the included sample:

```powershell
npm run sample
```

Analyze the latest Capture snapshot from the workspace root:

```powershell
npm run analyze -- --format report
```

Analyze a specific snapshot:

```powershell
npm run analyze -- --input <path-to-captanet-snapshot-*.json> --format report
```

Generate pitch artifacts locally:

```powershell
npm run pitch
```

Pitch output is written outside the repo by default:

```text
..\pitch-output\
```

## Sample Output

```text
Influence Report
Timeline: 2026-04-01T08:00:00.000Z -> 2026-04-06T10:28:00.000Z | days=6 | activities=17

Strongest Chains
1. [startup] -> [exam] (5) lift=2.8333 confidence=3.2353
   After engaging with startup-related content, you tended to move toward exam-related content.
```

## Programmatic Use

```js
import {
  analyzeInfluenceSnapshot,
  formatReadableGraph,
  formatReadableInsights,
  formatDotGraph,
  formatTerminalReport,
} from "memact-influence";
```

## Design Rules

- deterministic first
- no AI-generated conclusions
- no causal claims
- every influence pattern must retain evidence
- Origin and Influence must stay separate claim types

## License

See `LICENSE`.
