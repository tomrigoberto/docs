# Observation Library (starter)

This directory is a copy-ready starting point for the `observations-library` repo. After you create that repo, copy the contents of this folder into it as the initial commit.

## Contents

```
.
├── README.md                    # this file (copy as the repo's README)
├── CHANGELOG.md
├── ids.lock                     # registry of allocated observation IDs
├── schemas/                     # JSON Schema for observations and patterns
├── patterns/                    # the v0 pattern catalog (one YAML per pattern)
├── observations/                # one YAML per observation; analyst-authored
│   └── life_events/marital_status/OBS-LIFE-0042-marriage-detected.yaml
├── disclaimers/                 # reusable disclaimer text snippets
├── facts/                       # documentation of canonical facts and field paths
├── fixtures/                    # synthetic households for tests
│   └── households/
└── tests/                       # CI runs every observation's test_cases
```

## How CI validates the library

When a PR is opened, CI runs:

1. **Schema validation** — every `observations/**/*.yaml` validates against `schemas/observation.schema.json`
2. **ID registry** — every `id` is present in `ids.lock` and unique
3. **Pattern existence** — every `pattern:` referenced in an observation exists under `patterns/`
4. **Parameter validation** — every pattern's required parameters are present and typed correctly
5. **Placeholder check** — every `{{...}}` in `statement` and `discussion_points` resolves to a captured variable or a known member field
6. **Test execution** — every `test_cases` entry runs against the engine using the listed `fixture`
7. **Fixture sanitization** — fixtures are scanned for plausible real PII (SSN format, etc.)
8. **Disclaimers required** — estate / audit / lien / levy observations include `DISC-NOT-LEGAL-ADVICE`; inferential / speculative include `DISC-INFERENTIAL`; all observations include `DISC-NOT-TAX-ADVICE`
9. **Caveats required** — if `confidence` is `inferential` or `speculative`, `caveats` is non-empty

## Versioning

- Library is tagged with semver (e.g., `v0.5.0`).
- The app pins to a specific tag as its rule pack version.
- Every analysis result records the rule pack version that produced it.

## Authoring quickstart

See `irs-transcript-analyzer/analyst-handbook/authoring-guide.md` in `tomrigoberto/docs`.
