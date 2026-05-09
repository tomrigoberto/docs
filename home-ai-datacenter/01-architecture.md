# Solution Architecture

## Design principles

1. **Power is the constraint, not budget.** A residential 200 A / 240 V service
   delivers ~48 kW theoretical, ~30–35 kW continuous after derating and house
   loads. Every architectural choice flows from this. Spec compute *to power
   available*, not the other way around.
2. **Optimize for $/VRAM/hour, not FLOPS/hour.** The marketplace prices per-GPU
   regardless of utilization; what sells fastest in 2026 is high-VRAM PCIe
   cards (96 GB+) for inference and fine-tuning. Training-grade SXM clusters
   compete directly with hyperscalers and lose.
3. **Buy datacenter-licensed silicon.** NVIDIA's consumer EULA prohibits
   datacenter use of GeForce cards. Vast.ai and RunPod look the other way for
   small hosts, but the moment you incorporate or take corporate customers,
   that's a real liability. RTX PRO 6000 Blackwell, L40S, H100/H200 are all
   datacenter-licensed. RTX 4090/5090 are not.
4. **Single failure domain is fine; assume scheduled downtime.** You are not
   building a Tier-3 facility. Don't price one. Tell the marketplace you offer
   on-demand + interruptible only and price 15–20% under the median.
5. **Heat is a physical object, not a number on a spec sheet.** 16 kW of heat
   into a 400 sq ft garage will raise ambient ~2 °F per minute with no
   rejection. You need the cooling running *before* the GPUs spin up.

## Physical / facility layer

### Site selection inside the house

In order of preference:

1. **Detached garage** with concrete slab, exterior wall for AC condenser,
   separate from sleeping quarters. Best.
2. **Attached garage**, same as above but firewall the rack from the house and
   plan for sound isolation.
3. **Basement**, only if you have engineered floor support (a loaded 42U
   rack + UPS is 1,500–2,500 lb on ~5 sq ft = 300–500 PSF point load) and a
   reliable sump/water sensor system.
4. **Outbuilding / shed**, if climate allows and you can get conditioned air
   to it.

Avoid: bedrooms, living spaces, anywhere above finished space (water risk),
attics (heat soak in summer renders cooling impossible).

### Rack and layout

- **One 42U or 48U 4-post rack**, 1000–1100 mm deep (4U GPU servers are 850 mm
  chassis but you need cable management behind).
- Hot aisle / cold aisle is overkill for one rack. Instead: **cold air dumped
  in front, hot air ducted out the back of the rack into the AC return** via
  a flexible duct or shroud. This is the single highest-leverage cooling
  decision and costs ~$300 in ducting.
- Floor: anti-static mat, not carpet. Concrete sealed.
- Door: solid, gasketed, with a magnetic reed switch into your monitoring.

## Electrical layer

### Service entrance

Assume an existing 200 A / 240 V single-phase service. Steady-state house load
in a typical 2,500 sq ft home is 4–8 kW; peak (HVAC + dryer + EV) might hit 18 kW.
Headroom for the pod: ~25–30 kW continuous if you're disciplined; **22 kW is
the planning number**.

Options if 22 kW isn't enough:

- **400 A service upgrade**: $11k–$20k installed, 3–18 months for utility
  approval depending on transformer capacity on your street. Often gated on the
  utility upgrading the pole transformer (their cost, their timeline). Only do
  this if the math works at 30+ kW; otherwise the upgrade alone destroys
  payback.
- **Three-phase service**: rare residentially in the US, possible in some
  commercial-zoned mixed-use neighborhoods. Cleaner for big PSUs but rarely
  worth the conversion cost.
- **Don't.** Cap at one pod. Most of the time this is the right answer.

### Subpanel and circuits

```
Main 200A panel ──── 100A or 200A breaker ──── 200A subpanel (in garage/basement)
                                                       │
                                                       ├── 50A 240V L6-30R  → Node-01 PDU (rated 24A continuous, 5.7 kW)
                                                       ├── 50A 240V L6-30R  → Node-02 PDU
                                                       ├── 30A 240V L6-30R  → Network/storage/UPS
                                                       ├── 50A 240V         → Mini-split / DTC liquid loop
                                                       └── 20A 120V         → Lighting, monitoring, BMC
```

