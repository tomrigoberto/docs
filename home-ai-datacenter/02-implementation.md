# Implementation Approach

A phased build with explicit go/no-go gates. Each phase ends in a state where
the project is *paused-recoverable* — you've spent the money, but you haven't
made it impossible to walk away.

## Phase 0 — Site survey and feasibility (week 0–2, ~$500)

**Goal:** prove the building can support the load before you spend serious
money.

| Step | Output |
|---|---|
| Pull a copy of your electrical service rating (look at the meter and main breaker; call utility for the transformer kVA serving you) | Service capacity number |
| Use a clamp meter on the service mains for 7 days, log peak | Real residual capacity for the pod |
| Get an HVAC tech to quote a 36 kBTU mini-split with ducting to a specific room | Cooling capex confirmed |
| Get a licensed electrician to quote the subpanel + circuits described in `01-architecture.md` | Electrical capex confirmed |
| Check homeowner's insurance: is small-business-from-home GPU rental covered? Get rider quote | Insurance rider confirmed |
| Check zoning: home occupation permit required? Many cities require one. | Permit obtained or in flight |
| Check ISP business fiber availability and pricing | WAN confirmed |

**Go/no-go gate:**

- Available continuous capacity ≥ 22 kW after measured peak house load.
- Cooling quote ≤ $7k installed.
- Electrical quote ≤ $5k installed.
- Insurance rider ≤ $1k/yr.
- Business fiber ≤ $200/mo.

If any of these fails by > 25%, **stop**. Reconsider colocation. A 1U slot in
a Tier-3 colo is $200–500/mo and you skip every problem in this phase.

## Phase 1 — Facility prep (week 2–6, ~$15k)

Run in parallel: electrical and cooling work, both pulled by licensed pros.

1. Subpanel installation (1–2 days, permit + inspection).
2. Mini-split installation, including supply/return ducting to the rack
   location (2 days).
3. Rack delivery, anchor to floor, set in final position.
4. Networking pre-wire: pull two Cat6A and one OS2 fiber from the rack to
   the demarc.
5. Surge protection, grounding, water sensors installed.
6. **Burn-in test of the room with no compute:** run a 5 kW resistive heater
   in the rack space, confirm cooling holds within 5 °F of setpoint over a
   summer-day-equivalent test (run for 8 hours during peak heat).

**Go/no-go gate:** room holds setpoint with 5 kW dummy load. If not, fix
cooling before buying GPUs. This is the single most-skipped step that bites
people in July.

## Phase 2 — Core infrastructure (week 6–10, ~$25k)

Build the boring bits before the expensive bits.

1. UPS units, PDUs, KVM, BMC management network.
2. Edge router, firewall rules, VLAN segmentation, monitoring stack.
3. ISP business fiber installed and tested (run iperf3 to a few cloud
   regions; confirm > 900 Mbps symmetric).
4. Bring up Node-01 *without GPUs first* — install OS, configure ZFS, BMC,
   IPMI, Docker, NVIDIA drivers (preinstall), Vast.ai daemon. Confirm full
   remote management.
5. Repeat for Node-02.
6. Tenant isolation testing: stand up a test container, confirm it cannot
   reach VLAN 99 (house network), cannot reach BMC, cannot egress beyond
   VLAN 40's allow list.

**Go/no-go gate:** both nodes are remotely manageable, monitoring is green,
tenant isolation passes a manual penetration test (run nmap, attempt SSH to
each VLAN, attempt UDP/TCP scans — all blocked).

## Phase 3 — GPU installation and burn-in (week 10–12, ~$155k)

Now the expensive part. Insure the cards in transit. Inspect every box on
delivery; refuse damaged shipments.

1. Install GPUs into Node-01 (4 first, run a 24h burn-in, then 4 more).
   Burn-in script: `gpu-burn` for 24h continuous, monitor temps, ECC errors,
   power draw. Any card that throws a single ECC error in burn-in goes back
   to the vendor under DOA.
2. Repeat Node-02.
3. Confirm full thermal load: both nodes at 100% TDP for 4 hours. Room
   ambient should hold within +5 °F of setpoint. If not, you have a cooling
   problem. Don't move on.
4. Install per-GPU power caps as a safety: `nvidia-smi -pl 550` (50 W under
   spec) until you've validated cooling under summer conditions.

**Go/no-go gate:** all 16 GPUs pass 24h burn-in with zero ECC errors. Room
holds setpoint at full load.

## Phase 4 — Marketplace soft-launch (week 12–14, $0 capex, $0 revenue expected)

Don't list at production prices yet. Use this phase to find configuration
issues that only appear under real tenant load.

1. List 4 GPUs on Vast.ai at 50% of the median price. You'll fill instantly.
2. Watch for: PCIe link errors, container escape attempts, unusual power
   draw, network saturation, customer complaints in DMs.
3. Resolve any reliability incident before scaling listings.
4. Gradually list remaining 12 GPUs over 2 weeks.

**Go/no-go gate:** Vast.ai reliability score ≥ 95%, zero security incidents.

## Phase 5 — Production operation (ongoing)

| Cadence | Activity |
|---|---|
| Daily | Glance at Grafana — utilization, $/hr, ambient temp |
| Weekly | Review Vast.ai reviews, adjust pricing ±5% based on utilization |
| Monthly | Filter / fan service, BMC firmware check, full backup of config |
| Quarterly | DCGM full diagnostic on each GPU; replace any showing degradation |
| Annually | HVAC service, UPS battery test, insurance renewal, tax filing |

### Operational runbook highlights

- **GPU thermal trip / room overheat**: automation power-caps GPUs to 50%, sends
  page. If room ambient > 95 °F, automation marks host offline on Vast.ai
  (so you don't take new tenants), drains existing tenants over 30 min, then
  shuts down nodes.
- **Vast.ai daemon offline**: restart container; if 3 failures in 1 hour,
  page.
- **Power outage**: UPS holds 5 min, NUT sends shutdown signal, Vast API
  marked offline, nodes shut down gracefully. On power return: manual restart
  (don't auto-start; you want to inspect the room first).
- **Internet outage**: tenants disconnect, marketplace marks you offline. Wait
  it out. Don't bother with cellular failover for the data plane — Vast tenants
  expect you to be offline if your internet is.

### Scaling considerations (don't do this in year 1)

If, after 12 months, you have:

- > 90% sustained utilization
- > $9k/mo gross revenue
- Reliability score > 98%
- Power and cooling headroom

Then consider:

- Adding a third node (requires 400 A service upgrade, $11–20k + 3–18 month
  utility timeline).
- Switching to direct-to-chip liquid cooling for higher density.
- Selling reserved/committed capacity to a single anchor customer at a
  discount, in exchange for predictable revenue.

Otherwise: keep the pod where it is, take the cash, and put the next $200k
into the S&P 500 instead. The compute economics in 2026 do not favor scaling
homelabs into commercial datacenters.
