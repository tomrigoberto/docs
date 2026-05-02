# Observation Schema Reference

Every observation file must conform to `schemas/observation.schema.json` in the library repo. This page is the human-readable annotation of that schema.

Field key: **(req)** required, **(opt)** optional.

---

## Top-level fields

### `id` (req)
String, format `OBS-<CAT>-####`. Must be reserved in `ids.lock` before use. **Never reuse a retired ID.**
Example: `OBS-LIFE-0042`

### `version` (req)
Semver string. Bump:
- patch (`1.0.1`) — wording fixes only
- minor (`1.1.0`) — added discussion points or new optional sources
- major (`2.0.0`) — logic change that may change which households this fires on

### `status` (req)
One of: `draft`, `active`, `deprecated`, `retired`.
- `draft` — not evaluated against client households
- `active` — normal operation
- `deprecated` — still evaluated, banner in UI, scheduled for retirement
- `retired` — not evaluated; preserved only for historical run reproducibility

### `title` (req)
Short title shown in the library browser and on the observation card. ≤ 80 characters.

### `category` (req) and `subcategory` (req)
Must match the file path. Allowed categories at v0:
- `life_events`
- `tax`
- `financial`
- `estate`

Subcategories within each are documented in the pattern catalog and will grow over time.

### `severity` (req)
One of: `informational`, `opportunity`, `risk`, `urgent`. See `severity-rubric.md`.

### `confidence` (req)
One of: `deterministic`, `inferential`, `speculative`. See `confidence-rubric.md`.

### `applies_to` (req)
List of member roles this fires against:
- `primary_taxpayer`
- `spouse`
- `dependent`
- `business_entity`
- `trust`
- `estate`

The engine evaluates the rule once per matching member/entity. The current member is exposed as `member` in `capture`/`statement`/`sources`.

### `temporal_scope` (req)
- `year` — fires for a specific tax year (the most common)
- `period` — fires for a window of years
- `standing` — reflects a current state regardless of year

### `audience_tags` (opt)
List of tags for grouping in exec summary themes. Free-form but consistent. Examples: `planning`, `beneficiary_review`, `compliance`, `cash_flow`.

---

## `required_inputs` (req)

What must be present for the engine to even attempt this rule.

```yaml
required_inputs:
  transcript_types:           # any-of
    - account_transcript
  min_tax_years: 2            # minimum years of data
  facts:                      # canonical facts that must be populated
    - filing_status_by_year
```

The engine uses this to prune evaluation. **If you don't declare a required fact, the engine may skip your rule even when it should fire.**

---

## `logic` (req)

Either a single pattern or a combinator over patterns.

```yaml
logic:
  pattern: <pattern_id>
  parameters: { ... }
  capture: { name_in_observation: name_exposed_by_pattern, ... }
```

Or:

```yaml
logic:
  all_of:                     # also: any_of, none_of, not
    - pattern: ...
      parameters: { ... }
      capture: { ... }
    - pattern: ...
      parameters: { ... }
```

Valid combinators: `all_of`, `any_of`, `none_of`, `not`.
Maximum nesting depth: 2.

---

## `statement` (req)

Multi-line string. Templated with `{{...}}` placeholders. Allowed inside `{{...}}`:
- `member.display_name`, `member.id`, `member.role`
- Any name declared in `capture`
- Simple integer arithmetic on captured numerics: `{{transition_year - 1}}`
- Helper formatters: `{{currency(amount)}}`, `{{percent(rate)}}`, `{{date(d)}}`

No conditionals, no loops in statements. If you need branching, write two observations.

---

## `discussion_points` (req)

List of strings. Same templating as `statement`. Each item should be one concrete advisor action or talking point.

---

## `sources` (req)

List of citations. Each item:
```yaml
- description: "…"            # what this source proves
  transcript_type: account_transcript | wage_and_income | return_transcript | record_of_account | verification_of_non_filing
  member: "{{member.id}}"
  tax_year: "{{captured_year}}"
  field_path: "header.filing_status"   # documented in library/facts/
```

---

## `supersedes` (opt) and `suppressed_by` (opt)

Lists of observation IDs.
- `supersedes: [OBS-X]` — if this fires, OBS-X is hidden in this run
- `suppressed_by: [OBS-Y]` — if OBS-Y fires, this is hidden

Use to prevent double-surfacing on overlapping rules (e.g., spouse death + filing-status change).

---

## `caveats` (conditionally req)

Free-form prose warning about likely false positives.
**Required if** `confidence` is `inferential` or `speculative`.

---

## `disclaimers` (conditionally req)

List of disclaimer IDs from `disclaimers/disclaimers.yaml`.
**Required disclaimers:**
- `DISC-NOT-LEGAL-ADVICE` — estate, audit, lien, levy, fraud
- `DISC-INFERENTIAL` — any `inferential` or `speculative` confidence
- `DISC-NOT-TAX-ADVICE` — always required

---

## `test_cases` (req, min 3)

```yaml
test_cases:
  - name: "…"
    fixture: fixtures/households/<file>.json
    expected_fires: true | false
    expected_capture:           # required when expected_fires: true
      <captured_name>: <expected_value>
```

Must include at least one positive (`expected_fires: true`), one negative (`expected_fires: false`), and one edge case.

---

## `metadata` (req)

```yaml
metadata:
  authors: [<email or handle>]
  reviewers: [<handle>]                    # optional at MVP
  legal_review_required: false             # set true if estate/audit/lien/levy
  effective:
    start: "YYYY-MM-DD"
    end:   "YYYY-MM-DD"                    # optional; for sunset
  references:
    - "IRC §1 — filing status rules"
    - "<other authoritative source>"
```
