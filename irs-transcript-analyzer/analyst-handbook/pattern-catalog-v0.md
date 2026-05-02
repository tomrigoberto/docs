# Pattern Catalog v0

The v0 pattern catalog has 16 patterns. Each pattern is a parameterized template that engineering implements once and tests exhaustively. **Analysts pick a pattern and fill in its parameters.** No code, no expressions.

If no pattern fits cleanly, see `dsl-escape-hatch.md`.

## Quick index

1. [`filing_status_transition`](#filing_status_transition)
2. [`filing_status_equals`](#filing_status_equals)
3. [`transaction_code_present`](#transaction_code_present)
4. [`transaction_code_absent`](#transaction_code_absent)
5. [`transaction_code_sequence`](#transaction_code_sequence)
6. [`form_present`](#form_present)
7. [`form_absent`](#form_absent)
8. [`field_compare`](#field_compare)
9. [`field_change_year_over_year`](#field_change_year_over_year)
10. [`aggregate_threshold`](#aggregate_threshold)
11. [`count_threshold`](#count_threshold)
12. [`age_in_year`](#age_in_year)
13. [`years_of_data_present`](#years_of_data_present)
14. [`unfiled_year`](#unfiled_year)
15. [`member_relationship`](#member_relationship)
16. [`compare_members`](#compare_members)
17. [`presence_of_entity`](#presence_of_entity)

---

## `filing_status_transition`

**Detects:** filing status changing between years for the current member.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `from_any_of` | list of FilingStatus | yes | Statuses that count as the "before" state |
| `to_any_of` | list of FilingStatus | yes | Statuses that count as the "after" state |
| `in_consecutive_years` | boolean | no, default `true` | If `false`, gap years are tolerated |
| `in_year_range` | `[start, end]` | no | Restrict to transitions within these tax years |

**Captures:**
- `year_of_transition` (int)
- `status_before_transition` (FilingStatus)
- `status_after_transition` (FilingStatus)

**Use when:** detecting marriage, divorce, head-of-household changes.
**Don't use when:** the filing status is stable but you care about a different fact in the year (use `filing_status_equals`).

```yaml
logic:
  pattern: filing_status_transition
  parameters:
    from_any_of: [Single, Head_of_Household]
    to_any_of: [Married_Filing_Jointly, Married_Filing_Separately]
    in_consecutive_years: true
  capture:
    transition_year: year_of_transition
    prior_status: status_before_transition
    new_status: status_after_transition
```

---

## `filing_status_equals`

**Detects:** filing status equals a specific value in a year (or every year of a range).

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `equals_any_of` | list of FilingStatus | yes | |
| `in_year` | int | no | Specific tax year |
| `in_year_range` | `[start, end]` | no | Range; pattern fires if any year in range matches |
| `for_all_years_in_range` | boolean | no, default `false` | When `true`, requires every year in range to match |

**Captures:**
- `matching_year` (int) — first matching year
- `matched_status` (FilingStatus)

**Use when:** "client filed MFJ in 2022", "client has filed HoH every year 2020–2022".
**Don't use when:** detecting changes (use `filing_status_transition`).

```yaml
logic:
  pattern: filing_status_equals
  parameters:
    equals_any_of: [Head_of_Household]
    in_year_range: [2020, 2022]
    for_all_years_in_range: true
  capture:
    hoh_year: matching_year
```

---

## `transaction_code_present`

**Detects:** a specific transaction code (TC) is present in the account transcript for the member, optionally with action codes, amount filters, and year scoping.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `code` | int | yes | The TC code (e.g., 150, 290, 420) |
| `action_code_any_of` | list[int] | no | When the TC has an action code (e.g., TC 971) |
| `in_year` | int | no | Restrict to a specific tax year |
| `in_year_range` | `[start, end]` | no | Restrict to a range |
| `amount_gt` / `amount_lt` / `amount_between` | number / `[low, high]` | no | Filter by associated amount |

**Captures:**
- `event_year` (int)
- `event_date` (date)
- `event_amount` (number, when present)
- `event_action_code` (int, when present)

**Use when:** flagging penalty assessments (TC 240/270/280), liens (TC 582), levies (TC 670/671), audits (TC 420), AUR (TC 922), CNC (TC 530), installment agreements (TC 971/063).
**Don't use when:** you need a sequence of two TCs (use `transaction_code_sequence`).

```yaml
logic:
  pattern: transaction_code_present
  parameters:
    code: 420
    in_year_range: [2020, 2024]
  capture:
    audit_year: event_year
    audit_date: event_date
```

---

## `transaction_code_absent`

**Detects:** a TC is **not** present in a given window. Useful when absence is meaningful (e.g., no return filed when one was expected).

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `code` | int | yes | |
| `in_year` | int | no | |
| `in_year_range` | `[start, end]` | no | |

**Captures:**
- `absent_in_year` (int)

**Use when:** detecting unfiled returns (TC 150 absent), expected payments missing.
**Don't use when:** you can use `unfiled_year` (more specific and safer).

```yaml
logic:
  pattern: transaction_code_absent
  parameters:
    code: 150
    in_year: 2022
  capture:
    missing_year: absent_in_year
```

---

## `transaction_code_sequence`

**Detects:** TC X followed by TC Y, optionally within a time window or constrained to the same tax year.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `first` | object `{ code, action_code_any_of? }` | yes | |
| `then` | object `{ code, action_code_any_of? }` | yes | |
| `same_tax_year` | boolean | no, default `false` | |
| `within_days` | int | no | Maximum calendar days between events |
| `in_year_range` | `[start, end]` | no | Restrict the *first* event's tax year |

**Captures:**
- `first_event_date` (date)
- `then_event_date` (date)
- `tax_year` (int)
- `days_between_events` (int)

**Use when:** "AUR review opened within 18 months of return filing", "levy following lien within 60 days".
**Don't use when:** you only care about one TC (use `transaction_code_present`).

```yaml
logic:
  pattern: transaction_code_sequence
  parameters:
    first:  { code: 150 }
    then:   { code: 922 }
    same_tax_year: true
    within_days: 540
  capture:
    aur_tax_year: tax_year
    aur_date: then_event_date
```

---

## `form_present`

**Detects:** an information return (W-2, 1099-*, 5498, 1098, etc.) is present in the Wage & Income transcript, optionally filtered by year, payer, or field values.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `form_type` | string | yes | Canonical form code: `W-2`, `1099-R`, `1099-INT`, `1099-DIV`, `1099-B`, `1099-MISC`, `1099-NEC`, `5498`, `5498-SA`, `1098`, `1098-E`, etc. |
| `in_year` | int | no | |
| `in_year_range` | `[start, end]` | no | |
| `where` | object | no | Field filters (e.g., `taxable_amount_gt: 0`, `distribution_code_any_of: ["2","7"]`) |

**Captures:**
- `matching_year` (int)
- `count_of_matches` (int)
- `sum_of_<numeric_field>` (number) — e.g., `sum_of_taxable_amount`, `sum_of_box_1`
- `payers` (list of payer names)

**Use when:** detecting retirement distributions, brokerage activity, interest/dividend reporting, IRA contributions.
**Don't use when:** detecting absence (use `form_absent`).

```yaml
logic:
  pattern: form_present
  parameters:
    form_type: "1099-R"
    in_year: 2022
    where:
      distribution_code_any_of: ["2", "7"]
      taxable_amount_gt: 0
  capture:
    distribution_amount: sum_of_taxable_amount
```

---

## `form_absent`

**Detects:** no instance of a given form type was reported in the window.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `form_type` | string | yes | |
| `in_year` | int | no | |
| `in_year_range` | `[start, end]` | no | |

**Captures:**
- `absent_in_year` (int)

**Use when:** "no W-2 reported in 2023 despite being employed prior years" (combine with `form_present` in prior years using `all_of`).

---

## `field_compare`

**Detects:** a numeric field crosses a threshold.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `field` | string | yes | Documented fact path (e.g., `agi`, `wages.total`, `withholding.total`) |
| `comparison` | enum | yes | `gt`, `gte`, `lt`, `lte`, `eq`, `neq`, `between` |
| `value` | number | required for non-`between` | |
| `value_range` | `[low, high]` | required for `between` | |
| `in_year` | int | no | |
| `in_year_range` | `[start, end]` | no | |

**Captures:**
- `matching_year` (int)
- `field_value` (number)

**Use when:** "AGI over $X", "refund > $0", "balance due > $1,000".
**Don't use when:** comparing across years (use `field_change_year_over_year`).

```yaml
logic:
  pattern: field_compare
  parameters:
    field: balance_due
    comparison: gt
    value: 1000
    in_year_range: [2020, 2024]
  capture:
    balance_due_year: matching_year
    balance_due_amount: field_value
```

---

## `field_change_year_over_year`

**Detects:** a numeric field changed materially YoY.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `field` | string | yes | |
| `comparison` | enum | yes | `absolute_increase_gt`, `absolute_decrease_gt`, `percent_increase_gt`, `percent_decrease_gt`, `absolute_change_gt` |
| `threshold` | number | yes | Number of dollars or fraction (0.20 for 20%) |
| `in_year_range` | `[start, end]` | no | |

**Captures:**
- `change_year` (int) — the later year
- `prior_value` (number)
- `current_value` (number)
- `delta` (number)

```yaml
logic:
  pattern: field_change_year_over_year
  parameters:
    field: agi
    comparison: percent_decrease_gt
    threshold: 0.30
    in_year_range: [2020, 2024]
  capture:
    drop_year: change_year
    prior_agi: prior_value
    new_agi: current_value
```

---

## `aggregate_threshold`

**Detects:** a sum, average, max, or min across years crosses a threshold.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `field` | string | yes | |
| `aggregate` | enum | yes | `sum`, `avg`, `max`, `min` |
| `comparison` | enum | yes | `gt`, `gte`, `lt`, `lte` |
| `value` | number | yes | |
| `over_year_range` | `[start, end]` | no | |

**Captures:**
- `aggregate_value` (number)
- `years_included` (list[int])

```yaml
logic:
  pattern: aggregate_threshold
  parameters:
    field: penalties.total
    aggregate: sum
    comparison: gt
    value: 5000
    over_year_range: [2018, 2024]
  capture:
    penalty_total: aggregate_value
    penalty_years: years_included
```

---

## `count_threshold`

**Detects:** the count of records matching a filter crosses a threshold.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `record_type` | enum | yes | `tc_event`, `form` |
| `where` | object | no | Filters specific to record type |
| `comparison` | enum | yes | `gt`, `gte`, `lt`, `lte`, `eq` |
| `value` | int | yes | |
| `in_year` / `in_year_range` | | no | |

**Captures:**
- `count_value` (int)

```yaml
logic:
  pattern: count_threshold
  parameters:
    record_type: form
    where: { form_type: "1099-R" }
    comparison: gte
    value: 3
    in_year: 2023
  capture:
    distribution_count: count_value
```

---

## `age_in_year`

**Detects:** the member's age in a given year crosses a threshold.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `comparison` | enum | yes | `gte`, `gt`, `lt`, `lte`, `eq`, `between` |
| `age` | int | required for non-`between` | |
| `age_range` | `[low, high]` | required for `between` | |
| `in_year` | int | yes | The tax year to evaluate age at |

**Captures:**
- `evaluated_age` (int)

**Use when:** RMD age detection (73 starting 2023), Social Security age, catch-up contribution eligibility (50+).
**Note:** the engine computes age from member.birth_year, which must be set on the member.

```yaml
logic:
  pattern: age_in_year
  parameters:
    comparison: gte
    age: 73
    in_year: 2024
  capture:
    age_in_2024: evaluated_age
```

---

## `years_of_data_present`

**Detects:** the member has at least N years of a given transcript type. Often used as a guard in `all_of` to avoid firing on insufficient data.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `transcript_type` | enum | yes | |
| `min_years` | int | yes | |

**Captures:**
- `years_present` (list[int])
- `years_present_count` (int)

---

## `unfiled_year`

**Detects:** verified non-filing or absence of TC 150 for a year where filing was expected (income reported by payers).

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `in_year_range` | `[start, end]` | yes | |
| `require_income_reported` | boolean | no, default `true` | When true, only fires if W&I shows income for the year |

**Captures:**
- `unfiled_year` (int)
- `income_reported_amount` (number, when applicable)

```yaml
logic:
  pattern: unfiled_year
  parameters:
    in_year_range: [2020, 2024]
    require_income_reported: true
  capture:
    missing_year: unfiled_year
    income_for_year: income_reported_amount
```

---

## `member_relationship`

**Detects:** the member fills a specific household role or relationship.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `role_any_of` | list[Role] | yes | |

**Captures:**
- `member_role` (Role)

**Use when:** scoping observations to dependents under 18, or business owners.

---

## `compare_members`

**Detects:** a comparison between two specific members in the household.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `member_a` | Role | yes | E.g., `primary_taxpayer` |
| `member_b` | Role | yes | E.g., `spouse` |
| `field` | string | yes | |
| `comparison` | enum | yes | `absolute_difference_gt`, `ratio_gt`, `ratio_lt`, `a_gt_b`, `a_lt_b` |
| `threshold` | number | yes | |
| `in_year` / `in_year_range` | | no | |
| `only_in_years_where` | nested logic | no | Restrict to years matching another pattern |

**Captures:**
- `matching_year` (int)
- `value_a` (number)
- `value_b` (number)
- `difference_value` (number)

```yaml
logic:
  pattern: compare_members
  parameters:
    member_a: primary_taxpayer
    member_b: spouse
    field: wages.total
    comparison: absolute_difference_gt
    threshold: 50000
    only_in_years_where:
      pattern: filing_status_equals
      parameters: { equals_any_of: [Married_Filing_Jointly] }
  capture:
    gap_year: matching_year
    gap_amount: difference_value
```

---

## `presence_of_entity`

**Detects:** the household includes a specific kind of non-individual entity.

**Parameters:**
| Name | Type | Required | Notes |
|---|---|---|---|
| `entity_type_any_of` | list | yes | `business`, `trust`, `estate` |

**Captures:**
- `entity_id` (string)
- `entity_type` (string)
- `entity_name` (string)

**Use when:** scoping estate-category observations to households that have a trust, or planning observations to households with a business.

---

## Filing Status canonical values

- `Single`
- `Married_Filing_Jointly`
- `Married_Filing_Separately`
- `Head_of_Household`
- `Qualifying_Surviving_Spouse`

## Roles canonical values

- `primary_taxpayer`
- `spouse`
- `dependent`
- `business_entity`
- `trust`
- `estate`
