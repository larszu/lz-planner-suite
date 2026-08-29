# Network Documentation & Broadcast IP Management

> Research date: **2026-08-29** (brief dated 2026-08-28). Claims are labelled:
> **FACT** (I opened the cited page and read it), **INFERENCE** (my reasoning from FACTs),
> **UNKNOWN / unverified** (I could not verify it this pass — the text says what to check).
>
> **Read the source-access caveat first.** It is not boilerplate: it changes how you should
> use the pricing section, which contains **no verified price at all**.

---

## Source-access caveat (read before trusting anything below)

This pass ran under two hard constraints:

1. **The WebSearch budget was already exhausted when the task started** (200/200 calls used by
   earlier work in the same session). **Zero web searches were performed.** The previous
   dossiers in this folder have a "SNIPPET" evidence tier — search-engine summaries of vendor
   pages. **That tier does not exist here.** Nothing in this document rests on a search result.
2. **The egress proxy allowed only code-hosting domains.** Confirmed reachable:
   `github.com`, `raw.githubusercontent.com`, `gitlab.com`. Confirmed **blocked**
   (`EGRESS_BLOCKED` / `CONNECT tunnel failed, response 403`): `netboxlabs.com`,
   `docs.netbox.dev`, `specs.amwa.tv`, `amwa-tv.github.io`, `www.zabbix.com`,
   `www.paessler.com`, `www.auvik.com`, `docs.lawo.com`, `en.wikipedia.org`.

So the evidence here is **binary**: either I read the primary source on GitHub/GitLab, or I
mark it UNKNOWN. There is no middle tier and nothing has been reconstructed from memory.

**What this does to the dossier, honestly:**

| Area | Evidence quality | Why |
| --- | --- | --- |
| Standards (NMOS IS-04/05/06/08/09/12/14, BCP-002/008) | **Excellent — FACT** | AMWA publishes every specification as Markdown in public GitHub repos. I read them. |
| Open-source IPAM / DCIM / NMS (NetBox, Nautobot, phpIPAM, NIPAP, RackTables, openDCIM, LibreNMS, Zabbix, Checkmk, Netdisco, SuzieQ) | **Good — FACT** | READMEs, in-repo docs, licence and release metadata all on GitHub. |
| Discovery / ingest tooling (Orb, Diode, device-onboarding, netaudio, python-zeroconf) | **Good — FACT** | Same. |
| Commercial broadcast IP orchestration (Nevion VideoIPath, Lawo VSM, Riedel, EVS Cerebrum, Ross Ultrix, Skyline DataMiner, Techex, Bridge Technologies, Arista CloudVision) | **Partial — FACT only where a vendor or a user publishes on GitHub** | I could not open a single one of their own sites. What I *can* prove comes from vendor GitHub orgs, from Bitfocus Companion modules that talk to these systems, and from **SWR's** (German public broadcaster) open-source VideoIPath automation package. |
| **Prices** | **NONE VERIFIED** | Every pricing page is on a blocked domain. The only price facts available are the licences of the open-source products, i.e. "free of charge, self-hosted". |
| Practitioner sentiment ("do small crews use these?") | **INFERENCE ONLY** | No forum, Reddit, or community-site access. Flagged wherever it appears. |

**Do not lift any number from the pricing section into a comparison slide.** There are no
numbers there. The section lists the exact URLs to re-run.

---

## Segment summary

This segment answers a question that the technical-planning segment (cable/patch/rack) does not
touch: **"what is the state of the network, and is it what we intended?"** In an SDI plant that
question barely exists — a cable is either plugged in or it is not. In an IP plant it is the
whole job, because the patch is now a subscription, the tie-line is now a multicast group, and
the "wire" is a VLAN with a bandwidth budget.

Four distinct product families sit in this segment, and they were built by four different
industries that do not talk to each other:

| # | Family | Core question | Representative tools |
| --- | --- | --- | --- |
| 1 | **Source of truth / IPAM / DCIM** | *What is supposed to exist?* Prefixes, VLANs, devices, ports, cables | NetBox, Nautobot, phpIPAM, NIPAP, RackTables, openDCIM, i-doit |
| 2 | **Discovery / NMS / monitoring** | *What actually exists, and is it up?* | LibreNMS, Zabbix, Checkmk, Netdisco, SuzieQ, PRTG, Auvik, Arista CloudVision |
| 3 | **Broadcast IP control planes** | *Which flow is routed where, right now?* | NMOS (IS-04/IS-05), Nevion VideoIPath, Lawo VSM, EVS Cerebrum, Ross, Riedel, Skyline DataMiner |
| 4 | **Stream/essence analysis** | *Is the media on the wire legal?* | EBU LIST (pi-list), ebu/smpte2110-analyzer, Bridge Technologies, Techex (last two unverified) |

**Who buys what.** Family 1 and 2 are bought by IT/network teams and are priced and shaped for
datacentres and enterprise WANs. Family 3 is bought by broadcast engineering and system
integrators, sold through a sales conversation, and is generally deployed as part of a facility
build. Family 4 is bought by the same people as family 3, usually as an appliance.

**Typical price band — UNVERIFIED this pass.** What *is* verified: families 1 and 2 have a
genuinely free, self-hostable, production-grade open-source core (Apache 2.0 / GPL / AGPL /
MIT / BSD — all read from the repos). Family 3 has **no** open-source product at all; the only
open artefacts are the *standard* (NMOS, Apache-2.0-style AMWA licensing), reference
implementations (`nmos-cpp`, `nmos-js` — Apache 2.0, Sony), and third-party clients. **INFERENCE:**
that asymmetry — free at the documentation layer, sales-contact-only at the orchestration layer —
is the defining commercial fact of this segment.

---

## Product table

Legend: **Offline?** = can it run with no internet, on an isolated production LAN.
Price column: every commercial entry is UNVERIFIED this pass — see the caveat.

