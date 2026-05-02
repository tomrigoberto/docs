# Authoring Guide for Analysts

**Audience:** tax and financial analysts who will write observations.
**You do not need any programming background.** If you can read a recipe and fill out a structured form, you can author observations here.

---

## 1. What you're doing and why

The app reads IRS transcripts for an entire client household and surfaces "observations" — things an advisor should notice and discuss with the client. Each observation in the library is a small file that says:

- **What we're looking for** (the *logic*)
- **What we'd say to the client if we found it** (the *statement*)
- **What the advisor should discuss** (the *discussion points*)
- **Where in the transcript we got it from** (the *sources*)
- **How to test that this works** (the *test cases*)

The app then evaluates every observation in the library against the household's transcripts and shows the advisor everything that fired.

---

## 2. The mental model

- **One observation = one file.** No bundling.
- **One insight per observation.** If your statement contains "and also…", split it into two observations.
- **You don't write code.** You pick a *pattern* from the catalog and fill in its parameters. The pattern is the logic; you're configuring it.
- **Every claim must cite a source.** If your statement says "the client received $X in retirement distributions" then the observation must include a source pointing to the 1099-R that says so.
- **Every observation must be tested.** You provide synthetic example households where the rule should fire and where it should not.

---

## 3. The shape of an observation file

Files live at:
```
observations-library/observations/<category>/<subcategory>/OBS-<CAT>-####-<short-slug>.yaml
```

For example:
```
observations/life_events/marital_status/OBS-LIFE-0042-marriage-detected.yaml
```

Every file has the same shape, with these top-level fields. (Full reference: `schema-reference.md`.)

```yaml
id:                  # OBS-CAT-####, assigned from ids.lock; never reused
version:             # semver, e.g. 1.0.0
status:              # draft | active | deprecated | retired
title:               # one-line title shown in the library browser
category:            # life_events | tax | financial | estate
subcategory:         # e.g. marital_status, withholding, retirement
severity:            # informational | opportunity | risk | urgent
confidence:          # deterministic | inferential | speculative
applies_to:          # which household roles this evaluates against
temporal_scope:      # year | period | standing
audience_tags:       # optional grouping tags for the exec summary

required_inputs:     # what must be present for this rule to even be evaluated
  transcript_types:
  min_tax_years:
  facts:

logic:               # the pattern (or all_of/any_of/none_of of patterns)

statement:           # what we'd say to the client, with {{placeholders}}
discussion_points:   # bullets the advisor should walk through
sources:             # where in the transcript each value came from
supersedes:          # IDs of observations this one replaces if both fire
suppressed_by:       # IDs of observations that take precedence over this one
caveats:             # plain-language warnings about false positives
disclaimers:         # IDs from disclaimers/disclaimers.yaml

test_cases:          # at minimum: one positive, one negative, one edge

metadata:            # authors, reviewers, references, effective dates
```

---

## 4. How to write the logic

You will not write code. You will pick a **pattern** from `pattern-catalog-v0.md` and fill in its parameters.

### Single pattern

```yaml
logic:
  pattern: filing_status_transition
  parameters:
    from_any_of: [Single, Head_of_Household]
    to_any_of:   [Married_Filing_Jointly, Married_Filing_Separately]
    in_consecutive_years: true
  capture:
    transition_year: year_of_transition
    prior_status:    status_before_transition
    new_status:      status_after_transition
```

`capture:` defines names you can use later in `statement`, `sources`, etc. The right-hand side is a fixed name the pattern exposes (each pattern documents what it can capture).

### Multiple conditions

Use `all_of` (every condition must hold), `any_of` (at least one), `none_of` (none may hold), `not` (a single negation):

```yaml
logic:
  all_of:
    - pattern: filing_status_transition
      parameters:
        from_any_of: [Single]
        to_any_of:   [Married_Filing_Jointly]
      capture:
        transition_year: year_of_transition
    - pattern: form_present
      parameters:
        form_type: "1099-R"
        in_year: "{{transition_year}}"
        where:
          distribution_code_any_of: ["2", "7"]
          taxable_amount_gt: 0
      capture:
        conversion_amount: sum_of_taxable_amount
```

**Rule of thumb:** if you find yourself nesting `all_of`/`any_of` more than two levels deep, stop. File a request for a new pattern instead. Your reviewer will help.

### What if no pattern fits?

Use the DSL escape hatch — see `dsl-escape-hatch.md`. Use it sparingly. It triggers a tax-lead reviewer requirement and a quarterly audit.

---

## 5. Writing the statement and discussion points

The **statement** is what an advisor would read out loud (or paraphrase) to the client. It uses `{{placeholders}}` for values you captured.

Good:

> {{member.display_name}} appears to have married in {{transition_year}}, with filing status changing from {{prior_status}} to {{new_status}}.

