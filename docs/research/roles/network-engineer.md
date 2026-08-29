# Broadcast Network / IT Engineers

Research dossier for AV Planner Suite. Compiled 2026-08-29.

> **Method and evidence caveat — read this first.**
>
> **What worked in this session:** `WebSearch` (English and German), and the GitHub MCP tools
> for repository metadata.
>
> **What did not:** `WebFetch` and `curl` were refused by the egress proxy for essentially every
> destination in the brief. Verified `EGRESS_BLOCKED` or proxy-403 this session:
> `reddit.com` and `old.reddit.com` (also explicitly excluded from the search index — the search
> API returns `400: domains are not accessible to our user agent`), `prosoundweb.com`,
> `controlbooth.com`, `blue-room.org.uk`, `thebroadcastbridge.com`, `newscaststudio.com`,
> `film-tv-video.de`, `community.cisco.com`, `docs.ndi.video`, `studio-tech.com`,
> `bluecatnetworks.com`, `forum.blackmagicdesign.com`, `en.wikipedia.org`, `nmos.tv`,
> `specs.amwa.tv`, `audinate.com`. The GitHub API and the GitHub MCP server are scoped to
> `larszu/*` repositories only, so third-party issue trackers could not be read either.
>
> **The consequence, stated plainly.** I could not open a single page in full. What I have
> instead is the search engine's *extraction* from those pages: it returns passages, sometimes
> near-verbatim, from URLs it names. That is a real and citable evidence layer — the passages
> below demonstrably come from ProSoundWeb threads, ControlBooth threads, Blue Room, Church
> Production Magazine, The Broadcast Bridge, production-partner.de and vendor documentation —
> but it is one remove from reading the page, it cannot be quoted verbatim with confidence, and
> **it strips dates**. Where a date could not be established, it says so.
>
> Labels used throughout, extending [`METHOD.md`](../METHOD.md):
>
> - **[EXTRACT]** — a passage from the cited URL was returned to me by the search tool and is
>   paraphrased here. The URL is real and was surfaced by the search index. The page was **not**
>   opened in full. This is the dominant label in this dossier.
> - **[FACT]** — read directly this session (GitHub repository metadata via MCP; files in this
>   repository).
> - **[INFERENCE]** — my reasoning from the above, flagged as reasoning.
> - **[SECOND-HAND]** — carried over from a sibling dossier in this corpus, with its URL so it
>   can be re-verified.
> - **unverified** — could not be established. Left visible rather than quietly dropped.
>
> **Frequency grading is deliberately conservative.** Without the Reddit layer, `widespread` is
> used only where (a) the same failure is documented independently by two or more manufacturers
> *and* appears in practitioner forums, (b) a vendor has shipped a product feature whose only
> purpose is to solve it, or (c) a paid training course exists purely to bridge the gap.
> Several findings that are almost certainly widespread are graded `recurring`.
>
> **Vendor-sourced numbers are marked as such.** Two quantitative claims appear below (a
> "40–50 % of setup time" figure and a "30 % of 2024 deployments" figure). Both originate in
> vendor or vendor-adjacent marketing carried by trade press. They are recorded because they are
> the only numbers on offer, and flagged so nobody quotes them as research.

---

## Who they are / where they sit in the production

### The title is unstable; the shape of the job is not

