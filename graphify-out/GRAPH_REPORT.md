# Graph Report - sysmac  (2026-08-04)

## Corpus Check
- 12 files · ~31,510 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 94 nodes · 151 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `322c5489`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- .rail
- test.js
- gen_all.js
- lib.js
- genname.js
- sysmac-program-generator
- run

## God Nodes (most connected - your core abstractions)
1. `Rung()` - 9 edges
2. `series()` - 9 edges
3. `buildUnit()` - 8 edges
4. `latch()` - 8 edges
5. `mutexGroup()` - 8 edges
6. `orOfAnds()` - 7 edges
7. `merge2()` - 7 edges
8. `motionStep()` - 7 edges
9. `sysmac-program-generator` - 7 edges
10. `orMany()` - 6 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - ".rail"
Cohesion: 0.42
Nodes (8): latch(), merge2(), motionStep(), mutexGroup(), orMany(), orOfAnds(), Rung(), ton()

### Community 1 - "test.js"
Cohesion: 0.06
Nodes (26): aCoil, bCoil, byId, flowJson, fs, gateOrder, mxGate, mxObjs (+18 more)

### Community 2 - "gen_all.js"
Cohesion: 0.30
Nodes (8): AL(), buildMain(), buildUnit(), findLsc(), MF(), pad(), pairUp(), stripAS()

### Community 3 - "lib.js"
Cohesion: 0.31
Nodes (7): chunkNot(), dualAux(), esc(), ls2(), sect(), series(), vr()

### Community 10 - "sysmac-program-generator"
Cohesion: 0.20
Nodes (9): Alur, Batasan, Cara build, Condition (bit bernama, tanpa batas 3), Motion Sequence (urutan gerak AutoRunning), Struktur, sysmac-program-generator, Uji yang dijalankan `test.js` (+1 more)

## Knowledge Gaps
- **33 isolated node(s):** `fs`, `path`, `flowJson`, `byId`, `stub` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildUnit()` connect `gen_all.js` to `.rail`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `buildMain()` connect `gen_all.js` to `.rail`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `series()` connect `lib.js` to `.rail`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `flowJson` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `test.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._