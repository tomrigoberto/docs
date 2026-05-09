# Software Stack

Everything is open-source or has a generous free tier. Total recurring software
cost should be < $200/mo, dominated by Vast.ai's internal surcharge (which is
on the customer side, not yours, since they removed host fees in 2026).

## Operating system layer

| Component | Choice | Notes |
|---|---|---|
| Host OS | **Ubuntu Server 24.04 LTS** | Bare metal. Skip Proxmox unless you actually need VMs — adds a layer of GPU passthrough complexity that costs you 2–5% throughput and creates IOMMU debugging pain. |
| Filesystem | **ZFS on Linux** for data, mdadm RAID-1 for boot | ZFS for the U.2 pool gives you snapshots, compression, and integrity checks. Disable atime, set recordsize=1M for AI workloads. |
| Bootloader | systemd-boot, UEFI | |
| Kernel | HWE kernel (`linux-generic-hwe-24.04`) | Newer driver compatibility for Blackwell |
| User accounts | One sysadmin + one service account per major daemon. SSH key auth only, root login disabled. | |

## GPU and compute stack

| Component | Choice | Notes |
|---|---|---|
| NVIDIA driver | **570.x or newer** (Blackwell support) | Install from NVIDIA's official .run for full DCGM features, not Ubuntu's repo |
| CUDA toolkit | 12.8+ | Required for Blackwell |
| Container runtime | **Docker 26+** with `nvidia-container-toolkit` | Vast.ai expects Docker, not containerd or Podman |
| GPU monitoring | **NVIDIA DCGM + dcgm-exporter** | Per-GPU metrics into Prometheus |
| MIG | **Off.** | RTX PRO 6000 doesn't support MIG; whole-GPU rentals only. (H100/H200 do — irrelevant here.) |

## Marketplace daemons

| Component | Choice | Notes |
|---|---|---|
| **Primary**: Vast.ai host daemon | `vastai_host` Docker container | Runs in privileged mode, manages tenant containers, reports inventory. Setup: ~30 min following Vast docs. |
| **Secondary**: RunPod Community Cloud daemon | `runpodctl` agent | Add after 6 months of stable Vast operation. |
| Pricing automation | Custom: `vastai-autoprice` (small Python service) | Polls Vast.ai API for median market price per GPU type, adjusts your listing ±10% based on rolling 7-day utilization. ~50 LOC. |
| Reliability monitor | Custom: `host-watchdog` | If Vast.ai daemon dies or GPU temps exceed threshold, mark host offline via API to preserve reliability score. |

## Inference / training enablement (for tenants who don't bring their own image)

You don't have to provide these — most Vast.ai tenants bring their own
container. But offering one or two well-tuned templates increases utilization.

| Component | Use case | Notes |
|---|---|---|
| **vLLM** (latest stable) | LLM inference serving (OpenAI-compatible API) | PagedAttention, gives 14–24× throughput vs naive serving. The default for renters in 2026. |
| **SGLang** | Structured generation, agentic tool-use workloads | Faster than vLLM for some workloads (constrained decoding, multi-turn) |
| **Ollama** | Hobbyist single-user inference | Lower throughput, friendly UX. Some Vast tenants want this template. |
| **PyTorch 2.5+ with CUDA 12.8** | Training / fine-tuning base | Standard. Provide via Docker image. |
| **ComfyUI / Stable Diffusion WebUI** | Image generation | Significant share of consumer rentals; offer as a template. |

## Networking and security

| Component | Choice | Notes |
|---|---|---|
| Edge router OS | **MikroTik RouterOS 7** or **OPNsense** | Both fine. RouterOS has lower latency, OPNsense has friendlier GUI. |
| VPN for management | **Tailscale** (free tier, 100 nodes) | Mesh, no port forwarding, magic DNS. |
| WireGuard for OOB | Backup if Tailscale auth-server is down | |
| Firewall ruleset | nftables, declarative via Ansible | Tenant VLAN egress allow-list: HTTPS, DNS, NTP, 443, 80. *Block* SMTP (spam abuse), block residential ISP CGN ranges (lateral movement vector). |
| DDoS protection | None purchased | Customer egress is the attack vector worth thinking about. If a tenant uses your IP for outbound abuse, Vast.ai's TOS gives you an out, but expect ISP grumbling. Mitigation: rate-limit tenant egress to 100 Mbps per GPU. |
| Certificate management | `caddy` reverse proxy with Let's Encrypt | For your management portal only |

## Observability

| Component | Choice | Notes |
|---|---|---|
| Metrics | **Prometheus** | Single instance, 30-day retention. ~50 GB. |
| Visualization | **Grafana** OSS | One dashboard: per-GPU temp/power/util, ambient temp, $ earned today, Vast online status. |
| Logs | **Loki + Promtail** | Cheap, good enough |
| Alerting | **Alertmanager → ntfy.sh** (free) or PagerDuty free tier | Phone push notifications for critical alerts |
| Tracing | None | Overkill at this scale |
| Smart panel | **Span Panel** API → Home Assistant → Prometheus | Per-circuit current, real-time |
| Environmental | **Home Assistant** with ESPHome / Zigbee2MQTT | Temp, humidity, water, door |
| Synthetic checks | **Uptime Kuma** | Hits Vast.ai's /status endpoint every 30s |

## Configuration management

| Component | Choice | Notes |
|---|---|---|
| Provisioning | **Ansible** | Two playbooks: `bootstrap.yml` (OS → working node) and `update.yml` (drivers, daemons, firewall). |
| Secrets | **sops + age** in git, decrypted to disk on apply | No HashiCorp Vault overhead at this scale |
| Backups | **restic** to a Backblaze B2 bucket, nightly | Backs up: configs, Prometheus snapshots, customer-facing template Dockerfiles. ~$5/mo. |
| Source control | GitHub or self-hosted Gitea | Whatever you prefer |
| CI for infra | GitHub Actions or none | Optional. Run `ansible-lint` and a dry-run on PR. |

## Tenant container security

This is where home hosts cut corners and get burned. Don't.

1. **Tenant containers run in non-privileged mode by default.** Vast.ai's
   default. Don't override unless tenant pays a premium.
2. **gVisor or Kata Containers** for the paranoid; adds 5–8% overhead.
   Worth it for first 6 months until you trust your tenant base.
3. **No host filesystem mounts** beyond the per-tenant scratch directory.
4. **Egress firewall** as described above.
5. **Per-tenant cgroup limits** for CPU, RAM, network bandwidth, disk IOPS.
6. **Image scanning**: tenant brings the image, but you can configure
   Vast.ai to require KYC for tenants requesting > 4 GPUs (raises the bar
   for abuse).

## Software cost recap (per month, recurring)

| Item | Cost |
|---|---:|
| Backblaze B2 (configs/backups) | $5 |
| Domain + DNS (one .com, Cloudflare DNS) | $1 |
| ntfy.sh / monitoring | $0 (self-host) |
| Tailscale | $0 (free tier) |
| Grafana / Prometheus / Loki | $0 (self-host) |
| **Total** | **~$10/mo** |

The "free" software stack is genuinely free at this scale. The hidden cost is
your time configuring it — budget 60–80 hours of setup labor for the full
stack from a clean OS install to a working Vast.ai listing.