| Product | Vendor | Platform | Price model | Offline? | API? | Best at |
| --- | --- | --- | --- | --- | --- | --- |
| **NetBox** | NetBox Labs + community | Self-hosted Django/PostgreSQL; NetBox Cloud | Core **Apache 2.0** (FACT); cloud/enterprise tiers **price UNKNOWN** | **Yes** (self-hosted) | **REST + GraphQL**, OpenAPI at `/api/schema/swagger-ui/`, token auth, ETag/`If-Match` since v4.6 (FACT) | The best modelled source of truth in existence: IPAM + DCIM + cables + VLANs + circuits in one object graph. v4.6.9 released 2026-08-25 (FACT) |
| **Nautobot** | Network to Code + community | Self-hosted Django/PostgreSQL or MySQL | **Apache 2.0** (FACT); commercial offering UNKNOWN | **Yes** | REST + **GraphQL** + webhooks + Git-backed YAML config (FACT) | Same data model as NetBox (fork of NetBox v2.10.4, FACT) plus **Jobs** and an app framework — a source of truth that also *runs* automation |
| **phpIPAM** | Community | LAMP (PHP 7.2–8.5, MySQL/MariaDB 5.7.7+) | **GPL v3** (FACT) | **Yes** | REST API (documented at phpipam.net — **not opened**) | Light, fast IPAM when NetBox is too much. Repo topics include `network-discovery`, `network-visualization` (FACT) |
| **NIPAP** | SpriteLink | Self-hosted, PostgreSQL | **MIT** (FACT) | **Yes** | **XML-RPC** middleware + CLI + web GUI; Python/Java/Oracle clients (FACT) | Very large prefix estates, VRF/overlapping prefixes, regex prefix search. Pre-1.0 (FACT) |
| **RackTables** | Community | LAMP (PHP 7.0+ min, MySQL 5+) | Licence **UNKNOWN** (not stated in README) | **Yes** | UNKNOWN | Long-lived rack/object documentation, versions 0.20–0.22 (FACT). Old-school, still maintained |
| **openDCIM** | Community | LAMP + PHP-SNMP | **GPL v3** (FACT) | **Yes** | UNKNOWN | Racks, power, cabling, device templates, basic IPAM — **but the maintainer is retiring after ~20 years, a final 26.01 release was planned and the opendcim.org domain will not be renewed** (FACT). Treat as end-of-life |
| **i-doit** | synetics / i-doit, **Düsseldorf, Germany** (FACT — GitHub verified org) | LAMP | Open-source core + commercial editions (**price UNKNOWN**) | **Yes** | **JSON-RPC** (official `api-client-php`, AGPL-3.0) (FACT) | German-market IT documentation/CMDB. Notably also ships a **Checkmk Web-API client** (FACT) — the DE pairing of CMDB + Checkmk in one vendor's repo list |
| **LibreNMS** | Community | PHP/MySQL/SNMP | **GPL v3** (FACT), 4.9k stars | **Yes** | REST API (docs in-repo under `doc/API`) | Auto-discovery + port/VLAN/ARP/FDB collection; `discovery-protocols` (xDP/OSPF/OSPFv3/BGP) and `arp-table` enabled by default, `discovery-arp`, `route`, `vrf` **disabled** by default (FACT) |
| **Zabbix** | Zabbix | Self-hosted | **AGPL-3.0-only** (FACT — a change from GPL); support subscriptions **price UNKNOWN** | **Yes** | API (JSON-RPC; not opened) | Enterprise-class monitoring with **network topology maps**, discovery, multitenancy (FACT) |
| **Checkmk** | Checkmk (checkmk.com; German HQ **unverified on the page**) | Self-hosted | **Community edition GPL-2.0** (FACT); Pro / Ultimate / Ultimate-MSP **price UNKNOWN** | **Yes** | REST API in paid editions (FACT, per README feature split) | Agent-based *and* agentless monitoring, hundreds of plugins; the German SME default (**INFERENCE**, unverified) |
| **Netdisco** | Community | Perl + PostgreSQL | **BSD-3-Clause** (FACT) | **Yes** | Web + CLI; REST **UNKNOWN** | The single most under-rated tool here: *"Locate a machine on the network by MAC or IP and show the switch port it lives at"*, and *"Turn off a switch port, or change the VLAN or PoE status of a port"* (FACT, quoted) |
| **SuzieQ** | netenglabs / Stardust Systems | Self-hosted, container | **Apache 2.0** + commercial enterprise edition (FACT); price UNKNOWN | **Yes** | **REST API** + CLI + GUI + Python objects (FACT) | Time-series network state: LLDP topology, MAC tables, routes, ARP/ND, BGP/OSPF/EVPN/MLAG; **path visualisation between endpoints** and **asserts** (FACT) |
| **NetBox Discovery** (Orb agent + Diode) | NetBox Labs | Container (Docker/Podman), 2 cores / 1.5 GB min | Orb **Apache 2.0**; **Diode is "NetBox Limited Use License 1.0"** — source-available, not OSI open source (FACT) | **Yes** | gRPC + Go/Python SDKs; requires NetBox ≥ 4.2.3 and the Diode plugin (FACT) | Closing the loop: nmap-based network discovery, device discovery, SNMP and **gNMI** backends feeding a source of truth (FACT) |
| **Nautobot device onboarding app** | Network to Code | Nautobot app | Licence file present, type **UNKNOWN** | **Yes** | via Nautobot | Onboards a device from *an IP and a location* using **netmiko/NAPALM**, populating interfaces, IPs, MTU, MAC, LAG, VRF, **tagged/untagged VLANs and cable terminations derived from LLDP** (FACT) |
| **NMOS stack** (`nmos-cpp`, `nmos-js`, Easy-NMOS, `nvnmos`, `nmos-testing`, `nmos-device-control-mock`) | AMWA + Sony + NVIDIA + community | Linux/Windows/macOS; Docker Compose | **Apache 2.0** (FACT) | **Yes — designed for isolated media LANs** | HTTP+JSON registration/query, **WebSocket** subscriptions, IS-05 connection API (FACT) | The only open, vendor-neutral live inventory + patch state for ST 2110 plants |
| **Nevion VideoIPath** | Nevion (Sony) | On-prem server | **Sales contact; price UNKNOWN** | On-prem yes | HTTP API over HTTPS:443 with UI credentials; "2023 LTS API" (FACT via Companion module); Python client covers Inventory, **Topology**, multicast pools, profiles (FACT via SWR package) | SDN orchestration of 2110/JPEG-XS across LAN **and WAN** — the OB-truck-to-broadcast-centre case |
| **Skyline DataMiner** | Skyline Communications (BE) | On-prem/hybrid | **Sales contact; price UNKNOWN** | On-prem | Large connector ecosystem; docs are **open source on GitHub** (`dataminer-docs`, `dataminer-docs-connectors`, `dataminer-docs-MediaOps`) (FACT) | Multi-vendor NOC umbrella + Service & Resource Management (`Frameworks/SRM` in the docs tree, FACT) |
| **Lawo VSM** | Lawo (DE) | On-prem | **Sales contact; price UNKNOWN** | On-prem | **Ember+** — published by the Lawo Group as an open initiative, protocol defines "the communication parts and a basic data tree structure, but not the content of it" (FACT, quoted) | Broadcast-wide control/orchestration and panel logic |
| **Riedel MediorNet / Artist** | Riedel (DE) | Hardware + control | **Price UNKNOWN** | On-prem | **RRCS = XML-RPC** (FACT via Companion module metadata); Companion modules exist for MediorNet, RRCS, SmartPanel, MediaNetworks (FACT) | Signal transport + intercom in one fabric |
| **Ross Video (Ultrix / control)** | Ross (CA) | Hardware + software | **Price UNKNOWN** | On-prem | Ross publishes **Catena** (C++, BSD-3-Clause) and a **`terraform-provider-st2138`** — "Terraform Provider for SMPTE ST2138 Compatible Services" (FACT) | Router + production control; notable for being the vendor betting on **SMPTE ST 2138** and infrastructure-as-code |
| **Arista CloudVision** | Arista | On-prem/cloud | **Price UNKNOWN** | On-prem possible | **gRPC + Protobuf resource APIs**, streaming telemetry, device inventory, events (FACT via `cloudvision-python`, Apache 2.0) | Knowing "the topology of the network, device configuration, interface activity and other network events" (FACT, quoted) for the 2110 spine/leaf |
| **Dante Controller / Dante Domain Manager** | Audinate | Windows/macOS app; DDM server | Controller commonly free, DDM licensed — **both UNKNOWN, audinate.com blocked** | **Yes — Controller is mDNS-local** | **DDM exposes a GraphQL API** (FACT via `companion-module-audinate-dante-ddm`) | Audio-network discovery and routing that *actually works for small crews* |
| **netaudio** | chris-ritsen (community) | Python 3.9+ CLI + Rust core | **Unlicense** (public domain) (FACT) | **Yes** | CLI with **JSON output** (FACT) | Dante control without Dante Controller: mDNS discovery, subscriptions, device/channel names, sample rate, latency, AVIO gain, lock/unlock. **Author states it is "not ready for anything other than a test environment"** (FACT, quoted) |
| **EBU LIST (pi-list)** | EBU | Docker | **GPL-3.0** (FACT) | **Yes** | Web UI | ST 2110 pcap compliance: per-stream analysis, video/audio timing, ancillary, TTML, stream comparison. **"No longer actively maintained"** (FACT, quoted) |
| **ebu/smpte2110-analyzer** | EBU | Python 3.6+ | Open source (licence file present) | **Yes** | scripts | `cfull_analysis.py`, `vrx_analysis.py`, **`ptp_analysis.py`** on ns-precision pcaps (FACT) |
| **Kronekeeper** | nick-prater (community) | Web app | **AGPLv3** (FACT) | **Yes** | Spreadsheet import/export (FACT) | Krone frame + jumper documentation; a KRIS replacement in production at Global Radio, Bauer Media, Wireless Group since 2017 (FACT) |
| **Bitfocus Companion** | Bitfocus AS (NO) | Desktop / Docker | Open source (LICENSE.md present) | **Yes** | 700+ connections (FACT); modules MIT | Not a documentation tool — but it is **what small crews actually have running**, and it now ships an in-house **NMOS IS-04 TypeScript library** (`@bitfocus/nmos`) (FACT) |
| **PRTG** | Paessler (DE) | Windows | **Sensor-based licensing; price UNKNOWN — paessler.com blocked** | **Yes** | UNKNOWN | German-market SME network monitoring (**INFERENCE**, unverified) |
| **Auvik** | Auvik (CA) | SaaS | **Per-device subscription; price UNKNOWN — auvik.com blocked** | **No** (cloud) | UNKNOWN | Automated topology mapping for MSPs (**INFERENCE**, unverified) |
| **Techex tbm**, **Bridge Technologies** | Techex (UK), Bridge Technologies (NO) | Appliance/software | **UNKNOWN** | UNKNOWN | UNKNOWN | **Nothing verified this pass.** No reachable primary source. Listed only so the gap is explicit |