- **Use 240 V everywhere.** Halves the current at the same wattage. The
  Supermicro 4U GPU PSUs are rated 200–240 V and *will run* on 120 V at
  ~50% capacity — don't.
- **Continuous load rule (NEC 210.20):** breakers must be sized to 125% of
  continuous load. A 24 A continuous draw needs a 30 A breaker, not 25.
- **Dedicated EGC (equipment grounding conductor) and isolated neutral** for
  the subpanel. GPUs are noisy; you don't want that on the same neutral as
  your refrigerator's compressor.
- **Surge protection:** Type 1 SPD at the service entrance, Type 2 SPD at the
  subpanel. Skip and you will eventually lose a $9k GPU to a nearby strike.

### UPS strategy

You do **not** need to ride through a full outage. You need:

- 5 minutes of runtime to gracefully shut down GPU jobs and signal Vast.ai's
  API to mark the host offline (so reliability isn't penalized).
- Brownout / sag protection (more common than full outages and far more
  destructive to PSUs).

Spec: **2× double-conversion online UPS, 6 kVA each, 240 V input/output**, one
per node. ~$2.5–3.5k each. Lithium-ion if available — lower TCO over 8 years.

Skip a generator. Diesel + residential = noise complaints, fuel storage code,
not worth it for AI workloads that customers expect to be interruptible.

## Cooling layer

### Heat budget

| Component | Count | Power | Heat output |
|---|---:|---:|---:|
| RTX PRO 6000 Blackwell GPU | 16 | 600 W each | 9,600 W |
| Dual EPYC 9004 CPU + RAM + chassis | 2 | ~700 W each | 1,400 W |
| NVMe storage (per node) | 2 | ~150 W | 300 W |
| Networking (switch + NICs) | 1 | ~250 W | 250 W |
| BMC + ancillary | — | ~150 W | 150 W |
| **IT load total** | | | **~11.7 kW** |
| Cooling overhead at PUE 1.4 (air) | | | ~4.7 kW |
| **Wall draw total** | | | **~16.4 kW** |

(Numbers tighten further — a fully loaded GPU server with all 8 cards at
sustained 600 W is rare; AI workloads typically run at 70–85 % TDP. Plan to
the spec, run lower in practice.)

### Cooling options

| Option | Capex | OPEX impact | Noise | Recommendation |
|---|---:|---:|---:|---|
| Mini-split 36k BTU (3-ton) inverter | $4–6 k installed | PUE ~1.4 | 50–55 dB outdoor unit, 35 dB indoor | **Default choice.** Quietest, simplest, serviceable by any HVAC tech. |
| Direct-to-chip (DTC) liquid loop with dry cooler | $20–30 k | PUE ~1.1 | Quiet (pumps only) | If you can absorb the capex and want to scale. Recovers $1–2 k/yr in cooling cost. |
| Two-phase immersion | $40 k+ | PUE ~1.05 | Silent | Don't. Code issues, tank weight, fluid replacement, GPU warranty void on most consumer cards. |
| Spot cooler (portable AC) | $1–2 k | Terrible PUE | Loud | Only as supplemental. Will not handle 12 kW continuous in summer. |

**Default architecture: mini-split + rack ducting.**

- 1× Mitsubishi MUZ-FH or Daikin Aurora 36 kBTU (3-ton) inverter heat pump.
  ~10 kW cooling capacity at 95 °F outdoor / 80 °F indoor return.
- Indoor head ducted to deliver cold supply directly to the front of the rack
  via a 14" insulated flex duct.
- Hot aisle: 4U server exhaust → ducted to the AC's return air intake. This
  is non-standard residential plumbing — run it past the HVAC tech first.
- Backup: 1× 12k BTU spot cooler with hard-plumbed condensate drain. Held in
  reserve, kicks on if primary fails or ambient > 85 °F.

**If cooling capacity is exceeded (e.g., July heatwave, both servers at 100% TDP):**
your monitoring (next section) should trigger GPU power-cap reduction via
`nvidia-smi -pl 450` *before* thermal trip. Better to lose 25% throughput than
to brick a card.

## Networking layer

### Internal fabric

- **You don't need InfiniBand.** PCIe Gen5 GPU servers use the host bus, not
  a back-end fabric, for intra-node GPU↔GPU. Inter-node traffic for inference
  is negligible (model weights load once; tokens are tiny). For occasional
  fine-tuning across both nodes, 200 GbE is plenty.
- **1× MikroTik CRS520-4XS-16XQ-RM** (16× 100 GbE QSFP28 + 4× 25 GbE) — ~$3k.
  Or a used Mellanox SN2010 for $1.5k. Either works.
- **2× ConnectX-7 NICs per server** (one for storage/east-west, one for north
  bound). ~$1.6k each new, ~$700 used.

### External / WAN

- **1 Gbps symmetric fiber, business class, with a static IP block.** Vast.ai
  publishes per-GPU bandwidth tests and renters do select on this; 1 Gbps is
  fine for inference, marginal for very large dataset uploads but acceptable.
  Residential cable / fixed wireless will not pass Vast.ai's bandwidth test
  reliably.
- **5G or LTE failover for management plane only**, not data plane. Cradlepoint
  or Peplink with cellular WAN. Used for OOB SSH back to BMC if the fiber
  drops; you don't need to keep selling capacity over LTE.
- **Static IPv4 + IPv6 prefix** from the ISP. Required for hosting marketplace
  inbound. Do not NAT through a residential gateway — buy a real edge router
  (MikroTik CCR2004 ~$650, or pfSense on a used 1U box).

### Segmentation

```
VLAN 10  Management   (BMC, switch mgmt, UPS, PDU)            untagged on a separate cable
VLAN 20  Compute      (GPU node OS, Vast.ai daemon)           tagged
VLAN 30  Storage      (NVMe-oF / NFS for shared datasets)     tagged, jumbo frames
VLAN 40  Tenant       (per-customer container egress)         tagged, isolated, no LAN access
VLAN 99  House        (your home network)                     never reachable from VLAN 40
```

Hard rule: **the tenant VLAN must not be able to ARP, ping, or route to the
house VLAN.** Tested. Verified. Run nmap from a tenant container monthly to
confirm. A single misconfiguration here turns "homelab side hustle" into "you
just gave a stranger lateral movement into your kid's iPad."

## Compute layer

### Node design (× 2)

| Element | Spec | Notes |
|---|---|---|
| Chassis | Supermicro AS-4125GS-TNRT (4U, dual EPYC) | 8× double-wide PCIe Gen5 GPU slots, redundant PSUs |
| CPU | 2× AMD EPYC 9354 (32C, 280 W) | 64 cores total per node. Don't cheap out — PCIe lanes matter for 8 GPUs. |
| RAM | 24× 32 GB DDR5-4800 RDIMM = 768 GB | NUMA-balanced. Tenant workloads pin to socket. |
| GPU | 8× NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB, 600 W) | Passive cooling — relies on chassis fans, which is why we chose this chassis |
| Boot | 2× 480 GB SATA SSD (RAID-1 via mdadm) | OS only |
| Data | 4× 7.68 TB U.2 NVMe Gen4 (ZFS RAIDZ1, ~21 TB usable per node) | Customer scratch + model cache |
| NIC | 2× ConnectX-7 (1× 200 GbE storage, 1× 25/100 GbE WAN) | |
| BMC | Built-in ASPEED AST2600, dedicated NIC, on VLAN 10 | |
| PSU | 4× 2700 W (2+2 redundant), 240 V | Total max draw at wall ~7 kW per node |

