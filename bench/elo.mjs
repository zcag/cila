#!/usr/bin/env node
// cila-Bench — pairwise leaderboard.
//
// Reads a results.json of pairwise outcomes and prints a ranked leaderboard.
// LLM judges score design poorly in absolute terms but RANK adequately (UI-Bench,
// MLLM-as-UI-Judge), so cila-Bench is *pairwise only* — never a 1–10 absolute score.
//
// Two rating models (both standard, both implemented here):
//   - Elo (default): online, order-sensitive, intuitive. Good for a streaming loop.
//   - Bradley–Terry (--bt): batch MLE, order-independent, the "honest" rating when
//     you re-rate the whole corpus. Recommended for the published leaderboard.
//
// results.json shape:  [{ "a": "cila@v3", "b": "cila@v2", "winner": "a" | "b" | "tie",
//                          "brief": "saas-landing", "criterion": "overall" }, ...]
//   - `a`/`b` are competitor (cila version / baseline) ids; one match = one rendered
//     page of `a` vs one of `b` on the same brief, as decided by the pairwise judge.
//   - `winner`: "a", "b", or "tie". `brief`/`criterion` are optional metadata.
//
// Usage:
//   node bench/elo.mjs [results.json]        # Elo (default); defaults to bench/results.sample.json
//   node bench/elo.mjs results.json --bt     # Bradley–Terry MLE ratings
//   node bench/elo.mjs results.json --k 24   # Elo K-factor (default 32)
//   node bench/elo.mjs results.json --json   # emit the leaderboard as JSON

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : true;
};
const useBT = flag("bt", false) === true;
const asJson = flag("json", false) === true;
const K = Number(flag("k", 32));
const file =
  args.find((a) => !a.startsWith("--") && !/^\d+$/.test(a)) ??
  new URL("./results.sample.json", import.meta.url).pathname;

let matches;
try {
  matches = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`Could not read results from ${file}: ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(matches) || matches.length === 0) {
  console.error("results must be a non-empty array of { a, b, winner } matches.");
  process.exit(1);
}

// score for `a`: 1 win, 0 loss, 0.5 tie
const scoreA = (w) => (w === "a" ? 1 : w === "b" ? 0 : 0.5);
const expected = (ra, rb) => 1 / (1 + 10 ** ((rb - ra) / 400));

const players = [...new Set(matches.flatMap((m) => [m.a, m.b]))];
const stats = Object.fromEntries(
  players.map((p) => [p, { player: p, w: 0, l: 0, t: 0, n: 0 }])
);
for (const m of matches) {
  const s = scoreA(m.winner);
  stats[m.a].n++; stats[m.b].n++;
  if (s === 1) { stats[m.a].w++; stats[m.b].l++; }
  else if (s === 0) { stats[m.a].l++; stats[m.b].w++; }
  else { stats[m.a].t++; stats[m.b].t++; }
}

let rating;
if (useBT) {
  rating = bradleyTerry(matches, players);
} else {
  // Online Elo. Order matters; results.json is chronological (append-only).
  const r = Object.fromEntries(players.map((p) => [p, 1500]));
  for (const m of matches) {
    const s = scoreA(m.winner);
    const ea = expected(r[m.a], r[m.b]);
    r[m.a] += K * (s - ea);
    r[m.b] += K * ((1 - s) - (1 - ea));
  }
  rating = r;
}

// Bradley–Terry MLE via MM/iterative-scaling (Hunter 2004), then mapped to an
// Elo-like scale for readability. Order-independent — the batch "truth".
function bradleyTerry(ms, ids) {
  const wins = Object.fromEntries(ids.map((p) => [p, 0]));      // effective wins (ties = 0.5)
  const opp = {};                                               // games matrix
  for (const p of ids) opp[p] = Object.fromEntries(ids.map((q) => [q, 0]));
  for (const m of ms) {
    const s = scoreA(m.winner);
    wins[m.a] += s; wins[m.b] += 1 - s;
    opp[m.a][m.b]++; opp[m.b][m.a]++;
  }
  let p = Object.fromEntries(ids.map((id) => [id, 1]));
  for (let iter = 0; iter < 1000; iter++) {
    const next = {};
    for (const i of ids) {
      let denom = 0;
      for (const j of ids) {
        const games = opp[i][j];
        if (games) denom += games / (p[i] + p[j]);
      }
      // +1 smoothing keeps undefeated/winless players finite
      next[i] = denom > 0 ? (wins[i] + 1e-9) / denom : p[i];
    }
    // normalize (geometric mean → 1) to prevent drift
    const gm = Math.exp(
      ids.reduce((a, id) => a + Math.log(Math.max(next[id], 1e-12)), 0) / ids.length
    );
    let maxDelta = 0;
    for (const id of ids) {
      const v = next[id] / gm;
      maxDelta = Math.max(maxDelta, Math.abs(v - p[id]));
      p[id] = v;
    }
    if (maxDelta < 1e-9) break;
  }
  // strengths → Elo-like points centered at 1500
  return Object.fromEntries(ids.map((id) => [id, 1500 + 400 * Math.log10(p[id])]));
}

const board = players
  .map((p) => ({ ...stats[p], rating: rating[p] }))
  .sort((x, y) => y.rating - x.rating)
  .map((row, i) => ({ rank: i + 1, ...row }));

if (asJson) {
  console.log(JSON.stringify({ model: useBT ? "bradley-terry" : "elo", board }, null, 2));
  process.exit(0);
}

const pct = (r) => (r.n ? Math.round((100 * (r.w + 0.5 * r.t)) / r.n) : 0);
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
const nameW = Math.max(8, ...board.map((r) => r.player.length));

console.log(`\ncila-Bench leaderboard  (${useBT ? "Bradley–Terry" : "Elo"}, ${matches.length} matches)`);
console.log("─".repeat(nameW + 38));
console.log(`${pad("#", 3)}${pad("competitor", nameW + 2)}${lpad("rating", 7)}${lpad("W-L-T", 11)}${lpad("win%", 7)}`);
console.log("─".repeat(nameW + 38));
for (const r of board) {
  console.log(
    `${pad(r.rank, 3)}${pad(r.player, nameW + 2)}${lpad(Math.round(r.rating), 7)}${lpad(`${r.w}-${r.l}-${r.t}`, 11)}${lpad(pct(r) + "%", 7)}`
  );
}
console.log("─".repeat(nameW + 38));
console.log("Higher = wins more pairwise design-quality judgments. A rising cila@vN over time = cila improved.\n");
