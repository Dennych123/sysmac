# Graph Report - .  (2026-08-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 62 nodes · 107 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f5b05662`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Rung
- test.js
- gen_all.js
- lib.js
- genname.js

## God Nodes (most connected - your core abstractions)
1. `Rung()` - 9 edges
2. `series()` - 9 edges
3. `buildUnit()` - 8 edges
4. `latch()` - 8 edges
5. `merge2()` - 7 edges
6. `motionStep()` - 7 edges
7. `orMany()` - 6 edges
8. `ton()` - 6 edges
9. `buildMain()` - 4 edges
10. `esc()` - 4 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (10 total, 1 thin omitted)

### Community 0 - "Rung"
Cohesion: 0.42
Nodes (6): latch(), merge2(), motionStep(), orMany(), Rung(), ton()

### Community 1 - "test.js"
Cohesion: 0.15
Nodes (12): byId, flowJson, fs, okSeeded, okStub, outdir, path, run() (+4 more)

### Community 2 - "gen_all.js"
Cohesion: 0.30
Nodes (8): AL(), buildMain(), buildUnit(), findLsc(), MF(), pad(), pairUp(), stripAS()

### Community 3 - "lib.js"
Cohesion: 0.31
Nodes (7): chunkNot(), dualAux(), esc(), ls2(), sect(), series(), vr()

## Knowledge Gaps
- **10 isolated node(s):** `fs`, `path`, `flowJson`, `byId`, `stub` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildUnit()` connect `gen_all.js` to `Rung`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `series()` connect `lib.js` to `Rung`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `buildMain()` connect `gen_all.js` to `Rung`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `flowJson` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._