### Why this chassis and these GPUs

- **PCIe over SXM**: SXM modules require an HGX baseboard ($30k+ on top of the
  GPUs) and force you into 8-up topology. PCIe cards are individually
  serviceable, individually rentable on Vast.ai, and have working resale
  markets.
- **8-GPU chassis over 4×2-GPU workstations**: density. The chassis cost is
  amortized; 4 workstations means 4 sets of PSUs, 4 sets of CPUs, 4 sets of
  rack rails, 4 IPMI licenses to manage.
- **RTX PRO 6000 Blackwell over H200**: a single H200 is $30k+ and rents at
  $3–4/hr; a PRO 6000 is $9k and rents at $1.30–1.90/hr. Per dollar of capex,
  the PRO 6000 returns ~2× as much rental revenue and the residual value
  decay curve is gentler. The H200 is faster per GPU but you lose more on
  it as Blackwell Ultra and Rubin generations land.

### Storage design

- **Per-node ZFS pool (RAIDZ1, 4× 7.68 TB U.2)** for tenant scratch, model
  weights cache, container images. ~21 TB usable.
- **No shared NAS for v1.** Adds a SPOF and cross-node bandwidth pressure.
  Each node is independent; tenants get their data staged onto the node they
  rent on.
- **If/when you scale**: TrueNAS Scale on a 12-bay 2U with 100 GbE, NFS over
  RDMA. Not before $/$.

