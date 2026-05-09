# Hardware Bill of Materials

Prices are May 2026 USD, sourced from public listings (Supermicro store, NVIDIA
authorized resellers, Amazon, ServeTheHome marketplace) cross-referenced
with the searches in `99-sources.md`. Round up 5–10% for taxes, freight, and
sundries.

## Compute (the biggest line)

| Item | Vendor / SKU | Qty | Unit | Subtotal | Notes |
|---|---|---:|---:|---:|---|
| 4U dual-EPYC GPU server, 8× PCIe Gen5 GPU slots | Supermicro AS-4125GS-TNRT | 2 | $9,500 | $19,000 | Barebone with PSUs, no CPU/RAM/GPU |
| AMD EPYC 9354 32-core CPU | AMD | 4 | $3,400 | $13,600 | 2 per node |
| 32 GB DDR5-4800 RDIMM | Micron / Samsung | 48 | $200 | $9,600 | 24 per node = 768 GB |
| RTX PRO 6000 Blackwell Server Edition (96 GB) | NVIDIA / authorized reseller | 16 | $8,800 | $140,800 | The big one. MSRP $8,565; market $8.0k–$9.2k. |
| 480 GB SATA SSD (boot) | Micron 5400 PRO | 4 | $90 | $360 | RAID-1 per node |
| 7.68 TB U.2 NVMe Gen4 | Micron 7450 PRO | 8 | $850 | $6,800 | RAIDZ1 per node |
| 200 GbE OSFP NIC | NVIDIA ConnectX-7 (MCX755106AS-HEAT) | 4 | $1,650 | $6,600 | 2 per node |
| Rack rails / cable arms | Supermicro | 2 | $300 | $600 | |
| **Compute subtotal** | | | | **$197,360** | |

## Networking

| Item | Vendor / SKU | Qty | Unit | Subtotal | Notes |
|---|---|---:|---:|---:|---|
| 100/200 GbE leaf switch, 1U | MikroTik CRS520-4XS-16XQ-RM | 1 | $3,000 | $3,000 | Or used Mellanox SN2010 ~$1,500 |
| 1 GbE management switch | UniFi USW-Pro-24 | 1 | $400 | $400 | For BMC, IPMI, monitoring |
| Edge router / firewall | MikroTik CCR2004-1G-12S+2XS | 1 | $700 | $700 | |
| 200 GbE OSFP DAC, 2 m | FS.com | 4 | $200 | $800 | Server ↔ switch |
| 25 GbE SFP28 DAC, 2 m | FS.com | 6 | $40 | $240 | Storage / mgmt uplinks |
| Cat6A cables, fiber LC patch | misc | 1 lot | $200 | $200 | |
| **Networking subtotal** | | | | **$5,340** | |

## Power and protection

| Item | Vendor / SKU | Qty | Unit | Subtotal | Notes |
|---|---|---:|---:|---:|---|
| Online double-conversion UPS, 6 kVA, 240 V | Eaton 9PX6K or APC SRT6KXLT | 2 | $3,200 | $6,400 | Lithium upgrade if available |
| Switched/metered 0U PDU, 30 A 240 V, L6-30P | APC AP8865 or Tripp-Lite PDUMNV30HVNET | 2 | $750 | $1,500 | 1 per node; metered for billing audit |
| Type 2 SPD, panel-mounted | Siemens FS140 | 1 | $250 | $250 | |
| Type 1 SPD, service entrance | Eaton CHSPT2ULTRA | 1 | $300 | $300 | |
| Subpanel, 200 A, 30-circuit | Square D QO | 1 | $400 | $400 | |
| Breakers (50A 2P, 30A 2P, 20A 1P) | Square D QO | 1 lot | $400 | $400 | |
| 6 AWG / 10 AWG THHN, conduit, fittings | Home Depot | 1 lot | $800 | $800 | |
| **Electrician labor (subpanel + 5 circuits)** | local | — | $3,500 | $3,500 | Including permit and inspection |
| **Power subtotal** | | | | **$13,550** | |

## Cooling

