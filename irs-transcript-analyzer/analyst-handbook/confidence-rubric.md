# Confidence Rubric

Three levels. Pick exactly one. Confidence reflects how sure we can be that the observation is true *given only what's in the transcripts*.

| Level | Meaning | Examples | Exec summary |
|---|---|---|---|
| `deterministic` | The transcripts directly show the fact. There's no inference. | TC 150 filed for 2022; W-2 from employer X reported $Y; IRA contribution of $Z reported on 5498 | Eligible |
| `inferential` | Strong reason to believe based on transcript patterns, but not directly stated. The advisor should confirm with the client. | Filing status went Single → MFJ between years ("possible marriage"); 1099-R with code 4 ("possible inherited IRA"); large 1099-R + Roth basis change ("possible Roth conversion") | Eligible |
| `speculative` | A planning prompt that fits a pattern but is not strongly supported by the transcripts. | "Client may benefit from QCDs" based only on age and IRA presence; "client may want to consider a backdoor Roth" based only on income range | **Never** included in exec summary |

## Decision questions

1. Does the transcript itself state this fact? → `deterministic`
2. Does the transcript pattern strongly imply it, but the client should confirm? → `inferential`
3. Is this a planning prompt I would explore even without strong evidence? → `speculative`

## What this affects

- **Exec summary inclusion.** Speculative observations are never on the one-pager.
- **UI presentation.** Inferential and speculative observations show a confidence badge and require `caveats` to be filled in.
- **Required disclaimers.** `inferential` and `speculative` both require `DISC-INFERENTIAL`.

## Anti-patterns

- Don't mark observations `deterministic` to get them onto the exec summary. The rubric is enforced; you'll fail review.
- Don't avoid `speculative` because it feels weak. Speculative observations are valuable in the detailed report; they just don't belong on the one-pager.
- A rule that fires from a single transaction code with a clear meaning is `deterministic`. A rule that fires from a *pattern* of codes inferring intent is `inferential`.
