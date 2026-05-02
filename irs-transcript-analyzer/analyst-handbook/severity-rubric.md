# Severity Rubric

Four levels. Pick exactly one. The level affects sort order in the UI and prominence in the executive summary.

| Level | Meaning | Examples | Exec summary |
|---|---|---|---|
| `urgent` | Time-sensitive or potentially harmful if not addressed soon. The advisor should bring this up at the next contact. | Active IRS lien, levy, or audit; missed RMD detected; verified non-filing for a recent year with income reported by payers; statute-of-limitations window closing | Always shown, top of page |
| `risk` | An ongoing problem or exposure with material financial or compliance impact, but not time-sensitive. | Repeated underwithholding, multi-year penalty assessments, IRA contribution exceeding limit, Section 199A loss carryforward at risk | Always shown |
| `opportunity` | A planning move that could benefit the client. Not a problem. | Roth conversion window detected, QCD opportunity (RMD age + IRA), HSA underutilized, missing 199A optimization | Shown if `confidence` is `deterministic` or `inferential` |
| `informational` | Something the advisor should know about the household. No action implied. | Detected new dependent, address change, business entity recently formed | Shown only if pinned by advisor |

## Decision questions

1. Is this time-sensitive (statute, RMD deadline, levy notice)? → `urgent`
2. Is this an ongoing exposure with material financial impact? → `risk`
3. Could acting on this benefit the client financially? → `opportunity`
4. None of the above, but worth knowing? → `informational`

## Anti-patterns

- Don't mark every retirement-related observation `urgent`. Reserve `urgent` for actual deadlines or active enforcement.
- Don't mark exploratory or speculative items `risk`. Use `informational` and let the rubric for `confidence` handle uncertainty.
- Don't downgrade severity to avoid alarming the client. Severity reflects the situation; tone in `statement` reflects the conversation.