Bad:

> Looks like marriage happened. (no values, no member, no year)

**Rules:**
- Refer to the member by `{{member.display_name}}`, not pronouns.
- Currency: use `{{currency(amount)}}` — do not concatenate `"$" + amount`.
- Tax years are integers: `{{transition_year}}`, `{{transition_year - 1}}`.
- Reading level: 9th–10th grade. Define jargon in parentheses on first use.
- No second-person ("you") — the advisor speaks; we don't.

The **discussion points** are bullets the advisor walks through with the client. Each one should be a concrete next step or talking point.

Good:
- "Confirm marriage date and update the household profile."
- "Compare MFJ vs. MFS for {{transition_year}} forward."

Bad:
- "Marriage is important." (not actionable)
- "Discuss with client." (no content)

See `style-guide.md` for the full style guide.

---

## 6. Sources — cite everything

Every value you put into `statement` and every condition in `logic` must point back to a transcript field. List them in `sources:`.

```yaml
sources:
  - description: "Filing status, year before transition"
    transcript_type: account_transcript
    member: "{{member.id}}"
    tax_year: "{{transition_year - 1}}"
    field_path: header.filing_status
  - description: "Filing status, transition year"
    transcript_type: account_transcript
    member: "{{member.id}}"
    tax_year: "{{transition_year}}"
    field_path: header.filing_status
```

The `field_path` values are documented in `facts/` in the library repo. If you need a fact that isn't there yet, file a request.

---

## 7. Severity, confidence, audience tags

- **Severity** (`informational | opportunity | risk | urgent`) — see `severity-rubric.md`.
- **Confidence** (`deterministic | inferential | speculative`) — see `confidence-rubric.md`. **Speculative observations never appear in the executive summary.**
- **Audience tags** group observations by theme on the exec summary (e.g., `planning`, `beneficiary_review`, `compliance`).

---

## 8. Caveats and disclaimers

- **Caveats** are required if `confidence` is `inferential` or `speculative`. They warn about likely false-positive scenarios.
- **Disclaimers** are global, reusable text snippets. Reference them by ID from `disclaimers/disclaimers.yaml`. Don't write the disclaimer text inline.

Observations in the **estate** category and any observation involving audits, liens, or levies need `DISC-NOT-LEGAL-ADVICE`.

---

## 9. Test cases (mandatory)

Every observation must include at least:
- One positive test (the rule fires, with expected captured values)
- One negative test (the rule doesn't fire)
- One edge case (often: a near-miss that should NOT fire, or the suppression scenario)

```yaml
test_cases:
  - name: "Single → MFJ in 2022"
    fixture: fixtures/households/single_to_mfj_2022.json
    expected_fires: true
    expected_capture:
      transition_year: 2022
      prior_status: Single
      new_status: Married_Filing_Jointly
  - name: "MFJ throughout"
    fixture: fixtures/households/mfj_stable.json
    expected_fires: false
  - name: "Spouse died — should be suppressed by OBS-LIFE-0044"
    fixture: fixtures/households/spouse_death_2022.json
    expected_fires: false
```

Fixtures are JSON files under `fixtures/households/` that describe a synthetic household with synthetic transcripts. Reuse existing fixtures when you can; create new ones when you can't. **Synthetic data only — never real client data, ever.**

---

## 10. Submitting your work

1. Create a branch in `observations-library`.
2. Add or edit your YAML file under `observations/<category>/<subcategory>/`.
3. Add fixtures under `fixtures/households/` if needed.
4. Reserve your ID by adding it to `ids.lock`.
5. Open a pull request.
6. CI runs schema validation and your test cases. Green CI is required.
7. Reviewer signs off. Merge.

At MVP we have a single role: any analyst can review another analyst's PR. We will add an explicit approver role later.

---

## 11. Pre-submit checklist

- [ ] One file per observation; one insight per file
- [ ] `id` reserved in `ids.lock`
- [ ] `version` set; bumped if logic changed
- [ ] `category` and `subcategory` match the file path
- [ ] `severity` and `confidence` set per rubrics
- [ ] `applies_to` accurately lists who this fires for
- [ ] `required_inputs` declares what must be present (engine prunes on this)
- [ ] `logic` uses patterns; nesting is at most two levels
- [ ] `statement` uses `{{member.display_name}}` and captured variables only
- [ ] Every value in `statement` is backed by a `sources` entry
- [ ] `discussion_points` are actionable
- [ ] `caveats` filled in if `confidence` is `inferential` or `speculative`
- [ ] `disclaimers` includes `DISC-NOT-LEGAL-ADVICE` if estate / audit / lien / levy
- [ ] At least one positive, one negative, one edge `test_cases`
- [ ] Fixtures are synthetic only
- [ ] CI green
