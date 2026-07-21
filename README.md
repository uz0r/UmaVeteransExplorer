# Uma Veterans Explorer

A local-first analytics and breeding-planning tool for **Uma Musume: Pretty Derby** veteran dumps.

The app accepts the universal `data.json` export produced by [xancia/UmaExtractor](https://github.com/xancia/UmaExtractor), processes it entirely in the browser, and helps find useful parents and inheritance lines without uploading collection data anywhere.

## Live site

After GitHub Pages is enabled through the included workflow:

`https://uz0r.github.io/UmaVeteransExplorer/`

## Current features

### Overview

- Collection health and scenario coverage.
- Strongest direct-parent lines.
- Strongest grandparent/white-factor donors.
- Hidden-value veterans with rich white factors but weak main blue sparks.

### Raw Explorer

- Search by character, veteran ID, factor name, or factor ID.
- Sort by any major collection metric.
- Select any factor and rank by total stars or number of copies.
- Evaluate the factor in three scopes:
  - **Own** — the veteran as a future grandparent.
  - **Active** — veteran + two direct parents.
  - **Full** — all seven characters in the exported lineage.
- Export filtered rows to CSV.

### Rankings

Collection-relative scoring profiles for:

- Universal grandparent.
- Universal direct parent.
- Pace Chaser parent.
- Sprint/Mile parent.
- Medium Pace parent.
- Long-distance parent.
- White-first donor.
- Blue-first comparison.

Every component is visible and adjustable: blue factors, white factors, pink factors, G1/affinity, inherited unique utility, and factor diversity.

### Pair Builder

- Select a target character.
- Rank possible parent pairs from the user's own collection.
- Uses individual parent quality, exact `aff2`/`aff3` compatibility when available, G1 intersections, parent-to-parent synergy, and relevant factor coverage.
- Excludes the target character and duplicate character identities from parent slots.

## Data and privacy

- The imported dump stays in browser memory.
- No veteran data is transmitted to this repository, GitHub, or uma.moe.
- The app downloads only public reference resources from uma.moe: factor names, character names, and affinity matrices.
- If public resources cannot be loaded, the explorer continues in offline/fallback mode.

## Scoring model

The scoring model is intentionally transparent and heuristic.

A grandparent is evaluated mostly from **its own factors**, because its parents fall outside the active inheritance line in the next generation. A direct parent is evaluated from the active three-character package: **veteran + its two direct parents**.

Exact target-line base affinity follows this structure:

```text
Aff2(target, parent)
+ Aff3(target, parent, left grandparent)
+ Aff3(target, parent, right grandparent)
+ G1 intersections inside the parent line
```

Pair Builder adds parent-to-parent affinity, their shared G1 wins, and relevant-factor coverage. The final pair score is a planning heuristic rather than an official game formula.

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## GitHub Pages

The workflow in `.github/workflows/pages.yml` builds and deploys the Vite site whenever `main` is updated. In the repository settings, Pages should use **GitHub Actions** as the source.

## Roadmap

- User-defined scoring profiles saved locally.
- Multi-factor priority lists and hard requirements.
- Better inherited-unique metadata by course and strategy.
- Course/Champions Meeting profiles with recommended acceleration and speed skills.
- Search for the best owned parent plus a borrowable parent from uma.moe.
- Full CM planner: target character → strategy → course → skill package → parent pair.
- Shareable, privacy-safe analysis snapshots without the original dump.

## Attribution

- Dump format and extraction: [xancia/UmaExtractor](https://github.com/xancia/UmaExtractor)
- Public game reference data and affinity matrices: [uma.moe](https://uma.moe/)
