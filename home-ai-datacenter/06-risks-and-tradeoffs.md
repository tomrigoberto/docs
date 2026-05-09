# Risks and Tradeoffs

Things that go wrong in real builds, in roughly the order they occur.
Sorted by what an experienced engineer wishes someone had told them before
writing the first check.

## Tier 1 — Will eventually happen, plan now

### 1. The breaker trips at 3 a.m.

Inrush current on 8 GPUs starting simultaneously can briefly exceed the
breaker's instantaneous trip threshold. So can a tenant kicking off a workload
that ramps from idle to 600 W per card in milliseconds.

**Mitigation:**
- Size the breaker for 125% of measured inrush, not just nominal continuous.
- Use a "soft start" GPU power-cap on boot (`nvidia-smi -pl 400`), ramp up
  over 60 seconds.
- Don't share a circuit between two nodes. Ever.
- Monitor breaker state via Span Panel (or current sensor + ESPHome) and
  alert on any trip.

### 2. GPU resale value collapse

Blackwell Ultra (announced) and Rubin (rumored 2026–2027) will land. When
they do, your year-old PRO 6000s drop 20–40% in resale value overnight.

**Mitigation:**
- Plan capex on a 5-year, not 3-year, horizon.
- Don't borrow at high interest to buy GPUs — the depreciation will outpace
  loan amortization.
- Track Vast.ai pricing weekly. If RTX PRO 6000 host take drops below
  $0.70/hr sustained, sell while resale is still healthy.

### 3. Tenant abuse leading to ISP complaint

Some tenant will run a port scanner, mine crypto from a residential IP, or
attempt to send spam. You'll get a CGN abuse complaint from your ISP. Two of
these and your fiber is canceled.

**Mitigation:**
- Egress allow-list (HTTPS, SSH, DNS, NTP).
- Block SMTP (25, 465, 587) outbound.
- Per-tenant bandwidth caps (100 Mbps).
- Maintain Vast.ai's KYC settings — require verified accounts for > 4 GPU
  rentals.
- Have a backup ISP option lined up (different provider, not just a second
  line from the same one).

### 4. A summer heatwave overruns the cooling

You sized for 95 °F outdoor. It's 105 °F for a week. The mini-split derates
30%. Your hot aisle hits 110 °F. Cards thermal-throttle, then fail.

**Mitigation:**
- Auto power-cap on ambient threshold (room > 88 °F → cap GPUs to 450 W).
- Backup spot cooler ready to deploy.
- Don't list 100% of GPUs during forecasted heat waves; preemptively offline
  half.

### 5. PSU / UPS failure cascade

A failing PSU draws excess current, trips the UPS into bypass, voltage spikes
hit a NIC or NVMe.

**Mitigation:**
- Test UPS bypass behavior in commissioning.
- Replace PSUs proactively at 5 years.
- SPDs at both panel and UPS input.
- Per-circuit current monitoring with alerting on anomalies.

## Tier 2 — Possible, painful, manageable

### 6. Insurance claim denial after a fire

Standard homeowner's insurance excludes "business activities" as a default
exclusion. After a fire, an adjuster discovers $250k of GPU equipment running
a paid service from your garage.

**Mitigation:**
- **Get a commercial activity rider in writing before commissioning.** This
  is non-negotiable. ~$1k/yr.
- Some carriers will require a separate commercial policy at $200–400/mo.
  Pay it.
- Document with photos, list of equipment, confirmation of code-compliant
  install.
- Consider an LLC; some carriers price differently for entity-owned business
  property than personally-owned.

### 7. Local zoning / HOA enforcement

Neighbor complains about the AC noise, or sees you receiving a server crate.
Code enforcement shows up.

**Mitigation:**
- Get a home occupation permit (cheap, often $50–200/yr) *before* listing.
- Acoustic blanket on the AC condenser, isolate it from shared property
  lines.
- Don't advertise the address. Vast.ai gives tenants an opaque hostname.
- If HOA-restricted: read your covenants. If business activity is barred,
  this is a no-go.

### 8. Vast.ai TOS / payout change

