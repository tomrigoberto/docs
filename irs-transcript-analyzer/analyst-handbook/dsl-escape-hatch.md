# DSL Escape Hatch

**Use sparingly.** The pattern catalog handles ~95% of observations. The DSL exists for the remaining 5% where a one-off condition can't be expressed cleanly with patterns. Using the DSL triggers:

- Mandatory `metadata.legal_review_required: true`
- Mandatory tax-lead reviewer on the PR
- Inclusion in the quarterly DSL audit

If you find yourself reaching for the DSL more than once a month, the catalog is missing a pattern. File a request.

---

## Shape

```yaml
logic:
  pattern: custom_expression
  parameters:
    expression: |
      <DSL expression that returns a boolean>
  capture:
    <name>:
      expression: |
        <DSL expression that returns a value>
```

## DSL surface (v0)

- Literals: numbers, strings, dates (`date("2022-04-15")`), lists `[a, b, c]`
- Operators: `==`, `!=`, `<`, `<=`, `>`, `>=`, `in`, `not in`, `and`, `or`, `not`
- Parentheses for grouping
- Member context: `member.id`, `member.role`, `member.age_in(year)`
- Facts namespace: `facts.<fact_name>(<args>)`
- A fixed helper library (see below)

### Helpers (v0)

```
has_transition(series, from_in, to_in, consecutive)
first_transition_year(series, from_in, to_in)
status_at(series, year)
status_before(series, year)
tc_events(member, year?, code?)
forms(member, type?, year?)
field(member, year, path)
days_between(a, b)
years_between(a, b)
any(list, where: lambda?)
count(list, where: lambda?)
sum(list, of: lambda)
max(list)
min(list)
between(value, low, high)
abs(value)
```

Lambdas are single-argument expression-only: `where: e -> e.code == 922`.

## What the DSL does NOT support

- Loops (use `any` / `count` / `sum` with a lambda)
- Recursion
- Variable definitions (no `let`)
- I/O
- New helpers (file a request to engineering)
- Imports of any kind

## Worked example

"AUR review (TC 922) opened within 18 months of return filing (TC 150) for the same tax year."

```yaml
logic:
  pattern: custom_expression
  parameters:
    expression: |
      any(
        facts.tc_events(member),
        where: aur ->
          aur.code == 922
          and any(
            facts.tc_events(member),
            where: filed -> filed.code == 150
                            and filed.tax_year == aur.tax_year
                            and days_between(filed.date, aur.date) <= 540
          )
      )
metadata:
  legal_review_required: true
```

The equivalent pattern (`transaction_code_sequence`) handles this in four lines and should be preferred. Use the DSL only when the pattern can't express what you need.

## When the DSL is the right call

- The condition involves a relationship the catalog doesn't model (e.g., a TC chain across three events with conditional timing)
- A one-off comparison spanning multiple members where `compare_members` doesn't fit
- An aggregate over a non-standard grouping (e.g., "sum of distributions across all retirement-coded forms in years where AGI was below $X")

If you write a DSL observation, immediately file a pattern-request issue describing what you needed. If three people have written similar DSL expressions, that's a missing pattern.
