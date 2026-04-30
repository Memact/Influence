# Memact Influence

Version: `v0.0`

Influence finds repeated shaping patterns around a thought.

It owns one job:

```text
detect what repeatedly moved attention, themes, or activity in a direction
```

Influence does not claim causality. It explains repeated patterns that may have shaped the context around a thought.

## What This Repo Owns

- Reads Capture snapshots today.
- Can later read Memory/Schema evidence at query time.
- Normalizes fragmented activity labels.
- Detects directional transitions such as `A -> B`.
- Computes count, `P(B | A)`, `P(B)`, lift, and confidence.
- Filters bidirectional noise.
- Reports source trails behind repeated patterns.
- Emits JSON, readable reports, graph lines, and DOT output.

## Valid Chain Rules

A chain is kept only when it passes support and direction checks:

```text
count(A -> B) >= 3
count(A) >= 5
P(B | A) > P(B)
A -> B is stronger than B -> A
```

Confidence:

```text
count(A -> B) * (P(B | A) - P(B))
```

## Run Locally

Prerequisites:

- Node.js `20+`
- npm `10+`

Install:

```powershell
npm install
```

Validate:

```powershell
npm run check
```

Run sample:

```powershell
npm run sample
```

Analyze a Capture snapshot:

```powershell
npm run analyze -- --input path\to\capture-snapshot.json --format report
```

All output formats:

```powershell
npm run sample:all
```

## Contract

- Influence is about repeated shaping, not first origin.
- It should avoid weak bidirectional patterns.
- It should cite source trails when available.
- It should never say a source caused a thought.

## License

See `LICENSE`.