That is **28 named products**, of which 24 have at least one FACT-tier claim attached.

---

## Deep dives

### 1. NetBox — the reference data model for "what is supposed to exist"

**What it does.** NetBox calls itself *"the premier source of truth powering network
automation"* and models *"Racks, devices, cables, IP addresses, VLANs, circuits, power, VPNs,
and lots more"* (FACT, README). Originally built by Jeremy Stretch at DigitalOcean in 2015,
open-sourced 2016 (FACT, `docs/introduction.md`).

**Data model.** From the introduction doc (FACT): **IPAM** (IPv4/IPv6, VRFs, automatic
provisioning), **DCIM** (rack elevations, device modelling, network/power/console cabling, power
distribution), **virtualization**, **circuits**, **wireless** (WLAN and point-to-point links),
**VPN & security** (tunnels, IKE/IPSec policies, L2VPN overlays), plus ASNs, VLAN groups, FHRP
groups and application service bindings.

The VLAN model is worth quoting exactly because it is the pattern to copy (FACT,
`docs/models/ipam/vlan.md`):

- VID is *"A 12-bit numeric ID for the VLAN, 1-4094 (inclusive)"*.
- Direct **site assignment is deprecated**; VLANs belong to a **VLAN group** instead.
- VLAN groups *"define scope and to enforce uniqueness"* and support *"the assignment of a VLAN
  to multiple sites"*.
- There are first-class **Q-in-Q role** and **Q-in-Q service VLAN** fields.

**The scoped-uniqueness idea is the transferable one.** "VLAN 101" is not globally meaningful;
it is meaningful *within a group*, and the group is what travels between sites. That is exactly
the shape an OB truck needs (see white space, below).

**API.** Read directly from `docs/integrations/rest-api.md` (FACT): JSON over HTTP; token auth
with a v2 format `Authorization: Bearer nbt_<key>.<token>` (v1 `Token <token>` deprecated);
tokens restrictable by write-capability and client IP; offset pagination default 50, max 1000,
plus cursor pagination via `start`; `?fields=id,name,status` field selection and `?brief=true`;
bulk create/update/delete by posting arrays, with bulk update explicitly **all-or-none**;
**ETag on detail responses with `If-Match` on PATCH/PUT since v4.6** to prevent lost updates;
OpenAPI/Swagger UI at `/api/schema/swagger-ui/`. GraphQL exists alongside it.

**Integrations.** The NetBox Labs org (FACT) now surrounds the core with **Orb agent**
(Apache 2.0 — nmap-based network discovery, device discovery, SNMP and gNMI backends,
pktvisor/OpenTelemetry observability) and **Diode**, an ingestion service whose stated purpose
is that integrations do not need *"deep knowledge of NetBox's internal architecture"*. There is
also a read-only **NetBox MCP server** for LLM access (FACT).

**Notable strengths.** (a) The explicit *anti-scope*: NetBox documents that it is **not** a
monitoring tool, DNS server, RADIUS server, configuration management system, or facilities
management tool, and says the goal is that *"scope creep is reasonably contained"* (FACT). Very
few products in any of these dossiers state what they refuse to be. (b) Concurrency control in
the API. (c) A release cadence that is visibly alive: v4.6.9 on 2026-08-25, v4.7.0-beta2 on
2026-08-26 (FACT, releases page).

**Notable limits.** (a) **It has no idea what a video signal is.** A VLAN, a prefix and a cable
are modelled beautifully; a PTP domain, a multicast group per essence flow, a genlock reference
or a 2110-20 bandwidth budget are not modelled at all (INFERENCE from the model docs — none of
these appear). (b) The commercial gradient is real and visible: Diode ships under a **"NetBox
Limited Use License 1.0"**, not an OSI licence (FACT). (c) Postgres + Django + Redis is not a
laptop-in-a-truck deployment.

### 2. NMOS (AMWA IS-04 / IS-05 and friends) — the broadcast-native answer, read from the spec

This is the strongest FACT block in the dossier because AMWA publishes every specification as
Markdown in a public GitHub repo.

