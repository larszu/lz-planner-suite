# Streaming / REMI Engineers

Research dossier for AV Planner Suite. Compiled 2026-08-28.

> **Method and evidence caveat — read this first.**
>
> This session began with its `WebSearch` budget already exhausted (200/200 calls consumed
> before the first query), and the egress proxy refused CONNECT to every destination except
> `github.com`, `raw.githubusercontent.com`, `api.github.com` and `gitlab.com`. Reddit,
> ProSoundWeb, Control Booth, the Blackmagic forum, the vMix forum, videohelp, obsproject.com,
> help.twitch.tv, haivision.com, srtalliance.org, liveu.tv, teradek.com, TVBEurope, The
> Broadcast Bridge, NewscastStudio, Wikipedia, Stack Overflow, YouTube and **every**
> German-language source (film-tv-video.de, production-partner.de, VPLT) returned `000` or a
> proxy 403. Search-engine gateways are blocked as well.
>
> The consequence is the same as for the sibling dossiers in this corpus: **the forum-venting
> layer is missing**, and with it most of the direct evidence about paper, Excel and WhatsApp.
> What replaces it here is unusually good for *this particular role*, because the streaming/REMI
> toolchain is disproportionately open source and its users file issues in public. Almost every
> claim below is anchored in an issue or a README **that I opened and read in this session**,
> written by a person describing their own production.
>
> Labels used throughout, following [`METHOD.md`](../METHOD.md):
>
> - **[FACT]** — stated in a page I opened and read in full this session (GitHub issue body,
>   README, or protocol documentation). Dated and attributable.
> - **[SECOND-HAND]** — a claim carried over from a sibling dossier in this corpus
>   ([`technical-director.md`](./technical-director.md),
>   [`camera-operator.md`](./camera-operator.md), [`workflow-chain.md`](../workflow-chain.md)),
>   collected in an earlier session that had search access. The URL is given so it can be
>   re-verified; in this session it is one remove from the source.
> - **[INFERENCE]** — my reasoning from the facts, flagged as reasoning.
> - **unverified** — could not be established here. Left visible rather than quietly dropped.
>
> **Frequency grades are deliberately conservative.** With no forum layer, `widespread` is used
> only where either (a) several *independent* projects exist for no purpose other than to solve
> the problem, or (b) the vendor/maintainer concedes it. Several findings that are probably
> widespread are graded `recurring`.
>
> **Dates matter here.** The streaming stack moves fast. Anything from before ~2022 is marked,
> and where a complaint is old but the issue is still open, that is stated — an issue left open
> for four years is itself evidence.

---

## Who they are / where they sit in the production

There is no settled title. The same job is advertised and self-described as **streaming
engineer**, **encoding engineer**, **transmission engineer**, **broadcast IT**, **REMI operator**
or **at-home operator**, and in German-speaking productions as *Streaming-Techniker* or
*Encoder-Verantwortlicher* (unverified — the German-language sources could not be reached this
session). What is consistent is the shape of the role, and the shape explains everything else in
this document.

**They sit at the end of the chain and own the part nobody else can see.** Every other
department produces something a human in the room can verify: the lighting is on the stage, the
audio is in the PA, the camera is on the multiviewer. The streaming engineer's output exists
only somewhere else — on a platform's CDN, in a viewer's browser, on a client's Teams call. The
practical result appears verbatim in an OBS bug report from a working production:

