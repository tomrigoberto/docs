# Cost Model

A realistic financial picture. Conservative case, base case, optimistic case.
**The base case is what you should plan against.** Anything below the base case
should make you stop, anything above is gravy.

## Capex summary

From `03-hardware-bom.md`:

| Variant | Capex |
|---|---:|
| Half-pod (1 node, 8 GPUs) | $140,000 |
| **Default reference (2 nodes, 16 GPUs)** | **$250,000** |
| 32-GPU + 400 A upgrade | $510,000 |

Use the default reference for the rest of this document.

## Opex (monthly)

### Power

The single largest opex line. Highly location-sensitive — *do not skip this
calculation for your specific utility.*

```
IT load (continuous):        ~12 kW   (2 nodes at typical 70–85% TDP, networking, storage)
Cooling overhead at PUE 1.4:  ~5 kW
Wall draw:                  ~17 kW

Hours/month:                 730
Energy/month:               17 × 730 ≈ 12,400 kWh/month
```

| Scenario | $/kWh | Monthly power |
|---|---:|---:|
| Cheap (ID, ND, WA hydro) | $0.085 | $1,054 |
| **US residential average (April 2026)** | **$0.1765** | **$2,189** |
| US commercial average (April 2026) | $0.1412 | $1,751 |
| California, NY, MA | $0.30 | $3,720 |
| Hawaii | $0.43 | $5,332 |

**Many residential utilities have time-of-use plans that punish 24/7 high
loads.** Run the math on your *actual* tariff including demand charges, not
the headline rate. A 17 kW peak demand on a residential demand tariff can add
$200–400/mo on top of the energy charge.

If your utility offers a small-commercial tariff, switching to it usually
*saves* money at this load level — but it requires registering as a business
and is gated on zoning approval. Check this first.

### Other recurring opex

| Item | $/month | Notes |
|---|---:|---|
| Power (US average residential) | $2,189 | See above |
| Internet (1 Gbps symmetric business fiber) | $200 | Static IPs, business SLA. |
| Insurance rider (commercial activity) | $85 | $1k/yr amortized. May be higher in some markets. |
| Cloud / SaaS (B2, DNS, monitoring) | $10 | |
| Property tax delta on equipment | $40 | Personal property tax in some states; check yours. |
| Spare parts reserve (PSU, fans, NVMe) | $200 | Build a fund for inevitable replacements. |
| HVAC service / filters | $30 | Annualized $360/yr. |
| **Subtotal cash opex** | **$2,754** | |
| Equipment depreciation (5-yr straight-line) | $4,166 | $250k / 60 mo. *Non-cash*, but real economically. |
| **Total economic opex** | **$6,920** | |

## Revenue model

### Pricing inputs (Vast.ai market data, May 2026)

- RTX PRO 6000 Server Edition list price on Vast.ai: **$1.07–$1.33/GPU/hr**
- Median host take after Vast surcharge (host-side): **~$0.90–$1.05/GPU/hr**
- New / unverified hosts typically clear at the lower end: **$0.85/GPU/hr**

We'll use **$0.90/GPU/hr** as the planning host take.

### Utilization assumptions

| Period | Utilization | Reasoning |
|---|---:|---|
| Months 1–3 (verification, building reputation) | 30% | Vast.ai prioritizes verified hosts; expect slow ramp. |
| Months 4–6 | 50% | Reliability score reaches 95%+, reviews accumulate. |
| Months 7–12 | 60% | Steady state for residential hosts. |
| Year 2+ steady state | 60–65% | The market clearing rate. |

### Monthly gross revenue (steady state)

```
16 GPUs × $0.90/GPU/hr × 730 hr/mo × 60% utilization
  = 16 × 0.90 × 730 × 0.60
  = $6,307/mo gross
```

### Year 1 cumulative (ramp)

| Month | Util | Gross |
|---:|---:|---:|
| 1 | 20% | $2,102 |
| 2 | 30% | $3,154 |
| 3 | 35% | $3,679 |
| 4 | 45% | $4,730 |
| 5 | 50% | $5,256 |
| 6 | 55% | $5,782 |
| 7–12 | 60% | $6,307 ea |
| **Y1 total gross** | | **~$62,540** |

## P&L, base case

| Line | Month (steady state) | Year 1 | Year 2 | Year 3 |
|---|---:|---:|---:|---:|
| Gross revenue | $6,307 | $62,540 | $75,684 | $75,684 |
| Cash opex | ($2,754) | ($33,048) | ($33,839) | ($34,646) |
| EBITDA (cash) | $3,553 | $29,492 | $41,845 | $41,038 |
| Depreciation (5-yr SL) | ($4,167) | ($50,000) | ($50,000) | ($50,000) |
| Pre-tax income | ($614) | ($20,508) | ($8,155) | ($8,962) |

