# CHANGELOG

All notable changes to the observation library.
The library uses semver. Breaking changes (logic semantics) bump major.

## [0.2.0] - 2026-05-XX

### Added
- Observation OBS-LIFE-0044: Possible death of spouse during analysis window
- Observation OBS-TAX-0010: Active IRS examination on file
- Fixture: audit_tc420 (synthetic household with TC 420 audit indicator)
- CI workflow validating schemas, ids.lock, and fixture sanitization

### Changed
- Existing fixtures updated to include `tax_year` on every TC event (matches parser contract)

## [0.1.0] - 2026-05-02

### Added
- Initial scaffold with v0 pattern catalog (17 patterns)
- Observation and pattern JSON Schemas
- Sample observation OBS-LIFE-0042 (Possible marriage during analysis window)
- Synthetic fixtures: single_to_mfj_2022, mfj_stable, spouse_death_2022
- Disclaimer registry (DISC-NOT-LEGAL-ADVICE, DISC-NOT-TAX-ADVICE, DISC-INFERENTIAL)