## Marketplace / monetization layer

```
                        ┌──────────────────────────────────────────┐
                        │  Customer (researcher / hobbyist / SaaS) │
                        └────────────────────┬─────────────────────┘
                                             │ HTTPS, SSH, Jupyter
                        ┌────────────────────▼─────────────────────┐
                        │   Vast.ai control plane (cloud)          │
                        │   - matchmaking, billing, KYC            │
                        │   - container scheduling                 │
                        └────────────────────┬─────────────────────┘
                                             │ outbound from host
                        ┌────────────────────▼─────────────────────┐
                        │   vastai-host daemon on Node-01/02       │
                        │   - reports GPU inventory, bw, prices    │
                        │   - launches Docker containers           │
                        │   - enforces tenant isolation            │
                        └──────────────────────────────────────────┘
```

- **Primary marketplace: Vast.ai.** As of 2026 they removed host fees, you set
  prices, you keep what you set. Largest demand pool for long-tail GPUs.
- **Secondary: RunPod Community Cloud.** More demanding on uptime; better
  price tier for hosts with > 99% reliability scores. Use after 6 months
  once your Vast.ai score is established and you understand operational
  cadence.
- **Tertiary (do not bother in v1): Salad, Clore.ai, io.net.** These are
  fine for a single 4090 in a gaming rig, but the per-GPU rates are 30–50%
  below Vast.ai for the cards we're running. Useful as a pure overflow, but
  don't engineer for them.

### Pricing strategy

- **Anchor on the Vast.ai median, undercut by 10–15%** for first 60 days to
  build reliability score and reviews.
- **Target utilization: 60% blended.** Below 50% you should drop price; above
  75% you can raise. 60% is the long-run market clearing rate for residential
  hosts.
- **Spot/interruptible at 40% of on-demand price** to fill troughs.
- **No reserved/committed pricing.** Customers expect SLAs at that tier;
  you don't have them.

## Observability layer

| Layer | Tool | Why |
|---|---|---|
| Metrics | Prometheus + DCGM-exporter + node_exporter | Per-GPU temp, power, util, mem |
| Logs | Loki | Cheap, integrates with Grafana |
| Dashboards | Grafana | One screen: per-node power, ambient °F, $ earned/hr, utilization |
| Alerting | Alertmanager → PagerDuty free tier or ntfy.sh | GPU > 85 °C, ambient > 90 °F, breaker trip (smart panel), Vast offline |
| Smart panel | Span Panel or Emporia Vue 2 | Real-time per-circuit current, integrates with Home Assistant |
| Environmental | 2× temp/humidity sensors (cold aisle, hot aisle), 1× water leak sensor under rack | Z-Wave or ESPHome, into Home Assistant → Alertmanager |
| Power | UPS NUT integration | Trigger graceful shutdown on extended outage |

The single most important alert: **ambient temperature in the room rising
faster than 2 °F/min**. That means cooling failed. You have ~10 minutes
before damage. Trigger automatic GPU power-cap to 50% and page yourself.
