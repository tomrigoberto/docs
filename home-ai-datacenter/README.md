# Home AI Datacenter — Build & Sell GPU Capacity

> **Author's framing.** This is written from the perspective of an infrastructure
> engineer who has racked, cabled, and rebuilt enough GPU pods to have opinions.
> The goal is not "biggest possible cluster." It is "the largest pod that fits
> on a residential service, runs profitably (or at least cash-flow neutral), and
> doesn't burn your house down or get you condemned by the utility."
>
> Read this section first. It will save you from the most common, most expensive
> mistakes.

## TL;DR — The honest version

| Question | Honest answer |
|---|---|
| Can I make a profit selling AI compute from my house? | **Sometimes.** Margins are thin. Hyperscalers and Tier-3 colos with $0.05–0.07/kWh and 100% utilization have a 30–50% structural cost advantage over you. You win on niches (long-tail VRAM-heavy GPUs, hobbyist customers) and on doing your own labor for free. |
| What is the right size for "a home pod"? | **One 200 A subpanel of compute** — about 16 kW of IT load, ~22 kW at the wall after cooling. That's 16× RTX PRO 6000 Blackwell or 8× H200 PCIe. Beyond that you need a 400 A service upgrade and utility approval, which kills payback. |
| What GPU should I buy? | **RTX PRO 6000 Blackwell Server Edition (96 GB).** Best $/VRAM/hour on the rental market in 2026, datacenter-licensed (consumer 4090/5090 are not, per NVIDIA's EULA — a real risk for resale-as-a-service), and PCIe form factor (no SXM/NVL fabric headache). |
| Where do I sell capacity? | **Vast.ai** primary, **RunPod Community Cloud** secondary. Avoid trying to compete with hyperscalers for enterprise deals — you don't have SLAs, dual-utility feed, or SOC 2. |
| What is the realistic payback? | **36–60 months** on equipment, assuming 60% blended utilization and a host take of ~$0.85–1.00/GPU/hour. GPU resale value is the single biggest financial risk. |
| What is the #1 thing people get wrong? | **Power.** Not the dollars — the *physics*. They wire a 50 A circuit and try to push 14 kW through it. Then a breaker trips at 3 a.m. mid-rental and their reliability score craters. |

## What this repo contains

| File | Purpose |
|---|---|
| [`01-architecture.md`](./01-architecture.md) | Solution architecture — physical, electrical, network, software layers |
| [`02-implementation.md`](./02-implementation.md) | Phased implementation plan with go/no-go gates |
| [`03-hardware-bom.md`](./03-hardware-bom.md) | Hardware bill of materials with line-item pricing |
| [`04-software-stack.md`](./04-software-stack.md) | Software inventory, orchestration, monetization stack |
| [`05-cost-model.md`](./05-cost-model.md) | Capex, opex, revenue model, sensitivity analysis |
| [`06-risks-and-tradeoffs.md`](./06-risks-and-tradeoffs.md) | Things that will go wrong, in order of likelihood |

## Reference design at a glance

```
                                +-------------------------------------+
                                |   Residential 240 V / 200 A panel   |
                                |   (existing house load: ~6 kW peak) |
                                +------------------+------------------+
                                                   |
                                       200 A subpanel (NEW)
                                                   |
            +--------------------+-----------------+--------------------+
            |                    |                                      |
       +----v----+        +------v------+                       +-------v-------+
       | Node-01 |        |  Node-02    |                       |  Cooling +    |
       | 8x RTX  |        |  8x RTX     |                       |  Networking + |
       | PRO     |        |  PRO 6000   |                       |  Storage +    |
       | 6000    |        |  Blackwell  |                       |  UPS / PDU    |
       | 4U EPYC |        |  4U EPYC    |                       |               |
       | ~7 kW   |        |  ~7 kW      |                       |  ~5–7 kW      |
       +----+----+        +------+------+                       +-------+-------+
            |                    |                                      |
            +--------------------+----------+-------------------------- +
                                            |
                              200 GbE leaf switch (MikroTik or
                              Mellanox SN2010, 1U) on isolated VLAN
                                            |
                                +-----------v-----------+
                                |  Internet uplink:     |
                                |  1 Gbps symmetric     |
                                |  fiber (primary)      |
                                |  + 5G failover (mgmt) |
                                +-----------+-----------+
                                            |
                          +-----------------v-----------------+
                          |  Marketplace agents:              |
                          |  vast.ai (primary)                |
                          |  RunPod Community Cloud (backup)  |
                          +-----------------------------------+
```

## When NOT to build this

- You rent and your landlord won't approve a panel upgrade.
- Your power costs > $0.18/kWh (you will lose money on most workloads).
- You expect this to fund itself in < 24 months.
- You're in a deed-restricted HOA or noise-restricted neighborhood (mini-splits
  + 2× 4U servers at full tilt = ~70 dB at 1 m; ~55 dB through a garage door).
- Your homeowners insurance excludes commercial activity and you can't get a
  rider. (You will need one. See [`06-risks-and-tradeoffs.md`](./06-risks-and-tradeoffs.md).)

If two or more of these apply: rent compute on Vast.ai or RunPod, build software,
keep your day job. The math doesn't work.
