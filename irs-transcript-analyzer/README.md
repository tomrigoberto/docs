# IRS Transcript Analyzer

App + observation library for analyzing batches of IRS transcripts (HTML)
across a client household and surfacing observations from a curated
library of pre-defined rules.

## Repos

| Repo | Purpose |
|---|---|
| `tomrigoberto/observations` | The application (FastAPI + Next.js + Postgres) |
| `tomrigoberto/observations-library` | The observation library — analyst-authored YAML files |
| `tomrigoberto/docs` (this repo, `irs-transcript-analyzer/`) | Design docs, analyst handbook, library starter scaffold |

## Where to start

| If you are a... | Start here |
|---|---|
| Engineer | `architecture/plan.md` |
| Tax / financial analyst authoring observations | `analyst-handbook/authoring-guide.md` |
| Library admin / reviewer | `analyst-handbook/severity-rubric.md`, `confidence-rubric.md`, `style-guide.md` |

## Versions

- Schema: 0.1.0 (pre-release; expect changes)
- Pattern catalog: v0
- App: 0.0.1 (skeleton)

## Design decisions locked in (2026-05)

- Logic is authored using **patterns** (parameterized templates), not free-form code.
- A small **DSL escape hatch** exists for rare cases; using it requires a tax-lead reviewer.
- One observation per file. Files live in a separate library repo and are pinned by the app as a versioned rule pack.
- Single-firm, single-role at MVP. Approver role and multi-tenant come later.
- Local-only deployment via docker-compose for now; managed cloud later.
- All test fixtures use synthetic data only.

## Library structure at a glance

When you create the `observations-library` repo, copy `library-starter/` from this directory as your starting point. It contains the schemas, the v0 pattern catalog, an example observation, and the disclaimer registry — all schema-validated and ready to extend.