| Item | Vendor / SKU | Qty | Unit | Subtotal | Notes |
|---|---|---:|---:|---:|---|
| 36k BTU mini-split inverter heat pump | Mitsubishi MUZ-FH36 or Daikin Aurora | 1 | $4,500 | $4,500 | Equipment + standard install |
| Insulated supply duct (14") + boot | local HVAC | 1 lot | $400 | $400 | |
| Hot-aisle return duct + flex | local HVAC | 1 lot | $300 | $300 | |
| Spot cooler, 12k BTU, portable | Tripp Lite SRCOOL12K | 1 | $1,400 | $1,400 | Backup |
| **HVAC labor (refrigerant lineset, electrical, condensate)** | local | — | $1,800 | $1,800 | |
| **Cooling subtotal** | | | | **$8,400** | |

## Rack and physical

| Item | Vendor / SKU | Qty | Unit | Subtotal | Notes |
|---|---|---:|---:|---:|---|
| 42U 4-post rack, 1100 mm deep | StarTech RK4242BKM | 1 | $900 | $900 | |
| Blanking panels (1U/2U) set | misc | 1 lot | $100 | $100 | |
| KVM-over-IP (Pi-KVM v4 or Lantronix) | Pi-KVM v4 | 2 | $400 | $800 | 1 per node |
| Anti-static mat, sealer | Home Depot | 1 lot | $200 | $200 | |
| **Physical subtotal** | | | | **$2,000** | |

## Monitoring / safety

| Item | Vendor / SKU | Qty | Unit | Subtotal | Notes |
|---|---|---:|---:|---:|---|
| Smart panel monitor | Span Panel or Emporia Vue 2 | 1 | $1,500 | $1,500 | Span ≈ $4k, Vue 2 ≈ $200; pick by feature need |
| Temp/humidity sensors (Z-Wave) | Aeotec | 2 | $40 | $80 | |
| Water leak sensors | Aeotec | 2 | $40 | $80 | |
| Door reed switch | misc | 1 | $20 | $20 | |
| Home Assistant Yellow (or repurposed mini PC) | Nabu Casa | 1 | $400 | $400 | |
| **Monitoring subtotal** | | | | **$2,080** | |

## Misc / contingency

| Item | Notes | Subtotal |
|---|---|---:|
| Tools (torque drivers, network testers, label maker) | One-time | $500 |
| Permits (electrical, HVAC, home occupation) | Varies; budget high | $800 |
| Insurance rider (year 1) | Commercial activity from home | $1,000 |
| Shipping / freight (servers crate from vendor) | | $800 |
| Contingency at 8% | Unknowns always exist | ~$18,000 |
| **Misc subtotal** | | **$21,100** |

## Total capex (default reference design)

| Section | Amount |
|---|---:|
| Compute | $197,360 |
| Networking | $5,340 |
| Power and protection | $13,550 |
| Cooling | $8,400 |
| Rack and physical | $2,000 |
| Monitoring / safety | $2,080 |
| Misc / contingency | $21,100 |
| **Total** | **~$250,000** |

## Variants (cheaper / smaller / bigger)

### "Half pod" — 8× RTX PRO 6000 in one node, ~$140k

If you want to test the waters with one server:

- Drop one chassis, one set of CPUs/RAM, 8 GPUs, one PDU/UPS.
- Save ~$110k upfront.
- Power draw drops to ~9 kW at the wall — fits a 50 A 240 V circuit and a
  smaller mini-split.
- Reduces marketplace presence (you can't fill 16 customer slots) but lets
  you learn operations on a smaller blast radius. Strong recommendation for
  first-time builders.

### "Inference-density variant" — 16× RTX 5090, ~$110k capex but legally fraught

- 16× RTX 5090 (32 GB) at ~$2,200 each = $35k for GPUs.
- Same chassis / power / cooling.
- ~50% the rental rate per card on Vast.ai but ~25% the GPU cost.
- **Risk: NVIDIA's GeForce EULA** prohibits datacenter use. Vast.ai tolerates
  it for small hosts; large hosts get warning letters. If you incorporate or
  pursue commercial customers, this becomes a legal issue. If you're
  comfortable with the risk profile (sole proprietor, small scale), the
  capex math is genuinely better.

### "Training-grade variant" — 8× H200 SXM HGX, ~$420k

- Single 8-GPU HGX H200 SXM5 baseboard. Not recommended for residential
  builds. Weight, cooling (NVL needs liquid), and capex all worse. You're
  competing with hyperscalers on their turf.

### "Bigger pod" — 32 GPUs, requires 400 A service

- Roughly 2× everything plus $15k for the 400 A upgrade and 6–18 mo wait.
- Capex ~$510k. Revenue scales linearly. Payback shifts ~6 months sooner
  *if* the upgrade goes smoothly (it often doesn't). Skip until v2.

## What I deliberately left out and why

- **NVL (NVLink Bridge) cards.** PCIe RTX PRO 6000 supports NVLink only
  between paired adjacent cards. Vast.ai customers don't reliably select on
  this, and the bridges add $400/pair for marginal value on most inference
  workloads.
- **Tape backup or disaster recovery.** Tenant data is ephemeral — they bring
  it, you delete it on container exit. Your config is in git. Don't overbuild.
- **Multiple ISPs.** Customers expect outages from residential hosts. Don't
  pay for redundancy that doesn't move your reliability score above what's
  achievable on one good fiber link.
- **Rack-scale liquid cooling (CDU, cold plates, dry cooler).** Worth it at
  scale; for one rack, the capex doesn't pencil.