(Power inflation modeled at 4%/yr per EIA STEO. GPU resale residual at end of
year 5 estimated at 25% of capex = $35k recoverable on the GPUs alone.)

**Key insight:** the project is **cash-flow positive from month 4** but
**accounting-loss for the first ~5 years** because of GPU depreciation. That
matters for taxes (the loss can offset other active income if you structure
this as a Schedule C business or LLC) and matters even more for whether you
can stomach the optics: you are converting capital into cash flow, slowly.

## Payback analysis

```
Capex:          $250,000
Cash flow yr 1:  $29,492
Cash flow yr 2:  $41,845
Cash flow yr 3:  $41,038
Cash flow yr 4:  $40,217
Cash flow yr 5:  $39,372

Cumulative cash:
After yr 1:  $29,492
After yr 2:  $71,337
After yr 3: $112,375
After yr 4: $152,592
After yr 5: $191,964
After yr 6: $231,335
After yr 7: $271,697  ← payback ~6.7 yr
```

**Plus residual asset value** at end of year 5 (~$35–50k for the GPUs,
assuming Blackwell isn't completely obsolete by then — a real risk; see
sensitivity).

## Sensitivity analysis

What moves the answer the most?

| Variable | Base | Effect of −20% | Effect of +20% |
|---|---:|---:|---:|
| GPU host take ($/hr) | $0.90 | $4,209/mo cash flow ⇒ 8.7 yr payback | $11,037/mo ⇒ 4.3 yr payback |
| Utilization | 60% | $4,205/mo ⇒ 8.7 yr | $11,053/mo ⇒ 4.3 yr |
| Power $/kWh | $0.1765 | Save $437/mo, payback 6.0 yr | Lose $437/mo, payback 7.7 yr |
| Capex | $250k | $200k ⇒ 5.4 yr | $300k ⇒ 8.0 yr |

**The two variables that dominate are price-per-hour and utilization.** Both
are set by the marketplace, not by you. Power is a distant third. Capex
matters but you can't easily move it — the GPUs are the GPUs.

## Catastrophic scenarios you must price in

| Scenario | Probability over 5 yr | Impact |
|---|---:|---:|
| GPU resale value collapses (Blackwell Ultra and Rubin land cheap) | ~50% | -$30–50k vs base case at end-of-life |
| Vast.ai marketplace shifts pricing model unfavorably | ~30% | -20% revenue indefinitely |
| Major hardware failure (PSU takes out 4 GPUs) | ~25% | -$35k one-time, partial insurance recovery |
| Power event (surge, outage, lightning) damages servers | ~15% | -$10–50k depending on severity |
| Insurance claim denied due to commercial activity | ~10% | -$10–250k worst case |
| Forced shutdown (utility, zoning, HOA) | ~5% | full project loss minus residual |

The cumulative risk-adjusted return is meaningfully lower than the headline
number. **A reasonable expected NPV at 8% discount over 5 years is in the
$30–60k range** — not zero, not life-changing, requires real labor.

## Comparison to alternatives

If your goal is "make money from $250k of capital," the GPU homelab is
roughly competitive with:

- **Index fund (S&P 500 historical 8% real)**: +$117k over 5 years, no labor.
- **Real estate rental (cap rate 5%)**: +$70k over 5 years, similar labor.
- **GPU homelab (this plan)**: +$60–100k over 5 years, real labor (5–10
  hr/wk), real downside risk.

If your goal is "build a research platform that pays for itself", the math
is much better — the alternative is paying $5k/mo in cloud GPU bills, which
this deployment offsets while also generating modest cash flow on idle time.
**This is the strongest case for a home AI datacenter in 2026:** you are an
AI researcher or builder who wants their own iron, and the rental revenue
keeps the lights on between research projects.

## What would change the math

The plan flips from "marginal" to "obviously good" if any two of these are
true for you:

1. Power < $0.10/kWh.
2. You will personally use 30%+ of the capacity for your own workloads
   (saving cloud spend at $1.50–2.00/GPU-hr).
3. You can write off depreciation against $50k+ of other active income.
4. You're in a no-state-income-tax jurisdiction.
5. You have free space (not paying rent on the square footage).
6. You'll pivot to model fine-tuning services in year 2 (3–5× margins vs
   raw rental).