> "So we were streaming. Then all of a sudden the stream stops there is no indication on OBS
> that this is occuring. The onyl way to know is to monitor the live stream simultaneously."
> — [obs-studio#11016](https://github.com/obsproject/obs-studio/issues/11016), 2024-07, macOS,
> OBS 30.2.0 **[FACT]**

That sentence is the role in one line: **the tool that is doing the work cannot tell you whether
the work is arriving**, so the engineer builds a second, parallel apparatus whose only job is to
watch the first one.

**In REMI they own a second invisible thing: the path between two buildings.** Remote
Integration Model production — cameras and a small crew at the venue, the gallery/control room
somewhere else — turns what used to be an internal SDI problem into a public-internet problem.
The sibling dossier records that the camera-control landscape has explicitly reorganised around
this: Cyanview's RIO gateway is positioned for "REMI and unreliable networks", with a separate
WAN licence tier
([`landscape/camera-control-rcp.md`](../landscape/camera-control-rcp.md)) **[SECOND-HAND]**. The
streaming engineer is the person who has to make that WAN behave.

**Team size determines whether this is a job or a hat.** Three configurations recur in the
evidence:

| Configuration | Who does it | What the evidence looks like |
| --- | --- | --- |
| Broadcast / large corporate | A dedicated transmission or encoding engineer, sometimes a whole IP team | Companion module requests for rack encoders (Haivision KB, Wowza Clearcaster, Matrox Maevex) — these are appliances nobody buys for a one-person show **[FACT]** |
| Mid-size event / agency | The TD or video engineer wearing the streaming hat | [`camera-operator.md`](./camera-operator.md) records job descriptions collapsing "live switcher, and a stream engineer" into one line **[SECOND-HAND]** |
| Church, school, club, IRL, single-operator | One person, entirely | Church/PTZ/StreamYard module requests ([companion-module-requests#777](https://github.com/bitfocus/companion-module-requests/issues/777)); the whole IRL tooling ecosystem **[FACT]** |

**The dependency map is brutally asymmetric.** They depend on: the switcher's programme output,
the audio department's mix (and its mix-minus), graphics, the rundown, the venue's internet, the
client's platform credentials, and the platform itself. Nothing depends on them until it fails,
at which point everything does. [INFERENCE] This is why the role's tooling is so heavily biased
toward *monitoring and automatic fallback* rather than toward *planning* — the planning tools
were never built, so the engineer compensates downstream.

---

## A day in the life

Chronological. Each stage is anchored where evidence exists; stages that rest on reasoning are
marked.

### Prep (days to weeks out)

**Collecting destinations and credentials.** The first real task is not technical: it is getting
the list of where the stream must go and the credentials for each. For a corporate job that means
the client's YouTube, LinkedIn, a Vimeo or Kaltura enterprise endpoint, sometimes a customer's
own RTMP ingest; for church/HoW it is YouTube plus Facebook plus a website player; for IRL it is
one platform plus a personal relay. The evidence that this is a *collection and re-entry* problem
rather than a lookup is everywhere in the multi-destination tooling — see
[Double data entry](#double-data-entry).

**Deciding the transport and building the encoder profile.** RTMP(S) to the platform is a given;
the contribution leg (venue → gallery, or camera → studio) is increasingly SRT, SRTLA (bonded
SRT) or RIST. This is where the first large, invisible time sink lives, because the parameters
are not obvious and the official guidance is inconsistent — see
[Time sinks §2](#2-tuning-srtbonding-parameters-against-documentation-that-contradicts-itself).

**Provisioning connectivity.** For bonded cellular: SIMs, data plans, carrier diversity, and —
if the encoder is a BELABOX-class Linux box — operating-system-level network configuration. The
upstream project states the prerequisite plainly:

> "The sender needs to have [source routing](https://tldp.org/HOWTO/Adv-Routing-HOWTO/lartc.rpdb.simple.html)
> configured, as srtla uses `bind()` to map UDP sockets to a given connection. Only Linux is
> supported"
> — [BELABOX/srtla README](https://raw.githubusercontent.com/BELABOX/srtla/master/README.md) **[FACT]**

and, two lines earlier, sets the expectation for the whole category:

> "This application is experimental. Be prepared to troubleshoot it and experiment with various
> settings for your needs." **[FACT]**

**Standing up the receiving side.** Someone has to run the thing the encoder connects *to*. In
practice that is a VPS the engineer personally administers: an nginx-RTMP or SRT-live-server
relay, a `srtla_rec` receiver, a Restreamer instance, or a self-hosted multistreamer. The install
path is a shell script and an API key in a dotfile:

> "Run the installer script. It will create `./data` directory and `./.apikey` file … If you
> don't have the API key anymore, navigate to the directory where srtla-receiver is installed and
> run `cat .apikey`"
> — [OpenIRL/srtla-receiver README](https://raw.githubusercontent.com/OpenIRL/srtla-receiver/main/README.md) **[FACT]**

**Building the fallback rig.** Before the show exists, the engineer configures a separate program
that watches the ingest statistics and switches OBS scenes when the bitrate drops or the source
disappears. This is a hand-edited JSON file containing scene names, thresholds, an obs-websocket
password and chat-bot credentials — reproduced in full by users in public issue threads
([NOALBS#178](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/178),
2024-10; [NOALBS#157](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/157),
2023-12) **[FACT]**.

### Load-in

**Physical patch, then IP.** Programme video and the correct audio mix into the encoder or
capture card; then the part no other department does: getting a usable network. [INFERENCE] This
is where the venue's IT reality lands on one person — captive portals, blocked UDP, NAT,
insufficient upload, a "we have gigabit" that is a shared 50/10.

**Bandwidth reality check and a test stream.** A private/unlisted test to each destination.
[INFERENCE, strongly supported] The reason this is non-negotiable is that several failure modes
in this dossier are *silent*: the stream appears healthy at the encoder and is dead, wrong, or
silent downstream ([obs-studio#11016](https://github.com/obsproject/obs-studio/issues/11016);
[obs-studio#5572](https://github.com/obsproject/obs-studio/issues/5572)) **[FACT]**.

**Starting the monitoring stack.** The stats page, the scene-switcher, sometimes a Prometheus
exporter and Grafana dashboard built specifically for this
([roflb0y/SRTExporter](https://raw.githubusercontent.com/roflb0y/SRTExporter/main/README.md),
first commit 2026-01) **[FACT]**.

### Rehearsal

**Return path and remote contributors.** In REMI and hybrid corporate events this is the stage
where the routing of *who sees and hears what* is discovered to be wrong. The clearest
description of the problem in the entire corpus is a 2025 feature request that opens with the
words "THE PAIN":

> "in the corporate events industry you often have this situation where you have an event in some
> venue and some 'remote' speakers might connect … you put a couple of cameras with operators,
> then get a video feed from the video mixer and a video feed from the audio mixer and send them
> to say zoom. You also have the video and audio output from the zoom computer go to the video and
> audio mixer. … Once is Alice time to speak … Bob and Charlie would like to see Alice speaking.
> Alice however, would like to see the venue, because someone might ask her questions"
> — [vdo.ninja#1218](https://github.com/steveseguin/vdo.ninja/issues/1218), 2025-12 **[FACT]**

**Latency and sync.** Contribution latency (SRT buffer), platform latency, and the delay between
what the remote speaker hears and what the room hears. [INFERENCE] Nothing in the reachable
evidence measures this end-to-end for the engineer; they measure it with a clock on camera and a
second screen — the technique appears incidentally in an OBS SRT bug report, where the reporter
identified stale cached video because "an SRT source which has a clock on its output showed up
with the time from before the connection drop"
([obs-studio#11062](https://github.com/obsproject/obs-studio/issues/11062), 2024-08) **[FACT]**.

### Show

**Watching numbers, not pictures.** Bitrate, RTT, retransmits, dropped frames, per-modem
throughput. The tooling that exists to do this was written by users:
[NOALBS](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching) (502 stars),
[Loopy SRT Stats Monitor](https://github.com/loopy750/SRT-Stats-Monitor) (178 stars, written in
QB64/VB6 — that detail alone says something about who builds these), `SRTExporter`,
`srtla_send` (Rust rewrite, 2025-08), `BelaboxBitrateOverlay`, `belabot` **[FACT]**.

**Reporting status to people who are not in the room.** In the IRL world this has been solved by
piping the bitrate into a public chat channel as a bot command (`!bitrate`, `!b`), so moderators
and the audience can see the connection state
([NOALBS#178 config](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/178))
**[FACT]**. [INFERENCE] In corporate REMI the equivalent channel is a WhatsApp or Teams group —
see [Paper / Excel / WhatsApp](#paper--excel--whatsapp-inventory).

**Manual intervention when the automation misfires.** The automation cutting to the "offline"
card while the show is genuinely live is a documented, recurring failure — see
[Error sources §4](#4-the-safety-net-fires-when-nothing-is-wrong).

### Load-out

Stop outputs in the right order, confirm the platform archive/VOD actually exists, pull the local
ISO recording. [INFERENCE, evidenced] The "local recording as insurance" assumption has a hole in
it: OBS users report that network trouble on the *streaming* output can overload the encoder and
corrupt the *recording* as well —

> "every time any overloading of the encoder happens because of network, recording gets corrupted
> unnecessarily … it can be corrupted by reasons that should not be happening"
> — [obs-studio#12087](https://github.com/obsproject/obs-studio/issues/12087), 2025-04 **[FACT]**

### Post

VOD trim/upload, deliverables to the client, analytics, and — where it happens at all — an
incident note. [INFERENCE] Nothing in the reachable evidence suggests a structured post-show
record exists; the artefacts that *do* survive are the config files, which is why users paste
them wholesale into issue threads when something breaks.

---

## Tools they actually use

Feelings are only recorded where there is evidence for them in a source I read; otherwise the
cell says so.

| Tool | For what | How they feel about it |
| --- | --- | --- |
| **OBS Studio** | The production switcher and encoder for most non-broadcast streaming | Load-bearing and grudgingly trusted. Praise is implicit; the complaints are about silence and reconnection ([#11016](https://github.com/obsproject/obs-studio/issues/11016), [#5572](https://github.com/obsproject/obs-studio/issues/5572), [#6497](https://github.com/obsproject/obs-studio/issues/6497)). One user, on a scene-import bug: "Extremely irritating bug. Makes OBS unusable in any serious production environment" ([#8953](https://github.com/obsproject/obs-studio/issues/8953), 2023) **[FACT]** |
| **obs-multi-rtmp** (plugin) | Sending one show to several platforms at once | Necessary, under-documented. Users cannot find whether per-destination bitrate is safe ([#344](https://github.com/sorayuki/obs-multi-rtmp/issues/344)), cannot start all outputs together ([#17](https://github.com/sorayuki/obs-multi-rtmp/issues/17), open since 2020, 16 comments), and ask for per-platform rate control ([#329](https://github.com/sorayuki/obs-multi-rtmp/issues/329)) **[FACT]** |
| **SRT** (protocol/library) | Contribution transport venue → gallery | Trusted as a protocol, distrusted as a configuration surface. See [Time sinks §2](#2-tuning-srtbonding-parameters-against-documentation-that-contradicts-itself) **[FACT]** |
| **SRTLA / BELABOX / belaUI** | Bonded-cellular contribution from a venue with no usable fixed line | Openly experimental by the maintainer's own description; the free server component is declared "unsupported … not suitable for production deployment" with a pointer to the paid cloud ([srtla README](https://raw.githubusercontent.com/BELABOX/srtla/master/README.md)) **[FACT]** |
| **Moblin** (iOS) / phone-as-encoder | Cheap bonded contribution, backup path | Actively developed; bonding logic is still being corrected in 2026 ([moblin#418](https://github.com/eerimoq/moblin/issues/418)) **[FACT]** |
| **Hardware encoders** — LiveU, Teradek VidiU, Kiloview, Haivision KB, Matrox Maevex, Resi, DataVideo NVS, Cerevo | Contribution and platform delivery in the mid/large tier | Present in the evidence mainly as *things that cannot be controlled from the show's button surface* — eight separate open Companion module requests, 2020–2023, none fulfilled **[FACT]** |
| **NOALBS** | Automatic scene switching on low bitrate / signal loss | The de-facto standard safety net, configured by hand-editing JSON. Recurring false-offline behaviour ([#125](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/125), [#119](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/119), [#120](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/120)) **[FACT]** |
| **Loopy SRT Stats Monitor** | Same job, GUI, for SRT/SRTLA/RIST/BELABOX/Restreamer/nginx | Explicitly a community workaround: "This program will not launch 'out of the box' until the bare minimum of required settings are correctly configured" ([README](https://raw.githubusercontent.com/loopy750/SRT-Stats-Monitor/main/README.md)) **[FACT]** |
| **nginx-rtmp / SRS / SRT-Live-Server / Restreamer / Prism** | Self-hosted relay, fan-out, ingest statistics | Chosen to avoid paying for a SaaS: "No need to pay restream or cloudflare!" ([Prism README](https://raw.githubusercontent.com/MorrowShore/Prism/master/README.md)) **[FACT]** |
| **VDO.Ninja** | Remote contributors and remote camera feeds into the switcher | Liked enough that people file detailed feature requests instead of leaving; the gaps are director-side control and per-guest routing ([#1218](https://github.com/steveseguin/vdo.ninja/issues/1218), [#569](https://github.com/steveseguin/vdo.ninja/issues/569), [#838](https://github.com/steveseguin/vdo.ninja/issues/838)) **[FACT]** |
| **Zoom / Teams as a contribution path** | Remote speakers in corporate events | Used because the *client* uses it, and because its pinning model does what VDO.Ninja cannot ([vdo.ninja#1218](https://github.com/steveseguin/vdo.ninja/issues/1218)) — a textbook grudging tool **[FACT]** |
| **obs-websocket / obs-websocket-http** | Remote and scripted control of the switcher; the glue for everything above | Infrastructure. IRLToolkit maintains an HTTP bridge purely because so many tools speak HTTP and not websockets ([README](https://raw.githubusercontent.com/IRLToolkit/obs-websocket-http/master/README.md)) **[FACT]** |
| **Bitfocus Companion + Stream Deck** | The show's button surface | Liked; the complaint is what is *missing* from it (encoders) and the config-shuffling around it ([companion#2909](https://github.com/bitfocus/companion/issues/2909), [#3654](https://github.com/bitfocus/companion/issues/3654)) **[FACT]** |
| **Prometheus / Grafana** | Because nothing in the stack has a dashboard | Built by users, for users ([SRTExporter](https://github.com/roflb0y/SRTExporter)) **[FACT]** |
| **Excel / Google Sheets** | Destination lists, key lists, rundowns, bandwidth budgets | Not directly evidenced for *this* role this session; strongly evidenced as the universal substrate for the neighbouring roles ([`technical-director.md`](./technical-director.md): sixteen ontime Excel import/export issues, 2021–2026) **[SECOND-HAND]**. One direct data point: a Companion user asked to edit the entire button config *in Excel* ([companion#1339](https://github.com/bitfocus/companion/issues/1339), 2020) **[FACT]** |
| **Discord** | The actual support channel and knowledge base for the whole streaming stack | Evidenced repeatedly: NOALBS, Loopy and BELABOX all route support to Discord, and a user's escalation path is "no one has replied to me on Discord about it" before opening a GitHub issue ([obs-multi-rtmp#88](https://github.com/sorayuki/obs-multi-rtmp/issues/88), 2021) **[FACT]** |

---

## Time sinks

Ranked by my reading of cost × frequency across the evidence. Each carries a frequency grade and
a time estimate; where the estimate is reasoning rather than a measured figure it says so.

### 1. Assembling and re-entering the destination/key set for every show

`frequency: recurring` (arguably widespread — four independent projects exist to manage it) ·
`cost: 30–90 minutes per show, plus the whole class of errors below` [INFERENCE for the figure]

A modern job has three to six destinations. Each needs a server URL, a stream key, and its own
bitrate/resolution/keyframe constraints. There is no shared register: the values are typed into
the encoder, then again into the backup encoder, then again into the relay, then again into
whatever automation starts the outputs.

The clearest picture of the end state is the self-hosted multistreamer, where every platform key
is a literal environment variable in a `docker run` line the engineer edits by hand:

> `-e YOUTUBE_KEY="your-youtube-key" \` … `-e FACEBOOK_KEY=…` … `-e TWITCH_KEY=…` … `-e RTMP1_URL=…`
> `-e RTMP1_KEY=…` … "Each line starting with -e signals a destination. **Remove all the
> destination lines that don't concern you.**"
> — [Prism README](https://raw.githubusercontent.com/MorrowShore/Prism/master/README.md) **[FACT]**

And the confusion this produces is a support category of its own. In Restreamer, users cannot work
out what the "stream key" for their own server even *is*:

> "If i go to Streamyard and add a destination as RTMP server, i pasted the URL and it asks for a
> streamkey. i read in the discussions that the key everything after the domain name & when i
> tried that it doesnt work."
> — [restreamer#823](https://github.com/datarhei/restreamer/issues/823), 2024-09 **[FACT]**

and cannot choose their own, so they must transcribe a generated GUID:
[restreamer#961](https://github.com/datarhei/restreamer/issues/961), 2026-01 **[FACT]**.

### 2. Tuning SRT/bonding parameters against documentation that contradicts itself

`frequency: recurring` · `cost: hours, once per new venue/route; minutes to re-check per show`

This is the single best-documented time sink in the dossier, because I could read both the
complaints and the documentation they are about.

The official SRT configuration guidance gives the receiver-buffer size as a function of RTT,
latency, bitrate and MTU. **The same document states the formula two different ways.** In
"Calculating Target Size in Packets":

> `pktsRBufSize = bps / 8 × (RTTsec + latency_sec) / bytePayloadSize`

and eight paragraphs later, in "Summing Up":

> `const long long targetPayloadBytes = static_cast<long long>(msLatency + msRTT / 2) * bpsRate / 1000 / 8;`

— [Haivision/srt configuration-guidelines.md](https://raw.githubusercontent.com/Haivision/srt/master/docs/API/configuration-guidelines.md),
read in full this session. `RTT` in one, `RTT/2` in the other. **[FACT — verified directly]**

A user found exactly this and asked which is right; the issue is open:

> "I am trying to wrap my head around the SRT parameters for streaming at high bitrates, `maxbw`,
> `rcvbuf`, `fc` and so forth. I read the most referenced issues, as #642, #703, #409 and others,
> as well as the Configuration Guidelines and the Socket options page. … Here the code is almost
> the same, except for the division by two applied to the RTT value. I think this is an error"
> — [srt#3168](https://github.com/Haivision/srt/issues/3168), 2025-05, **open** **[FACT]**

The same pattern, six years earlier and also still open — a user reading the vendor's own
deployment guide and finding its overhead table counter-intuitive:

> "why is less bandwidth overhead required for lossier networks - wouldn't it be the opposite?"
> — [srt#656](https://github.com/Haivision/srt/issues/656), 2019-04, **open** **[FACT]**

And the underlying request, from 2018, which explains why this is a *recurring per-show* cost
rather than a one-off learning curve:

> "I know we can recover from packet loss in network using latency and overhead bandwidth but how
> do we know that there is loss in network at certain time and there is no loss otherwise and then
> set the latency/oheadbw accordingly. If we set the latency manually, it can be too low or high
> depending upon network loss. Is there a mechanism in SRT to check loss continuously?"
> — [srt#460](https://github.com/Haivision/srt/issues/460), 2018-09 **[FACT]**

A companion request asks outright for "a functionality for best parameter tweak calculation"
([srt#621](https://github.com/Haivision/srt/issues/621), 2019) **[FACT]**. [INFERENCE] Nothing in
the reachable evidence indicates such a calculator shipped; the engineer still does this by hand,
per route, and re-does it when the venue changes.

There is a second, nastier variant: **the parameters are transported in a URI**, and the escaping
rules are undefined —

> "passphrase and streamid, are usually passed in many software implementing SRT in the URI as a
> query parameter. This makes that some special characters, such as, `'#&=/'` could be bad
> interpreted as params URI delimiters. … I have a big doubt here."
> — [srt#2749](https://github.com/Haivision/srt/issues/2749), 2023-06, **open** **[FACT]**

[INFERENCE] A platform-generated key containing one of those characters is a connection that
fails for a reason no log will name.

### 3. Building and maintaining the monitoring/fallback rig that no product ships

`frequency: widespread` (grade justified: at least five independent projects exist whose *only*
purpose is this) · `cost: days to build once, 15–45 minutes to verify per show` [INFERENCE for
figures]

The switcher does not reliably tell you the stream stopped
([obs-studio#11016](https://github.com/obsproject/obs-studio/issues/11016)). So the community
built: NOALBS (Rust, 502 stars, ingest stats → OBS scene switch + chat bot), Loopy SRT Stats
Monitor (178 stars, GUI, SRT/SLS/BELABOX/Restreamer/RIST/nginx), SRTExporter (Prometheus),
BelaboxBitrateOverlay, belabot, SRT-Stats-Monitor's multi-camera mode, and IRLToolkit's HTTP
bridge to obs-websocket **[FACT — all READMEs/descriptions read this session]**.

Every one of these is configured by hand-editing JSON or INI. Every one of them is another place
the same scene names and credentials must be typed. And they generate their own support load:
ten NOALBS issues read this session are configuration problems, not bugs.

### 4. Re-creating the same setup on the second machine

`frequency: recurring` · `cost: 1–3 hours per new machine` [INFERENCE for the figure]

Redundancy in this world means a second encoder or a second OBS machine — which means the entire
configuration exists twice and drifts. The portability mechanisms have a poor record: profile
export was broken on macOS and Windows in 2021–2022 (opening an *import* dialog instead of a save
dialog — [#5599](https://github.com/obsproject/obs-studio/issues/5599),
[#6298](https://github.com/obsproject/obs-studio/issues/6298)); cross-platform scene-collection
import crashed ([#6398](https://github.com/obsproject/obs-studio/issues/6398), 2022) and silently
failed ([#8635](https://github.com/obsproject/obs-studio/issues/8635), 2023); importing a
collection could randomly change the live scene after a transition
([#8953](https://github.com/obsproject/obs-studio/issues/8953), 2023) **[FACT]**. These are dated
and several are closed — cited as evidence that **this class of break exists**, not that it exists
today.

### 5. Sorting out remote contributors' views, audio and return feeds

`frequency: recurring` · `cost: most of the rehearsal window in a hybrid event` [INFERENCE]

Covered in the rehearsal section and in [Missing interfaces](#missing-interfaces). The 2025
"THE PAIN" request ([vdo.ninja#1218](https://github.com/steveseguin/vdo.ninja/issues/1218))
describes an entire signal-flow problem — venue video mixer and audio mixer feeding a
conferencing platform, and the platform's output feeding back into both — that the streaming
engineer has to design, patch and explain, per event, with no drawing tool that models it.

### 6. Explaining what happened, afterwards

`frequency: recurring` · `cost: unknown` — [INFERENCE] The evidence for this is indirect but
consistent: when something breaks, the engineer's reconstruction material is a pasted config file
and a log URL. Every OBS bug report read this session leads with a hosted log link; every NOALBS
report leads with the full `config.json`. There is no show record; there is a pile of artefacts.

---

## Double data entry

What the same fact has to be typed into. Each row lists the systems and the evidence that the
duplication is real.

| Fact | Typed into | Evidence |
| --- | --- | --- |
| **Stream key + ingest URL** (per platform) | Platform dashboard → primary encoder → backup encoder → relay/multistreamer config → the automation that starts outputs → the handover document | [Prism README](https://raw.githubusercontent.com/MorrowShore/Prism/master/README.md) (env vars per platform); [obs-multi-rtmp](https://github.com/sorayuki/obs-multi-rtmp/issues/88); [restreamer#823](https://github.com/datarhei/restreamer/issues/823), [#961](https://github.com/datarhei/restreamer/issues/961) **[FACT]** |
| **Per-destination bitrate / rate control / profile** | Encoder output settings, then again per destination in the multi-destination plugin, then against each platform's published limit | "Such as 'Rate control' (CBR or VBR) and 'Profile' so I can restream on multiple platforms with different settings, because each platform have it's own requirements" — [obs-multi-rtmp#329](https://github.com/sorayuki/obs-multi-rtmp/issues/329), 2023 **[FACT]** |
| **Scene names** | OBS scene collection → NOALBS `switchingScenes` *and* `overrideScenes` *and* `optionalScenes` → Companion buttons → the chat-bot command aliases | [NOALBS#178 config](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/178) shows the same scene names entered three times in one file **[FACT]** |
| **SRT connection parameters** (latency, passphrase, streamid, MSS, FC, buffer) | Sender, receiver, and any middlebox — with no negotiation of the human-meaningful ones | [srt configuration-guidelines](https://raw.githubusercontent.com/Haivision/srt/master/docs/API/configuration-guidelines.md); [srt#2016](https://github.com/Haivision/srt/issues/2016) ("Negotiated SRT link latency is unknown") **[FACT]** |
| **obs-websocket host/port/password** | OBS itself, NOALBS config, Loopy config, Companion connection, any custom script | [NOALBS#178](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/178), [#157](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/157); [obs-websocket-http config.ini](https://raw.githubusercontent.com/IRLToolkit/obs-websocket-http/master/README.md) **[FACT]** |
| **Ingest stats endpoint** | The relay server config, the scene-switcher config, the Prometheus scrape config, the overlay | [NOALBS#178](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/178); [SRTExporter README](https://raw.githubusercontent.com/roflb0y/SRTExporter/main/README.md) **[FACT]** |
| **Source/camera naming** | Switcher inputs → OBS scenes/sources → tally system → rundown → the streaming engineer's own scene list | [`technical-director.md`](./technical-director.md) documents the input map living in the switcher, the router table, the tally mapping, a paper sheet and the rundown simultaneously **[SECOND-HAND]** |
| **Event metadata** (title, description, schedule, privacy, category) | Each platform's broadcast-creation UI, separately | unverified — no reachable source this session. Flagged because it is the obvious remaining duplication and should be confirmed before it drives a build decision |

**The pattern behind the table.** There is no *register of destinations* anywhere in this stack.
Each tool holds its own private copy of the same handful of facts, in its own format, with the
secret embedded in the same file as the operational settings. That is simultaneously the
double-entry problem and the security problem — see below.

---

## Error sources

What goes wrong, what it costs, and how often the evidence says it happens.

### 1. The stream stops and nothing says so

`frequency: recurring` · `cost: minutes of dead air, discovered only by an out-of-band check`

The canonical report ([obs-studio#11016](https://github.com/obsproject/obs-studio/issues/11016),
2024-07): stream stops after a few minutes, "no indication on OBS", occurred "over 5 times within
one hour this morning", fixed only by stop/start. Upload capacity was not the constraint
("we are doing a upload of over 200"). **[FACT]**

[INFERENCE] The consequence in a paid production is not the outage itself but the *detection
lag*: whatever time passes between the failure and the engineer glancing at the second screen is
broadcast as nothing.

### 2. It reconnects, and comes back wrong

`frequency: recurring` · `cost: the rest of the show is silent, or the archive is split`

The most-commented instance read this session
([obs-studio#5572](https://github.com/obsproject/obs-studio/issues/5572), 2021-11, **65
comments**): after an automatic reconnect the video continues and the **audio does not**, while
every meter in OBS and Windows shows audio present. The reporter's own summary of the cost:

> "Stop the stream manually in the OBS, relaunch it - everything works now, but the VOD is split
> and half of the viewers are gone." **[FACT]**

Independently reported at [#6557](https://github.com/obsproject/obs-studio/issues/6557) (2022,
"I have noticed another streamer friend of mine having this issue as well") and
[#6813](https://github.com/obsproject/obs-studio/issues/6813) (2022) **[FACT]**. Dated —
but three independent reports of the same silent-audio-after-reconnect signature is the shape of
a class of bug, not a one-off.

The SRT equivalent, on the receiving side: after a reconnect OBS plays a few seconds of *stale
cached video* and freezes, and takes minutes to notice
([obs-studio#11062](https://github.com/obsproject/obs-studio/issues/11062), 2024-08, open)
**[FACT]**. And SRT reconnection while recording has been broken since 2021 and is still open
([#4596](https://github.com/obsproject/obs-studio/issues/4596), 26 comments), with the reporter
naming the trust consequence explicitly:

> "as SRT is all about providing stability and a robust stream under any circumstances, hopefully
> this and any other stability related issues can be resolved, else users might not trust being
> able to leave OBS/SRT unattended." **[FACT]**

### 3. The redundancy sends the show down the dead path

`frequency: recurring` · `cost: 60–70% packet loss while a healthy link sits idle`

The most technically precise report in the dossier
([moblin#418](https://github.com/eerimoq/moblin/issues/418), 2026-07, open): with RIST bonding,
the link-weighting logic uses only RTT, and a dead interface's RTT estimate *freezes at a low
value* — so the scheduler treats the dead link as the best one. Measured over a 10-second window
of a real stream:

| metric | delta / 10 s |
| --- | --- |
| received (delivered directly) | +2275 |
| missing (sent to the dead link) | +8525 |
| recovered (retransmit via good link) | +1790 |
| lost (never recovered) | +6307 |

> "So ~60–70% of packets go to the dead interface … most is permanently lost → continuous
> buffering." **[FACT]**

The reporter's workaround is to give up aggregation entirely. A related bonding failure — cellular
silently excluded from the bond depending on IPv6 and DNS strategy — is
[moblin#89](https://github.com/eerimoq/moblin/issues/89), 2024-12 **[FACT]**.

[INFERENCE] This is the most expensive error class conceptually, because it is *invisible in the
plan*: the redundancy diagram shows two paths, the engineer has two paths, and the system is
routing the show into the one that does not work.

The OBS-side counterpart, from an engineer explicitly testing bonded-LTE conditions:

> "The purpose of my test case is to replicate a symptom that I frequently see while streaming on
> bonded LTE connections … which I have observed in more than half of my recent streams. … I have
> never seen the issue when Dynamic Bitrate (beta) is disabled."
> — [obs-studio#6497](https://github.com/obsproject/obs-studio/issues/6497), 2022-05 (closed)
> **[FACT]**

Automatic reconnect and dynamic bitrate — the two features that exist to *survive* a bad network
— deadlocked each other, requiring a force-quit of the switcher mid-show.

### 4. The safety net fires when nothing is wrong

`frequency: recurring` · `cost: the live content is replaced by a holding card, on air`

The scene-switcher's failure mode is a false negative on *its own stats source*, not on the
stream:

- The ingest stats page intermittently returns blank, and the switcher cuts to "offline" while the
  feed is fine: "Bitrate is definitely fine, i managed to catch it when I had the liveU stats open
  and the stream in parallel in VLC, no drops. … Is there a way that NOALBS can ignore this
  behavior and not switch to the offline scene immediately?"
  ([NOALBS#125](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/125),
  2022-10) **[FACT]**
- With a bonded hardware encoder (Kiloview P2) the nginx channel stays open at 0 bit/s, so
  "offline" never triggers *and* the bot reports a healthy `nginx: 0`
  ([NOALBS#120](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/120),
  2022-09) **[FACT]**
- Sticky-offline: switches to offline and instantly returns there even when forced back manually
  ([NOALBS#119](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/119),
  2022-09, 18 comments, open) **[FACT]**
- Reachability of `localhost/stat` misconfigured → permanent offline scene and `No connection :(`
  in chat, after the user "searched for hours"
  ([NOALBS#178](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/178),
  2024-10) **[FACT]**

**Both directions of this error are expensive.** A false "offline" cuts live content to a card; a
false "online" (the 0 bit/s case) leaves a frozen or black picture on air with the automation
convinced everything is fine.

### 5. Keys and services bleed into each other

`frequency: isolated-to-recurring` (one detailed report, but it names a regression class) ·
`cost: stream fails to start at showtime with a misleading error`

> "Swapping from Service: Twitch to custom, causes my twitch stream key to be pre-populated in the
> stream key box (despite historic settings having a different stream key), and when attempting to
> stream to the server, an error occurs stating 'failed to start streaming - no config URL
> available for the current service'. … If enhanced broadcasting is not enabled, then on switching
> back to custom service, all settings are lost. This feels like a step back in general UX for the
> stream settings dialog. Stream keys also seem to 'bleed' between service providers now when they
> did not before (in 29.x)"
> — [obs-studio#11079](https://github.com/obsproject/obs-studio/issues/11079), 2024-08 **[FACT]**

Two distinct failures in one report: a key from one destination silently offered for another, and
a whole destination configuration lost by switching service type. Both are showtime failures.

### 6. Credentials end up in places they should not be

`frequency: recurring` · `cost: unquantified, but the exposure is real`

- Keys as shell-command environment variables that get copied between machines and pasted into
  chat ([Prism README](https://raw.githubusercontent.com/MorrowShore/Prism/master/README.md))
  **[FACT]**
- The obs-websocket password, the ingest server auth and the chat-bot token in the *same* JSON
  file as the scene names — a file users paste wholesale into public issue threads when asking for
  help. One user redacted with `XXXX`
  ([NOALBS#178](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/178));
  another pasted an ingest `"auth": {"username": "admin", "password": "admin"}` block unredacted
  ([NOALBS#157](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/157))
  **[FACT]**
- OBS itself has had a clear-text credential report filed against it
  ([#8966](https://github.com/obsproject/obs-studio/issues/8966), 2023, closed) **[FACT]**
- The receiver's API key is a plaintext dotfile recovered with `cat .apikey`
  ([OpenIRL/srtla-receiver](https://raw.githubusercontent.com/OpenIRL/srtla-receiver/main/README.md))
  **[FACT]**

[INFERENCE] The structural cause is the one identified under double entry: because there is no
key register, the key lives in the operational config, and the operational config is the thing you
send to someone when you need help.

### 7. The insurance copy is damaged by the same event

`frequency: isolated` (one detailed report) · `cost: no usable archive after a bad show`

[obs-studio#12087](https://github.com/obsproject/obs-studio/issues/12087) (2025-04): network
congestion on the streaming output drives encoder overload, and "recording gets corrupted
unnecessarily … causes recording to become 5fps un-usable footage and also the audio is broken"
**[FACT]**. Graded isolated on evidence, flagged as high-consequence: the local recording is the
standard answer to "what if the stream fails", and here the two failures are correlated.

### 8. Bitrate control that does not control the bitrate

`frequency: isolated, but current` · `cost: instant congestion at showtime`

[obs-studio#13772](https://github.com/obsproject/obs-studio/issues/13772) (2026-08, open, OBS
32.2.1): CBR set to 1500 kbps, actual output climbs to 11,000–16,000 kbps on AMD hardware
encoding **[FACT]**. Fresh enough to matter; single report, so graded isolated.

---

## Paper / Excel / WhatsApp inventory

**This is the weakest section of the dossier and I am not going to pretend otherwise.** The
sources that would document it — Reddit, ProSoundWeb, Control Booth, church-AV blogs, German
event-tech forums — were unreachable. What follows separates what is attested from what is
inference.

### Attested, in sources I read this session

**In hand-edited config files (the streaming engineer's real "spreadsheet"):**

- `config.json` for the scene-switcher: thresholds, scene names three times over, obs-websocket
  password, chat platform, admin usernames, per-command permission lists, and the ingest server's
  auth block. Reproduced in full in
  [NOALBS#178](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/178) and
  [#157](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/157) **[FACT]**
- `config.ini` for the obs-websocket HTTP bridge: address, port, auth key, obsws connection
  ([IRLToolkit README](https://raw.githubusercontent.com/IRLToolkit/obs-websocket-http/master/README.md))
  **[FACT]**
- A `docker run` command line holding every platform key
  ([Prism README](https://raw.githubusercontent.com/MorrowShore/Prism/master/README.md)) **[FACT]**
- `readme.txt` settings files that "will not launch out of the box until the bare minimum of
  required settings are correctly configured"
  ([Loopy README](https://raw.githubusercontent.com/loopy750/SRT-Stats-Monitor/main/README.md))
  **[FACT]**

**In Excel — one direct data point for the adjacent surface:** a Companion user asked to export
the button configuration to Excel, edit it there and import it back, because clicking each button
individually was untenable ([companion#1339](https://github.com/bitfocus/companion/issues/1339),
2020, closed) **[FACT]**.

**In Discord — attested and important.** The streaming stack's documentation of record is a chat
server. NOALBS, Loopy and BELABOX all route support there; the Loopy README even names a specific
streamer's Discord as the place where "both the hardware and software can be confusing at first,
but as a community, helping each other, we can iron out all the bugs"; and users escalate to
GitHub only after "no one has replied to me on Discord"
([obs-multi-rtmp#88](https://github.com/sorayuki/obs-multi-rtmp/issues/88)) **[FACT]**.
[INFERENCE] For this role, **Discord is what WhatsApp is for the rest of the crew**: the real
knowledge base, unsearchable, unversioned, and gone when the server dies.

**In public chat — attested and startling.** The IRL convention is to expose the connection state
of the production *to the audience*, as chat-bot commands `!bitrate` / `!b`, with `!fix` and
`!switch` reserved to moderators
([NOALBS#178 config](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/178))
**[FACT]**. There is no production-internal status channel, so the public one is used.

### Carried over from the corpus (second-hand, re-verify before building)

- **Paper is still load-bearing next door.** A paper routing sheet for a 40x40 router, in current
  use ([bmd-videohub#9](https://github.com/bitfocus/companion-module-bmd-videohub/issues/9), 2020,
  open), and printed rundowns / PDF exports as an explicit requirement
  ([ontime#542](https://github.com/cpvalente/ontime/issues/542)) — both from
  [`technical-director.md`](./technical-director.md) **[SECOND-HAND]**
- **Excel is the universal substrate.** Sixteen separate Excel/Sheets import-export issues in the
  rundown tool between 2021 and 2026, chosen for "easy collaboration with others"
  ([ontime#194](https://github.com/cpvalente/ontime/issues/194)) **[SECOND-HAND]**
- **WhatsApp/e-mail traffic: [UNKNOWN].** [`workflow-chain.md`](../workflow-chain.md) reached the
  same conclusion for the whole corpus and marked it unobservable without practitioner forums.

### Inference, clearly labelled

[INFERENCE] The documents I would expect to find for this role, and could not confirm:

- a **destination sheet** (platform, URL, key, bitrate cap, contact, who owns the account) that
  arrives by e-mail from the client and is retyped
- a **bandwidth/uplink budget** in a spreadsheet, per venue
- a **redundancy plan** as prose in an e-mail or a slide, not as a model
- a **printed showtime card** on the encoder position with the fallback procedure

Every one of these is plausible and none is evidenced here. Treat them as hypotheses to test in a
session with forum access, not as findings.

---

## Missing interfaces

Department handovers that break, with the evidence for the break.

### Audio → streaming: the mix-minus is designed twice and matches by luck

The "THE PAIN" report ([vdo.ninja#1218](https://github.com/steveseguin/vdo.ninja/issues/1218),
2025-12) describes the topology in the engineer's own words: venue video mixer feed *and* audio
mixer feed into the conferencing platform, and the platform's video and audio outputs back into
both mixers. Two departments each own half of a loop, and the loop's correctness — that no
participant hears themselves, that the remote speaker hears the room and not their own return —
is nobody's documented deliverable. **[FACT]**

A related structural gap: remote-contributor audio arrives as a single mixed stream rather than
per-participant tracks, so the audio department cannot treat remote guests like local ones
([vdo.ninja#898](https://github.com/steveseguin/vdo.ninja/issues/898), 2021: a user who routed the
audio through an entirely separate system, Studio Link + Reaper, to get isolated tracks;
[vdo.ninja#276](https://github.com/steveseguin/vdo.ninja/issues/276), complex channel routing
"experimentally possible now. compatibility = low") **[FACT]**

### Switcher/TD → remote contributors: no tally crosses the boundary

Local talent and camera ops get tally. Remote contributors get nothing, and the person calling the
show cannot see who is live either. The request, from someone describing exactly the REMI split:

> "With the mention of #438 Multiple Directors I can see a use case where one person may be running
> 'tech/operator' for a event with a 2nd person remotely acting as a 'Stage manager' calling the
> show/transitions … it would be more beneficial to watch the composited shot live and have just
> the director's 'Dashboard' available to see the status of everyone's feeds and quickly see who
> is live."
> — [vdo.ninja#569](https://github.com/steveseguin/vdo.ninja/issues/569), 2020-12, open **[FACT]**

A parallel request asks for on-air indication and audible warning at the *contributor* end
("tally lights — yellow border when visible in OBS, red when visible in OBS and OBS status is
streaming", plus "audible alert when video becomes visible in OBS (for guests waiting to be
interviewed)") — [vdo.ninja#654](https://github.com/steveseguin/vdo.ninja/issues/654), 2021
**[FACT]**.

[LOCAL] This gap is directly addressed by two repositories already in this workspace:
`tally-pi` (browser tally by QR code, ATEM-driven) and `Broadcast-intercom` (browser beltpacks via
invite link, Companion control endpoint). Neither currently claims a *remote-contributor* mode.

### Encoders → show control: the transmission chain is not on the button surface

Everything else in a modern show is on a Stream Deck through Companion. Encoders are not. Eight
separate module requests, all open, spanning 2020–2023, all asking for essentially one thing —
start and stop:

| Request | Device | Date | What they asked for |
| --- | --- | --- | --- |
| [#177](https://github.com/bitfocus/companion-module-requests/issues/177) | Wowza Clearcaster | 2020-03 | module request |
| [#194](https://github.com/bitfocus/companion-module-requests/issues/194) | Haivision KB Encoder | 2020-04 | control |
| [#540](https://github.com/bitfocus/companion-module-requests/issues/540) | Cerevo LiveShell | 2021-06 | "a simple start and stop is all I need" |
| [#790](https://github.com/bitfocus/companion-module-requests/issues/790) | Teradek VidiU Go | 2022-04 | module request |
| [#815](https://github.com/bitfocus/companion-module-requests/issues/815) | Matrox Maevex 6120 | 2022-05 | "Use Case: Start and Stop the streaming" |
| [#880](https://github.com/bitfocus/companion-module-requests/issues/880) | Resi Encoder | 2022-08 | start/stop encoder, schedule an event |
| [#1080](https://github.com/bitfocus/companion-module-requests/issues/1080) | TBS 2603se | 2023-03 | "start/stop my encoder stream from my streamdeck XL" |
| [#1143](https://github.com/bitfocus/companion-module-requests/issues/1143) | DataVideo NVS-33 | 2023-05 | record + stream control, HTTP API PDF attached |

**[FACT — all read this session]** Plus [#2075](https://github.com/bitfocus/companion-module-requests/issues/2075)
(2026-05) asking to trigger actions on stream up/down for Shoutcast/Icecast — i.e. wanting the
*stream state* as a trigger source, not just a button target.

[INFERENCE] The consequence at showtime: "go live" is one action for the whole show except the
part that actually goes live, which is a different person on a different screen. That is exactly
where a missed start or a stray stop comes from.

### Monitoring → the production's alarm path

The stream's health lives in a web stats page, a Grafana board, a chat bot, or a second monitor —
never in intercom, never on the multiviewer, never in the rundown. Evidenced by the fact that the
entire monitoring category is user-built (see Time sinks §3) and that its output channel of last
resort is *public chat* **[FACT]**.

### Rundown → transmission

[INFERENCE] A rundown says what happens; it does not say "start recording here", "the second
destination joins at item 4", "the archive must be cut here". [`technical-director.md`] documents
the rundown tool's own gaps (Excel import, print/PDF) but nothing about a transmission column
**[SECOND-HAND]**. A targeted search of the rundown tool's issues for OBS/stream integration
returned nothing this session — recorded as **unverified**, not as absence.

### Client → engineer: account ownership

[INFERENCE] The stream key belongs to an account somebody else owns. Nothing in the reachable
evidence describes a handover mechanism for it — no scoped credential, no expiry, no delegation.
The observable substitute is the engineer holding the client's key in a config file. Flagged as
the most consequential unverified item in this dossier.

---

## Workflows that are needlessly complicated

1. **Multi-destination requires either re-encoding or a mystery.** Users cannot tell whether
   changing the per-destination bitrate away from "Get from OBS" costs them a second encode:
   "I see if I change it from 'Get From OBS' I can adjust the bitrate.. but I have a feeling I
   don't want to change it from this setting"
   ([obs-multi-rtmp#344](https://github.com/sorayuki/obs-multi-rtmp/issues/344), 2023) **[FACT]**.
   The same uncertainty in Restreamer is a feature request to *reuse* an encode rather than repeat
   it, with a careful analysis of when passthrough is and is not offered
   ([restreamer#873](https://github.com/datarhei/restreamer/issues/873), 2025-01) **[FACT]**.
2. **Outputs cannot be started together.** A request from 2020, open, 16 comments: a provider
   requires all bitrate variants to start simultaneously, and the plugin can only start them one
   at a time ([obs-multi-rtmp#17](https://github.com/sorayuki/obs-multi-rtmp/issues/17)) **[FACT]**.
3. **Bandwidth is allocated by whoever connects first.** "it seems that it is sending all the
   bitrate (or most of it) to the main server … leaving almost nothing to stream to the other two
   … I don't know how or if it is possible to 'split' or assign the total bitrate"
   ([obs-multi-rtmp#88](https://github.com/sorayuki/obs-multi-rtmp/issues/88), 2021) **[FACT]**.
4. **Monitoring requires standing up a stats server you do not otherwise need.** A user with only
   USB cameras asks how to get OBS's own bitrate instead of running nginx purely to be measured
   ([NOALBS#82](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/82),
   2022, open) **[FACT]**.
5. **Two ingest sources is a config-file research project.** A user wanting a hand-off between two
   contributing streamers, with the fallback firing only when *both* are down, guessed at the JSON
   structure and got it wrong
   ([NOALBS#47](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/47),
   2021; [#60](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/60))
   **[FACT]**. The feature now exists as a `streamServers` array with `priority` and `dependsOn` —
   still hand-edited JSON.
6. **The auto-configuration wizard lies about its own state.** Un-ticking enhanced broadcasting
   and re-running the tests leaves it enabled in the results
   ([obs-studio#11264](https://github.com/obsproject/obs-studio/issues/11264), 2024-09, open)
   **[FACT]**.
7. **Bonding requires OS-level routing setup before the streaming tool will work at all**
   ([BELABOX/srtla README](https://raw.githubusercontent.com/BELABOX/srtla/master/README.md))
   **[FACT]**.

## Software they use grudgingly, and why

| Tool | Why grudgingly | Evidence |
| --- | --- | --- |
| **Zoom / Teams as a contribution path** | Wrong tool, right politics — used because the client lives there, and because its per-participant pinning is something purpose-built tools do not offer | [vdo.ninja#1218](https://github.com/steveseguin/vdo.ninja/issues/1218) **[FACT]** |
| **Self-hosted relay on a personal VPS** | Chosen explicitly to avoid a subscription — "No need to pay restream or cloudflare!" — which means the engineer now personally operates production infrastructure | [Prism README](https://raw.githubusercontent.com/MorrowShore/Prism/master/README.md) **[FACT]** |
| **A vendor's cloud relay** | The opposite trade: the free/self-hostable server component is declared "unsupported, no longer under development and not suitable for production deployment", with a sign-up link | [BELABOX/srtla README](https://raw.githubusercontent.com/BELABOX/srtla/master/README.md) **[FACT]** |
| **Hand-edited JSON/INI configs** | The only interface offered by the safety-net tooling | NOALBS, Loopy, obs-websocket-http **[FACT]** |
| **Twitch/YouTube "enhanced broadcasting" / platform-managed encoding** | Takes control of encoder settings and leaks state across services | [obs-studio#11079](https://github.com/obsproject/obs-studio/issues/11079), [#11264](https://github.com/obsproject/obs-studio/issues/11264), [#13127](https://github.com/obsproject/obs-studio/issues/13127) **[FACT]** |
| **Discord as documentation** | Because there is no documentation | Loopy README; [obs-multi-rtmp#88](https://github.com/sorayuki/obs-multi-rtmp/issues/88) **[FACT]** |

---

## What they would want

Their words, not mine. Every item below is a request an identifiable user actually filed.

1. **Per-destination bitrate and rate control without a second encode.**
   "I'd like to send the maximum bitrate for Twitch but adjust the plugin to send more for
   YouTube" ([obs-multi-rtmp#344](https://github.com/sorayuki/obs-multi-rtmp/issues/344)); "Such as
   'Rate control' (CBR or VBR) and 'Profile' … because each platform have it's own requirements"
   ([#329](https://github.com/sorayuki/obs-multi-rtmp/issues/329)) **[FACT]**
2. **Start all destinations with one action.**
   "Can an option be set in the plugin to 'select all' to start? Or it could also be that ALL
   outputs start when the start button is pushed in the main OBS controls"
   ([obs-multi-rtmp#17](https://github.com/sorayuki/obs-multi-rtmp/issues/17)) **[FACT]**
3. **Explicit bitrate allocation across destinations**, instead of first-come-first-served
   ([obs-multi-rtmp#88](https://github.com/sorayuki/obs-multi-rtmp/issues/88)) **[FACT]**
4. **Reuse one encode for several platforms** rather than transcoding per destination
   ([restreamer#873](https://github.com/datarhei/restreamer/issues/873)) **[FACT]**
5. **Choose your own stream key**, so the URL is memorable and documentable:
   "is it possible to use your own custom streamkey? So that the URL looks like
   `rtmp://mydomain.com/live/my_key`?" ([restreamer#961](https://github.com/datarhei/restreamer/issues/961))
   **[FACT]**
6. **Encoder start/stop on the show's button surface.** Eight open requests; the most direct is
   "a simple start and stop is all I need"
   ([companion-module-requests#540](https://github.com/bitfocus/companion-module-requests/issues/540))
   **[FACT]**
7. **Stream state as a trigger, not just a target** — fire actions when the stream goes up or down
   ([companion-module-requests#2075](https://github.com/bitfocus/companion-module-requests/issues/2075),
   2026) **[FACT]**
8. **Automatic calculation of transport parameters.**
   "Add a functionality for best parameter tweak calculation" ([srt#621](https://github.com/Haivision/srt/issues/621));
   "Is there a mechanism in SRT to check loss continuously?" and set latency/overhead accordingly
   ([srt#460](https://github.com/Haivision/srt/issues/460)) **[FACT]**
9. **Guidance documents that agree with themselves** ([srt#3168](https://github.com/Haivision/srt/issues/3168),
   [srt#656](https://github.com/Haivision/srt/issues/656)) **[FACT]**
10. **A fallback that tolerates a transient monitoring outage.**
    "Is there a way that NOALBS can ignore this behavior and not switch to the offline scene
    immediately?" ([NOALBS#125](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/125))
    **[FACT]**
11. **Health measured at the switcher, not at a separate server** they had to erect for the purpose
    ([NOALBS#82](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/82))
    **[FACT]**
12. **Multiple contribution sources with priority and hand-off**, so two contributors can swap
    without the automation cutting to a card
    ([NOALBS#47](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/47),
    [#60](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/60)) **[FACT]**
13. **Per-guest routing and a director dashboard showing who is live**
    ([vdo.ninja#1218](https://github.com/steveseguin/vdo.ninja/issues/1218),
    [#569](https://github.com/steveseguin/vdo.ninja/issues/569),
    [#654](https://github.com/steveseguin/vdo.ninja/issues/654)) **[FACT]**
14. **Bonding that can be told to ignore an interface.** "allow excluding an interface from RIST
    bonding. RIST currently has no per-interface control; SRT connection priorities don't apply to
    RIST, and SRTLA doesn't bond VPN-type interfaces, so there is no workaround"
    ([moblin#418](https://github.com/eerimoq/moblin/issues/418)) **[FACT]**
15. **Edit the control-surface configuration in a spreadsheet**, because clicking each item is
    untenable ([companion#1339](https://github.com/bitfocus/companion/issues/1339)) **[FACT]**

---

## Implications for AV Planner Suite

The suite already claims the adjacent territory: Cable Planner's own README describes planning
"from camera to switcher to **encoder**" [LOCAL]. Today the encoder is where the drawing stops.
Everything in this dossier says the interesting half of the problem starts there.

### 1. Model the delivery path as first-class signal flow, not as a note on the last node

[INFERENCE, grounded in the evidence above] Extend the Cable Planner node/edge model past the
encoder: **encoder → uplink(s) → relay/ingest → destination(s)**. The edges need typed parameters
the engineer already fights with: protocol (RTMP/RTMPS/SRT/SRTLA/RIST/NDI), caller/listener role,
latency, passphrase-present flag, streamid, target bitrate, and — critically — a **path group**
so an A/B pair is visible as redundancy rather than as two unrelated lines.

Why this specifically: [moblin#418](https://github.com/eerimoq/moblin/issues/418) shows a
redundancy plan that was correct on paper and catastrophic in practice because the two paths were
not equal. A planner that renders "two paths" without asking *which carrier, which route, which
failure mode* reproduces the same illusion.

### 2. A destination register with real secret handling

The repository already stores Rentman tokens in the OS credential store via `keytar`, and CLAUDE.md
states the rule: external tokens "niemals loggen oder ins Projekt-File schreiben" [LOCAL]. **Apply
exactly that rule to stream keys.** The destination is project data (platform, ingest URL, bitrate
cap, key *reference*, owner, contact); the key itself is a keytar entry.

This addresses two findings at once: the duplication (one register, exported everywhere) and the
leakage (the config you paste into a support thread no longer contains the key —
[NOALBS#157](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/157)).

Practical consequence for the print/PDF path: a redacted printable destination sheet is the
artefact that can safely be handed to a client or pinned at the encoder position.

### 3. Export configuration instead of making people retype it

The double-entry table has one shape: the same handful of facts, in five formats. The suite is
well placed to be the authoring surface and emit the rest. Ranked by evidence strength:

- **OBS**: scene collection / profile JSON, and stream-service settings
- **Multi-destination plugin**: per-destination URL + key + bitrate
- **Scene-switcher (`config.json`)**: scene names, thresholds, stream-server entries with
  `priority`/`dependsOn` — the exact structure users guess at wrongly
  ([NOALBS#47](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/47))
- **Companion**: a generated page of buttons for the transmission chain
- **Relay**: nginx-rtmp / Restreamer / Prism destination blocks

[INFERENCE] Even a one-way export is worth more than nothing here, because the alternative is a
human retyping a GUID at 17:50.

### 4. A transport calculator, using the published formulas

The formulas for SRT receiver buffer, flow-control window and latency are public and were read in
full this session; their problem is that they are inconsistent between two sections of the same
document ([configuration-guidelines.md](https://raw.githubusercontent.com/Haivision/srt/master/docs/API/configuration-guidelines.md);
[srt#3168](https://github.com/Haivision/srt/issues/3168)). A planner that takes **measured RTT,
measured/assumed loss, target bitrate and MTU** and produces latency, `SRTO_FC`, `SRTO_RCVBUF` and
the resulting bandwidth overhead — showing its working, and citing which formula it used — is a
small, high-confidence feature that removes an hours-long research task per route.

This belongs in `src/renderer/lib/` alongside the existing length/power calculations, per the
CLAUDE.md placement table [LOCAL].

### 5. Make redundancy checkable, not decorative

[INFERENCE] Given a modelled path graph, the checks are mechanical and would have caught real
failures in this dossier:

- two "redundant" uplinks that terminate on the same relay, the same VPS provider, or the same
  carrier
- a destination with no second path at all
- a monitoring source (stats endpoint) that lives on the same host as the thing it monitors —
  precisely the [NOALBS#125](https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/125)
  false-offline failure
- an ISO recording whose only copy is on the machine doing the encoding
  ([obs-studio#12087](https://github.com/obsproject/obs-studio/issues/12087))

### 6. Connect the suite's own tally and intercom work to remote contributors

`tally-pi` already serves a browser tally page by QR code; `Broadcast-intercom` already issues
browser beltpacks by invite link and exposes a Companion control endpoint [LOCAL]. The evidenced
gap is precisely that on-air state and talkback do not cross to remote participants
([vdo.ninja#569](https://github.com/steveseguin/vdo.ninja/issues/569),
[#654](https://github.com/steveseguin/vdo.ninja/issues/654)). A remote-contributor mode — the same
invite-link mechanism, reachable over WAN — is a small extension of something that already exists,
aimed at a documented hole.

### 7. Offline-first is not a nice-to-have for this role

[INFERENCE] The streaming engineer plans in places with a captive portal and configures encoders
on a phone hotspot. The suite's existing offline-first posture is a genuine fit; a cloud-only
planner would be unusable at exactly the moment the plan needs changing.

### 8. What *not* to build on this dossier

Two tempting features rest on unverified ground and should be confirmed with forum access first:

- **Platform metadata management** (titles, descriptions, schedules pushed to each platform's API).
  Plausible, obviously duplicated, and completely unevidenced in this session.
- **Anything that assumes a paper transmission sheet exists.** I inferred it; I did not see it.

---

## Confidence summary

| Finding | Grade | Basis |
| --- | --- | --- |
| Destination/key config is duplicated across 4–6 systems per show | recurring | 4 independent projects, 6 issues read |
| Transport parameter tuning is unguided and the docs contradict themselves | recurring | verified directly against the source document |
| Monitoring and fallback are entirely user-built | widespread | 5+ independent projects exist solely for this |
| Streams fail silently; detection is out-of-band | recurring | 4 issues, 2021–2024 |
| Bonded redundancy can route the show into a dead link | recurring | 2 issues, one with measurements, 2024 + 2026 |
| The safety net fires falsely | recurring | 4 NOALBS issues, 2022–2024 |
| Encoders are absent from the show's control surface | recurring | 8 open module requests, 2020–2023 |
| Credentials live in operational config and reach public threads | recurring | 4 sources incl. two pasted configs |
| Remote-contributor routing/tally is a hand-built loop per event | recurring | 4 vdo.ninja issues, 2020–2025 |
| Paper / Excel / WhatsApp specifics for this role | **unverified** | forum layer unreachable |
| Event metadata duplication across platforms | **unverified** | no reachable source |
| German-market practice | **unverified** | all German sources blocked |

---

## Sources

Every URL below was opened and read in this session unless marked otherwise. Grouped by kind.

**Protocol and transport documentation (read in full)**

- https://raw.githubusercontent.com/Haivision/srt/master/docs/API/configuration-guidelines.md
- https://raw.githubusercontent.com/Haivision/srt/master/docs/features/live-streaming.md

**Issue trackers — transport and bonding**

- https://github.com/Haivision/srt/issues/460 — determine latency/oheadbw from loss (2018)
- https://github.com/Haivision/srt/issues/621 — request: best-parameter calculation (2019)
- https://github.com/Haivision/srt/issues/656 — deployment guide bandwidth-overhead table (2019, open)
- https://github.com/Haivision/srt/issues/1210 — improve description of latency options (2020)
- https://github.com/Haivision/srt/issues/2016 — negotiated link latency unknown (2021, open)
- https://github.com/Haivision/srt/issues/2157 — main/backup switching bandwidth peak (2021)
- https://github.com/Haivision/srt/issues/2600 — latency semantics questions (2023)
- https://github.com/Haivision/srt/issues/2749 — passphrase/streamid URI escaping (2023, open)
- https://github.com/Haivision/srt/issues/2968 — improve live-mode bandwidth measurement (2024, open)
- https://github.com/Haivision/srt/issues/3168 — inconsistency in receiver-buffer guidelines (2025, open)
- https://github.com/Haivision/srt/issues/3280 — receiving a live stream with srt-live-transmit (2026)
- https://github.com/eerimoq/moblin/issues/418 — RIST bonding sends traffic to dead link (2026-07, open)
- https://github.com/eerimoq/moblin/issues/89 — SRTLA bonding excludes cellular, IPv6/DNS (2024-12)

**Issue trackers — switcher, destinations, keys**

- https://github.com/obsproject/obs-studio/issues/11079 — stream keys bleed between services; settings lost (2024)
- https://github.com/obsproject/obs-studio/issues/4250 — SRT stream key vs streamid (2021)
- https://github.com/obsproject/obs-studio/issues/11016 — stream stops with no indication (2024)
- https://github.com/obsproject/obs-studio/issues/5572 — no audio after reconnect; VOD split (2021, 65 comments)
- https://github.com/obsproject/obs-studio/issues/6557 — reconnect audio bug, second reporter (2022)
- https://github.com/obsproject/obs-studio/issues/6813 — audio not sent after reconnection (2022)
- https://github.com/obsproject/obs-studio/issues/6497 — auto-reconnect vs dynamic bitrate on bonded LTE (2022)
- https://github.com/obsproject/obs-studio/issues/4596 — SRT reconnect while recording (2021, open, 26 comments)
- https://github.com/obsproject/obs-studio/issues/11062 — SRT freezes after reconnect, stale cached video (2024, open)
- https://github.com/obsproject/obs-studio/issues/13469 — SRT glitches/artifacts (2026-05, open)
- https://github.com/obsproject/obs-studio/issues/12087 — network congestion corrupts the recording (2025)
- https://github.com/obsproject/obs-studio/issues/13772 — CBR not honoured on AMD encoder (2026-08, open)
- https://github.com/obsproject/obs-studio/issues/11264 — enhanced broadcasting stays enabled in wizard (2024, open)
- https://github.com/obsproject/obs-studio/issues/13127 — enhanced broadcasting + stream encoder broken on AMD (2026, open)
- https://github.com/obsproject/obs-studio/issues/12958 — RTSP source does not reconnect (2025, open)
- https://github.com/obsproject/obs-studio/issues/6366 — random RTMP disconnects (2022)
- https://github.com/obsproject/obs-studio/issues/7381 — immediate disconnect without reconnect window (2022)
- https://github.com/obsproject/obs-studio/issues/8966 — clear-text credentials report (2023)
- https://github.com/obsproject/obs-studio/issues/8953 — scene-collection import changes live scene (2023)
- https://github.com/obsproject/obs-studio/issues/8635 — scene collection import silently does nothing (2023)
- https://github.com/obsproject/obs-studio/issues/6398 — crash importing a Windows scene collection on Linux (2022)
- https://github.com/obsproject/obs-studio/issues/6298 — profile export broken (2022)
- https://github.com/obsproject/obs-studio/issues/5599 — macOS profile export opens import dialog (2021)
- https://github.com/obsproject/obs-studio/issues/4600 — random audio dropouts while streaming (2021, open, 100 comments)
- https://github.com/sorayuki/obs-multi-rtmp/issues/344 — per-destination bitrate uncertainty (2023, open)
- https://github.com/sorayuki/obs-multi-rtmp/issues/329 — per-destination rate control and profile (2023)
- https://github.com/sorayuki/obs-multi-rtmp/issues/88 — bitrate allocation across destinations (2021, open)
- https://github.com/sorayuki/obs-multi-rtmp/issues/17 — start all outputs at once (2020, open, 16 comments)
- https://github.com/sorayuki/obs-multi-rtmp/issues/305 — same encoder, different bitrate (2023)
- https://github.com/datarhei/restreamer/issues/823 — "Help with Stream Key" (2024, open)
- https://github.com/datarhei/restreamer/issues/961 — custom stream key (2026, open)
- https://github.com/datarhei/restreamer/issues/873 — reuse an encode across platforms (2025, open)
- https://github.com/datarhei/restreamer/issues/278 — multiple RTMP destinations / key generation (2021)

**Issue trackers — monitoring and automatic fallback**

- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/178 — stats unreachable, permanent offline scene; full config posted (2024, open)
- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/157 — config posted with ingest auth credentials (2023, open)
- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/125 — transient blank stats page causes instant offline switch (2022)
- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/119 — sticky offline scene (2022, open, 18 comments)
- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/120 — Kiloview bonded encoder leaves channel at 0 bit/s (2022, open)
- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/175 — unwanted switching to BRB (2024)
- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/164 — triggers not taking effect (2024)
- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/82 — use OBS bitrate instead of nginx stats (2022, open)
- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/47 — stats for multiple ingest streams (2021)
- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/60 — second RTMP source (2021)

**Issue trackers — remote contribution and control surface**

- https://github.com/steveseguin/vdo.ninja/issues/1218 — "THE PAIN": corporate hybrid event routing (2025-12, open)
- https://github.com/steveseguin/vdo.ninja/issues/569 — tally status in the director view (2020, open)
- https://github.com/steveseguin/vdo.ninja/issues/654 — on-air indication and audible alert for guests (2021, open)
- https://github.com/steveseguin/vdo.ninja/issues/898 — per-participant isolated audio tracks into a DAW (2021, open)
- https://github.com/steveseguin/vdo.ninja/issues/276 — complex audio channel routing (2020, open)
- https://github.com/steveseguin/vdo.ninja/issues/838 — solo-hear for the director (2021, open)
- https://github.com/steveseguin/vdo.ninja/issues/665 — director changing a guest's broadcast settings remotely (2021, open)
- https://github.com/bitfocus/companion-module-requests/issues/177 — Wowza Clearcaster (2020, open)
- https://github.com/bitfocus/companion-module-requests/issues/194 — Haivision KB Encoder (2020, open)
- https://github.com/bitfocus/companion-module-requests/issues/540 — Cerevo LiveShell, "simple start and stop" (2021, open)
- https://github.com/bitfocus/companion-module-requests/issues/790 — Teradek VidiU Go (2022, open)
- https://github.com/bitfocus/companion-module-requests/issues/815 — Matrox Maevex 6120 (2022, open)
- https://github.com/bitfocus/companion-module-requests/issues/880 — Resi encoder (2022, open)
- https://github.com/bitfocus/companion-module-requests/issues/1080 — TBS 2603se (2023, open)
- https://github.com/bitfocus/companion-module-requests/issues/1143 — DataVideo NVS-33 (2023, open)
- https://github.com/bitfocus/companion-module-requests/issues/2075 — stream up/down as a trigger (2026, open)
- https://github.com/bitfocus/companion-module-requests/issues/777 — PTZ + StreamYard church setup (2022, open)
- https://github.com/bitfocus/companion/issues/1339 — edit button config in Excel (2020)
- https://github.com/bitfocus/companion/issues/2909 — bulk connection handling on config import (2024, open)
- https://github.com/bitfocus/companion/issues/3654 — "ignore all" on config import (2025, open)

**READMEs and project documentation (read in full)**

- https://raw.githubusercontent.com/BELABOX/srtla/master/README.md
- https://raw.githubusercontent.com/OpenIRL/srtla-receiver/main/README.md
- https://raw.githubusercontent.com/irlserver/srtla_send/main/README.md
- https://raw.githubusercontent.com/loopy750/SRT-Stats-Monitor/main/README.md
- https://raw.githubusercontent.com/roflb0y/SRTExporter/main/README.md
- https://raw.githubusercontent.com/IRLToolkit/obs-websocket-http/master/README.md
- https://raw.githubusercontent.com/MorrowShore/Prism/master/README.md
- https://raw.githubusercontent.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/v2/README.md
- https://github.com/BELABOX/belaUI — repository metadata only (no README; issue search returned nothing)
- https://github.com/NOALBS/belabot — repository metadata only
- https://github.com/keenan-smith/BelaboxBitrateOverlay — repository metadata only

**Corpus cross-references (second-hand in this session)**

- [`../METHOD.md`](../METHOD.md)
- [`../workflow-chain.md`](../workflow-chain.md)
- [`./technical-director.md`](./technical-director.md)
- [`./camera-operator.md`](./camera-operator.md)
- [`../landscape/camera-control-rcp.md`](../landscape/camera-control-rcp.md)
- [`../landscape/tally.md`](../landscape/tally.md)

**Local repositories (context, not independent demand)**

- `/home/user/cable-planner` — README, CLAUDE.md (keytar credential rule, `lib/` placement rule)
- `/home/user/av-planner-suite` — README
- `/home/user/tally-pi` — README (browser tally, ATEM, Companion)
- `/home/user/Broadcast-intercom` — README (browser beltpacks, Companion control endpoint)

**Blocked and therefore absent** (recorded so the gap is visible): reddit.com
(r/VIDEOENGINEERING, r/livesound, r/broadcastengineering), prosoundweb.com, controlbooth.com,
blue-room.org.uk, forum.blackmagicdesign.com, vmix.com and its forum, videohelp.com,
obsproject.com (forum and docs), help.twitch.tv, support.google.com, haivision.com,
srtalliance.org, liveu.tv, teradek.com, tvbeurope.com, thebroadcastbridge.com,
newscaststudio.com, en.wikipedia.org, stackoverflow.com, news.ycombinator.com,
film-tv-video.de, production-partner.de, and all other German-language sources.
