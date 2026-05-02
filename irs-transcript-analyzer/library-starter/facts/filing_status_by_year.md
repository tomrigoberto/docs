# Fact: `filing_status_by_year(member)`

## What it is

A series of (tax_year, filing_status) entries for the given member, derived from the Account Transcript.

## Source

- Transcript type: `account_transcript`
- Field path: `header.filing_status`
- One entry per tax year present in the transcripts for that member

## Canonical filing status values

- `Single`
- `Married_Filing_Jointly`
- `Married_Filing_Separately`
- `Head_of_Household`
- `Qualifying_Surviving_Spouse`

## Notes

- If a year is missing from the transcripts, no entry is produced (NOT a null entry).
- If two transcripts disagree for the same year (rare), the most recent transcript wins; the conflict is logged.
- Patterns that compare consecutive years should not be confused by gaps; helpers like `has_transition` accept a `consecutive` flag.

## Used by patterns

- `filing_status_transition`
- `filing_status_equals`
