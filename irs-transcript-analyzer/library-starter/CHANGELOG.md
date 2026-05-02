# CHANGELOG

All notable changes to the observation library.
The library uses semver. Breaking changes (logic semantics) bump major.

## [0.3.0] - 2026-05-XX

### Added
- All 17 v0 patterns are now implemented in the engine (was: 8/17)
- DSL escape-hatch evaluator (`custom_expression` pattern)
- Observation OBS-TAX-0030: Required minimum distribution age reached
- Observation OBS-TAX-0070: Examination opened within 18 months of return filing
- Observation OBS-FIN-0001: Significant wage gap between spouses
- Observation OBS-EST-0001: Trust entity present in household
- Fixtures: senior_rmd_age, dual_income_gap, household_with_trust

## [0.2.0] - 2026-05-02

### Added
- Observation OBS-LIFE-0044: Possible death of spouse during analysis window
- Observation OBS-TAX-0010: Active IRS examination on file
- Fixture: audit_tc420
- CI workflow validating schemas, ids.lock, and fixture sanitization

### Changed
- Existing fixtures updated to include `tax_year` on every TC event

## [0.1.0] - 2026-05-02

### Added
- Initial scaffold with v0 pattern catalog (17 patterns documented)
- Observation and pattern JSON Schemas
- Sample observation OBS-LIFE-0042 (Possible marriage during analysis window)
- Synthetic fixtures: single_to_mfj_2022, mfj_stable, spouse_death_2022
- Disclaimer registry (DISC-NOT-LEGAL-ADVICE, DISC-NOT-TAX-ADVICE, DISC-INFERENTIAL)
