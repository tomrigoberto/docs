# IRS Transcript Analyzer — Plan & Architecture

## Goal

Given a batch of IRS transcripts (HTML) for an entire client household — primary, spouse, dependents, businesses, trusts, and estates — surface observations from a curated library so an advisor can walk a client through findings. Provide:

- Full transparency into which transcripts were ingested per member
- Clear coverage of which tax years the analysis spans
- An executive summary (one-pager) and a detailed observation report
- PDF export of both
- Source citations on every observation
- A library browser inside the app

## Approach

The library is **data, not code**. Analysts author observations as schema-validated YAML files in `observations-library`. The app loads a versioned rule pack and runs a deterministic engine over a normalized fact store extracted from the transcripts. No LLMs in the evaluation path — at 10K rules, advisors need reproducibility, auditability, and per-line source citations.

## Architecture

```
┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐
│ Upload UI    │──▶ │ HTML Parsers     │──▶ │ Normalized Facts   │
│ (per member) │    │ (one per         │    │ (Postgres + JSONB) │
└──────────────┘    │  transcript      │    └─────────┬──────────┘
                    │  type)           │              │
                    └──────────────────┘              ▼
                                              ┌──────────────────┐
                                              │ Rule Engine      │
                                              │ (evaluates only  │
                                              │  applicable obs) │
                                              └─────────┬────────┘
                                                        │
                          ┌─────────────────────────────┼────────────────┐
                          ▼                             ▼                ▼
                   ┌──────────────┐           ┌──────────────┐   ┌──────────────┐
                   │ Advisor UI   │           │ PDF: Exec    │   │ PDF: Detail  │
                   │ (review/edit)│           │   Summary    │   │   Report     │
                   └──────────────┘           └──────────────┘   └──────────────┘

Library repo (separate):  observations/*.yaml ──▶ build step ──▶ compiled rule pack
```

## Components

| Layer | Purpose | Tech |
|---|---|---|
| Ingestion | Parse each IRS transcript HTML type into typed records | Python + lxml/BeautifulSoup; one parser per transcript type |
| Household model | Members (PT, spouse, dependents), entities (businesses/trusts/estates), relationships, role of each transcript | Postgres relational tables |
| Normalized fact store | Canonical facts: filing_status_by_year, agi_by_year, tc_events, wage_income_documents, retirement_distributions, etc. Every fact carries a back-pointer to source transcript + line | Postgres JSONB keyed by (household, member/entity, year) |
| Library | YAML files, JSON-Schema validated, with test fixtures | Git repo; CI builds an immutable rule pack |
| Rule engine | Indexes observations by required inputs; evaluates only applicable ones; produces results with filled placeholders + citations | Python; pattern dispatcher |
| Results store | Per-household analysis run, immutable, versioned against rule-pack version | Postgres |
| Web app | Upload, household builder, run analysis, review observations, edit/dismiss/annotate, export PDFs, browse library | Next.js + FastAPI |
| PDF | Server-side HTML → PDF | WeasyPrint |

## Key non-obvious choices

1. **Two-stage processing.** Parsers never make inferences; they only produce structured records. The engine never re-parses HTML.
2. **Required inputs is a first-class field on every observation.** With ~15 fact types per household and explicit input declarations, evaluation prunes 10K rules to a few hundred per run.
3. **Confidence is a first-class field**, not a flag. Affects sort order and exec-summary inclusion.
4. **Results are immutable per run.** Re-running creates a new run; old results stay intact for client conversations.
5. **Rule pack version is recorded on every result.**
6. **Patterns over DSL.** Analysts pick from a parameterized catalog. A DSL escape hatch exists but requires a tax-lead reviewer.

## Phased roadmap

| Phase | Scope | Outcome |
|---|---|---|
| 0 (now) | Lock schema, pattern catalog v0, authoring guide, severity & confidence rubrics, style guide | Analysts can begin authoring confidently |
| 1 (MVP) | Ingestion for Account + Wage & Income; ~50 hand-picked observations across all four categories; full UI; both PDFs; audit trail; library browser | End-to-end demo on synthetic households |
| 2 | Add Return Transcript + RoA + VNF parsers; library to ~500 observations via templates; library-health dashboard; advisor edit/dismiss flows | Production-usable for pilot advisors |
| 3 | Authoring UI (web form → YAML PRs); observation suggester (pattern mining over fired/dismissed history); scale to several thousand observations | Analysts author without git proficiency |
| Ongoing | Quarterly reviews, deprecation, new transcript types, LLM-assisted parsing for edge HTML formats (always behind review) | |

## App requirements (MVP)

- Client creation that starts empty, awaiting upload
- Upload UI that lets advisors tag each HTML to member/entity, transcript type, tax year (auto-detect with override)
- Household builder for primary, spouse, dependents, businesses, trusts, estates and their relationships
- Input transparency view: per member/entity, a matrix (tax year × transcript type) with parse status and click-through to source HTML
- Coverage banner: "Analysis covers tax years YYYY–YYYY across N members and M entities"
- Analysis run produces an immutable result
- Observation review UI grouped by category, filterable, with: statement (filled), discussion points, source citations, caveats, disclaimers, rule version
- Advisor actions: dismiss with reason, annotate, mark "discussed"
- Executive summary (one-pager): household at a glance, tax years covered, top urgent/risk, top opportunities, headline numbers; advisors can pin/unpin items
- PDF export for both reports (server-side HTML → WeasyPrint)
- Source citations on every observation, in UI and PDF
- Library browser: read-only inside the app; browse by category → subcategory; filter by severity/confidence/tags; search by ID/title/fact name
- Audit log (who ran what, when, against which rule pack, plus advisor edits)

## Scaling to 10K observations

- Templates for parameterized observation families (same shape, different TC code or threshold) — avoid hand-authoring near-duplicates
- Index by required inputs to prune evaluation per run
- Library partitioning by category with code-owners gating reviews
- Library-health dashboard tracks fire-rate and dismissal-rate — candidates for review or retirement
- Performance budget: full household run (5 members × 5 years × ~20 transcripts) under 30s

## Open and deferred

- Authoring UI — Phase 3
- Multi-tenant — out of scope
- Approver role — out of scope at MVP; single role with PR review enforced via CI
- Real-PII handling — out of scope; synthetic only
