# Style Guide

Voice and formatting standards for `statement`, `discussion_points`, `caveats`, and `title`.

## Voice

- **Third-person.** The advisor speaks; we don't. Use `{{member.display_name}}`, not "you."
- **Neutral and concrete.** State what the transcripts show. Avoid alarmist or judgmental language.
- **Plain English.** Reading level 9th–10th grade. Define jargon parenthetically on first use: "Required Minimum Distribution (RMD)."
- **Active voice when possible.** "The IRS issued a CP2000 in 2023." not "A CP2000 was issued."

## Title

- ≤ 80 characters
- Sentence case
- Lead with the subject of the observation
- Don't start with "Possible" unless the observation is `inferential` or `speculative`

Good: `Possible marriage during analysis window`
Bad: `Found a marriage`

## Statement

- 1–3 sentences
- Always include the member's display name and the relevant year(s)
- Currency: `{{currency(amount)}}` — always
- Percentages: `{{percent(rate)}}` (rate as decimal, e.g., 0.22 → 22%)
- Dates: `{{date(d)}}` for short format; spell month for long form when needed
- Tax years: bare integers, never with dollar sign or commas

## Discussion points

- Imperative or interrogative; each one a concrete next step
- 5–10 words ideal; ≤20 words max
- Don't repeat the statement
- 3–6 bullets per observation

Good:
- "Confirm marriage date and update household profile."
- "Compare MFJ vs. MFS for {{transition_year}} forward."
- "Update beneficiary designations on retirement accounts."

Bad:
- "Marriage is important." (not actionable)
- "Discuss with client." (no content)
- "As we noted in the statement above, the filing status changed…" (repeats)

## Caveats

- 1–3 sentences
- Lead with the most likely false-positive scenario
- Use "may" and "can"; never imply certainty

## Forbidden in statements

- Pronouns referring to the member ("you", "they", "he", "she")
- Conditionals ("if X, then Y") — if you need branching, write two observations
- Lists of items with commas where a separate bullet would do
- Inline disclaimer text — use `disclaimers:` IDs
- Phone numbers, URLs, or external resource references in the statement — put those in discussion points
- Speculation phrases like "perhaps" or "possibly" when the observation is `deterministic`

## Capitalization of statuses and codes

- Filing statuses: `Single`, `Married_Filing_Jointly`, `Married_Filing_Separately`, `Head_of_Household`, `Qualifying_Surviving_Spouse` (canonical, with underscores in YAML; render with spaces in statements via the formatter)
- Transaction codes: render as `TC 150`, `TC 922`, etc.
- Form types: render as `W-2`, `1099-R`, `1099-INT`, `5498`, `5498-SA`