There is no settled name. English-language job postings surfaced this session advertise the
same work as **Broadcast Network Engineer**, **Senior Staff Broadcast Network Engineer**,
**Field Network Engineer**, **Broadcast Infrastructure Engineer** and **Media Network
Engineer** ([builtin.com](https://builtin.com/job/senior-staff-broadcast-network-engineer/7722587),
[builtin.com field network engineer](https://builtin.com/job/field-network-engineer-entry-intermediate-sr/7763784),
[Indeed](https://www.indeed.com/q-Network-Broadcast-Engineer-jobs.html)) **[EXTRACT]**. In the
German-speaking event market the same person is hired as **Fachkraft für Veranstaltungstechnik
— Schwerpunkt IT-, Netzwerk- und Medientechnik**
([VPLT Jobmarket](https://jobs.vplt.org/de/jobs/fachkraft-fuer-veranstaltungstechnik-mwd-schwerpunkt-it-netzwerk-und-medientechnik/))
**[EXTRACT]** — note that the German posting frames it as an *event technician who also does
networks*, not as a network engineer who happens to work in events. That asymmetry is the
single most important thing to understand about the role in the European event market.

Three configurations recur, and they have genuinely different problems:

**1. Facility / broadcaster staff.** Permanent ST 2110 plant, spine-leaf fabric, an NMOS
registry, a real change-control process. Job postings for this tier ask for Arista EOS and
Cisco Nexus, multicast (PIM, MSDP, Anycast-RP), and explicitly for **NetBox and Confluence** as
the documentation home, with Ansible/Terraform/Jinja2/Git as bonus skills
([Indeed multicast roles](https://www.indeed.com/q-network-engineer-multicast-jobs.html),
[greenhouse posting](https://job-boards.eu.greenhouse.io/isam/jobs/4899571101)) **[EXTRACT]**.
This tier has the best tooling and the least of the problems in this dossier — but it is a
minority of the people doing the work.

**2. OB truck / flypack engineer.** The truck has a fixed internal IP plan that survives between
jobs. Everything *outside* the truck is new every time: the venue, the fibre run, the camera
count, the guest's laptop, the client's Teams call. Adder's OB blog puts the reconfiguration
problem plainly: when a truck moves from a concert to a golf tournament, "the resources within
the vehicle need to be configured accordingly" and traditionally the truck "would need to be
completely reconfigured to meet the requirements of the new job"
([Adder](https://www.adder.com/en/news-media/blogs/ip-based-kvm-outside-broadcasting))
**[EXTRACT]** — a vendor framing, but it names the real cycle.

**3. Event / rental AV networking tech.** Builds a temporary network per show out of a flightcase
of switches. Dante, NDI, sACN/Art-Net, intercom, control and production Wi-Fi all land on the
same small infrastructure. This is the configuration the German sources describe, and it is the
one where the role is most often **a hat rather than a job** — worn by the A1, the systems tech,
the video engineer or the EIC.

### They own the only medium nobody can look at

Every other department produces something a human in the room can verify. Lighting is on the
stage. Audio is in the PA. The camera is on the multiviewer. In an SDI world the network
engineer's equivalent was also verifiable: a cable was either in the socket or it was not.

IP removed that. The Broadcast Bridge states the consequence directly: with a traditional SDI
plant "a traditional system block diagram is often sufficient for troubleshooting", but "with a
modern IP-centric facility, block diagrams are of little use because of the software involved",
and lacking proper documentation "guarantees panic if something fails"
([Documentation Part 2](https://www.thebroadcastbridge.com/content/entry/8680/documentation-part-2-designing-and-documenting-an-ip-architecture))
**[EXTRACT]**. The same article calls keeping a record of "many thousands, and even tens of
thousands of IP addresses describing the device endpoints around a network" a "logistical
nightmare" **[EXTRACT]**.

**[INFERENCE]** That is the structural position of the role: they are the only department whose
work product is invisible, whose failure is instantly visible to everyone, and whose primary
documentation artefact is a spreadsheet that nobody else in the building can read.

### They sit between two professions that do not understand each other

This is not my characterisation. It is the stated rationale of a paid three-day course. The
AVIXA **NAVS — Netzwerktechnik in AV-Systemen** seminar, delivered in Germany by Kern & Stelly,
describes its purpose as giving "AV-Experten die elementaren Kenntnisse der Netzwerktechnik für
eine verständnisvolle Zusammenarbeit und Kommunikation auf Augenhöhe mit der IT" and giving
"IT-Experten das Verständnis für die Besonderheiten von AV-Netzwerken", because "oft fehlen
gegenseitiges Verständnis für die Anforderungen des Gegenübers"
([vt-stage NAVS](https://vt-stage.com/veranstaltungstechnik-weiterbildungskurse/netzwerktechnik-in-av-systemen-navs-2/),
[Kern & Stelly](https://www.kern-stelly.de/profile/event/read/id/2069/)) **[EXTRACT]**.

The Broadcast Bridge says the same thing from the broadcast side: "video engineers need
counterpart network engineers and good communication between them, and an engineer with
experience in both fields is a great asset"
([Three Tips To Accelerate Your IP Deployments](https://www.thebroadcastbridge.com/content/entry/16803/three-tips-to-accelerate-your-ip-st-2110-deployments))
**[EXTRACT]**.

Church Production Magazine documents what happens when the gap is not bridged, in a named
church's own words: deploying Dante "felt very foreign to the IT department", "there wasn't much
clarity around what they actually wanted to use it for or why", and the result was
"discouragement around the idea as a whole and ultimately tension between the IT and production
teams"
([Church Production](https://www.churchproduction.com/magazine/how-to-manage-network-traffic-in-churches-balancing-it-and-a/))
**[EXTRACT]**.

**Frequency: widespread.** Three independent source types — a commercial training curriculum, a
broadcast trade publication, and a house-of-worship practitioner magazine — describe the same
inter-departmental incomprehension as the defining problem of the role.

---

## A day in the life

Chronological. Every stage below is anchored in at least one cited source; where a step is my
reconstruction of how the cited facts fit together, it says **[INFERENCE]**.

### Prep — weeks to days before

**Extend or rebuild the IP plan.** The Broadcast Bridge is explicit about the starting artefact:
"documenting a network begins with a spreadsheet or database combined with a new type of line
drawing" and it "needs to be consistently maintained and updated"
([Documentation Part 2](https://www.thebroadcastbridge.com/content/entry/8680/documentation-part-2-designing-and-documenting-an-ip-architecture))
**[EXTRACT]**. The same source notes that using static addressing "requires maintaining accurate
records of all devices, their IP addresses, and corresponding MAC addresses, which in the past
was often managed through large spreadsheets maintained by engineering teams" **[EXTRACT]** —
the "in the past" is doing a lot of optimistic work there.

For a 2110 job the plan is not one address per device. Every essence is its own multicast flow:
2110-20 video, 2110-30 audio (small in bandwidth, "large in multicast group count"), 2110-40
ancillary, each typically one multicast group, usually with the UDP port left at 20000 across
streams so the **(address, port) pair must be unique per sender**
([Arista M&E Multicast Addressing whitepaper](https://www.arista.com/assets/data/pdf/Whitepapers/ME-Multicast-Addressing-WP.pdf),
[Dataton WATCHOUT ST 2110 docs](https://docs.dataton.com/guide/watchout/network-setup/st-2110-video-over-ip.html))
**[EXTRACT]**. Redundancy doubles it (2022-7 red/blue). **[INFERENCE]** A 12-camera truck is
therefore a several-hundred-row multicast table before a single control or comms address is
allocated.

The scale is not hypothetical: the ST 2110 fit-out of WTTG/WDCA (Fox Television) is described as
roughly 500 physical endpoints carrying 700 redundant video flows, 800 redundant audio flows and
300 redundant ancillary flows
([SMPTE case study](https://www.smpte.org/blog/case-study-implementing-smpte-st-2110-for-a-new-ip-based-local-tv-station))
**[EXTRACT]**.

**Site survey.** The NFHS Network's production site-survey guidance is a good proxy for what
actually gets checked: confirm the internet source, establish whether it is Ethernet or
wireless, and identify "any firewalls that need to be disabled or passwords needed to attain the
proper connection"
([NFHS site survey](http://blog.nfhsnetwork.com/posts/best-practices-for-production-site-survey))
**[EXTRACT]**. Finding the demarc matters and is not always obvious: the demarcation point is
"typically in a location easily accessible to technicians", commonly an outside wall or near an
electrical panel, and for fibre is "a fibre patch panel with SC bulkhead fibre connectors located
in the 'meet me room'"
([Tailwind](https://www.tailwindvoiceanddata.com/blog/demarcation-point-everything-you-need-to-know),
[lawinsider demarcation clause](https://www.lawinsider.com/clause/demarcation-points)) **[EXTRACT]**.

**Negotiate with house IT.** This is where a plan meets an organisation. AV-over-IP design
guidance from three independent directions says the same thing: an AV-specific VLAN "keeps
traffic isolated, prevents interference with other systems, and simplifies troubleshooting", and
"someone from the IT department should work with the consultant and integrator to ensure proper
IP addresses, appropriate switch port connections according to VLAN schemes, and successful
traffic flow between devices"
([Ruckus](https://www.ruckusnetworks.com/blog/2026/why-av-over-ip-needs-an-enterprise-networking-approach/),
[Crestron AV-over-IP network design](https://docs.crestron.com/en-us/9496/Content/Topics/AV-over-IP_Network-Design.htm),
[FinePoint](https://finepoint.tech/five-tips-for-adding-av-over-ip/)) **[EXTRACT]**. The warning
attached to that advice, repeated across the same sources: badly configured multicast "can behave
like a broadcast storm, flooding the network with traffic and taking down unrelated systems"
**[EXTRACT]**. **[INFERENCE]** That sentence is exactly why house IT says no, and why the
network engineer's prep phase is largely a negotiation rather than an engineering task.

**Pre-configure and label kit.** Switches racked, ports described, configs loaded, fibre
labelled. Netgear's AV Line exists as a product because this step is a barrier: the vendor built
web profiles "über die die benötigten Punkte zum Aufbau eines Netzwerks auf einer Veranstaltung
sofort ausgewählt werden können", explicitly so technicians do not have to touch a CLI
([Production Partner Netgear AV-Line test](https://www.production-partner.de/test/netgear-av-line-switch-generation-fuer-av-over-ip-im-test/))
**[EXTRACT]**.

### Load-in

**Rack, patch, power, and then discover.** The first real task on site is reconciling what came
off the truck against what the plan says. Discovery in practice is a stack of unrelated tools:
Dante Controller for anything Dante, NDI Studio Monitor or an NDI Discovery Server for NDI, a
ping sweep or a scanner (Advanced IP Scanner, Fing, nmap) for everything else, and the switch's
own MAC-address table when nothing else works
([Fing tool comparison](https://www.fing.com/news/best-network-scanner-apps/),
[NDI Discovery Server docs](https://docs.ndi.video/all/getting-started/white-paper/discovery-and-registration/discovery-server))
**[EXTRACT]**.

**Fix what came back wrong from the last job.** Dante device names must be unique on a network,
and Audinate's own FAQ describes the collision behaviour: give two devices the same name and
"one of them will retain the name 'Fred' and the other will rename itself as 'Fred(2)'"
([Audinate FAQ](https://www.getdante.com/support/faq/what-happens-if-you-try-to-give-two-dante-devices-the-same-name/))
**[EXTRACT]**. **[INFERENCE]** In a rental fleet where the same stagebox model returns from
three different jobs with three different naming conventions, this is not an edge case, it is
Tuesday.

**Type IP addresses into devices, one device at a time.** This is the single largest
mechanical time cost of the role and it is almost never discussed as a problem because it is
assumed. ProSoundWeb's practical primer for AV techs walks through configuring "the IP address
and the subnet mask" per device on Mac and Windows, and specifically warns that the default
gateway "is typically not necessary for our connections to audio equipment" — a note that only
exists because people keep filling it in
([IP Made Practical](https://www.prosoundweb.com/ip-made-practical-a-straightforward-path-to-successfully-linking-devices/))
**[EXTRACT]**.

### Rehearsal — the intermittent-fault window

This is when the network's disagreements with itself surface. The recurring set, each documented
below in *Error sources*: mDNS discovery not crossing a VLAN so a device pings but does not
appear; IGMP snooping without a querier killing multicast; clock leader flapping; a rogue DHCP
server handing out addresses from somebody's travel router; PTP domain mismatch producing
"random glitches" that are anything but random.

The ControlBooth thread *"Dante — Can Ping cards but Dante Controller isn't seeing them"* is the
canonical shape of this: the devices answered ping "from anywhere", but "mDNS replies weren't
working from all devices everywhere, and mDNS is how Dante handles discovery"
([ControlBooth thread 47261](https://www.controlbooth.com/threads/dante-can-ping-cards-but-dante-controller-isnt-seeing-them.47261/))
**[EXTRACT]**. The thread ran to at least three pages and the eventual fix was capital
expenditure — "300 feet of conduit and 550 feet of fiber" **[EXTRACT]**. Date not established
(unverified); thread ID places it in ControlBooth's late-2010s range.

**[INFERENCE]** Note the diagnostic trap in that thread and why it costs hours: *ping works*.
The single most-used verification tool in AV networking tests the wrong layer for the two
protocols (mDNS discovery, IGMP multicast) that actually carry the show.

### Show

Under time pressure the questions are always the same and always urgent: *what is that device's
IP, which switch port is it on, which VLAN, is the stream actually flowing.* The answer lives in
a spreadsheet on a laptop, in the switch's running config, or in the engineer's head.

Consequence of not answering fast: there is no second take. **[INFERENCE]**

### Load-out

Cables come out, labels come off, the switch configs are usually not saved back anywhere, and
the *as-built* — the network as it actually ended up, after the six changes made during load-in
— evaporates. The next show starts from the plan, not from what was really built.

### Post

As-built documentation "should" be updated. The generic-IT literature on this is unambiguous and
matches what the broadcast sources imply: "network documentation goes stale faster than any other
documentation type, and manual upkeep is structurally impossible at scale", after which "IT stops
referencing it at all, and instead depends on tribal knowledge"
([IT Portal](https://www.itportal.com/blogs/documenting-a-network/)) **[EXTRACT]**. Obelinf puts
the same point about the diagram: "a network topology diagram is the most consulted and the most
quickly outdated document in infrastructure operations"
([Obelinf](https://obelinf.com/blog/network-topology-diagrams-best-practices/)) **[EXTRACT]**.

---

## Tools they actually use

| Tool | For what | How they feel about it |
| --- | --- | --- |
| **Microsoft Excel / Google Sheets** | The IP plan; VLAN table; switch-port map; multicast address plan; Dante channel list | Indispensable and resented. It is the default because nothing else fits the shape of a per-show plan. It is also the thing that is wrong by show day. |
| **Visio / draw.io / Lucidchart** | Topology and rack drawings | Kept by hand, out of date almost immediately. "No easy way to keep it up to date without manual effort, no relationships between diagrams, no clarification between the logical and physical networks" ([Graphical Networks](https://graphicalnetworks.com/blog-documenting-with-visio-or-excel-driving-you-crazy/)) **[EXTRACT]** |
| **NetBox / Nautobot** | Source of truth at facility tier; named explicitly in broadcast job postings alongside Confluence ([Indeed](https://www.indeed.com/q-network-engineer-multicast-jobs.html)) **[EXTRACT]** | Respected when someone feeds it. The known failure mode is structural: "a second source of truth always goes stale, and stale data quietly undermines the new tool" ([BlueCat](https://bluecatnetworks.com/blog/ip-address-spreadsheets/)) **[EXTRACT]** |
| **Dante Controller** | The de-facto discovery, naming, patching and clock-diagnosis tool for anything audio | Universally used, genuinely liked as a patching surface. Also carries the naming and subscription model, which is where several errors originate (below). |
| **Dante Domain Manager / Dante Director** | Enrolment, domains, guest access, access control | Grudging. Trade coverage concedes that "for smaller live systems with a limited number of users, Dante Domain Manager might be too much since a license comes at a cost", which is why subscription tiers were introduced ([SVC on DDM subscriptions](https://www.svconline.com/the-wire/introducing-dante-domain-manager-subscriptions)) **[EXTRACT]**. Where it is deployed, engineers describe real benefit: a guest engineer's Dante desk "up and running within 10 minutes" with scoped access ([ProSoundWeb DHCP-or-static thread](https://forums.prosoundweb.com/index.php?topic=160535.40)) **[EXTRACT]** |
| **NDI Studio Monitor / NDI Discovery Server / NDI Analysis** | Finding NDI sources; forcing discovery across subnets; diagnosing timing | Discovery Server is a workaround they are grateful for and resent needing. It is TCP 5959 and, critically, "if a Discovery Service is specified, then mDNS will not be used" — an all-or-nothing switch ([NDI docs](https://docs.ndi.video/all/getting-started/white-paper/discovery-and-registration/discovery-server)) **[EXTRACT]** |
| **Wireshark** | Packet-level truth when nothing else explains it | Respected, rarely affordable in time. It is a formal module of the German NAVS course ("Netzwerkanalyse-Tools mit Praxisteil in Wireshark") ([vt-stage](https://vt-stage.com/veranstaltungstechnik-weiterbildungskurse/netzwerktechnik-in-av-systemen-navs-2/)) **[EXTRACT]** |
| **Switch CLI / web GUI** (Cisco IOS & Catalyst, Arista EOS, Cisco SG350, Netgear AV Line, Luminex) | VLANs, IGMP querier, QoS/DSCP, PoE, port descriptions | Wildly variable, and the variability itself is a hazard: "if the network uses different types of switches, the configurations may not behave as intended even if set correctly" ([ControlBooth 47261](https://www.controlbooth.com/threads/dante-can-ping-cards-but-dante-controller-isnt-seeing-them.47261/)) **[EXTRACT]**. The SG350 is described on ControlBooth as "the industry standard for Dante" that "poses the least amount of risk" **[EXTRACT]** — i.e. the community's answer to configuration risk is to standardise on one SKU. |
| **Advanced IP Scanner / Fing / nmap** | On-site discovery of what is actually connected | Pragmatic. The documented workflow is exactly this layering: a scanner "to narrow down the problem", then Wireshark for the deep dive ([Fing](https://www.fing.com/news/best-network-scanner-apps/)) **[EXTRACT]** |
| **PTP grandmaster web UIs; 2110 analysers** (EBU LIST, Bridge Technologies VB440, Leader/PHABRIX, Telestream) | Timing and flow validation | Expensive, and the German event-side equivalent is priced out of most rigs: the Production Partner wiki recommends a Fluke EtherScope-class analyser at roughly EUR 8,000 for bandwidth-per-protocol analysis and broadcast-storm identification ([wiki.production-partner.de](https://wiki.production-partner.de/licht/monitoring-und-fehlersuche-im-veranstaltungsnetzwerk/)) **[EXTRACT]** |
| **NMOS registry / controller** (AMWA IS-04/IS-05; vendor controllers) | Discovery, registration and cross-vendor connection management for 2110 | Aspirational. `AMWA-TV/nmos-testing` — the reference conformance tool — was created 2018-10-23, was last updated 2026-08-14 and carries **101 open issues** **[FACT, GitHub MCP]**. Practitioner-facing analysis is blunt: "the hardest part of implementing NMOS in a real ST 2110/IPMX environment is usually not the APIs themselves — but making discovery, connection management, timing, and monitoring work reliably across mixed-vendor devices and subnets", and "implementations vary in interpretation of optional parameters" ([Promwad, 2026](https://promwad.com/news/nmos-is04-is05-av-system-integration-2026)) **[EXTRACT]** |
| **Bitfocus Companion** | The button surface the whole gallery drives; a consumer of every IP in the plan | It hard-binds to addresses. `companion#3193`: Companion "doesn't detect and rebind service to new IP if bound interface's address changes", with "Launch GUI" still opening the old IP after a restart; `companion-satellite#135`: after changing the IP in the Satellite web UI "the satellite works until the next reboot, when it falls back to the old companion server IP" ([#3193](https://github.com/bitfocus/companion/issues/3193), [satellite#135](https://github.com/bitfocus/companion-satellite/issues/135), [satellite#171](https://github.com/bitfocus/companion-satellite/issues/171)) **[EXTRACT]** |
| **Confluence / SharePoint / OneNote** | Where documentation is supposed to live | Named in job postings next to NetBox ([Indeed](https://www.indeed.com/q-network-engineer-multicast-jobs.html)) **[EXTRACT]**. **[INFERENCE]** For freelance and rental-side engineers there is no such system at all; the equivalent is a folder of XLSX files named `IP-Plan_v3_FINAL_neu.xlsx`. |
| **WhatsApp** | Where the current version of the plan actually is | See *Paper / Excel / WhatsApp inventory*. |
| **Label printer** (Brother P-touch class) | The only documentation that is physically attached to the thing it documents | The one artefact everybody trusts. Cabling guidance is consistent that "each end of cables should be neatly and permanently labeled with location identification and port number" ([Auvik network documentation best practices](https://www.auvik.com/franklyit/blog/network-documentation-best-practices/)) **[EXTRACT]** |

---

## Time sinks

Ranked by my assessment of total hours across a production, with the evidence for each.

### 1. Typing addresses into devices, one device at a time

**Frequency: widespread. Time cost: hours per show, days on a large build.**

There is no bulk-provisioning path for most AV endpoints. Each device is configured through its
own front panel, its own web UI, or its own vendor application. ProSoundWeb's primer exists to
teach AV technicians how to do exactly this per-device dance on Mac and Windows
([IP Made Practical](https://www.prosoundweb.com/ip-made-practical-a-straightforward-path-to-successfully-linking-devices/))
**[EXTRACT]**.

The only field-sourced quantification I found is vendor-adjacent and must be read as such:
Production Partner's Milan article reports that "laut Nutzerfeedback aus dem Feld ... Techniker
bis zu 40–50 Prozent ihrer Setup-Zeit für Netzwerk-Engineering aufgewendet haben — Zeit, die mit
Milan wieder der eigentlichen Beschallungsaufgabe zugutekommt"
([Production Partner, Milan](https://www.production-partner.de/allgemein/milan-ein-kabel-kein-kompromiss/))
**[EXTRACT]**. This is an Avnu/Milan positioning claim carried by trade press, with no
methodology given. **Do not quote it as research.** Discount it heavily and it still says the
network share of setup time is large enough that a standards body built a marketing campaign on
removing it.

### 2. Building and maintaining the IP plan spreadsheet

**Frequency: widespread. Time cost: hours per project, recurring.**

The Broadcast Bridge names the spreadsheet as the *starting point* of network documentation and
in the same breath calls maintaining tens of thousands of endpoint records "a logistical
nightmare"; it also explicitly frames NMOS as the escape route, "reducing the need to keep reams
of spreadsheets that need manual intervention to keep them up to date"
([Documentation Part 2](https://www.thebroadcastbridge.com/content/entry/8680/documentation-part-2-designing-and-documenting-an-ip-architecture))
**[EXTRACT]**.

The generic-IT literature identifies the specific failure modes that also apply here: "human
error, concurrent edits across geographies, access-control dilemmas, inability to represent
complex architectures", and the mechanical limit that "Excel starts choking around 50,000 rows"
([BlueCat](https://bluecatnetworks.com/blog/ip-address-spreadsheets/),
[SimpleIPAM](https://simpleipam.com/blog/excel-ip-management)) **[EXTRACT]**.

### 3. Reconciling the plan against what is actually on the network

**Frequency: widespread. Time cost: hours per load-in.**

**[INFERENCE]** Every load-in contains a reconciliation pass that nobody schedules: what came
off the truck, under which names, with which addresses, versus what the plan says. The evidence
is indirect but consistent — Dante's automatic `Fred(2)` renaming
([Audinate](https://www.getdante.com/support/faq/what-happens-if-you-try-to-give-two-dante-devices-the-same-name/))
**[EXTRACT]**, the existence of scanner-to-IPAM bridges built specifically to close this gap
(`lopes/netbox-scanner`, 206 stars, an nmap/Cisco-Prime-to-NetBox reconciler) **[FACT, GitHub
MCP]**, and the configuration-drift literature's finding that teams eventually "lose trust in
their documentation" and fall back on tribal knowledge
([IT Portal](https://www.itportal.com/blogs/documenting-a-network/)) **[EXTRACT]**.

### 4. Multicast / IGMP / discovery debugging

**Frequency: widespread. Time cost: minutes to hours, always at the worst moment.**

This is the best-documented time sink in the corpus because manufacturers have had to write
about it. Shure's knowledge base has a dedicated article on Dante and IGMP snooping; Audinate has
one on multiple leader clocks; both name IGMP snooping as a cause of *devices not appearing in
Dante Controller* and of *multiple leader clocks*
([Shure](https://service.shure.com/articles/en_US/Knowledge/dante-networks-and-igmp-snooping),
[Audinate multiple leader clocks](https://support.getdante.com/hc/en-gb/articles/5285123768607-Multiple-Leader-Clocks))
**[EXTRACT]**.

The practitioner forums describe the same thing more viscerally: "turning on IGMP snooping on
certain switches can disable 100 % of the Dante multicast traffic and kill it dead"; "only one
IGMP querier should be turned on"; and Audinate tech support is reported as recommending making
switches "neutral" — no DHCP serving, no multicast filtering, no IGMP snooping — as the safe
default
([Blue Room, Dante switch performance](https://www.blue-room.org.uk/topic/60090-dante-switch-performance-and-issues/),
[ControlBooth 47261](https://www.controlbooth.com/threads/dante-can-ping-cards-but-dante-controller-isnt-seeing-them.47261/))
**[EXTRACT]**. Dates unverified.

**[INFERENCE]** Note the contradiction the engineer is standing in the middle of: the audio
vendor's field advice is *turn multicast management off*, and the video/2110 side cannot work
without it. On a shared event network those two pieces of advice are mutually exclusive, and
resolving that per venue is unpaid design work.

### 5. Negotiating with house IT / venue IT

**Frequency: widespread in event and corporate work, recurring in broadcast. Time cost: days of elapsed time, hours of effort.**

There is no standard artefact for this handover — no agreed form, no schema. The AV-over-IP
design literature prescribes the *content* (VLANs, IP ranges, multicast support, switch
capability, QoS) and prescribes a joint testing session, but prescribes no document
([Crestron](https://docs.crestron.com/en-us/9496/Content/Topics/AV-over-IP_Network-Design.htm),
[Ruckus](https://www.ruckusnetworks.com/blog/2026/why-av-over-ip-needs-an-enterprise-networking-approach/))
**[EXTRACT]**. Church Production's practical recommendation is a *monthly standing meeting*
between AV and IT **[EXTRACT]** — an organisational workaround for a missing document.

### 6. Renaming and re-labelling gear returning from other jobs

**Frequency: recurring, approaching widespread in rental fleets. Time cost: minutes per device, hours per fleet.**

Dante names are up to 31 characters, case-insensitive, must be unique, and duplicates get
auto-suffixed
([Audinate](https://www.getdante.com/support/faq/what-happens-if-you-try-to-give-two-dante-devices-the-same-name/),
[Organize It: Naming Dante Devices](https://www.getdante.com/blog/organize-it-naming-dante-devices/))
**[EXTRACT]**.

The evidence that this is painful enough to route around is the workaround Audinate itself
documents: save a Dante preset, **open the XML in a plain-text editor, find-and-replace the
device name across all instances, and redeploy the preset** so that "devices [get] new names
with subscriptions remaining in place"
([Audinate, channel labels FAQ](https://support.getdante.com/hc/en-gb/articles/5453986486175-How-are-labels-assigned-to-channels))
**[EXTRACT]**. **[INFERENCE]** When the manufacturer's official advice for a routine operation is
"hand-edit our XML", that operation has no product surface. That is a missing feature stated in
the clearest possible terms.

### 7. Producing documentation for other people

**Frequency: widespread. Time cost: hours, and it is the first thing cut.**

AV commissioning guidance lists what a handover pack should contain — "as-built drawings,
equipment serial numbers, DSP settings, and test results", plus "VLAN requirements, bandwidth
considerations for audio/video streaming, potential QoS settings, and IP addresses for each
device"
([Zapperr AV commissioning checklist](https://zapperrav.com/av-commissioning-checklist-for-system-integrators/),
[OneDiversified](https://onediversified.com/insights/blog/mastering-av-network-integration-strategies-for-seamless-installations))
**[EXTRACT]**. The same literature concedes the gap: "even minor documentation gaps can lead to
installation errors, project delays and costly site work"
([XTEN-AV](https://xtenav.com/blog/commercial-av-installation-documentation/)) **[EXTRACT]**.

### 8. Answering "what's the IP of X?" mid-show

**Frequency: widespread. Time cost: minutes each, dozens of times, at maximum stress.**

**[INFERENCE]** No source documents this directly — it is too mundane to write about — but it is
the necessary consequence of every finding above: the plan is in a spreadsheet on one laptop, the
truth is in the switch, and the person asking is on comms.

### 9. Per-event switch reconfiguration

**Frequency: recurring. Time cost: an hour to a day.**

Adder describes trucks historically needing complete reconfiguration between job types and
positions presets as the fix **[EXTRACT]**; Netgear ships AV profiles so integrators can "start
projects directly with confidence that all network settings are correct"
([Production Partner](https://www.production-partner.de/test/netgear-av-line-switch-generation-fuer-av-over-ip-im-test/))
**[EXTRACT]**. **[INFERENCE]** Two vendors independently productising "don't reconfigure it by
hand every time" is decent evidence that people were reconfiguring it by hand every time.

### 10. PTP commissioning and re-commissioning

**Frequency: recurring at facility/truck tier. Time cost: days at commissioning; unbounded when it goes wrong later.**

The failure mode is uniquely expensive because it is silent: misconfigured PTP shows up as
"random glitches that are anything but random", and design/commissioning errors can produce
"months or years of unexplained on-air glitches and gremlins"
([Keycode Media, PTP Done Right for ST 2110](https://www.keycodemedia.com/ptp-done-right-for-st-2110-wp/))
**[EXTRACT]**. A vendor blog claims "30 % of 2024 deployments reporting PTP issues"
([Packetstorm](https://packetstorm.com/understanding-smpte-2110-timing-and-synchronization/))
**[EXTRACT]** — **vendor marketing, no methodology, treat as unverified.**

---

## Double data entry

The same identity — *this device, this address, this name* — has to be entered into a startling
number of independent systems. Enumerated, with what breaks when they diverge:

| # | System | What gets typed | What breaks when it drifts |
| --- | --- | --- | --- |
| 1 | **The device itself** (front panel / web UI / vendor app) | IP, mask, gateway, hostname | Nothing until something else disagrees with it |
| 2 | **The IP plan spreadsheet** | Everything | The plan silently stops describing reality |
| 3 | **The topology diagram** (Visio / draw.io) | Boxes, links, sometimes addresses | The diagram lies; troubleshooting starts from a false map |
| 4 | **The switch config** | Port description, VLAN, DHCP reservation, static ARP, ACL | Port descriptions are the *only* on-switch documentation; when stale, tracing a cable becomes physical |
| 5 | **DHCP / DNS** | Reservations, hostnames | Duplicate addresses; "accidentally assigning duplicate addresses to two computers could freeze up part of your network" ([TechTarget](https://www.techtarget.com/searchnetworking/tip/How-to-avoid-duplicate-IP-addresses-in-a-network)) **[EXTRACT]** |
| 6 | **NMOS registry / broadcast control system** | Device, sender, receiver, flow identities and labels | Router panel labels stop matching what is actually routed |
| 7 | **Monitoring** (PRTG / Zabbix / LibreNMS / vendor) | Host, address, thresholds | Alerts point at the wrong thing |
| 8 | **Dante Controller** | Device names, channel labels, subscriptions, presets | Subscriptions break on rename — see below |
| 9 | **Companion / control surfaces** | Target IPs per connection | Buttons stop working; see `companion#3193` |
| 10 | **Multiviewer / UMD / tally** | Source labels tied to inputs | The operator sees a name that is not the source |
| 11 | **Rental / inventory system** (Rentman and similar) | Asset, serial, barcode | The asset record knows nothing about hostname or address, so a last-minute swap invalidates the IP plan invisibly |
| 12 | **Cable / patch documentation** | Panel, port, cable ID | The physical and logical plans diverge |
| 13 | **The handover / as-built pack** | All of the above, again, as PDF | Ships wrong, gets filed, is never corrected |

### The Dante rename trap — a concrete double-entry cost

Audio channel names are the audio department's property. Device names and addresses are the
network engineer's. They collide inside one tool, and Audinate documents the sharp edge:
**subscriptions made against custom transmit-channel names "will fail if the channel is
subsequently renamed" on devices with firmware 4.3 or later**
([Audinate](https://support.getdante.com/hc/en-gb/articles/5508295730335-What-Happens-To-Existing-Subscriptions-When-I-Rename-A-Transmit-Channel-In-Dante-Controller))
**[EXTRACT]**.

**[INFERENCE]** So the A1 tidying channel labels during rehearsal can silently break the patch
the network engineer built that morning, and neither of them has a document that says so.

### The 2110 double entry: SDP

Without NMOS, connecting a 2110 sender to a receiver "requires manual multicast address
configuration on both endpoints"
([Promwad](https://promwad.com/news/guide-what-you-need-to-know-about-nmos-is-04-05-building-an-av-system))
**[EXTRACT]**. The mitigations that exist are copy-paste: WATCHOUT "generates its own SDP when
the output starts, and you can copy that SDP and paste it into any receiver to configure it in
one step", and the documentation states outright that "SDP is the fastest and least error-prone
path when the sender provides one" — the alternative being that "you type the sender's stream
parameters into the form"
([Dataton WATCHOUT](https://docs.dataton.com/guide/watchout/network-setup/st-2110-video-over-ip.html),
[disguise IP-VFC](https://help.disguise.one/hardware/ip-vfc/ip-vfc-st2110)) **[EXTRACT]**.

**[INFERENCE]** "Least error-prone" is vendor language for "the manual path produces errors". The
manual path is a human transcribing a multicast address, a port, a payload type and a timing
model between two web UIs, several hundred times per truck.

---

## Error sources

Ordered by how often the sources return to them.

### Duplicate or conflicting IP addresses

**Frequency: widespread. Consequence: intermittent, hard to attribute, can take down a segment.**

Manual record-keeping is named as the direct cause: paper lists or spreadsheets "had to be
manually updated when you added, deleted, or moved a network device", with "a high probability
for mistakes", and duplicate addresses "could freeze up part of your network"
([TechTarget](https://www.techtarget.com/searchnetworking/tip/How-to-avoid-duplicate-IP-addresses-in-a-network))
**[EXTRACT]**. The specific double-entry hazard is called out: static assignments must be
recorded so they are not "duplicat[ed] ... in other manual configurations or the DHCP services
on the network" **[EXTRACT]**.

### Subnet / mask mismatch — "it pings from here but not from there"

**Frequency: widespread. Consequence: partial connectivity, misdiagnosed as a hardware fault.**

ProSoundWeb's guidance for touring rigs is explicit about the trap: "if the subnet mask is
255.255.255.0, the first three octets have to match, whereas with 255.0.0.0 they can differ",
and all devices must share the same mask
([ProSoundWeb](https://www.prosoundweb.com/ip-made-practical-a-straightforward-path-to-successfully-linking-devices/))
**[EXTRACT]**. ControlBooth has a standing thread titled *Dante over different subnets*
([37025](https://www.controlbooth.com/threads/dante-over-different-subnets.37025/)), and
ProSoundWeb has at least two — *Dante Virtual Soundcard Subnet Issue*
([162890](https://forums.prosoundweb.com/index.php?topic=162890.0)) and *Dante Subnet Issue*
([172578](https://forums.prosoundweb.com/index.php?topic=172578.0)) **[EXTRACT]**.

### Mixed DHCP and static schemes on the same fabric

**Frequency: widespread. Consequence: link-local addresses, devices invisible to each other.**

The manufacturer documentation is consistent and slightly contradictory across vendors, which is
itself the problem. Dante devices default to DHCP and, absent a server, "will assign itself an
APIPA address in the range of 169.254.0.1 through 169.254.255.254"
([RDL](https://rdlnet.com/articles/setting-ip-addresses-of-dante-devices/)) **[EXTRACT]**. Green-GO
behaves the same way — dynamic by default, falling back to `169.254.x.x/16`
([Green-GO network guide](https://manual.greengoconnect.com/en/guides/network/)) **[EXTRACT]**.
SSL recommends fixed addresses for all Dante devices on the secondary network of an SSL Live
system "unless a DHCP server is present", while also noting DHCP is the preferred Dante method
([SSL](https://livehelp.solidstatelogic.com/Help/LANs/LAN-012/LAN012LiveConsoleIPAddressConfiguration.html))
**[EXTRACT]**. NDI's own certification guidance pushes the other way: a device "must get an
address from the DHCP server out of the box — static can be an option but must not be set when
the user receives the device"
([NDI interoperability requirements](https://docs.ndi.video/all/developing-with-ndi/ndi-certified/certification-guidelines/interoperability-requirements))
**[EXTRACT]**.

Studio Technologies' tech note names the operative failure: "trouble can occur when not all
devices have been assigned IP addresses using the same scheme"
([Studio Technologies](https://studio-tech.com/tech-notes/troubleshooting-dante-ip-address-configuration/))
**[EXTRACT]**.

**[INFERENCE]** Four manufacturers, four different defaults, one shared cable. The engineer's job
is to impose one scheme across gear whose vendors each recommend a different one — and to
document which decision was made, because the next engineer will assume the vendor default.

### IGMP snooping without a querier / with two queriers

**Frequency: widespread. Consequence: total multicast loss, or clock instability.**

Shure and Audinate both document it; ProSoundWeb, Blue Room and ControlBooth all describe hitting
it. Symptoms named by the vendors: devices missing from Dante Controller, information missing in
Dante Controller, and more than one leader clock
([Shure](https://service.shure.com/articles/en_US/Knowledge/dante-networks-and-igmp-snooping),
[Audinate](https://support.getdante.com/hc/en-gb/articles/5285123768607-Multiple-Leader-Clocks))
**[EXTRACT]**. Forum-reported behaviour on real hardware: IGMP snooping "killed all multicast
traffic" on one switch **[EXTRACT]**.

### mDNS not crossing VLANs — the "ping works, discovery doesn't" trap

**Frequency: widespread. Consequence: hours of misdirected troubleshooting.**

"mDNS uses link-local multicast and normally stays within one LAN, which means it doesn't cross
VLAN boundaries by default", so "in large broadcast facilities with segmented networks,
traditional mDNS discovery doesn't cross subnet boundaries"
([NDI Discovery Server docs](https://docs.ndi.video/all/getting-started/white-paper/discovery-and-registration/discovery-server),
[Callaba](https://callaba.io/ndi-network-ports-discovery)) **[EXTRACT]**. And the diagnostic that
matters most: "discovery and media are separate; the source may register correctly while the
chosen media transport or port range is blocked" **[EXTRACT]**.

vMix's own knowledge base states the two-line version of the same trap: "you may receive a blank
NDI input if the source device or PC is on a different subnet to the vMix PC", and "for best
results with NDI, the PC running vMix should only be connected to one network at a time"
([vMix KB 129](https://www.vmix.com/knowledgebase/article.aspx/129/diagnosing-blank-ndi-inputs))
**[EXTRACT]**. The vMix forum carries recurring threads on it: *Intermittent NDI Discovery
Issues*, *Can't see Local NDI sources*, *NDI — doesn't get detected*
([t33614](https://forums.vmix.com/posts/t33614-Intermittent-NDI-Discovery-Issues),
[t29297](https://forums.vmix.com/posts/t29297-Can-t-see-Local-NDI-sources),
[t21239](https://forums.vmix.com/posts/t21239-NDI---doesn-t-get-detected)) **[EXTRACT]**.

### NDI and Dante on the same fabric

**Frequency: recurring. Consequence: mutual interference, or an infrastructure requirement nobody budgeted.**

NDI's documentation concedes the operational reality: "running Dante and NDI in different
networks or VLANs is always the recommended choice but this sometimes requires complex network
infrastructure that is not always feasible"
([NDI docs](https://docs.ndi.video/all/using-ndi/using-ndi-with-software/using-ndi-and-dante-on-the-same-network))
**[EXTRACT]**.

### PTP domain mismatch

**Frequency: recurring, rising with 2110/AES67 mixing. Consequence: silent, long-lived, extremely expensive to find.**

"Devices visible on the same multicast media fabric but locked to different PTP domains" produce
"a receiver receiving packets yet media timing being wrong", and the mismatch is "especially
common when ST 2110 and AES67 devices are used together", because SMPTE ST 2059-2 commonly uses
default domain 127 while AES67 commonly uses domain 0
([Keycode Media](https://www.keycodemedia.com/ptp-done-right-for-st-2110-wp/)) **[EXTRACT]**. The
same source insists failover testing "should happen during commissioning, not only during
planned maintenance" **[EXTRACT]**.

**[INFERENCE]** The PTP domain number is a single integer that belongs in the plan and almost
never is in it — because a spreadsheet of IP addresses has no column for it.

### Multicast address collisions and L2 aliasing

**Frequency: recurring at 2110 scale. Consequence: unexplained cross-talk between unrelated flows.**

Arista's whitepaper documents the mechanism: the five bits that do not survive the L3-to-L2
mapping mean "32 (2^5) possible layer 3 IP addresses ... map to the same L2 MAC address", and
"it's best to design a multicast addressing scheme to avoid these unwanted aliases"
([Arista M&E Multicast Addressing](https://www.arista.com/assets/data/pdf/Whitepapers/ME-Multicast-Addressing-WP.pdf))
**[EXTRACT]**.

**[INFERENCE]** This is a rule that a human allocating addresses in Excel will violate without
ever knowing, and that a tool could enforce trivially.

### Device-name collisions

**Frequency: recurring. Consequence: broken subscriptions, wrong routes, confusion under pressure.**

Covered above. `Fred` and `Fred(2)`. **[EXTRACT]**

### Rogue DHCP servers

**Frequency: recurring. Consequence: whole segments get wrong addresses mid-rehearsal.**

The mitigation is well known outside AV — DHCP snooping on the switch, so that "if a new DHCP
server suddenly appears, it can be flagged as rogue" — and the detection tooling is standard
(Wireshark, dedicated discovery tools)
([LinkedIn advice article](https://www.linkedin.com/advice/0/what-best-techniques-detect-rogue-dhcp-servers-rnlac),
[NetScanTools](https://www.netscantools.com/nstpro_dhcp.html)) **[EXTRACT]**. **[INFERENCE]** On a
temporary event network built in a day, DHCP snooping is usually not configured, and the rogue
server is a crew member's travel router or a laptop with internet sharing left on.

### Control-layer address drift

**Frequency: recurring. Consequence: buttons stop working, and the failure looks like the target device.**

Companion's issue tracker documents it from three angles: the service not rebinding when the
bound interface's address changes (`companion#3193`), Satellite not showing buttons after an IP
change until USB is re-seated or Companion is restarted (`companion-satellite#171`), and the
Satellite reverting to the old server IP on reboot (`companion-satellite#135`) **[EXTRACT]**.

### Configuration drift between plan and plant

**Frequency: widespread. Consequence: every other error above becomes harder to diagnose.**

"Small undocumented changes accumulate into major operational risk"; without drift detection
"teams lose trust in their documentation"
([Broadcom/LogicVein/IBM configuration-drift literature](https://logicvein.com/blog-and-news/configuration-drift/))
**[EXTRACT]**.

### What the errors cost

**[INFERENCE]**, but bounded by the sources above: in a live production the consequences are
black frame, silence, lost comms, or a rehearsal that does not happen. The Broadcast Bridge's
phrase for the state this produces is "hair on fire" panic, and its stated remedy is
documentation
([Documentation Part 2](https://www.thebroadcastbridge.com/content/entry/8680/documentation-part-2-designing-and-documenting-an-ip-architecture))
**[EXTRACT]**. There is no undo and no second take.

---

## Paper / Excel / WhatsApp inventory

Being specific, as asked. Confidence flagged per item.

### Paper

| Document | Evidence |
| --- | --- |
| **Printed IP / port sheet taped inside the rack door or on the switch case lid** | **[INFERENCE]**, strongly implied. Network-documentation guidance prescribes "diagrams or photos of racks that identify key components, along with a simplified network diagram and a static IP address table" ([Auvik](https://www.auvik.com/franklyit/blog/network-documentation-best-practices/)) **[EXTRACT]**; the live-event practice of printing it and attaching it to the rack is not directly documented in the sources I could reach — **unverified**, though universally observed in the field. |
| **Physical cable and port labels** | Prescribed: "each end of cables should be neatly and permanently labeled with location identification and port number" ([Auvik](https://www.auvik.com/franklyit/blog/network-documentation-best-practices/)) **[EXTRACT]**. Equipment labels carrying "owner, switch name, IP address, and contact information" ([UW-Madison KB 24112](https://kb.wisc.edu/24112)) **[EXTRACT]** |
| **Site-survey notes** | The NFHS survey guidance describes making "a physical or mental list of items that need to be buttoned up beforehand" ([NFHS](http://blog.nfhsnetwork.com/posts/best-practices-for-production-site-survey)) **[EXTRACT]** — note "or mental". |
| **Crew network-access sheet** (SSID, password, address range, what not to plug in) | Implied by FOX's World Cup requirement that "all the hundreds of freelancers and staff members understand how to access the network and prevent problems" ([SVG, 2026-07-07](https://www.sportsvideo.org/2026/07/07/how-fox-built-a-world-class-network-infrastructure-for-the-fifa-world-cups-unique-demands/)) **[EXTRACT]**. The *form* this takes is **unverified**. |

### Excel

| Spreadsheet | Evidence |
| --- | --- |
| **The IP plan** — subnet, VLAN, device, IP, MAC, switch port, location, purpose | Named as the starting artefact of network documentation ([Broadcast Bridge](https://www.thebroadcastbridge.com/content/entry/8680/documentation-part-2-designing-and-documenting-an-ip-architecture)) **[EXTRACT]** |
| **Switch port assignment sheet** ("Switch-Port-Belegung") | A German commercial template exists and specifies its columns: "Switch-Port-Nummern, verbundene Geräte, Gerätetypen, MAC-Adressen, IP-Adressen, VLAN-Zuordnungen und Dienstbezeichnungen" ([vorlagesheet.com](https://vorlagesheet.com/switch-port-belegung/)) **[EXTRACT]**. Templates exist because the demand is real. |
| **VLAN table, one tab per switch, ports as columns, VLANs as rows** | Described as common practice on a German networking forum: "simple Excel-Tabellen ... bei denen jeder Reiter einen Switch darstellt, innerhalb jedes Reiters jeder Port als Spalte und jedes VLAN als Zeile" ([LANCOM-Forum](https://www.lancom-forum.de/lancom-allgemeine-fragen-f23/vlan-dokumentieren-t14665.html), [MCSEboard](https://www.mcseboard.de/topic/206179-netzwerkdoku-vorlagen/)) **[EXTRACT]** |
| **General network-documentation workbook** — Netzwerkübersicht, Topologie, IP-Adressierung, Komponenten, Dienste, Sicherheit, Diagramme; VLAN sheets carrying "VLAN ID, Netzmaske, DHCP, DNS, IP-Bereiche und Geräte mit festen IPs" | Multiple German commercial templates ([vorlagen.com](https://vorlagen.com/excel/excel-vorlage-fuer-netzwerkdokumentation-und-it-inventar/), [de.vorlagesheet.com](https://de.vorlagesheet.com/netzwerkdokumentation/)) **[EXTRACT]** |
| **Multicast address plan for 2110** | **[INFERENCE]** from the Arista and WATCHOUT/disguise material on per-flow address and port uniqueness — the constraint has to be tracked somewhere, and NMOS is not universally deployed. |
| **Dante channel / patch list** | **[INFERENCE]**; the Dante-preset XML find-and-replace workaround ([Audinate](https://support.getdante.com/hc/en-gb/articles/5453986486175-How-are-labels-assigned-to-channels)) **[EXTRACT]** is what people do when the list lives outside the tool. |
| **Fibre / copper cable schedule** | Cross-referenced from the sibling dossier [`landscape/technical-planning.md`](../landscape/technical-planning.md) **[SECOND-HAND]** |

### WhatsApp and email

| Practice | Evidence |
| --- | --- |
| **The IP plan is emailed as XLSX or PDF, then a corrected version is posted in the crew WhatsApp group, and the group becomes the newest version of the truth** | **[INFERENCE]** for the AV-specific case — I could not reach a source documenting it in production. What *is* documented is why it is corrosive: WhatsApp groups give "no visibility if the person managing the group leaves, no handoff for new team members, and no audit trail for what was sent, when, or by whom", and new joiners "do not get access to any history, meaning that the benefits of using chat systems to share information in a way that can be accessed in future is lost" ([Silk Helix](https://www.silkhelix.co.uk/blog/whatsapp-groups-for-work/)) **[EXTRACT]** |
| **Screenshots of Dante Controller, the switch front panel, or an ipconfig window as the shared record** | **unverified**, universally observed, no reachable source. |

**[INFERENCE]** The pattern across all three columns is the same: the authoritative artefact is
always the *least structured* one available. Paper beats Excel because it is physically attached
to the hardware. WhatsApp beats email because it is faster. Excel beats a database because it
does not need anyone's permission. Every one of those choices is rational, and every one of them
destroys the information after the show.

---

## Missing interfaces

Where the handover between departments breaks. These are the seams AV Planner Suite could
actually own.

### 1. System design → network design: the switch is not on the drawing

The single most quotable finding in this dossier, from a house-of-worship integration
practitioner: **"Everything connects to a network switch — something the schematics don't show,
and as a result the integrator has to figure all that out on site as they go along"**
([Church Production](https://www.churchproduction.com/churchdesign/well-connected-designing-future-proof-church-av-networks/))
**[EXTRACT]**.

The Broadcast Bridge states the same failure at facility scale from the other direction: block
diagrams "are of little use" for an IP plant **[EXTRACT]**.

**Frequency: widespread.** **[INFERENCE]** The signal-flow drawing and the network drawing are
two documents describing the same cable, produced by two people, in two tools, and neither is
derived from the other. Everything downstream in this dossier follows from that one break.

### 2. Cable / patch plan → IP plan: no shared device identity

**[INFERENCE]**, but forced by the evidence. The same camera appears as a device in the cable
plan, a line in the rack elevation, a row in the IP plan, an asset in the rental system, a name
in Dante Controller and a label on a multiviewer — six identities, no key. This is the
mechanical cause of the double-entry table above.

### 3. AV ↔ house IT: there is no request artefact

Covered above. The design literature prescribes the content and the joint test session but no
document; the industry's answer is a training course (NAVS) and a monthly meeting (Church
Production). **Frequency: widespread.**

### 4. Network engineer ↔ audio (A1/A2)

Dante channel labels belong to audio; device names and addresses belong to the network. They live
in one tool and interact destructively — renaming a transmit channel breaks existing
subscriptions on firmware 4.3+
([Audinate](https://support.getdante.com/hc/en-gb/articles/5508295730335-What-Happens-To-Existing-Subscriptions-When-I-Rename-A-Transmit-Channel-In-Dante-Controller))
**[EXTRACT]**. **Frequency: recurring.**

### 5. Network engineer ↔ lighting

sACN and Art-Net universes, priorities, and broadcast-versus-unicast behaviour are lighting
decisions with direct network consequences. ControlBooth carries threads on lighting network
changes and on ETC RPU IP conflicts
([Lighting Network Changes](https://www.controlbooth.com/threads/lighting-network-changes.49484/),
[ETC RPU IP conflict](https://www.controlbooth.com/threads/etc-rpu-ip-conflict.37463/))
**[EXTRACT]**, and the touring convention that ETC gear lives at `10.101.x.x/16` is folklore
carried in the same forums **[EXTRACT]** — a per-manufacturer address convention that the IP plan
has to accommodate but rarely records as a rule. **Frequency: recurring.**

### 6. Network engineer ↔ control / graphics / media servers

Companion configs, media-server presets and control macros hard-code addresses; when the address
plan changes, they break silently. See `companion#3193` and the Satellite issues **[EXTRACT]**.
**Frequency: recurring.**

### 7. Network engineer ↔ rental / logistics

**[INFERENCE]** The rental system knows serial numbers; the IP plan knows hostnames. A last-minute
substitution of one stagebox for another identical one is invisible to the IP plan and to the
Dante subscription set. Cross-reference: [`landscape/event-rental-management.md`](../landscape/event-rental-management.md)
**[SECOND-HAND]**. **Frequency: recurring.**

### 8. Truck / venue → freelance crew

FOX's World Cup build is the clearest statement of the requirement: the architecture is
irrelevant unless "all the hundreds of freelancers and staff members understand how to access the
network and prevent problems"
([SVG, 2026-07-07](https://www.sportsvideo.org/2026/07/07/how-fox-built-a-world-class-network-infrastructure-for-the-fifa-world-cups-unique-demands/))
**[EXTRACT]**. **[INFERENCE]** There is no standard artefact for this either. **Frequency: recurring.**

### 9. Site → office: nothing flows back

The as-built never returns to the plan. This is the drift problem, and it is why the next show
starts from a document that was already wrong at the end of the last one
([IT Portal](https://www.itportal.com/blogs/documenting-a-network/),
[LogicVein](https://logicvein.com/blog-and-news/configuration-drift/)) **[EXTRACT]**.
**Frequency: widespread.**

---

## What they would want

Restricted to wishes that are *stated* in the sources — as an explicit request, as a
user-invented workaround, or as a feature a vendor built in response to demand. My own ideas are
in the next section, clearly separated.

### 1. A documentation system where the diagram is derived, not redrawn

"The strongest option is a tool where the diagram derives from your infrastructure documentation,
so you never redraw a connection you already documented"
([Obelinf](https://obelinf.com/blog/network-topology-diagrams-best-practices/)) **[EXTRACT]**.
The complaint it answers is specific: Visio's three headaches are "no easy way to keep it up to
date without manual effort, no relationships between diagrams, and no clarification between the
logical and physical networks"
([Graphical Networks](https://graphicalnetworks.com/blog-documenting-with-visio-or-excel-driving-you-crazy/))
**[EXTRACT]**.

### 2. To stop maintaining "reams of spreadsheets"

The Broadcast Bridge names this as the industry's stated motivation for NMOS: a central database
of routing, formats, sources and destinations, "thus reducing the need to keep reams of
spreadsheets that need manual intervention to keep them up to date"
([Documentation Part 2](https://www.thebroadcastbridge.com/content/entry/8680/documentation-part-2-designing-and-documenting-an-ip-architecture))
**[EXTRACT]**.

### 3. Switch configuration by profile, not by CLI

Netgear built exactly this and Production Partner describes why: web profiles so the required
settings "zum Aufbau eines Netzwerks auf einer Veranstaltung sofort ausgewählt werden können",
letting integrators "start projects directly with confidence that all network settings are
correct"
([Production Partner](https://www.production-partner.de/test/netgear-av-line-switch-generation-fuer-av-over-ip-im-test/))
**[EXTRACT]**. Adder built the truck-side equivalent: "technicians [can] program pre-set
configurations", and after one project the truck "can be easily configured in situ using the
presets"
([Adder](https://www.adder.com/en/news-media/blogs/ip-based-kvm-outside-broadcasting)) **[EXTRACT]**.

### 4. Bulk rename / templating for repeat shows

The strongest single piece of evidence for an unmet need in this dossier: Audinate's own official
advice is to save a preset, open the XML in a text editor, find-and-replace the device name, and
redeploy
([Audinate](https://support.getdante.com/hc/en-gb/articles/5453986486175-How-are-labels-assigned-to-channels))
**[EXTRACT]**. Users are hand-editing XML because there is no bulk-rename surface.

### 5. Less per-device address entry

The entire Milan/AVB pitch, and the NDI Discovery Server, exist to reduce manual per-device
network work
([Production Partner](https://www.production-partner.de/allgemein/milan-ein-kabel-kein-kompromiss/),
[NDI docs](https://docs.ndi.video/all/getting-started/white-paper/discovery-and-registration/discovery-server))
**[EXTRACT]**.

### 6. A shared language with IT

The NAVS course's stated goal — communication with IT "auf Augenhöhe" — is the wish, and the fact
that people pay for three days of training to get it is the measure of how badly it is wanted
([vt-stage](https://vt-stage.com/veranstaltungstechnik-weiterbildungskurse/netzwerktechnik-in-av-systemen-navs-2/))
**[EXTRACT]**. Church Production's version is procedural: a monthly standing AV/IT meeting, and
the flat statement that "in order for collaboration to work, there also has to be documentation
in addition to communication"
([Church Production](https://www.churchproduction.com/magazine/how-to-manage-network-traffic-in-churches-balancing-it-and-a/))
**[EXTRACT]**.

### 7. Failover and timing tested at commissioning, not on show day

"Even when a PTP design looks correct on a diagram, it should not be trusted without testing, and
failover testing should happen during commissioning, not only during planned maintenance"
([Keycode Media](https://www.keycodemedia.com/ptp-done-right-for-st-2110-wp/)) **[EXTRACT]**.

### 8. Scoped guest access without rebuilding the network

The DDM anecdote is the shape of the wish: a guest engineer arrives with a Dante desk, is asked
which endpoints they need, those are added to a guest domain, "and they were up and running
within 10 minutes while maintaining control of their access"
([ProSoundWeb](https://forums.prosoundweb.com/index.php?topic=160535.40)) **[EXTRACT]**.

---

## Implications for AV Planner Suite

Cable Planner already has issues in flight that touch this territory — `#346` IP budget, `#347`
ST 2110 signal paths, `#348` PTP/sync, `#365` NMOS IS-04/IS-05 modelling, `#221` off-page /
network references **[FACT, read this session via GitHub MCP on `larszu/cable-planner`]**. The
research below should sharpen those rather than add to them.

### The strategic read

**[INFERENCE]** The defining finding is *Missing interface #1*: the schematic does not show the
switch. AV Planner Suite already owns the schematic. That is an unusually strong position,
because the thing this role most needs is not another IPAM — NetBox exists and is better than
anything we would build — but a **network layer on the drawing that already exists**, sharing one
device identity with the cable plan and the inventory.

The correct ambition is therefore: **be the plan, not the plant.** Own design-time truth and the
handover artefacts. Do not attempt to own runtime.

### Recommendations, in priority order

**1. One device, many facets — including NICs.**
Model the network side as facets of the *same* device record the cable plan already holds. This
kills rows 1, 2, 3, 11, 12 and 13 of the double-entry table in one move.

Critically: **AV devices have multiple NICs and modelling one IP per device is wrong.** A single
stagebox routinely has Dante primary and secondary; a 2110 device has red and blue media
interfaces plus a separate control interface; a camera has control, tally and media paths. The
data model needs `Device 1—n NetworkInterface`, each with address, mask, VLAN, switch, switch
port, MAC, role (`media-primary` / `media-secondary` / `control` / `management`).

**2. Subnet and VLAN allocation with conflict detection.**
Address-range templates that can be layered — a truck's standing plan, plus a per-venue overlay —
with duplicate-address and mask-mismatch detection at edit time. Evidence: duplicate addresses
and mask mismatches are the two most-cited error classes above.

**3. Multicast plan generation for ST 2110, with the rules built in.**
Enforce `(multicast address, UDP port)` uniqueness per sender, and *avoid L2 aliases* per the
Arista rule (32 L3 addresses collapse to one L2 MAC). This is a rule a human in Excel violates
blind and a tool enforces for free. Generate the per-flow table from the signal flow the user has
already drawn — video, audio and ancillary essences, doubled for 2022-7 redundancy.

**4. First-class timing fields.**
PTP domain number, grandmaster, boundary-clock topology, profile (ST 2059-2 vs AES67). One
integer — the domain — is a documented silent killer when 2110 and AES67 meet, and no
spreadsheet template in the German source set has a column for it. Ties directly to `#348`.

**5. Export artefacts that other departments actually consume.**
This is where the suite can beat a real IPAM, because a real IPAM has no idea who the audio
department is. Ship, from one model:
- a **printable rack-door sheet** (device, IP, VLAN, switch, port) sized for A4 in a rack door;
- a **switch port map** per switch;
- a **VLAN table**;
- **per-department subsets** — the A1 gets Dante devices and channel names; lighting gets sACN
  universes and gateway addresses; the control operator gets the list of addresses their
  Companion config depends on;
- a **house-IT request pack**: VLANs needed, address ranges, multicast requirement, IGMP querier
  expectation, DHCP scope, bandwidth per link, PoE budget, port count. There is no standard
  artefact for this today (Missing interface #3) and producing one is cheap.

**6. Import from the network, to show the delta.**
The answer to "what is stale by show day" is a reconciliation view. Accept a Dante Controller
export, an ARP/MAC table, an LLDP dump, or a plain CSV from a scanner, and render **plan versus
found**: unexpected devices, missing devices, address mismatches, name mismatches. Precedent
exists (`lopes/netbox-scanner`, 206 stars, nmap-to-NetBox reconciliation) **[FACT, GitHub MCP]**.
This is the single highest-value feature in this dossier and nothing in the AV planning market
does it.

**7. Naming-convention engine with bulk apply.**
Generate device and channel names from a rule (`role-location-number`), validate uniqueness and
the 31-character Dante limit, and export a rename set. The proof of demand is Audinate telling
users to find-and-replace in XML.

**8. Show-mode: fast answers under pressure.**
A read-only, searchable, offline view — type a name or a partial IP, get device, address, VLAN,
switch, port, rack, and what depends on it. This is the mid-show question, and today it is
answered by scrolling a spreadsheet.

**9. Lean on offline-first.**
On site there is often no usable internet — the whole reason the demarc and the venue circuit are
a survey item. Cloud IPAM is unreachable exactly when the plan is needed. The suite is already
offline-first with local project files **[FACT, `README.md`]**; for this role that is not a
philosophical stance, it is the differentiator.

### What we should NOT build

**[INFERENCE]**, stated as required by `METHOD.md`:

- **Not an IPAM/DDI.** No DHCP or DNS integration, no live address leasing. NetBox, phpIPAM and
  the DDI vendors own this and the second-source-of-truth failure mode is documented
  ([BlueCat](https://bluecatnetworks.com/blog/ip-address-spreadsheets/)) **[EXTRACT]**.
- **Not live monitoring.** Do not draw a green dot next to a device. A planning tool that appears
  to show live state will be trusted mid-show and will be wrong. Reconciliation is a deliberate,
  timestamped, user-initiated import — never a live feed.
- **Not switch configuration push.** Generating a *draft* config or a port-description list to
  paste is defensible; pushing config to production switches is not our risk to carry.
- **Not an NMOS controller.** Modelling NMOS senders/receivers for planning (`#365`) is right.
  Becoming a runtime IS-05 controller is a different product with a different liability profile,
  and the conformance surface alone is 101 open issues deep **[FACT, GitHub MCP]**.

---

## Sources

Every URL below was surfaced by the search index in this session and had content extracted from
it by the search tool. **No page was opened in full** — see the method caveat at the top.
GitHub repository metadata marked **[FACT]** was read directly via the GitHub MCP server.

### Broadcast trade press and technical publications

- https://www.thebroadcastbridge.com/content/entry/8680/documentation-part-2-designing-and-documenting-an-ip-architecture
- https://www.thebroadcastbridge.com/content/entry/16803/three-tips-to-accelerate-your-ip-st-2110-deployments
- https://www.thebroadcastbridge.com/content/entry/6303/understanding-ip-broadcast-production-networks-basic-principles-of-ip
- https://www.thebroadcastbridge.com/content/entry/6416/understanding-ip-broadcast-production-networks-host-configuration
- https://www.thebroadcastbridge.com/content/entry/6365/understanding-ip-broadcast-production-networks-routers-and-switches
- https://www.thebroadcastbridge.com/content/entry/20303/designing-ip-broadcast-systems-addressing-packet-delivery
- https://www.thebroadcastbridge.com/content/entry/20128/designing-ip-broadcast-systems-part-1-ip-network-design-principles
- https://www.thebroadcastbridge.com/content/entry/20505/designing-ip-broadcast-systems-part-3-designing-for-everyday-operation
- https://www.thebroadcastbridge.com/content/entry/12375/implementing-ptp-aka-smpte-st-2110-10
- https://www.thebroadcastbridge.com/content/entry/21347/broadcast-standards-the-nmos-standards-deep-dive
- https://www.thebroadcastbridge.com/content/entry/12629/ebu-claims-world-first-for-all-ip-ob-truck
- https://thebroadcastknowledge.com/2020/12/14/video-proper-network-designs-and-considerations-for-smpte-st-2110/
- https://www.sportsvideo.org/2026/07/07/how-fox-built-a-world-class-network-infrastructure-for-the-fifa-world-cups-unique-demands/
- https://www.sportsvideo.org/2018/10/03/case-study-arista-powers-nep-uks-smpte-st-2110-ob-trucks-for-uhd-delivery/
- https://www.svgeurope.org/blog/headlines/tvm-opts-for-arista-networks-switches-in-new-ob10-truck/
- https://www.newscaststudio.com/2026/03/10/inside-the-ob-truck-display-production-technology-that-keeps-up-with-the-action/
- https://www.tvbeurope.com/live-production/the-battle-for-attention-technology-and-connectivity-at-fifa-world-cup-2026
- https://broadcastmgmt.com/live-production/live-production-eic/
- https://www.mobiletvgroup.com/news/behind-the-scenes-eic/
- https://www.smpte.org/blog/case-study-implementing-smpte-st-2110-for-a-new-ip-based-local-tv-station
- https://www.smpte.org/smpte-st-2110-faq
- https://ipshowcase.org/wp-content/uploads/2019/10/1000-Fundamentals-of-IP-in-Broadcast-Production.pdf
- https://www.keycodemedia.com/ptp-done-right-for-st-2110-wp/
- https://packetstorm.com/understanding-smpte-2110-timing-and-synchronization/ *(vendor blog; the "30 % of 2024 deployments" figure comes from here and is unverified)*
- https://wsts.atis.org/session/how-to-troubleshoot-commission-and-monitor-smpte-st-2059-ptp-systems-for-the-broadcast-tv-industry/
- https://leaderphabrix.com/understanding-the-fundamentals-of-ptp-and-smpte-st-2110/
- https://muratdemirci.com.tr/en/st2110-television-campus/
- https://www.networksolutionshamburg.de/post/multicast-with-2110

### Practitioner forums

- https://www.controlbooth.com/threads/dante-can-ping-cards-but-dante-controller-isnt-seeing-them.47261/ (and pages 2 and 3)
- https://www.controlbooth.com/threads/dante-over-different-subnets.37025/
- https://www.controlbooth.com/threads/yamaha-cl-series-dante-network-setting-a-static-ip.44012/
- https://www.controlbooth.com/threads/dante-network-with-x32-2-m32s-and-a-d400-aviom-switch-audio-popping.47679/
- https://www.controlbooth.com/threads/pfc-can-i-get-a-couple-extra-eyeballs-on-a-dante-problem.49260/
- https://www.controlbooth.com/threads/switch-recommendation.45141/
- https://www.controlbooth.com/threads/lighting-network-changes.49484/
- https://www.controlbooth.com/threads/etc-rpu-ip-conflict.37463/
- https://www.controlbooth.com/threads/i-wanna-learn-networking-for-lighting.41236/
- https://www.blue-room.org.uk/topic/60090-dante-switch-performance-and-issues/
- https://www.blue-room.org.uk/topic/73985-dante-help/
- https://forums.prosoundweb.com/index.php?topic=160535.40 *(DHCP or STATIC?)*
- https://forums.prosoundweb.com/index.php?topic=160685.0 *(Need emergency Dante help; search index reported 2016-09)*
- https://forums.prosoundweb.com/index.php?topic=172578.0 *(Dante Subnet Issue)*
- https://forums.prosoundweb.com/index.php?topic=162890.0 *(Dante Virtual Soundcard Subnet Issue)*
- https://forums.prosoundweb.com/index.php?topic=171792.0 *(QL1 Dante Static IP)*
- https://forums.prosoundweb.com/index.php?topic=154261.0 *(Mixed traffic on Dante subnet?)*
- https://forums.prosoundweb.com/index.php?topic=170845.10 *(Dante Clock Issues)*
- https://forums.prosoundweb.com/index.php?topic=148384.0 *(IP Addresses & Routers — Help, I am an Audio Dummy)*
- https://www.prosoundweb.com/ip-made-practical-a-straightforward-path-to-successfully-linking-devices/
- https://www.prosoundweb.com/audio-network-essentials-the-wonderful-world-of-ip-addresses/
- https://www.prosoundweb.com/an-introduction-to-audio-networking/2/
- https://www.prosoundweb.com/constructing-the-network-talking-about-av-networking-with-specialist-ricki-cook/
- https://www.prosoundweb.com/consoles-spending-practices-ip-addresses-answering-church-sound-questions-from-readers/
- https://forums.vmix.com/posts/t33614-Intermittent-NDI-Discovery-Issues
- https://forums.vmix.com/posts/t29297-Can-t-see-Local-NDI-sources
- https://forums.vmix.com/posts/t21239-NDI---doesn-t-get-detected
- https://www.lancom-forum.de/lancom-allgemeine-fragen-f23/vlan-dokumentieren-t14665.html
- https://www.mcseboard.de/topic/206179-netzwerkdoku-vorlagen/
- https://www.computerbase.de/forum/threads/dokumentieren-eines-neuen-netzwerkes.1864779/

### Manufacturer and standards documentation

- https://service.shure.com/articles/en_US/Knowledge/dante-networks-and-igmp-snooping
- https://support.getdante.com/hc/en-gb/articles/5285123768607-Multiple-Leader-Clocks
- https://support.getdante.com/hc/en-gb/articles/5453986486175-How-are-labels-assigned-to-channels
- https://support.getdante.com/hc/en-gb/articles/5508295730335-What-Happens-To-Existing-Subscriptions-When-I-Rename-A-Transmit-Channel-In-Dante-Controller
- https://support.getdante.com/hc/en-gb/articles/5508296187807-How-are-audio-routes-tied-to-device-and-channel-names
- https://support.getdante.com/hc/en-gb/articles/5508266360223-DDM-Dante-devices-not-appearing-in-DDM
- https://www.getdante.com/support/faq/what-happens-if-you-try-to-give-two-dante-devices-the-same-name/
- https://www.getdante.com/blog/organize-it-naming-dante-devices/
- https://www.getdante.com/blog/nothing-shows-up/
- https://www.getdante.com/products/network-management/dante-domain-manager/
- https://www.getdante.com/wp-content/uploads/2025/11/Tips-for-Live-Sound.pdf
- https://www.svconline.com/the-wire/introducing-dante-domain-manager-subscriptions
- https://rdlnet.com/articles/setting-ip-addresses-of-dante-devices/
- https://studio-tech.com/tech-notes/troubleshooting-dante-ip-address-configuration/
- https://livehelp.solidstatelogic.com/Help/LANs/LAN-012/LAN012LiveConsoleIPAddressConfiguration.html
- https://mx.yamaha.com/es/products/contents/proaudio/docs/dante_network_design_guide/301_multicast.html
- https://docs.ndi.video/all/getting-started/white-paper/discovery-and-registration/discovery-server
- https://docs.ndi.video/all/using-ndi/using-ndi-with-software/using-ndi-and-dante-on-the-same-network
- https://docs.ndi.video/all/developing-with-ndi/ndi-certified/certification-guidelines/interoperability-requirements
- https://callaba.io/ndi-network-ports-discovery
- https://www.vmix.com/knowledgebase/article.aspx/129/diagnosing-blank-ndi-inputs
- https://www.vmix.com/knowledgebase/article.aspx/288/how-to-run-ndi-analysis
- https://manual.greengoconnect.com/en/guides/network/
- https://manual.greengoconnect.com/en/troubleshooting/
- https://www.riedel.net/fileadmin/user_upload/800-downloads/06.0-Manuals-Intercom/Riedel_Connect_IP_Manual_v2_0_EN.pdf
- https://docs.dataton.com/guide/watchout/network-setup/st-2110-video-over-ip.html
- https://docs.dataton.com/guide/watchout/network-setup/setting-up-st-2110.html
- https://help.disguise.one/hardware/ip-vfc/ip-vfc-st2110
- https://www.arista.com/assets/data/pdf/Whitepapers/ME-Multicast-Addressing-WP.pdf
- https://www.arista.com/assets/data/pdf/Whitepapers/ME-PTP-White-Paper.pdf
- https://docs.crestron.com/en-us/9496/Content/Topics/AV-over-IP_Network-Design.htm
- https://specs.amwa.tv/nmos/branches/main/docs/FAQ.html
- https://promwad.com/news/nmos-is04-is05-av-system-integration-2026
- https://promwad.com/news/guide-what-you-need-to-know-about-nmos-is-04-05-building-an-av-system

### German-language sources

- https://www.production-partner.de/allgemein/milan-ein-kabel-kein-kompromiss/ *(source of the 40–50 % setup-time figure; vendor-adjacent)*
- https://www.production-partner.de/test/netgear-av-line-switch-generation-fuer-av-over-ip-im-test/
- https://www.production-partner.de/basics/netzwerke-digitale-uebertragung-von-audiosignalen/
- https://www.production-partner.de/basics/audionetzwerk-avb-milan/
- https://www.production-partner.de/allgemein/digitalisierung-beim-wacken-open-air/
- https://wiki.production-partner.de/licht/monitoring-und-fehlersuche-im-veranstaltungsnetzwerk/
- https://www.professional-system.de/features/netzwerkmanagement-fuer-dante-systeme/
- https://www.professional-system.de/basics/das-dante-netzwerk/
- https://www.professional-system.de/tests/wozu-braucht-man-den-dante-domain-manager/
- https://www.film-tv-video.de/technology/2017/04/05/echtes-broadcast-ip-wird-realitaet/ *(2017-04-05)*
- https://www.film-tv-video.de/technology/2020/03/11/ip-basierte-infrastrukturen-mut-oder-wahnsinn/ *(2020-03-11)*
- https://www.film-tv-video.de/equipment/2022/11/22/messgeraet-von-bridge-technologies-fuer-die-ueberwachung-und-analyse/
- https://www.film-tv-video.de/equipment/2024/10/24/broadcast-solutions-techniktrends-der-branche/
- https://jobs.vplt.org/de/jobs/fachkraft-fuer-veranstaltungstechnik-mwd-schwerpunkt-it-netzwerk-und-medientechnik/
- https://vt-stage.com/veranstaltungstechnik-weiterbildungskurse/netzwerktechnik-in-av-systemen-navs-2/
- https://vt-stage.com/veranstaltungstechnik-weiterbildungskurse/netzwerktechnik-in-av-systemen/
- https://www.kern-stelly.de/profile/event/read/id/2069/
- https://www.event-akademie.de/event-akademie/kurse/ict-seminarbeschreibung-26.pdf
- https://vorlagesheet.com/switch-port-belegung/
- https://de.vorlagesheet.com/netzwerkdokumentation/
- https://vorlagen.com/excel/excel-vorlage-fuer-netzwerkdokumentation-und-it-inventar/
- https://www.mothergrid.de/broadcast/broadcast-solutions-baut-riesigen-ue-wagen/
- https://eventelevator.de/broadcast/broadcast-solutions-und-wdr-entwickeln-hoerfunkwagen/

### AV integration and house-of-worship press

- https://www.churchproduction.com/magazine/how-to-manage-network-traffic-in-churches-balancing-it-and-a/
- https://www.churchproduction.com/magazine/avoiding-network-congestion-why-it-and-production-teams-must/
- https://www.churchproduction.com/churchdesign/well-connected-designing-future-proof-church-av-networks/
- https://www.churchproduction.com/churchdesign/the-designer-s-primer-on-audio-networking/
- https://www.ruckusnetworks.com/blog/2026/why-av-over-ip-needs-an-enterprise-networking-approach/
- https://finepoint.tech/five-tips-for-adding-av-over-ip/
- https://www.imagsystems.com/post/understanding-multicast-in-av-over-ip-applications
- https://onediversified.com/insights/blog/mastering-av-network-integration-strategies-for-seamless-installations
- https://xtenav.com/blog/commercial-av-installation-documentation/
- https://zapperrav.com/av-commissioning-checklist-for-system-integrators/
- https://ccsmidatlantic.com/what-goes-into-a-successful-av-integration-project-an-inside-look-at-design-documentation-and-installation-workflows/
- https://www.adder.com/en/news-media/blogs/ip-based-kvm-outside-broadcasting
- https://www.cheqroom.com/blog/outside-broadcasting-all-you-need-to-know/

### Network documentation, IPAM and drift literature

- https://bluecatnetworks.com/blog/ip-address-spreadsheets/
- https://bluecatnetworks.com/resources/api-driven-ipam/
- https://simpleipam.com/blog/excel-ip-management
- https://obelinf.com/blog/network-topology-diagrams-best-practices/
- https://obelinf.com/blog/how-to-migrate-from-excel-to-a-real-ipam-dcim/
- https://graphicalnetworks.com/blog-documenting-with-visio-or-excel-driving-you-crazy/
- https://graphicalnetworks.com/blog-how-do-i-switch-from-visio-diagrams-to-automated-network-documentation/
- https://www.itportal.com/blogs/documenting-a-network/
- https://logicvein.com/blog-and-news/configuration-drift/
- https://www.auvik.com/franklyit/blog/network-documentation-best-practices/
- https://www.auvik.com/franklyit/blog/network-configuration-drift/
- https://www.techtarget.com/searchnetworking/tip/How-to-avoid-duplicate-IP-addresses-in-a-network
- https://netboxlabs.com/blog/network-operations-strategy-audit-ready/
- https://netboxlabs.com/docs/netbox/features/ipam/
- https://kb.wisc.edu/24112
- https://www.fing.com/news/best-network-scanner-apps/
- https://www.netscantools.com/nstpro_dhcp.html
- https://www.linkedin.com/advice/0/what-best-techniques-detect-rogue-dhcp-servers-rnlac
- https://www.silkhelix.co.uk/blog/whatsapp-groups-for-work/
- http://blog.nfhsnetwork.com/posts/best-practices-for-production-site-survey
- https://www.tailwindvoiceanddata.com/blog/demarcation-point-everything-you-need-to-know

### Job postings and role definitions

- https://builtin.com/job/senior-staff-broadcast-network-engineer/7722587
- https://builtin.com/job/field-network-engineer-entry-intermediate-sr/7763784
- https://builtin.com/job/broadcast-engineer-1-year-contract/4564229
- https://www.indeed.com/q-Network-Broadcast-Engineer-jobs.html
- https://www.indeed.com/q-network-engineer-multicast-jobs.html
- https://job-boards.eu.greenhouse.io/isam/jobs/4899571101
- https://careers.rtdna.org/career/broadcast-engineer/job-descriptions
- https://www.teamworkonline.com/multiple-properties/kroenkesportsjobs/kroenke-sports---entertainment/engineer-in-charge-eic-2126135

### GitHub (repository metadata read directly via MCP; issue text via search index)

- https://github.com/AMWA-TV/nmos-testing — created 2018-10-23, updated 2026-08-14, 101 open issues **[FACT]**
- https://github.com/AMWA-TV/sdpoker — 14 open issues **[FACT]**
- https://github.com/rhastie/easy-nmos **[FACT]**
- https://github.com/netbox-community/netbox **[FACT]**
- https://github.com/lopes/netbox-scanner — 206 stars, nmap/Cisco-Prime → NetBox reconciliation **[FACT]**
- https://github.com/nautobot/nautobot **[FACT]**
- https://github.com/phpipam/phpipam **[FACT]**
- https://github.com/cvicente/Netdot **[FACT]**
- https://github.com/bitfocus/companion/issues/3193 **[EXTRACT]**
- https://github.com/bitfocus/companion-satellite/issues/135 **[EXTRACT]**
- https://github.com/bitfocus/companion-satellite/issues/171 **[EXTRACT]**
- https://github.com/bbc/nmos-joint-ri **[EXTRACT]**
- https://github.com/larszu/cable-planner/issues/365 — existing NMOS modelling issue in this project **[FACT]**

### Sibling dossiers referenced

- [`docs/research/METHOD.md`](../METHOD.md)
- [`docs/research/landscape/technical-planning.md`](../landscape/technical-planning.md)
- [`docs/research/landscape/event-rental-management.md`](../landscape/event-rental-management.md)
- [`docs/research/roles/streaming-engineer.md`](./streaming-engineer.md)
- [`docs/research/roles/audio-engineer.md`](./audio-engineer.md)