**IS-04 Discovery & Registration.** Purpose: let *"control and monitoring applications find the
resources on a network"*. Mechanism (FACT, `README.md` and `docs/Discovery - Registered
Operation.md`):

- Nodes locate the registry by **DNS-SD, unicast preferred**.
- Service types are **`_nmos-register._tcp`** (Registration API) and **`_nmos-query._tcp`**
  (Query API). Both MUST also be capable of an **mDNS** advertisement.
- Required TXT keys: `api_proto` (`http`/`https`), `api_ver` (comma-separated version list),
  `api_auth` (`true`/`false`), and `pri` — an integer where *"Values 0 to 99 correspond to an
  active NMOS [API]"*, i.e. a priority for redundant registries.
- Nodes **register with HTTP + JSON**; applications **query with HTTP and/or subscribe over
  WebSocket**.

**IS-04 peer-to-peer mode is the sleeper feature for our use case** (FACT,
`docs/Discovery - Peer to Peer Operation.md`): with no registry, a Node scans mDNS for
`_nmos-node._tcp`. The spec says this is for *"cases where a distributed registry is not
available, such as small ad-hoc installations"*, that it *"SHOULD NOT be advertised when a
Registration API is present"*, and — critically — that mDNS *"is not intended to operate over IP
routed boundaries"*. **An OB van is precisely a small ad-hoc installation on one L2 island.**

**Data model** (FACT, `docs/Data Model.md`): **Node** (logical host) → **Device** (*"logical
groupings of functionality"*) → **Source** (*"abstract logical point of origin"*) → **Flow**
(*"concrete representations of content"*, a sequence of **Grains**) → **Sender** / **Receiver**
for network transport. Every entity carries a **UUID**.

**IS-05 Connection Management** (FACT): *"a transport-independent way of connecting Media
Nodes"*, covering **RTP, WebSocket and MQTT**, using `transport_params`, with **single and batch**
operations and **immediate or deferred (scheduled) activation**. In planning terms: IS-04 is the
device-and-port inventory, IS-05 is the patch, and IS-05 can be *scheduled*.

**The rest of the family, verified:**

| Spec | What it is (FACT unless noted) |
| --- | --- |
| **IS-06 Network Control** | A *"'Northbound' API from network fabric's controller"* giving **topology discovery, flow authorization and bandwidth assurances**, motivated by the fact that *"Ethernet switch output ports might only support a limited number of media flows before they start dropping packets"*. **Marked deprecated in its own repo.** See white space — this is the most important negative finding in the dossier |
| **IS-07 Event & Tally** | Covered in `tally.md`; exists because *"ST 2110 does not provide an equivalent to GPI functionality"* |
| **IS-08 Audio Channel Mapping** | Channel-level operations inside a device — muting channels, swapping languages, controller reads channel data from senders and writes mapping to receivers |
| **IS-09 System Parameters** | A System API *"global configuration resource"* so a Node can *"start, or re-start, in a well defined way that is consistent with the environment it's running in"* |
| **IS-10** | Authorization |
| **IS-12 + MS-05-01/-02** | The Control & Monitoring protocol; MS-05-01 is the control architecture, MS-05-02 the control framework |
| **IS-14 Device Configuration** | Controllers can *"back up an NMOS Nodes' MS-05-02 model as a JSON backup dataset"*, restore it, and change *"'rebuildable' parts of the model dynamically"*. **This is device-config-as-JSON — the show-file idea, standardised** |
| **BCP-002-01 Natural Grouping** | Nodes add a **`grouphint` tag** to each member of a natural group, giving *"a consistent way of referring to groups of related Resources (e.g. video and audio Senders of a camera)"* |
| **BCP-008-01 / -02** | Receiver / Sender **status monitoring** — a standard way to ask "is this receiver actually receiving?" |
| **nmos-parameter-registers** | Extensible enums — device types, formats, transports, tags, capabilities, device control types, media types, flow/sender/source attributes, node service types, transport parameters — as `urn:x-nmos:<type>:<value>[/<version>]`, updated by pull request |

**Implementations, all Apache 2.0 (FACT):** Sony's **`nmos-cpp`** (IS-04/05/07/08/09/10/12/14;
builds `nmos-cpp-registry` and `nmos-cpp-node`; Linux/Windows/macOS); Sony's **`nmos-js`**, a
browser NMOS client/controller with an IS-04 registry browser, IS-05 connection management and
IS-08 channel-mapping editing (**JT-NM Tested 03/20**); **NVIDIA `nvnmos`** (a C library, a
`nvnmosd` daemon with a **gRPC** API, and GStreamer elements); AMWA's
**`nmos-device-control-mock`** (IS-12, MS-05-02, BCP-008-01/-02, IS-14); and **Easy-NMOS**, a
docker-compose starter kit containing registry, virtual node, bridge adapter, Envoy and the
testing tool.

**And a conformance suite as a first-class product:** `nmos-testing` is *"a simple web service
which tests implementations of the NMOS APIs"* with ~25 test suites across IS-04 to IS-14 and
the BCPs. It carries a warning worth repeating: it **creates mock network announcements and
should only be run on isolated network segments** (FACT).

**Limits.** IS-04/IS-05 describe *live* state only. There is no notion of a *planned* state, a
*previous show's* state, or a diff between them. Nothing in NMOS documents a cable, a rack unit,
a label, or a person. And IS-06 — the one part that would have told you about switches, ports
and bandwidth — is deprecated.

### 3. Nevion VideoIPath — verified indirectly, and that turns out to be enough

I could not open nevion.com. But two independent parties publish working clients on GitHub, and
between them they reveal the shape of the system (all FACT):

**From SWR's `VideoIPath-Automation-Tool`** — published by the media-over-IP team of **SWR, a
German public broadcaster**, AGPL-3.0, Python ≥3.11, on PyPI as `videoipath-automation-tool`,
requiring **VideoIPath Server 2023.4.2 or higher**:

- It automates *"managing devices in the Inventory and Topology apps, as well the configuration
  of multicast pools and profiles"*.
- The README's own example instantiates `VideoIPathApp(server_address=..., username=...,
  password=..., use_https=..., verify_ssl_cert=...)` then
  `app.inventory.create_device(driver="com.nevion.NMOS_multidevice-0.1.0")`, sets
  `.configuration.label`, and calls `app.inventory.add_device(...)`.
- Status: **beta**, *"Features and interfaces may change"*.

Three things follow. (a) VideoIPath models equipment as **drivers** with versioned reverse-DNS
identifiers, and one of the shipped drivers is an **NMOS multidevice** driver — so NMOS is a
device *type* inside the orchestrator, not the orchestrator's own protocol. (b) The product has
distinct **Inventory** and **Topology** apps. (c) **Multicast pools** are a first-class,
configurable object — meaning multicast address planning is something a real 2110 orchestrator
has to own explicitly (see white space).

**From `bitfocus/companion-module-nevion-videoipath`** (TypeScript, MIT, updated 2026-08-28):
route control with *"configurable conflict handling"*, connection feedback, variables exposing
source/destination labels and the routed source ID per destination, and **port type filtering by
Video/Audio, GPIO, Tally, Group, Junction**. It connects over **HTTPS port 443 with a normal
VideoIPath UI user account** and *"supports VideoIPath systems exposing the 2023 LTS API"*.

**INFERENCE:** the "Group" and "Junction" endpoint types plus "conflict handling" tell you that
VideoIPath's routing model is a graph with contention, not a crosspoint matrix — closer to
booking a path through a network than to setting a crosspoint. That is the mental model an
IP-era signal planner needs to adopt.

**Limits (INFERENCE, from the fact that a broadcaster had to write and open-source this):** the
API is powerful but not obviously ergonomic — SWR's stated purpose is to *abstract the
complexity of the API*, and their own package is still beta after being useful enough to publish.

### 4. The "which port is this actually on" tier — Netdisco, LibreNMS, SuzieQ

This is the family that AV people have never heard of and would benefit from most.

**Netdisco** (BSD-3-Clause, Perl + PostgreSQL, FACT) states its job in one line:
*"Locate a machine on the network by MAC or IP and show the switch port it lives at"*, plus
*"Turn off a switch port, or change the VLAN or PoE status of a port"* and *"Inventory your
network hardware by model, vendor, software and operating system"*. It collects via SNMP, CLI or
device APIs and is described as suitable *"for small to very large networks"*.

**LibreNMS** (GPL v3, PHP/MySQL/SNMP, 4.9k stars, FACT). Its discovery modules and their default
states are documented in-repo and configured through `lnms config:set discovery_modules.<name>`:

| Module | Default |
| --- | --- |
| `os`, `ports`, `discovery-protocols` (xDP = CDP/LLDP, plus OSPF, OSPFv3, BGP), `arp-table`, `bgp-peers` | **Enabled** |
| `discovery-arp`, `route`, `vrf` | **Disabled** |

Its feature list includes *"VLAN, ARP and FDB table collection"*, NetFlow/sFlow/IPFIX, distributed
polling, an API, alerting, and integration with **Oxidized/RANCID** for config backup (FACT).

**SuzieQ** (Apache 2.0 + a commercial edition from Stardust Systems, FACT) is the most
interesting of the three conceptually. `sq-poller` collects over SSH from Cumulus, EOS, IOS/XE/XR,
JunOS, PanOS, NXOS, SONIC and Linux, normalising **LLDP topology, MAC tables, routing tables,
ARP/ND, BGP/OSPF, EVPN VNI and MLAG** into a time-series store. On top of that it offers
**path visualisation between two endpoints**, **asserts** ("statements that should be true"), and
**comparison across time periods**, exposed via CLI, GUI, REST and Python objects.

**The pattern to steal is SuzieQ's, not NetBox's:** *state, over time, with assertions*. "Show me
what changed between yesterday's rig check and now" is the question an OB engineer actually asks,
and SuzieQ is the only tool in this dossier that answers it natively.

**Limits.** All three assume SSH/SNMP access to managed switches with vendor support. A rented
unmanaged 10G switch in a flypack answers none of them (INFERENCE).

### 5. The AV-native discovery tier — Dante, NDI, and what "small crew" tooling really looks like

**Dante.** audinate.com was unreachable, but two GitHub artefacts pin down the API surface
(FACT): `companion-module-audinate-dante-ddm` *"uses the GraphQL API provided by Dante Domain
Manager"* to set subscriptions in a managed domain; and `companion-module-audinate-dantecontroller`
exists as a separate, more popular module (15 stars) for the un-managed case. So there are two
distinct integration paths — **DDM/GraphQL for managed domains, and something local for
everything else** — and only the first is a documented API.

**`netaudio`** (Unlicense, Python 3.9+ with a Rust core, 349 stars, FACT) is the community answer
to the second path: *"do everything that Dante Controller can do that would be useful for control
of the devices from a command-line interface or within scripts"* — **mDNS discovery**,
subscriptions, device and channel naming, sample rate/latency/encoding, AVIO gain, device
lock/unlock, **JSON output**. Its own README says it is *"not ready for anything other than a
test environment"*. That single repo is the clearest evidence in this dossier that the demand for
scriptable AV-network documentation exists and is being met by hobbyists, not vendors.

**NDI.** Bitfocus hosts 11 NDI-related repos (FACT) — routers, monitors, encoders — but the
DistroAV (ex-obs-ndi) README I opened says nothing about the NDI Discovery Server or mDNS; it only
requires *"NDI Runtime v6.3 or higher"*. **NDI discovery mechanics are UNKNOWN this pass** and
would need ndi.video documentation to verify.

**And the control surface small crews really run:** **Bitfocus Companion**, *"enables the Elgato
Stream Deck and other controllers to be a professional shotbox surface"*, with **700+
connections** (FACT). The strategically interesting part: Bitfocus now publishes
**`@bitfocus/nmos`**, *"AMWAs IS-04 JSON schema files, converted to zod, structured to their
respective URLs with an Axios HTTP library to fetch the resources"* (FACT, last updated
2026-05-08). **INFERENCE:** NMOS has reached the tier of tooling used by two-person crews. That
is a meaningful adoption signal and it happened in the last year.

---

## Standards & protocols

**Discovery**

| Protocol | Detail (FACT unless noted) |
| --- | --- |
| **DNS-SD / mDNS** | The universal AV/broadcast discovery substrate. NMOS: `_nmos-register._tcp`, `_nmos-query._tcp`, `_nmos-node._tcp` with TXT keys `api_proto`, `api_ver`, `api_auth`, `pri`. Dante and AES67 use mDNS/DNS-SD as well (AES67 with **DNS-SD and SAP**, per the Pi Audio Monitor project). Reference library: `python-zeroconf` (LGPL-2.1-or-later, pure Python) |
| **Unicast DNS-SD** | NMOS *prefers* unicast; mDNS is the fallback and *"is not intended to operate over IP routed boundaries"* |
| **SAP** | Session announcement for AES67 streams (FACT via `martim01/pam`) |
| **LLDP / CDP** | The as-built cabling oracle of the IT world. LibreNMS `discovery-protocols`; SuzieQ LLDP topology; Nautobot device-onboarding derives **cable terminations** from LLDP |
| **SNMP** | Netdisco, LibreNMS, openDCIM, Orb agent |
| **gNMI / gRPC** | Orb agent has a gNMI discovery backend; Arista CloudVision's resource APIs are gRPC + Protobuf |
| **SSDP/UPnP** | **UNKNOWN** — no primary source opened this pass |

**Media transport and timing**

| Standard | Relevance |
| --- | --- |
| **SMPTE ST 2110** | Separate RTP essence streams for video/audio/ANC. Analysed by EBU LIST and `ebu/smpte2110-analyzer` |
| **PTP / SMPTE ST 2059** | `ebu/smpte2110-analyzer` ships a dedicated `ptp_analysis.py`; NMOS IS-09 exists so nodes get consistent system parameters at start-up |
| **AES67 / ST 2110-30** | Audio-over-IP; discovered via DNS-SD and SAP |
| **Dante** | mDNS discovery + proprietary control; **DDM exposes GraphQL** |
| **NDI** | Discovery mechanics unverified this pass |
| **MXL (Media eXchange Layer)** | Appears in `nvnmos` and in Ross's `mxl-catena` — a newer transport being wired into NMOS-adjacent tooling |

**Control and interchange**

| Format / protocol | Notes |
| --- | --- |
| **NMOS HTTP+JSON / WebSocket** | Registration, query, subscription, IS-05 connection |
| **IS-14 JSON backup dataset** | A device's MS-05-02 model, backed up and restored as JSON — the standardised "show file" for a device |
| **`urn:x-nmos:` parameter registers** | Versioned, PR-governed enums for device types, formats, transports, capabilities, tags |
| **`grouphint` tag (BCP-002-01)** | Groups a camera's video and audio senders together |
| **Ember+** | Lawo-originated open control protocol; *"defines the communication parts and a basic data tree structure, but not the content of it"* |
| **SMPTE ST 2138** | Ross publishes a **Terraform provider** for ST 2138-compatible services — control-plane-as-code |
| **XML-RPC** | Riedel RRCS; NIPAP middleware |
| **JSON-RPC** | i-doit's API |
| **GraphQL** | NetBox, Nautobot, Dante Domain Manager |
| **REST + OpenAPI** | NetBox (Swagger UI, ETag/If-Match), Nautobot, LibreNMS, SuzieQ |
| **Legacy router control protocols** | Documented as open-source Wireshark Lua dissectors by `roddypratt/router_dissectors`: **Grass Valley Native, Harris LRC, Leitch Pass-Through, Nevion MRP, NVision NP0017, Pro-Bel SW-P-08, Pro-Bel SW-P-02, Quartz RCP, Utah RCP3-A** — plus a separate dissector for **TSL UMD V3.1/V4** |
| **pcap** | The lingua franca of 2110 troubleshooting; `ST2110_pcap_zoo` publishes example captures |
| **Spreadsheet import/export** | Kronekeeper's interchange format — and, realistically, the segment's true universal format (INFERENCE) |

---

## What this segment does WELL — patterns worth stealing

1. **Declare your anti-scope.** NetBox documents that it is *not* a monitoring tool, DNS server,
   RADIUS server, config management system or facilities manager, in service of keeping *"scope
   creep reasonably contained"*. This is a documentation *feature*.
2. **Scoped uniqueness instead of global uniqueness.** NetBox deprecated VLAN-to-site in favour of
   **VLAN groups** that *"define scope and enforce uniqueness"* and can span multiple sites. For a
   truck that redeploys weekly, the group is the reusable artefact and the site is not.
3. **Derive the as-built from the protocol.** Nautobot's onboarding app creates **cable
   terminations from LLDP**. Nobody types the patch in; the network confesses it.
4. **Reconcile discovery into the source of truth rather than replacing it.** NetBox Labs split
   the problem into an *agent* (Orb: nmap/SNMP/gNMI) and an *ingestion service* (Diode) whose
   whole selling point is that integrators need no *"deep knowledge of NetBox's internal
   architecture"*.
5. **State over time, plus assertions.** SuzieQ stores normalised network state historically and
   lets you write **asserts** and diff time periods. "What changed since the rig check" is a
   first-class query.
6. **A UUID graph with typed relationships.** NMOS's Node → Device → Source → Flow →
   Sender/Receiver chain, every entity UUID-identified, is a cleaner separation of *logical
   origin*, *content*, and *transport* than any AV planning tool has.
7. **Natural grouping via a hint tag.** `grouphint` (BCP-002-01) solves "these four senders are
   one camera" without inventing a rigid parent object.
8. **Extensible enums with governance.** The NMOS parameter registers are versioned URNs updated
   by pull request — extensibility without a fork.
9. **Ship the conformance suite as a product.** `nmos-testing` — ~25 suites, a web UI, and an
   explicit "isolated segments only" warning. Compare `docs/comparison.html` in this repo: the
   equivalent for a planner would be a validator you can point at a real project file.
10. **Ship a runnable reference stack.** Easy-NMOS is `docker compose up` for registry + node +
    controller + testing tool. The fastest way to make a standard real is to make it launchable.
11. **Config as a JSON backup dataset.** IS-14 standardises backing up and restoring a device's
    model — and even rebuilding parts of it dynamically.
12. **Concurrency control in the API.** NetBox 4.6's ETag/`If-Match` is directly relevant to this
    repo's CRDT/collab work: it is the pessimistic counterpart to what `collabStore` does.
13. **Topology as a generated view, never a stored drawing.** `netbox-topology-views` builds maps
    from cables and interfaces, supports **coordinate groups** so one topology can have several
    saved layouts, and exports to **draw.io XML** and PNG.
14. **Open the documentation even when the product is closed.** Skyline publishes `dataminer-docs`
    (31,566 commits) and `dataminer-docs-connectors` publicly. Ross publishes Catena and a
    Terraform provider. Lawo publishes Ember+. These vendors sell software and give away the
    interface description — and it is why they appear in this dossier at all while Techex and
    Bridge Technologies do not.

---

## What NOBODY in this segment solves well — the white space

1. **Planning a network that does not exist yet.** Every tool in families 2–4 discovers. NetBox
   and Nautobot can hold intent, but their workflow, docs and tooling all assume a permanent
   estate being reconciled. **Nothing here helps you design tomorrow's OB-van network on a
   laptop in a hotel room.** (INFERENCE — but consistent with every README read.)
2. **The planned-vs-live diff.** IS-04 is a live inventory of nodes and ports. IS-05 is the live
   patch. Nobody consumes either and diffs it against a *plan*. The building blocks are all
   Apache-2.0 and sitting on GitHub; the product is missing. This is the single largest gap.
3. **IS-06 is deprecated, and nothing replaced it.** The one specification that exposed
   **topology, flow authorisation and bandwidth assurance** from the network fabric — written
   because *"Ethernet switch output ports might only support a limited number of media flows
   before they start dropping packets"* — is marked deprecated in its own repository. So the
   question "will this 25G uplink carry the twelve 2110-20 flows I just planned?" has **no
   standard answer**. Everyone solves it in a spreadsheet or inside a closed orchestrator.
4. **Multicast address planning is absent from IPAM.** NetBox models prefixes, VRFs and VLANs
   beautifully; nothing in its model docs allocates *"camera 3's video flow gets 239.10.4.7:20000"*.
   Meanwhile VideoIPath treats **multicast pools** as a configurable first-class object (FACT) —
   proving the need exists and that only closed orchestrators meet it.
5. **The truck-shaped deployment.** NMOS itself acknowledges *"small ad-hoc installations"* and
   provides peer-to-peer mode for them — then every registry implementation is a server, every
   source of truth needs PostgreSQL, and every NMS needs SSH/SNMP to managed switches. There is
   no "one binary, one laptop, one flightcase, no internet" product in this segment.
6. **Cross-domain inventory.** Video is discovered by NMOS, audio by Dante/mDNS (or DDM's
   GraphQL), intercom by RRCS/XML-RPC, control by Ember+, switching by LLDP/SNMP. **No tool
   produces one device list across all five.** A camera position with a 2110 sender, a Dante
   channel, a tally receiver and an intercom key is four inventories today.
7. **Documentation output quality is dire.** These are all *databases with web UIs*. The
   deliverable an OB engineer must hand over — a printable pack with patch list, VLAN table, IP
   plan, PTP domain/priority, multicast map and switch-port allocation, per show, dated — is
   produced by **none** of them. The nearest thing to a documentation-first product in this
   entire dossier is **Kronekeeper**, which documents Krone frames and exports spreadsheets.
8. **End-of-life risk in the open-source DCIM tier.** openDCIM's maintainer is retiring after
   ~20 years and the domain will lapse (FACT). EBU LIST is *"no longer actively maintained"*
   (FACT). The most AV-adjacent open tools are the least maintained ones.
9. **Nothing bridges the SDI-era and IP-era documents.** The router-control protocols still in
   daily use (SW-P-08, NP0017, Quartz RCP, GV Native…) exist as community Wireshark dissectors,
   not as importers into any documentation tool.
10. **Price/complexity mismatch at the small end.** UNVERIFIED as to numbers, but structurally
    clear: family 1 and 2 are free but require a server and IT skills; family 3 is sales-contact
    and facility-scale. **INFERENCE (unverified — no forum access this pass): a five-person OB
    crew uses none of these and keeps the IP plan in Excel.** To verify, check
    r/VIDEOENGINEERING, the LibreNMS and NetBox community forums, and the Video Services Forum
    mailing list.

---

## Relevance to AV Planner Suite

Ranked by strength of fit.

### cable-planner — primary, and the codebase is already halfway there

Three existing pieces make this segment unusually actionable rather than aspirational:

- `apps/cable-planner/src/renderer/lib/netboxImport.ts` already pulls **NetBox
  devicetype-library** YAML (front ports, rear ports, interfaces, power) straight from GitHub.
  The suite already speaks NetBox's device vocabulary.
- `apps/cable-planner/src/main/ipc/collabDiscoveryIpc.ts` already runs **`bonjour-service`**,
  advertising and browsing `_cableplanner._tcp`. **An mDNS/DNS-SD stack is already in main.**
  Browsing for `_nmos-query._tcp`, `_nmos-register._tcp` and `_nmos-node._tcp` is a handful of
  lines against a service type constant that already exists.
- `apps/cable-planner/src/renderer/lib/danteNaming.ts` already encodes DNS-SD-conformant Dante
  and AES67 naming rules (1–31 chars, `a–z A–Z 0–9 -`, `channel@device`). The app already knows
  that AV device names are network identifiers.

Concrete opportunities, in order of value:

1. **An `nmos:*` IPC domain that reads a live plant.** Browse mDNS for `_nmos-query._tcp` (or
   `_nmos-node._tcp` in peer-to-peer mode), read the IS-04 registry, and import Nodes/Devices/
   Senders/Receivers as equipment and ports. This is the **as-built importer** that
   `technical-planning.md` already identified as missing from the whole planning segment — and
   it is entirely open, Apache 2.0, and specified in Markdown. Model it on the existing
   `videohub:*` and `atem:*` domains.
2. **Planned-vs-live diff.** Once IS-04 is readable, diff it against the project's planned signal
   flow, exactly as the Videohub label diff already does. Add IS-05 to compare the *patch*.
   Nobody in this segment ships this.
3. **An IP-plan layer in the project model.** VLANs (with **NetBox-style groups**, not sites —
   because a truck's VLAN plan travels), prefixes, **multicast pools** (the VideoIPath lesson),
   PTP domain/priority, and a per-link bandwidth budget. This lands in `src/renderer/types/` as a
   new domain type plus a `healProjectPositions` migration, and the arithmetic goes in
   `src/renderer/lib/` next to the length and power calculations.
4. **The bandwidth check nobody standardised.** IS-06 is deprecated and the question is
   unanswered: given N senders of format F on a link of speed S, does it fit? That is a
   `lib/` function and a red validation badge — squarely the kind of check `drawingChecks.ts`
   already does.
5. **`grouphint`-style grouping.** Adopt BCP-002-01's idea for camera bundles: video + audio +
   tally + intercom as a named natural group, not a rigid parent object.
6. **Documentation output.** The printable IP/VLAN/multicast/PTP pack per show. This segment's
   biggest gap is also this suite's existing strength (`print:*`).

### multicam-planner

Camera → sender/flow mapping is the IS-04 data model almost exactly (Device → Source → Flow →
Sender). `grouphint` grouping and IS-08 audio channel mapping give a verified vocabulary for
"this camera contributes video, four embedded audio channels and a tally receiver".

### broadcast-intercom

IS-08 (channel mapping), AES67 discovery via DNS-SD/SAP, and **Riedel RRCS = XML-RPC** (FACT)
are all directly relevant. The `intercom.md` dossier already noted that intercom has no
interchange format; NMOS gives one for the *audio transport* half of the problem.

### tally-pi

IS-07 Event & Tally is the standards answer and `tally.md` already covers it. BCP-008-01
(**receiver status monitoring**) is the newer, complementary piece: a standard way to show "this
receiver is not receiving" on a tally panel. `martim01/pam` (GPL-3.0) is a strong precedent — a
Raspberry Pi + touchscreen monitor that speaks **AES67 with DNS-SD/SAP discovery and has an NMOS
version complying with IS-04/IS-05**.

### sony-camera-bridge

Sony is the author of both `nmos-cpp` and `nmos-js` (Apache 2.0) — the reference NMOS registry,
node and controller. Anything that needs to speak NMOS to Sony gear has a Sony-written reference
to test against, and `nmos-device-control-mock` and Easy-NMOS to develop against without
hardware. **Sony NS-BUS itself is UNVERIFIED this pass** — no reachable primary source.

### shell / suite

Two shared-service candidates: (a) a **discovery service** in the shell (mDNS/DNS-SD browsing,
NMOS registry client, Dante/AES67 browsing) so cable-planner, multicam-planner and tally-pi all
consume one device list — this directly attacks white-space item 6; (b) `packages/inventory-core`
is the natural home for a NetBox-shaped device/port schema, since `netboxImport.ts` already
depends on that vocabulary.

### pi-media-station

`martim01/pam` is the closest analogue found anywhere in this research: a Pi with a touchscreen
doing AES67/NMOS monitoring under GPL-3.0.

### light-planner

Weakest fit. Art-Net/sACN are also multicast-over-IP and would benefit from the same VLAN and
multicast planning layer, but nothing else in this segment applies.

---

## Sources

Every URL below was **opened and read** in this pass. No search-engine results were used
(the WebSearch budget was exhausted before the task began).

**NetBox and ecosystem**
- https://github.com/netbox-community/netbox
- https://raw.githubusercontent.com/netbox-community/netbox/main/docs/introduction.md
- https://raw.githubusercontent.com/netbox-community/netbox/main/docs/models/ipam/vlan.md
- https://raw.githubusercontent.com/netbox-community/netbox/main/docs/integrations/rest-api.md
- https://github.com/netbox-community/netbox/releases
- https://raw.githubusercontent.com/netbox-community/netbox-topology-views/main/README.md
- https://github.com/orgs/netboxlabs/repositories?type=all
- https://github.com/netboxlabs/orb-agent
- https://raw.githubusercontent.com/netboxlabs/diode/develop/README.md

**Nautobot**
- https://raw.githubusercontent.com/nautobot/nautobot/develop/README.md
- https://github.com/nautobot/nautobot
- https://github.com/nautobot/nautobot-app-device-onboarding

**Other IPAM / DCIM**
- https://raw.githubusercontent.com/phpipam/phpipam/master/README.md
- https://github.com/phpipam/phpipam
- https://github.com/SpriteLink/NIPAP
- https://raw.githubusercontent.com/RackTables/racktables/master/README.md
- https://github.com/opendcim/openDCIM
- https://github.com/i-doit

**Monitoring / discovery**
- https://raw.githubusercontent.com/librenms/librenms/master/README.md
- https://github.com/librenms/librenms
- https://github.com/librenms/librenms/tree/master/doc
- https://github.com/librenms/librenms/tree/master/doc/Support
- https://raw.githubusercontent.com/librenms/librenms/master/doc/Support/Discovery%20Support.md
- https://raw.githubusercontent.com/librenms/librenms/master/doc/Support/Features.md
- https://raw.githubusercontent.com/zabbix/zabbix/master/README.md
- https://raw.githubusercontent.com/Checkmk/checkmk/master/README.md
- https://github.com/Checkmk/checkmk
- https://github.com/netdisco/netdisco
- https://raw.githubusercontent.com/netdisco/netdisco/master/README.md
- https://github.com/netenglabs/suzieq
- https://github.com/aristanetworks/cloudvision-python

**AMWA NMOS specifications and implementations**
- https://github.com/orgs/AMWA-TV/repositories?q=&type=all&sort=name
- https://raw.githubusercontent.com/AMWA-TV/nmos/main/README.md
- https://raw.githubusercontent.com/AMWA-TV/is-04/v1.3.x/README.md
- https://github.com/AMWA-TV/is-04/tree/v1.3.x/docs
- https://raw.githubusercontent.com/AMWA-TV/is-04/v1.3.x/docs/Discovery%20-%20Registered%20Operation.md
- https://raw.githubusercontent.com/AMWA-TV/is-04/v1.3.x/docs/Discovery%20-%20Peer%20to%20Peer%20Operation.md
- https://raw.githubusercontent.com/AMWA-TV/is-04/v1.3.x/docs/Data%20Model.md
- https://raw.githubusercontent.com/AMWA-TV/is-05/v1.1.x/README.md
- https://raw.githubusercontent.com/AMWA-TV/is-06/v1.0.x/README.md
- https://raw.githubusercontent.com/AMWA-TV/is-08/v1.0.x/README.md
- https://raw.githubusercontent.com/AMWA-TV/is-09/v1.0.x/README.md
- https://raw.githubusercontent.com/AMWA-TV/is-12/v1.0.x/README.md
- https://raw.githubusercontent.com/AMWA-TV/is-14/v1.0.x/README.md
- https://raw.githubusercontent.com/AMWA-TV/bcp-002-01/v1.0.x/README.md
- https://raw.githubusercontent.com/AMWA-TV/bcp-008-01/v1.0.x/README.md
- https://raw.githubusercontent.com/AMWA-TV/nmos-testing/master/README.md
- https://github.com/AMWA-TV/nmos-parameter-registers
- https://github.com/AMWA-TV/nmos-device-control-mock
- https://raw.githubusercontent.com/sony/nmos-cpp/master/README.md
- https://github.com/sony/nmos-js
- https://github.com/rhastie/easy-nmos
- https://github.com/NVIDIA/nvnmos

**Broadcast IP vendors and their open artefacts**
- https://github.com/SWR-MoIP/VideoIPath-Automation-Tool
- https://raw.githubusercontent.com/SWR-MoIP/VideoIPath-Automation-Tool/main/README.md
- https://github.com/orgs/SWR-MoIP/repositories?type=all
- https://github.com/bitfocus/companion-module-nevion-videoipath
- https://raw.githubusercontent.com/bitfocus/companion-module-nevion-videoipath/main/companion/HELP.md
- https://github.com/orgs/rossvideo/repositories?type=all
- https://raw.githubusercontent.com/Lawo/ember-plus/master/README.md
- https://github.com/SkylineCommunications/dataminer-docs
- https://github.com/SkylineCommunications/dataminer-docs/tree/main/dataminer
- https://github.com/SkylineCommunications/dataminer-docs/tree/main/dataminer/Frameworks
- https://github.com/SkylineCommunications/dataminer-docs/tree/main/dataminer/Reference
- https://github.com/orgs/SkylineCommunications/repositories?q=docs&type=all

**AV networking, analysis and the small-crew tier**
- https://github.com/bitfocus/companion
- https://github.com/bitfocus/nmos
- https://github.com/bitfocus/companion-module-audinate-dante-ddm
- https://github.com/orgs/bitfocus/repositories?q=nmos&type=all
- https://github.com/orgs/bitfocus/repositories?q=dante&type=all
- https://github.com/orgs/bitfocus/repositories?q=riedel&type=all
- https://github.com/orgs/bitfocus/repositories?q=ndi&type=all
- https://github.com/orgs/bitfocus/repositories?q=lawo&type=all
- https://github.com/orgs/bitfocus/repositories?q=evs&type=all
- https://github.com/orgs/bitfocus/repositories?q=videoipath&type=all
- https://github.com/chris-ritsen/network-audio-controller
- https://github.com/python-zeroconf/python-zeroconf
- https://github.com/DistroAV/DistroAV
- https://github.com/ebu/pi-list
- https://github.com/ebu/smpte2110-analyzer
- https://raw.githubusercontent.com/ebu/awesome-broadcasting/master/README.md
- https://github.com/orgs/ebu/repositories?q=&type=all&sort=stargazers
- https://github.com/nick-prater/kronekeeper
- https://github.com/roddypratt/router_dissectors
- https://github.com/martim01/pam

**Reachability probe**
- https://gitlab.com/explore

### Confirmed blocked this pass (re-run these first)

`netboxlabs.com`, `docs.netbox.dev`, `specs.amwa.tv`, `amwa-tv.github.io`, `www.zabbix.com`,
`www.paessler.com`, `www.auvik.com`, `docs.lawo.com`, `en.wikipedia.org`.

### Not opened — the highest-value re-runs, in order

1. **Pricing, all of it.** `netboxlabs.com/pricing/`, `checkmk.com/pricing`,
   `zabbix.com/support`, `paessler.com/prtg/prtg_pricing`, `auvik.com/pricing/`,
   `i-doit.com/preise`, and the Audinate DDM licensing page. **Nothing in this dossier can be
   quoted as a price until these are opened.**
2. `specs.amwa.tv/nmos` — the rendered spec index, to confirm the current status of **IS-06**
   and what (if anything) replaced it. This determines whether white-space item 3 is a permanent
   gap or a temporary one.
3. `ndi.video` documentation — NDI Discovery Server and NDI's mDNS behaviour are entirely
   unverified here.
4. `audinate.com` — Dante Controller/DDM feature split and the DDM GraphQL API reference.
5. `nevion.com` / Sony — VideoIPath's own API documentation, to confirm the "2023 LTS API"
   surface that SWR's package wraps.
6. `docs.dataminer.services` — DataMiner's NMOS and ST 2110 connector coverage. I browsed the
   docs repo structure but did **not** search inside it; absence of an NMOS page here is
   *not-checked*, not *absent*.
7. `techex.co.uk` and `bridgetech.tv` — both products are in the brief and **nothing** about
   them was verifiable.
8. r/VIDEOENGINEERING, the NetBox and LibreNMS community forums, and the Video Services Forum —
   the "do small crews actually use these?" question is INFERENCE-only in this dossier and
   deserves real evidence.