Marketplace economics can shift overnight. They have, historically, in both
directions (host fees added/removed, surcharge changed, KYC tightened).

**Mitigation:**
- Multi-home: have RunPod as a working secondary even if you don't list
  there day one.
- Don't scale capex on the assumption that current rates persist.
- Treat marketplace risk as a fundamental input, not an afterthought.

### 9. Tax surprise

The IRS treats this as a business, with all that entails: estimated quarterly
payments, self-employment tax, 1099 reporting from Vast, depreciation
schedule maintenance.

**Mitigation:**
- Talk to a CPA before listing. ~$500. They will save you that in year 1.
- Section 179 / bonus depreciation can be very favorable in year 1 if you
  have offsetting active income.
- Track every receipt. Every cable, every cooling service, every insurance
  bill.

## Tier 3 — Black swans, low probability, severe

### 10. Lightning strike or whole-house surge

Even with SPDs, a direct strike on the service drop can take out everything
downstream.

**Mitigation:**
- Type 1 (service entrance) + Type 2 (subpanel) + per-server surge strips.
- Sign up for utility "surge protection plans" if offered (cheap insurance).
- Equipment in a Faraday-cage-like environment (steel rack, properly
  bonded) is more protected than people think.

### 11. Water damage

Roof leak, frozen pipe, condensate line clog, AC drain pan overflow. Water
on a $250k pile of electronics.

**Mitigation:**
- Water sensors under rack, with auto-shutdown trigger.
- Hard-pipe AC condensate, secondary float switch.
- Don't site the rack under any plumbing.
- Slight grade in floor away from rack.

### 12. Theft

A 4U server with 8 GPUs is ~$80k of liquid hardware. There are people who
read GPU rental forums, looking for hosts.

**Mitigation:**
- Don't post your address publicly.
- Cameras with cellular backup (someone cuts your fiber).
- Detached garage with reinforced door.
- Lojack-style asset trackers in chassis (cellular tracker tags).

### 13. Forced shutdown by utility

If your utility's residential tariff specifies a load limit (some do, in
California for example), they may notice your draw and demand commercial
service. The conversion process can take months and the shutdown is on
their schedule.

**Mitigation:**
- Voluntarily upgrade to small-commercial tariff before listing if your
  utility supports it. It's usually cheaper anyway.
- Stay under the residential demand cap (~10 kW continuous in some
  jurisdictions) during initial listing — half-pod variant.

## Tradeoffs explicitly accepted in this design

These are choices that are known to be suboptimal in some dimension but are
right for the use case.

| Tradeoff accepted | Reason |
|---|---|
| **Single power feed**, no diesel generator | Customers expect outages from residential hosts; not worth $30k for marginal SLA improvement |
| **Single ISP**, no redundant data plane | Same reason. Marketplace marks you offline gracefully. |
| **Air cooling** vs liquid | Capex / complexity / serviceability. Revisit at 32-GPU scale. |
| **PCIe** vs SXM | Resale market, single-card serviceability, vendor neutrality |
| **Whole-GPU** rentals only, no MIG | RTX PRO 6000 doesn't support it; not a real choice |
| **Bare metal** Ubuntu vs hypervisor | 2–5% throughput, simpler operations |
| **No NVLink between non-adjacent cards** | PCIe Gen5 is enough for inference; training across 16 GPUs in one box happens via PCIe peer-to-peer |
| **No tape backup** | Tenant data is ephemeral; configs in git |

## When to walk away

Re-evaluate if any of these become true:

- Vast.ai host take for RTX PRO 6000 falls below $0.65/hr sustained for 30 days.
- Your sustained utilization stays below 40% for 3 consecutive months at
  market price.
- A new GPU generation drops list prices on equivalent VRAM by > 40%.
- Power tariff increases by > 30% in a single year.
- Insurance carrier non-renews your rider.

In any of those cases, the right move is to liquidate GPUs while resale value
is still meaningful (Vast.ai's used market, eBay, ServeTheHome forums) and
redeploy the capital. Don't anchor to "I already spent the money" — sunk costs
are sunk.
