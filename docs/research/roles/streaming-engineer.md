# Streaming / REMI Engineers

Research dossier for AV Planner Suite. Compiled 2026-08-28, substantially rewritten 2026-08-29
with a new evidence layer.

> **Method note — how to read the evidence labels.**
>
> This session had working web search and working direct access to `github.com`,
> `raw.githubusercontent.com` and `gitlab.com`. It did **not** have direct fetch access to
> Reddit, ProSoundWeb, Control Booth, Blue Room, the Blackmagic forum, the vMix forum, the OBS
> forum, videohelp, TVBEurope, The Broadcast Bridge, NewscastStudio, film-tv-video.de,
> production-partner.de or any other non-GitHub host — the egress proxy answers 403 to CONNECT
> for those. Reddit is additionally excluded from the search index available here.
>
> The practical consequence is that this dossier has **two grades of directness**, and every
> claim says which one it is:
>
> - **[FETCHED]** — I opened the page myself in this session and read it. All GitHub issues,
>   READMEs and the local repositories are in this class. Dated and attributable.
> - **[SEARCH-EXTRACT]** — the content reached me as a verbatim-ish extract returned by the
>   search tool from a *named URL* that I could not open directly. The URL is cited so it can
>   be re-verified. This is one remove from the source: the extract is real page content, but
>   I could not read the surrounding context, the comment thread, or the date unless the
>   extract carried it.
> - **[PRIOR-SESSION]** — carried over from the 2026-08-28 version of this dossier, which read
>   those pages directly. URLs given so they can be re-checked.
> - **[INFERENCE]** — my reasoning from the above, flagged as reasoning, not as finding.
> - **unverified** — could not be established. Left visible rather than quietly dropped.
>
> **Frequency grades follow [`METHOD.md`](../METHOD.md)** and are deliberately conservative
> here. `widespread` is used only where (a) several *independent* projects exist for no purpose
> other than to solve the problem, (b) the vendor or maintainer concedes it, or (c) both a
> practitioner source and a vendor/platform document describe the same thing. Because the
> Reddit and pro-forum venting layer is still missing, several findings that are probably
> widespread are graded `recurring`.
>
> **Dates matter here more than in any other role in this corpus.** The streaming stack changes
> every quarter. Anything before ~2022 is marked as such. Where a complaint is old but the
> issue is *still open*, that is stated — an issue open for four years is itself the finding.

---

## Who they are / where they sit in the production

There is no settled job title. The same work is advertised and self-described as **streaming
engineer**, **encoding engineer**, **transmission engineer**, **broadcast IT**, **live event
technology engineer**, **REMI operator** or **at-home operator**; in German-speaking productions
as *Streaming-Techniker* or, in smaller companies, simply as "der mit dem Encoder". Job postings
confirm the spread: Paramount advertises a "Sr Live Event Technology Engineer", Meta a "Video
Streaming and Broadcast Engineer", the NFL a "Seasonal Video Streaming Engineer"
[SEARCH-EXTRACT: https://careers.paramount.com/job/New-York-Sr-Live-Event-Technology-Engineer-NY-10036/1374027700/ ,
https://www.metacareers.com/profile/job_details/1017266434469763/ ,
https://www.showbizjobs.com/jobs/nfl-seasonal-video-streaming-engineer-in-inglewood/jid-233wy7].

What is consistent is the *shape* of the role, and the shape explains everything else in this
document.

### They own the only output nobody in the room can see

Every other department produces something a human on site can verify by looking at it. Lighting
is on the stage. Audio is in the PA. The camera is on the multiviewer. The streaming engineer's
output exists somewhere else entirely — on a CDN edge, in a viewer's browser, on a client's
Teams call. Verification requires a *second device on a different network*, which the monitoring
literature states plainly: open the stream as a viewer on a separate network, because what you
see in the production feed and what the audience receives are not the same thing, and this is
the fastest way to catch CDN-side and geo-specific problems that source-side monitoring misses
[SEARCH-EXTRACT: https://www.obsbot.com/blog/live-streaming/streaming-monitoring ,
https://touchstream.media/blog/live-stream-monitoring/].

That single structural fact drives the rest: the alarm path, the double-checking rituals, the
"is it still up?" anxiety, and the fact that the streaming engineer is usually the last person
in the room to be told the rundown changed.

### They sit across three org boundaries at once

1. **Downstream of production.** They receive a program feed (and increasingly a *second*,
   differently-framed feed) from the TD/switcher, and an audio mix from the audio department.
   Neither is designed for them; both are designed for the room.
2. **Upstream of a platform they do not control.** YouTube, Twitch, LinkedIn, Vimeo, a client's
   webinar portal, or a corporate CDN. Each has its own ingest rules, its own credentials, its
   own console, its own idea of what "backup" means.
3. **Sideways into IT.** The venue's network is owned by someone whose job is to *keep ports
   closed*. RTMP's default port 1935 "is not a well-known port like 80 or 443, which means many
   corporate, campus, and public Wi-Fi networks block it by default"
   [SEARCH-EXTRACT: https://www.videosdk.live/developer-hub/rtmp/port-rtmp]. Encoding
   requirements documents ask venue IT for things that read as absurd to a security team —
   "each encoding unit must have an individual port assigned that travels a unique path out to
   the internet", ports 80 and 1935 open *for the full duration of testing and the event*, and
   "firewall, gatekeeper or other security protocols must be disabled if in place"
   [SEARCH-EXTRACT: https://help.webcasts.com/books/live-events/page/onsite-encoding-requirements/export/html].

### In REMI specifically, they are the production's single point of failure

REMI (remote integration model, "at-home" production) puts a minimal crew and the cameras at the
venue and the gallery hundreds or thousands of kilometres away
[SEARCH-EXTRACT: https://www.film-tv-video.de/term-word/remote-production/]. Everything the
gallery sees, hears, cuts and mixes crosses the streaming engineer's transport. The trade press
is unusually blunt about what this concentrates:

> "REMI punishes sloppiness. If the timing's off, the links are fragile, the comms is messy or
> nobody's thought about what happens when something fails, remote production will find that
> weakness and expose it live, in front of everyone."
> — Alistair Horne, Hornets Tech, in NewscastStudio's 2026 REMI roundtable
> [SEARCH-EXTRACT: https://www.newscaststudio.com/2026/08/21/industry-insights-remi-moves-from-experiment-to-operating-model/]

The same roundtable records that the industry has stopped optimising for lowest latency and
started optimising for *predictability*: Appear CTO Andy Rayner is quoted to the effect that
reliable remote production depends on consistency more than on chasing the lowest possible
delay, and that broadcasters now decide role-by-role which people stay at the venue rather than
treating remote-vs-on-site as binary [SEARCH-EXTRACT: same URL].

### Two populations, one toolchain

It matters for product decisions that this role is served by two very different populations
running largely the *same software*:

- **Broadcast/corporate professionals** with hardware encoders, bonded cellular, redundant
  paths and a service contract. German providers advertise exactly this as the differentiator:
  hardware-based encoding with redundancy on every important device and the internet access
  "dreifach abgesichert" (triple-secured)
  [SEARCH-EXTRACT: https://www.uxstream.net/livestream-dienstleister/ ,
  https://www.livecom-gruppe.de/live-event-streaming-technische-anforderungen-und-loesungen/].
- **Houses of worship, universities, clubs and small AV shops** running OBS or vMix on a laptop,
  often with volunteers. Church Production Magazine describes this population's relationship
  with the encoder precisely: most churches stream every service, but techs and volunteers may
  not fully understand what is happening inside the encoder, and "it just works… until it
  doesn't"
  [SEARCH-EXTRACT: https://www.churchproduction.com/magazine/encoding-101-how-streaming-really-works/ ,
  published 2026-06-03].

The pain points below are drawn from both. Where they diverge, that is noted.

---

## A day in the life

Chronological. Sources for each claim are attached inline; the aggregate picture is
[INFERENCE] built from them.

### Prep (days to weeks out)

**Assemble the destination set.** For each output: platform, ingest URL, stream key, backup
ingest URL, backup key, bitrate, resolution, frame rate, keyframe interval, audio sample rate
and codec, plus the platform-side event object (title, description, thumbnail, scheduled start,
privacy, monetisation, chat settings, latency mode). None of this arrives in one place. It comes
from the client by email, from a platform console the engineer may not have access to yet, and
from a producer's spreadsheet.

**Reconcile the per-platform specs, which genuinely differ.** Twitch caps non-partners near
6,000 kbps; YouTube accepts 9,000–12,000 kbps at 1080p60 and supports 4K, which Twitch does not
[SEARCH-EXTRACT: https://stream.twitch.tv/encoding/ ,
https://streamersize.com/blog/twitch-vs-youtube-bitrate-comparison/]. So a simulcast to both is
either a compromise on one platform or two encodes.

**Discover that the switcher software will not do two encodes cleanly.** vMix's own
documentation states that multi-bitrate support is *disabled* when using multiple destinations,
and that by default all three destinations use the same quality settings — video bitrate, audio
bitrate, encode size — and that keyframe frequency and master frame rate must match for every
additional streaming target
[SEARCH-EXTRACT: https://www.vmix.com/help23/StreamingMultipleDestinations.html ,
https://www.vmix.com/help23/StreamingMultiBitrate.html]. On the OBS side, the multi-destination
plugin's users ask the same question and do not get an answer: issue #448, "I want to broadcast
via two plattforms with different settings; YT 4k, TWITCH 1080p", opened 2024-10-26, still open,
no maintainer response
[FETCHED: https://github.com/sorayuki/obs-multi-rtmp/issues/448]. And the recommended
workaround — set secondary outputs to "Get from OBS" — explicitly gives up per-destination
quality in order to protect the CPU
[SEARCH-EXTRACT: search summary of https://github.com/sorayuki/obs-multi-rtmp].

**Write the network ask and send it into a void.** A dedicated hardwired line, upload headroom,
ports. The planning guidance is specific — a conference with three simultaneous breakout
streams and 500 attendees on Wi-Fi should plan a minimum of 100 Mbps *dedicated* upload,
separate from the attendee network
[SEARCH-EXTRACT: https://trivisionstudios.com/conference-live-streaming-services-in-dc-a-planning-guide/].
German guidance uses a headroom rule instead: reserve at least 40% of available bandwidth for
overhead, so a 10 Mbit line should carry no more than 6 Mbit of encoding
[SEARCH-EXTRACT: https://contentflow.live/wie-muss-ich-meinen-encoder-richtig-einstellen/].
Whether the venue delivers it is unknown until load-in.

**Decide the transport and its parameters.** If SRT: caller or listener (a firewall/NAT
decision, not a video decision — the listener needs a port-forward rule, the caller usually
needs nothing, and rendezvous is largely unusable behind PAT)
[SEARCH-EXTRACT: https://doc.haivision.com/SRT/1.5.3/Haivision/srt-connection-modes ,
https://streamrus.github.io/onpremise-srt-server-docs/en/srt-basics.html ,
https://www.kiloview.com/downloads/User%20Manual/SRT%20related%20manuals/SRT%20%20Rendezvous%20Mode.pdf].
Then latency: the published rule of thumb is 3–4× measured RTT, while practical guides recommend
fixed values of 1,500–2,500 ms; these do not agree for low-RTT links
[SEARCH-EXTRACT: https://vajracast.com/srt-latency-tuning/ ,
https://medium.com/innovation-labs-blog/examining-srt-streaming-over-4g-networks-925e71c45cdf].
The SRT project's own tracker has carried open requests for a parameter calculator and clearer
latency documentation for years [PRIOR-SESSION: Haivision/srt issues #621, #656, #1210, #2016,
#2600, #3168].

**Build the fallback logic by hand.** There is no product that ships "if the contribution feed
dies, cut to slate and tell me". So the engineer wires one: NOALBS polls an ingest stats page and
switches OBS scenes when bitrate crosses a threshold. Its configuration surface is the tell —
OBS websocket host/port/password, low-bitrate threshold, offline threshold, retry count, SRT RTT
thresholds, three scene names, server type (nginx / SRT Live Server / BELABOX / …), a stats URL,
publisher/application/key credentials, and optionally a Twitch or Kick bot with an OAuth token,
admin usernames and a command prefix — all as hand-edited JSON, with the README warning users to
use a code editor rather than Notepad
[FETCHED: https://raw.githubusercontent.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/v2/README.md].

### Load-in

Rack the encoder(s), get on the network, discover what is actually blocked. Run a test stream to
each destination — which is the only way to catch a stale key, a wrong key, an unready platform
event, and a blocked port before it matters. Start encoders early: German operational guidance
says at least 15 minutes before the scheduled start, and to switch on *all* cameras,
presentations and audio sources simultaneously for the test rather than one at a time
[SEARCH-EXTRACT: https://help.movingimage.com/docs/de/livestreaming-encoding-settings].

If the venue's line is inadequate or absent, the bonded-cellular rig comes out — and its
performance is not predictable from the map. A practitioner account of a "50 states in 50 days"
tour with a four-output bonded LiveU reports no consistency at all: sites with expected good
signal where bandwidth collapsed, and sites expected to have no signal that delivered a lot
[SEARCH-EXTRACT: https://medium.com/@joelouis761/packet-level-intelligence-the-hidden-variable-determining-cellular-bonding-reliability-361b7e6814c1 ;
single account, graded `isolated` on its own]. A Control Booth thread on the same question lands
on the more fundamental constraint: without clean upstream at the site, bonding will not save
you, and the audience's own phones are competing for the same towers
[SEARCH-EXTRACT: https://www.controlbooth.com/threads/help-with-cellular-bonding.47366/].

### Rehearsal

The rehearsal is the only opportunity to test the thing that most needs testing and is most often
skipped: **the failover itself**. Platform guidance is explicit that you should stop the primary
encoder during rehearsal and confirm the stream stays live on the backup path
[SEARCH-EXTRACT: https://docs.castr.com/en/articles/5023371-backup-ingest-how-to-use-benefits-and-limitations].
It is also explicit about why this is not optional: YouTube's primary and backup streams must
have the *exact same* resolution, video codec, bitrate, framerate, keyframe frequency and audio
sample rate, and if they drift apart, failover breaks or throws ingest errors
[SEARCH-EXTRACT: same, plus https://support.google.com/youtube/answer/2853702].

Rehearsal is also where remote contributors are onboarded, and where the mix-minus is proven or
not. VDO.Ninja's own documentation notes that its `&mixminus` parameter belongs on the *director*
link, not on guest links, and that it stops a guest hearing their own return but does **not**
stop speaker-to-mic acoustic bleed from a guest without headphones; the documented
troubleshooting method for echo is to mute participants one at a time until the culprit is found
[SEARCH-EXTRACT: https://docs.vdo.ninja/advanced-settings/other-parameters ,
https://docs.vdo.ninja/common-errors-and-known-issues/echo-or-feedback-issues].

### Show

Three things happen at once and none of them has a shared display.

**Watching the source side.** Encoder bitrate, dropped frames, RTT, congestion. In OBS this is a
status bar; on a hardware encoder it is a web UI; on a bonded unit it is a per-modem readout.

**Watching the destination side.** Platform console health, viewer count, and — the giveaway —
a second device on a different network. The monitoring literature concedes the fragmentation
directly: most setups pull monitoring data from separate places (a software encoder, a CDN
dashboard, an analytics platform), and "when something breaks, you're jumping between screens
trying to match up what happened where"
[SEARCH-EXTRACT: https://www.obsbot.com/blog/live-streaming/streaming-monitoring].

**Being the escalation point.** Job descriptions for this role name it: act as the primary
technical escalation point for live event operations during live events, and troubleshoot across
the complete delivery chain from encoding hardware through CDN to the player and its
authentication
[SEARCH-EXTRACT: https://careers.paramount.com/job/New-York-Sr-Live-Event-Technology-Engineer-NY-10036/1374027700/].

Meanwhile, comms is frequently the weakest link in the REMI chain and is solved with whatever is
to hand. The RTS "indie engineer's perspective" piece documents a REMI control room where three
operators needed to talk but only two Bluetooth connections were available on the comms system,
so the graphics operator ran the show on a **cellphone call** instead of a headset
[SEARCH-EXTRACT: https://rtsintercoms.com/news/2022/intercom-solutions-from-rts-play-key-role-in-pushing-ip-enabled-remote-broadcast-production-the-next-level-%E2%80%93-the-indie-engineer/ ,
2022].

### Load-out

Stop the outputs in the right order, end the platform events, confirm the recordings exist and
are not corrupt. That last check is not paranoia: OBS issue #12087 records network congestion
corrupting the local recording [PRIOR-SESSION:
https://github.com/obsproject/obs-studio/issues/12087], and issue #13147 records the sharper
version — when a *stream upload* stalls while using the multi-RTMP plugin, the encoder overloads
and the frame rate of the independent local **recording** degrades, producing unusable material
that has to be discarded. The reporter's argument is worth quoting as a design principle: stream
upload connectivity should be isolated from encoder logic; a transmission problem should not
compromise local encoding. It was closed as *not planned* on 2026-02-20
[FETCHED: https://github.com/obsproject/obs-studio/issues/13147].

Then: tear down, and take with you the configuration that exists only in this machine's profile.

### Post

Trim, retitle, unlist or publish the VOD; export clips; deliver an archive; and — when something
went wrong — explain it. Live-to-VOD is not a no-op: archives need post-event reprocessing to
normalise loudness, rebuild thumbnails, trim dead air and regenerate the ABR ladder for
on-demand behaviour [SEARCH-EXTRACT: https://callaba.io/video-on-demand].

The explanation is the part with no tooling. There is no artefact that says what the transport
did during the show. The community's answer has been to build one repeatedly — SRT stats
monitors and Prometheus exporters exist as standalone hobby projects precisely because the
encoders do not keep a record anyone can hand to a client
[PRIOR-SESSION: https://github.com/loopy750/SRT-Stats-Monitor ,
https://github.com/roflb0y/SRTExporter].

---

## Tools they actually use

| Tool | For what | How they feel about it |
| --- | --- | --- |
| **OBS Studio** | Encoding, scene switching, multi-destination via plugin, SRT/RTMP out | Indispensable and free; but the failure modes below are all logged against it. Reconnect behaviour and dynamic bitrate are actively distrusted [FETCHED: obs-studio #2496, #11877]. |
| **obs-multi-rtmp plugin** | Sending one program to several platforms | Tolerated. 213 open issues at the time of reading; the per-destination-quality question is unanswered; it can drag the main encoder down [FETCHED: sorayuki/obs-multi-rtmp #448, #458; obs-studio #13147]. |
| **vMix** | Switching plus streaming in one box, up to three destinations | Liked for the integration, resented for the constraint that multi-bitrate is disabled with multiple destinations and all targets share quality settings [SEARCH-EXTRACT: vmix.com/help23]. |
| **Hardware encoders** (LiveU, Teradek, Haivision, Matrox, Kiloview, Resi, Epiphan) | The reliable path; bonded cellular; rackmount REMI | Trusted more than the laptop. German trade coverage frames the LiveU LU810/LU610S class as bonding several internal 5G/4G modems plus WLAN and Ethernet with frame-synchronous multicam, for OB vans and fixed sites [SEARCH-EXTRACT: film-tv-video.de 2022-08-31]. Grudge: each has its own web UI and none is on the button surface. |
| **BELABOX / srtla, Moblin** | Open bonded SRT for people who cannot afford LiveU | Loved for existing; the bonding logic itself has open defects, e.g. traffic still sent to a dead link [PRIOR-SESSION: eerimoq/moblin #418, 2026-07, open]. |
| **NOALBS** | Automatic "cut to BRB when the bitrate dies" | Genuinely relied on, and brittle. Its failure mode is the worst possible one: it parks the show on the offline scene while the stream is fine [FETCHED: NOALBS #178 (2024, open), #119 (2022)]. |
| **Restreamer / MediaMTX / nginx-rtmp / OME** | Self-hosted fan-out, ingest, re-stream | Chosen to avoid a subscription; the cost is that stream-key semantics become the operator's problem [FETCHED: datarhei/restreamer #823, #961]. |
| **Platform consoles** (YouTube Studio, Twitch, LinkedIn, Vimeo) | Creating the event object, getting the key, watching health | Used grudgingly. Each is a separate login, a separate metadata form, and a separate definition of "backup". |
| **Restream / StreamYard / Castr / Livepush** | Cloud fan-out to avoid retyping metadata per platform | Used grudgingly by professionals: it removes double entry but inserts a third party into the delivery path and takes away encoder control. Their own marketing sells exactly the pain — "no need to retype titles, descriptions, and other details separately" [SEARCH-EXTRACT: restream.io, livepush.io, streamyard.com]. |
| **VDO.Ninja** | Remote contributors, return feeds, mix-minus | The de-facto standard for low-budget REMI contribution; every show is hand-built from URL parameters [SEARCH-EXTRACT: docs.vdo.ninja]. |
| **Zoom / Microsoft Teams** | Client-mandated contribution path | Actively resented. Practitioner reports describe 4K cameras and fast lines producing roughly 480p through Teams while Zoom looked professional, and describe Teams audio through a switcher as compressed and low-resolution [SEARCH-EXTRACT: https://techcommunity.microsoft.com/discussions/microsoftteams/ms-teams-video-quality-is-terrible/1354190/replies/2085955 , https://learn.microsoft.com/en-us/answers/questions/4418410/help-in-teams-what-is-needed-to-output-video-at-fh]. |
| **Bitfocus Companion + Stream Deck** | One button surface for OBS/vMix/switcher/playback | Loved. The grudge is what is *missing*: encoder and platform control. The module-request tracker is full of long-open asks for exactly these devices [PRIOR-SESSION: companion-module-requests #177, #194, #540, #790, #815, #880, #1080, #1143, #2075]. |
| **Excel / Google Sheets** | Destination lists, IP plans, run of show, credentials | Universal and unloved. See the Paper/Excel/WhatsApp section. |
| **WhatsApp / group chat** | Keys, links, "are we live?", last-minute changes | Universal and dangerous. Event-operations writing concedes group threads "work fine for planning but fall apart on event day when decisions need to happen in seconds" and that on a single channel "critical messages get buried" [SEARCH-EXTRACT: https://www.homerunent.com/blog/2026/7/7/event-operations-guide-managing-production-on-event-day , https://www.phaedrasolutions.com/blog/how-to-use-whatsapp-for-event-planning-without-hassle]. |
| **A second phone or laptop on cellular** | Confirming the audience actually has a picture | The most-used monitoring tool in the role, and it is not a product [SEARCH-EXTRACT: obsbot.com, touchstream.media]. |

---

## Time sinks

Ranked by my estimate of aggregate hours across a production, with the evidence for each.

### 1. Assembling and re-entering the destination/key set for every show

**Frequency: widespread.** Every output needs URL, key, backup URL, backup key, and a matched
set of encoding parameters — and the sets differ per platform by design (Twitch ~6 Mbps cap
vs YouTube 9–12 Mbps and 4K) [SEARCH-EXTRACT: stream.twitch.tv/encoding, streamersize.com].
There is no export/import of a destination set between the tools that need it. The entire
category of cloud multistreaming products exists to sell relief from this
[SEARCH-EXTRACT: restream.io, livepush.io, castr.com, streamyard.com], which is the strongest
available evidence that the underlying task is both universal and disliked.

Self-hosting does not remove it, it relocates it: Restreamer users open issues asking what part
of the generated RTMP URL is the "stream key" when pasting it into another product, and whether
a custom stream key is even possible
[FETCHED: https://github.com/datarhei/restreamer/issues/823 (2024-09-26, open, labelled
"question"/"help wanted"), https://github.com/datarhei/restreamer/issues/961 (2026-01-07, open)].

### 2. Tuning transport parameters against documentation that does not agree with itself

**Frequency: widespread.** For SRT the engineer must choose connection mode (caller / listener /
rendezvous — a NAT decision, with rendezvous largely unusable behind PAT), latency, and overhead
bandwidth. The published guidance splits: 3–4× RTT as a formula versus fixed 1,500–2,500 ms as
practice [SEARCH-EXTRACT: vajracast.com/srt-latency-tuning/, medium innovation-labs;
doc.haivision.com, kiloview rendezvous PDF, streamrus.github.io]. The SRT project's own tracker
has carried requests for a parameter calculator, a bandwidth-overhead table, and clearer latency
semantics since 2019, several still open [PRIOR-SESSION: Haivision/srt #621, #656, #1210, #2016,
#2600, #2968, #3168].

The cost is not the maths. It is that the answer is re-derived per venue, per link, per show,
and never written down anywhere the next engineer can find it.

### 3. Building and maintaining the monitoring and fallback rig that no product ships

**Frequency: widespread**, on criterion (a) — several independent projects exist for no other
purpose. NOALBS exists to switch OBS scenes on bitrate collapse; SRT-Stats-Monitor and
SRTExporter exist to make transport telemetry visible; obs-websocket-http exists to let other
things drive OBS
[FETCHED: NOALBS README; PRIOR-SESSION: loopy750/SRT-Stats-Monitor, roflb0y/SRTExporter,
IRLToolkit/obs-websocket-http]. Configuring NOALBS alone means hand-editing JSON containing an
OBS websocket password, ingest credentials, and a chat OAuth token
[FETCHED: NOALBS README].

And it is fragile in the direction that hurts: NOALBS #178 (2024-10-23, open) is a working
production where NOALBS cannot reach `http://localhost/stat` — a URL that works fine in a browser
— so it continuously switches to the offline scene while the RTMP stream is live, and the
`!bitrate` chat command answers "No connection :(" [FETCHED]. NOALBS #119 (2022-09-14) is the
same class: the tool reverts to the offline scene instantly, even when the stream is healthy and
the operator switches back by hand [FETCHED].

### 4. Re-creating the same setup on the second machine, and on the next show

**Frequency: recurring.** Redundancy means a second encoder configured identically — and
"identically" is a hard requirement, not a preference, because YouTube's failover breaks if
primary and backup differ in resolution, codec, bitrate, framerate, keyframe frequency or audio
sample rate [SEARCH-EXTRACT: docs.castr.com backup-ingest, support.google.com/youtube/answer/2853702].
There is no first-class "copy this delivery configuration to that box" operation across
heterogeneous encoders; the OBS-side machinery for moving profiles and scene collections has its
own defect history [PRIOR-SESSION: obs-studio #6298 profile export broken, #5599, #8635, #8953,
#6398].

German practice confirms the same shape at the professional end: redundant encoding of the mixed
signal through **two** enterprise SRT hardware encoders in parallel
[SEARCH-EXTRACT: https://www.production-partner.de/story/tividoo-events-streaming-als-gesamtkonzept/],
and a backup connection such as an LTE modem alongside a second fixed line
[SEARCH-EXTRACT: https://www.production-partner.de/basics/tipps-fuer-ein-gelungenes-streaming/].
Every one of those is a config surface to keep in sync by hand.

### 5. Onboarding and babysitting remote contributors

**Frequency: recurring.** Each remote guest needs a send link, a return feed, a mix-minus, a
level check and a way to know they are on air. VDO.Ninja documents that mix-minus is a
director-link parameter, that it does not solve acoustic bleed, and that the supported echo
diagnostic is muting people one at a time [SEARCH-EXTRACT: docs.vdo.ninja]. Tally and on-air
indication for remote guests have been open feature requests since 2020–2021
[PRIOR-SESSION: steveseguin/vdo.ninja #569, #654]. When the client insists on Teams instead, the
engineer absorbs a documented quality drop [SEARCH-EXTRACT: Microsoft community threads above].

### 6. Negotiating with venue IT

**Frequency: recurring.** Port 1935 blocked by default on corporate, campus and public networks
[SEARCH-EXTRACT: videosdk.live]; fallback chains to 443 and then RTMPT on 80
[SEARCH-EXTRACT: https://www.dacast.com/support/knowledgebase/firewall-ports-for-rtmp-streaming/];
onsite encoding requirement documents that ask for security controls to be disabled outright
[SEARCH-EXTRACT: help.webcasts.com]. Each venue is a fresh negotiation with a fresh person, and
the outcome is rarely recorded anywhere reusable.

### 7. Explaining, afterwards, what happened

**Frequency: recurring** [INFERENCE from the tooling gap]. No mainstream encoder produces a
show-shaped transport record. The community-built stats exporters are the workaround
[PRIOR-SESSION: SRT-Stats-Monitor, SRTExporter]. Absent that, the post-mortem is reconstructed
from OBS log files, a platform console's health graph, and memory.

---

## Double data entry

What gets typed into more than one system, with the second and third system named.

| Datum | System 1 | System 2 | System 3 | Evidence |
| --- | --- | --- | --- | --- |
| Ingest URL + stream key | Platform console | Encoder / OBS / vMix profile | Backup encoder; often also a run-of-show sheet or chat message | [SEARCH-EXTRACT: vmix.com/help23/StreamingMultipleDestinations.html; gitguardian stream-key remediation] |
| Bitrate / resolution / fps / keyframe / audio sample rate | Primary encoder | Backup encoder (must match exactly or failover breaks) | Each additional destination in a multi-RTMP plugin | [SEARCH-EXTRACT: docs.castr.com backup-ingest; support.google.com/youtube/answer/2853702] [FETCHED: sorayuki/obs-multi-rtmp #448] |
| Event metadata (title, description, thumbnail, start time, privacy) | YouTube Studio | Facebook/LinkedIn/Vimeo event | Client's CMS or webinar portal; plus the marketing team's calendar | [SEARCH-EXTRACT: multistreaming vendor pages sell removal of exactly this retyping — restream.io, livepush.io, streamyard.com] |
| SRT/RIST parameters (mode, port, latency, passphrase, streamid) | Sender | Receiver | Firewall rule request to venue IT | [SEARCH-EXTRACT: doc.haivision.com connection modes; help.webcasts.com onsite requirements] |
| Scene names used by the fallback logic | OBS scene collection | NOALBS JSON config | The operator's memory during the show | [FETCHED: NOALBS README, #119, #178] |
| Device IPs / ports / VLANs | Encoder web UIs | The network plan spreadsheet | The venue IT ticket | [SEARCH-EXTRACT: thebroadcastbridge.com — broadcasters "traditionally maintain spreadsheets that need manual intervention"] |
| Credentials (OBS websocket password, ingest auth, chat OAuth) | The tool's settings | The JSON config file | A password manager, a shared doc, or a chat thread | [FETCHED: NOALBS README] [PRIOR-SESSION: NOALBS #157 with credentials pasted into a public issue; obs-studio #8966 clear-text credentials] |
| Which output feeds which platform | The engineer's head | The multi-RTMP plugin's output list | The run-of-show / cue sheet the TD reads | [INFERENCE] |

The pattern worth naming for product purposes: **the same delivery configuration is expressed
three times in three vocabularies** — once as a platform event, once as encoder settings, once as
a human-readable line in a document — and nothing checks that the three agree.

---

## Error sources

### 1. The stream stops and nothing tells anyone

**Cost: the show is off air for as long as it takes a human to look at the right screen.**
Structurally, the operator's only reliable detector is a second device on another network
[SEARCH-EXTRACT: obsbot.com, touchstream.media]. Concretely, OBS's reconnect machinery is
documented to fail in ways that leave the operator with a dead stream and a UI that does not
insist:

- **Dynamic Bitrate breaks Automatically Reconnect.** The stream sticks at 0 kbps, no
  reconnection is attempted, and the operator must close and restart OBS. The reporter's
  conclusion: disabling Dynamic Bitrate fixes it — i.e. choose between adaptive bitrate and
  reliable reconnection [FETCHED: https://github.com/obsproject/obs-studio/issues/2496 ,
  2020-03-13, closed]. A second, later report describes the same interaction on bonded LTE
  [PRIOR-SESSION: obs-studio #6497, 2022].
- **On instability, OBS drops the stream key, not just the connection.** Issue #11877
  (2025-02-18): the user expected a temporary disconnect and reconnect; instead OBS disconnected
  from the Twitch stream key entirely and would not accept it again without a full restart
  [FETCHED].
- **Silent stop.** "Stream stops with no indication" and "Live Streaming Keeps Stopping" are
  separate 2024 reports [PRIOR-SESSION: obs-studio #11016; also #11864 "Stream was stopped by
  the system"].

**Frequency: widespread** — the vendor concedes it in the form of multiple long-lived issues
across five years.

### 2. The redundancy is decorative

**Cost: the backup path is proven wrong at the exact moment it is needed.** YouTube's backup
ingest requires primary and backup to match on resolution, codec, bitrate, framerate, keyframe
frequency and audio sample rate; if they drift, failover breaks or the ingest errors
[SEARCH-EXTRACT: docs.castr.com backup-ingest]. Nothing in the encoder validates this. The only
proof is a rehearsal in which you deliberately kill the primary
[SEARCH-EXTRACT: same]. **Frequency: recurring**, and the corresponding failure at the bonding
layer is worse — Moblin issue #418 (2026-07, open) reports RIST bonding continuing to send
traffic down a link that is already dead [PRIOR-SESSION].

### 3. The safety net fires when nothing is wrong

**Cost: the audience sees a "be right back" slate during the keynote.** NOALBS #178 (2024, open):
stats endpoint unreachable from the tool though fine in a browser, so it parks on the offline
scene while the stream is live [FETCHED]. NOALBS #119 (2022): sticky offline scene that
reasserts itself instantly after manual correction [FETCHED]. #125 records a transient blank
stats page causing an instant offline switch [PRIOR-SESSION]. **Frequency: recurring** — four
issues, same failure class, three years apart.

### 4. It reconnects, and comes back wrong

**Cost: the show continues but the deliverable is damaged, often unnoticed until post.**
Documented variants: audio missing after reconnect [PRIOR-SESSION: obs-studio #5572 (65
comments), #6557, #6813]; SRT freezing on stale cached video after reconnect [PRIOR-SESSION:
#11062, 2024, open]; SRT sources unable to reconnect while a recording is running
[PRIOR-SESSION: #4596 (2021, open, 26 comments), #13506 (2026-05, open)]; AV1 output to YouTube
not recovering after dropped frames when other encoders do [PRIOR-SESSION: #10584].

### 5. A transmission problem damages the local recording

**Cost: the client's archive copy is unusable, and the failure is discovered after load-out.**
Issue #13147: an upload stall on any multi-RTMP output overloads the encoder and degrades the
independently-configured recording's frame rate; the reporter had to discard the material. Closed
as not planned, 2026-02-20 [FETCHED]. Issue #12087 reports network congestion corrupting the
recording [PRIOR-SESSION]. **Frequency: recurring.** This is the single most expensive error
class in the list, because it destroys the insurance copy using the same event it was insuring
against.

### 6. Keys and services bleed into each other

**Cost: broadcasting to the wrong destination, or not broadcasting at all.** OBS issue #11079
(2024) records stream keys bleeding between services and settings being lost [PRIOR-SESSION].
On the SRT side, OBS discarded the "Stream Key" field entirely for years, forcing operators to
hand-assemble a `streamid` into the URL, and a `streamid` containing key/value pairs was
truncated at the `?`
[FETCHED: https://github.com/obsproject/obs-studio/issues/4250 (2021, fixed 2022-11),
https://github.com/obsproject/obs-studio/issues/2990 (2020)]. The consequence class is well
known enough that platform-side guidance names it: wrong destination is among the most expensive
operator mistakes, and the recommended mitigations are a two-step verification before a
high-stakes broadcast and a short test stream to catch wrong or stale keys
[SEARCH-EXTRACT: https://heystream.com/blog/twitch-stream-key-rtmp-setup].

### 7. Credentials end up in places they should not be

**Cost: someone else broadcasts on your channel; or a platform-wide key rotation.** A stream key
is a password — anyone holding it can broadcast from the channel without touching the login — and
the standing advice is that keys live in one place, "and that place is not your group chat", with
an explicit instruction to audit docs, screenshots and chat history
[SEARCH-EXTRACT: https://onestream.live/blog/stream-leak-prevent-stream-hack/ ,
https://www.gitguardian.com/remediation/twitch-stream-key]. That a secrets-scanning vendor
maintains dedicated remediation playbooks for *Twitch stream key* and *generic stream key*
detectors is itself evidence the leak path is common
[SEARCH-EXTRACT: https://www.gitguardian.com/remediation/stream-key]. Twitch has previously
reset stream keys for all users after a leak
[SEARCH-EXTRACT: https://www.dexerto.com/entertainment/twitch-resets-stream-keys-for-everyone-but-says-passwords-are-safe-after-leak-1670117/].
In this corpus the concrete instance is in the open: a NOALBS configuration pasted into a public
issue complete with ingest auth credentials [PRIOR-SESSION: NOALBS #157, 2023, open].
**Frequency: recurring**, with the caveat that most instances are invisible by nature.

### 8. Bitrate control that does not control the bitrate

**Cost: platform-side ingest errors and buffering for viewers.** Reports include CBR not being
honoured on an AMD encoder [PRIOR-SESSION: obs-studio #13772, 2026-08, open], changing the
output bitrate mid-stream dropping output to 0 kbps and ending the stream [PRIOR-SESSION:
#13228, 2026-03], and unexplained bitrate collapse from 6,000 to under 1,000 [PRIOR-SESSION:
#13064, 2026-01]. Separately, a documented Twitch ingest pattern: connection succeeds, then at
roughly 25 seconds `RTMP send error 10054` and disconnect, with frame drops of 32–42% per cycle,
on a 1,000 Mbps line, no maintainer response
[FETCHED: https://github.com/sorayuki/obs-multi-rtmp/issues/458 , 2024-12-26, open].

### 9. Nobody checked the upload before the show

**Cost: an unrecoverable stream that looked fine in the room.** A post-mortem write-up of 50
failed streams reports that several streamers had never actually checked upload bandwidth before
going live, and that a single Wi-Fi drop ended streams outright because no fallback existed
[SEARCH-EXTRACT: https://yostream.io/blog/why-live-streams-fail/ ; secondary source, treat as
indicative]. This is the amateur end of the population, but it is the same tool stack.

---

## Paper / Excel / WhatsApp inventory

Specific artefacts. Where the artefact is attested in a source I read, that is marked; where it
is a reasonable inference from the corpus, that is marked too, and it should be confirmed by
interview before anything is built on it.

### Attested

| Artefact | Medium | Evidence |
| --- | --- | --- |
| **IP address / device plan for the production network** | Excel | Broadcast networks contain thousands of endpoint addresses; "keeping a record of these is a logistical nightmare", and broadcasters "traditionally maintain spreadsheets that need manual intervention to keep them up to date" — the stated motivation for NMOS is reducing "reams of spreadsheets" [SEARCH-EXTRACT: https://www.thebroadcastbridge.com/content/entry/6303/understanding-ip-broadcast-production-networks-basic-principles-of-ip]. |
| **Run of show / cue sheet** | Excel, Google Sheets or Numbers | Template libraries for run-of-show exist explicitly in those three formats, marketed for broadcasts and webinars [SEARCH-EXTRACT: https://rundownstudio.app/templates/]. |
| **Streaming checklist** | Web page printed, or a checklist doc | Multiple vendors publish "the ultimate live streaming checklist" as the operational artefact of record [SEARCH-EXTRACT: https://www.switcherstudio.com/blog/the-ultimate-livestreaming-checklist-to-ensure-smooth-streaming , https://ecamm.com/blog/live-streaming-checklist/]. |
| **Onsite encoding requirements / technical rider** | PDF or web doc emailed to the venue | Named port lists, per-encoder port assignments, and instructions to disable security controls [SEARCH-EXTRACT: https://help.webcasts.com/books/live-events/page/onsite-encoding-requirements/export/html]. |
| **Stream keys in chat threads and shared docs** | WhatsApp / Slack / a shared doc | The security guidance is written *against* an observed practice: do not store keys in plain-text shared documents, do not send them through long-lived chat threads, and audit chat history for them [SEARCH-EXTRACT: https://heystream.com/blog/twitch-stream-key-rtmp-setup , https://onestream.live/blog/stream-leak-prevent-stream-hack/]. |
| **Credentials inside hand-edited config files** | JSON on disk | NOALBS requires OBS websocket password, ingest publisher/app/key and a chat OAuth token in one JSON file [FETCHED: NOALBS README]; a real user's config with credentials was pasted into a public issue [PRIOR-SESSION: NOALBS #157]. |
| **Day-of coordination in a group chat** | WhatsApp / equivalent | Event-ops writing states group threads "work fine for planning but fall apart on event day when decisions need to happen in seconds" and that on one channel "critical messages get buried"; the recommended fix is *more* channels plus radios/PTT [SEARCH-EXTRACT: https://www.homerunent.com/blog/2026/7/7/event-operations-guide-managing-production-on-event-day , https://www.phaedrasolutions.com/blog/how-to-use-whatsapp-for-event-planning-without-hassle]. |
| **The intercom workaround** | A phone call | Three operators, two Bluetooth comms connections, graphics op on a cellphone for the duration of a REMI show [SEARCH-EXTRACT: rtsintercoms.com, 2022]. |

### Inference, clearly labelled

- **The destination sheet.** One tab per show listing platform, ingest URL, key, backup, bitrate,
  and who owns the account. [INFERENCE] from the double-entry pattern plus the existence of
  multistreaming products sold on removing exactly this retyping. Not directly attested in a
  source I read; confirm before building.
- **The SIM / data-plan inventory.** Which SIM is in which modem, which plan, how much data left.
  [INFERENCE] supported only by vendor marketing for carrier-neutral broadcast SIMs that promises
  "the same SIMs work at Silverstone, Monza, the Circuit de Barcelona-Catalunya… without
  reconfiguration" [SEARCH-EXTRACT: https://weconnect.one/blogs/best-sim-for-liveu-encoder-in-europe-carrier-neutral-broadcasting-sim-compared/ ,
  vendor source, weak].
- **The "what we did last time at this venue" note.** [INFERENCE]. The single most valuable
  document in the role and the one least likely to exist in a shared, findable form.

### Explicitly still unverified

German-market specifics about paper and spreadsheet practice remain **unverified**: the German
sources reachable this session were vendor and trade pages about technique, not practitioner
accounts of paperwork. Reddit and the professional forums remain unreachable, so the
first-person "here is my actual spreadsheet" layer is still missing from this dossier.

---

## Missing interfaces

Department handovers that break, in the order they bite.

### Audio → streaming: the stream mix is designed twice

The PA mix and the stream mix are different products with different targets, and the handover is
usually a matrix send and a verbal agreement. Nothing in either department's tooling records what
the stream mix is supposed to contain, whether the mix-minus for remote guests is correct, or
what the loudness target is. The remote-contribution layer makes it worse: VDO.Ninja's mix-minus
lives in a URL parameter on the director link and does not survive being written down anywhere
[SEARCH-EXTRACT: docs.vdo.ninja/advanced-settings/other-parameters]. **Frequency: recurring**
[INFERENCE, corroborated by the echo-troubleshooting procedure being "mute people one at a time"].

### Switcher/TD → remote contributors: no tally crosses the boundary

On-air indication for remote guests has been an open request in the dominant remote-contribution
tool since 2020–2021 [PRIOR-SESSION: vdo.ninja #569 tally in director view, #654 on-air
indication and audible alert for guests, both open]. Meanwhile the in-room tally chain is solved.
The result is a class of guest who does not know they are live. **Frequency: recurring.**

### Encoders and platforms → the show control surface

Companion can drive OBS, vMix, ATEM, ProPresenter, lighting and audio
[SEARCH-EXTRACT: https://bitfocus.io/companion , https://www.crazyamazingdesigns.com/knowledge-base/bitfocus-companion-streamdeck-church-production].
It cannot, generally, drive the hardware encoder or read the platform's health. The
module-request tracker is a list of exactly that gap left open for years: Wowza Clearcaster
(2020), Haivision KB (2020), Cerevo LiveShell "simple start and stop" (2021), Teradek VidiU Go
(2022), Matrox Maevex 6120 (2022), Resi (2022), TBS 2603se (2023), DataVideo NVS-33 (2023), and
in 2026 a request for **stream up/down as a trigger** [PRIOR-SESSION: companion-module-requests
#177, #194, #540, #790, #815, #880, #1080, #1143, #2075 — all open]. **Frequency: widespread**
on criterion (b): the ecosystem concedes it by leaving nine such requests open.

The 2026 request is the important one. "Stream up/down as a trigger" is the missing primitive
for the entire alarm path: it would let the transmission chain announce its own state to the same
button surface everyone else is already watching.

### Monitoring → the production's alarm path

Encoder telemetry, CDN health and player analytics live in three consoles and are correlated by a
human under time pressure [SEARCH-EXTRACT: obsbot.com/blog/live-streaming/streaming-monitoring].
There is no shared, production-shaped "the stream is healthy" indicator that a TD, a producer and
a client can all look at. **Frequency: widespread** on criterion (c): a practitioner-facing blog
and a monitoring vendor describe the same fragmentation.

### Rundown → transmission

The rundown says what happens. It does not say what the transmission chain must do at each point:
when to start and stop each destination, when the vertical/social output is needed, when a
segment must not be published, when to switch to the backup path for a sponsor read. The
streaming engineer reads the rundown and translates it into their own head or their own notes.
**Frequency: recurring** [INFERENCE, consistent with run-of-show templates being generic
spreadsheets with no transmission column — https://rundownstudio.app/templates/].

### Client → engineer: account ownership

The platform account belongs to the client; the responsibility for what it broadcasts belongs to
the engineer. Key rotation, permission grants and event creation therefore sit on a boundary with
no defined interface, which is why keys travel by chat message
[SEARCH-EXTRACT: heystream.com, onestream.live]. **Frequency: recurring** [INFERENCE from the
security guidance being written against this exact practice].

### Captions / accessibility

"Captioning usually fails at the handoff points" is the explicit framing in an accessibility
trade explainer, which argues captioning should be treated as a live performance workflow rather
than a text output [SEARCH-EXTRACT: https://translators-usa.com/real-time-captioning-services].
The handoff in question — clean audio to the captioner, caption data back into the encoder as
CEA-608 or CMAF ingest — crosses at least two departments and one vendor
[SEARCH-EXTRACT: https://www.syncwords.com/products/automated-live-captions-using-srt-streaming].
**Frequency: recurring.**

---

## Workflows that are needlessly complicated

1. **Simulcasting with different quality per platform.** Should be one program, N encodes, N
   destinations. Is: a plugin whose per-destination quality question goes unanswered
   [FETCHED: obs-multi-rtmp #448], a switcher that disables multi-bitrate the moment you add a
   second destination [SEARCH-EXTRACT: vmix.com/help23], or a third-party cloud service inserted
   into the delivery path.
2. **Making failover real.** Should be: declare a backup, the system enforces parameter parity
   and lets you test it. Is: manually mirror six settings across two encoders, then deliberately
   pull the plug in rehearsal and watch [SEARCH-EXTRACT: docs.castr.com backup-ingest].
3. **Getting an alarm when the stream dies.** Should be a property of the encoder. Is: a separate
   Rust program polling a stats page, plus a phone on cellular, plus a chat bot
   [FETCHED: NOALBS README, #178].
4. **Putting the encoder on the button surface.** Should be a module. Is: nine open module
   requests and a browser tab [PRIOR-SESSION: companion-module-requests].
5. **Sending a stream key to a colleague.** Should be a scoped, revocable share. Is: a chat
   message that security guidance explicitly tells you not to send
   [SEARCH-EXTRACT: onestream.live, gitguardian].
6. **Choosing SRT connection direction.** Should follow from the network topology automatically.
   Is: a human reasoning about NAT, port-forwards and PAT, per link, per venue
   [SEARCH-EXTRACT: doc.haivision.com, kiloview PDF].
7. **Proving what happened.** Should be an exportable transport record. Is: log files, a screen
   recording of a console if someone thought of it, and hobby-built stats exporters
   [PRIOR-SESSION: SRT-Stats-Monitor, SRTExporter].

---

## Software they use grudgingly, and why

| Software | Why grudgingly |
| --- | --- |
| **Microsoft Teams as a contribution path** | Client-mandated; practitioner reports of roughly 480p from 4K sources and compressed audio through a switcher, versus Zoom looking professional on the same setup [SEARCH-EXTRACT: techcommunity.microsoft.com, learn.microsoft.com Q&A]. |
| **Cloud multistreaming services (Restream, StreamYard, Castr, Livepush)** | They remove the metadata retyping, which is real relief, at the price of putting a third party in the delivery path and taking away encoder control [SEARCH-EXTRACT: vendor pages, above]. |
| **obs-multi-rtmp** | Necessary and unmaintained-feeling: 213 open issues, the core per-destination-quality question unanswered, and a documented path by which it drags the main encoder down [FETCHED: #448, #458; obs-studio #13147]. |
| **Platform consoles** | One login and one metadata form per platform, and each defines "backup" differently. |
| **Webinar/hybrid-event platforms** | Widely described as clunky producer portals with a learning curve that causes friction when onboarding guest speakers [SEARCH-EXTRACT: https://webinarninja.com/blog/live-webinar-platforms/ , vendor-comparison content — weak source, but the complaint recurs across several]. |
| **Excel** | Used for the IP plan, the destination list and the run of show because nothing better exists that all departments can open; conceded in the broadcast IP literature as a manual-maintenance burden [SEARCH-EXTRACT: thebroadcastbridge.com]. |
| **NOALBS and friends** | Relied on precisely because no product ships the function, and distrusted because its failure mode is to park the show on a slate [FETCHED: #178, #119]. |

---

## What they would want

Their own stated wishes, from the sources — not my product ideas.

1. **"Stream up/down as a trigger."** A 2026 Companion module request, still open: make the
   transmission chain's state available to the show-control surface
   [PRIOR-SESSION: bitfocus/companion-module-requests #2075].
2. **Encoder control on the button surface.** Nine separate module requests naming specific
   encoders, one of them explicitly asking for nothing more than "simple start and stop"
   [PRIOR-SESSION: companion-module-requests #177, #194, #540, #790, #815, #880, #1080, #1143].
3. **Different settings per destination from one program.** Stated verbatim: "I want to broadcast
   via two plattforms with different settings; YT 4k, TWITCH 1080p"
   [FETCHED: obs-multi-rtmp #448, 2024-10-26, open].
4. **Transmission problems must not damage local encoding.** Stated as a design principle by a
   reporter whose recording was ruined by an upload stall: stream upload connectivity should be
   isolated from encoder logic [FETCHED: obs-studio #13147, closed as not planned].
5. **One place to orchestrate destinations.** "I would like to tell OBS just stream to this
   address, then in restreamer I can orchestrate streams to YouTube, Periscope, etc. all in the
   perfect transcoding options independently to every network"
   [FETCHED: https://github.com/datarhei/restreamer/issues/76 , 2019 — old, but the same request
   recurs in #278, #873, #961].
6. **A parameter calculator instead of folklore.** Long-standing requests on the SRT tracker for
   best-parameter calculation and a bandwidth-overhead table
   [PRIOR-SESSION: Haivision/srt #621, #656].
7. **On-air indication for remote guests.** Open since 2020–2021
   [PRIOR-SESSION: vdo.ninja #569, #654].
8. **Custom, controllable stream keys.** Repeatedly asked of self-hosted ingest software
   [FETCHED: restreamer #961, #823].
9. **Predictability over peak performance.** The industry-level version, from the trade press:
   reliability depends on consistency more than on the lowest latency, and the discipline that
   matters is planning for failure rather than tuning for speed
   [SEARCH-EXTRACT: newscaststudio.com 2026 REMI roundtable].

---

## Implications for AV Planner Suite

Concrete, ordered by evidence strength. Each states what the evidence actually supports and what
it does not.

### 1. Model the delivery path as first-class signal flow

Cable Planner already models SDI and device connections. The transmission chain — encoder,
transport (SRT/RTMP/RIST/SRTLA), destination, backup destination — is signal flow that currently
falls off the end of the diagram as a note on the last node. Making it a modelled path is the
prerequisite for everything below, and it fits the existing domain model (`EquipmentItem`,
`Cable`, `LocationFrame`) rather than fighting it.

*Evidence:* the whole of this dossier. *Risk:* none identified.

### 2. A destination register with real secret handling

A per-project register of destinations: platform, ingest URL, key, backup URL, backup key,
required encoding parameters, and account owner. Keys must go through the OS credential store —
the Cable Planner CLAUDE.md already mandates `keytar` for Rentman tokens and forbids writing
external tokens into the project file, and stream keys are exactly the same class of secret.

*Evidence:* [FETCHED] restreamer #823/#961; [SEARCH-EXTRACT] gitguardian remediation playbooks,
onestream.live and heystream.com both instructing that keys must not live in shared docs or chat.
*What the evidence does not support:* that engineers want the tool to *hold* the live key rather
than reference it. Offer both: a reference/placeholder mode and a stored-secret mode.

### 3. Parameter-parity checking for redundancy

If a destination declares a backup, the plan should compare resolution, codec, bitrate,
framerate, keyframe interval and audio sample rate between primary and backup and flag a
mismatch. This is a cheap, deterministic check that directly targets a documented failure.

*Evidence:* [SEARCH-EXTRACT] YouTube backup-ingest requirements — mismatch breaks failover.
*Strength:* high; it is a platform-documented rule, not an opinion.

### 4. Export configuration instead of making people retype it

Emit the delivery configuration in the forms the downstream tools consume: an OBS profile /
scene-collection fragment, a vMix streaming preset, a NOALBS JSON skeleton (with secrets left as
references, never inlined), and a human-readable destination sheet for the run of show.

*Evidence:* [FETCHED] the NOALBS README's config surface; [PRIOR-SESSION] the OBS profile and
scene-collection export defect history. *Caveat:* these formats change; treat exporters as
best-effort and versioned, and never claim they are authoritative.

### 5. A transport calculator using published formulas

SRT latency from measured RTT, bandwidth overhead, and a bitrate-vs-uplink headroom check. Show
the formula and its source next to the number, because the published guidance disagrees with
itself and an unattributed number would be worse than none.

*Evidence:* [SEARCH-EXTRACT] the 3–4× RTT rule versus fixed 1,500–2,500 ms practice; the German
40% headroom rule; [PRIOR-SESSION] the SRT tracker's own open requests for such a calculator.
*Placement:* `src/renderer/lib/` per the existing convention for calculations.

### 6. Make the network ask a generated artefact

The venue-IT document — required upload, ports, per-encoder path, static addresses — is currently
hand-written per event and reads as unreasonable to the recipient. Generate it from the modelled
delivery path, and let the plan record the answer (what was granted, what was refused, what the
workaround was) so the next show at that venue starts from knowledge.

*Evidence:* [SEARCH-EXTRACT] help.webcasts.com onsite encoding requirements; videosdk.live and
dacast on port 1935; trivisionstudios on dedicated upload. *This is the "what we did last time at
this venue" note, made into a real artefact.*

### 7. Connect the suite's own tally and intercom work to remote contributors

The repositories in this account already include browser-based tally and browser-based intercom
beltpacks. Remote guests are the population with a documented, five-year-old unmet need for
exactly this. Extending the existing tally/intercom surface to a URL a remote contributor can
open is a smaller step than it looks.

*Evidence:* [PRIOR-SESSION] vdo.ninja #569 and #654, both open since 2020–2021; local repos
`tally-pi` and `Broadcast-intercom`.

### 8. Treat "stream state" as a show-control signal

If the suite ever emits or consumes show-control events, transmission state belongs in that
vocabulary. The community has already asked for it in the dominant control surface.

*Evidence:* [PRIOR-SESSION] companion-module-requests #2075 (2026, open).

### 9. Offline-first is not optional for this role

The streaming engineer works in venues where the network is the *subject* of the work and is
frequently hostile, restricted or absent until load-in. A planning tool that requires
connectivity to open the plan is unusable exactly when it is needed. The Cable Planner
architecture is already offline-first; this role is the strongest justification for keeping it
that way.

### 10. What *not* to build on this dossier

- **Do not build a live monitoring dashboard.** The evidence says monitoring is fragmented and
  painful; it does not say a planning tool is the right place to fix it, and doing it badly would
  make the suite responsible for a false "all clear".
- **Do not build multistreaming.** That market is served, and entering the delivery path is a
  liability the suite should not take on.
- **Do not model bonded-cellular link behaviour.** The one practitioner account available says
  real-world bonding performance is not predictable from location
  [SEARCH-EXTRACT: medium.com/@joelouis761], and no reachable source supports a planning model.
- **Do not assume the destination sheet exists in the form I inferred.** That specific artefact
  is [INFERENCE], not attested. Confirm with two practitioners before designing a UI around it.

---

## Confidence summary

| Finding | Frequency | Basis |
| --- | --- | --- |
| Reconnect/dynamic-bitrate failures leave streams dead without alarm | widespread | 6+ dated OBS issues 2020–2026, several open; two read in full this session |
| No product ships stream-death alarm or automatic fallback | widespread | independent projects exist solely for it; README read in full |
| Automatic fallback tools fail toward the offline scene | recurring | 4 NOALBS issues, 2022–2024, two read in full |
| Per-destination quality is unsolved in the common tools | widespread | vMix documents the limitation; OBS plugin issue open, unanswered |
| Backup ingest requires manual parameter parity, unverified by tooling | widespread | platform documentation states the rule |
| Transmission faults damage local recordings | recurring | 2 OBS issues; one closed as not planned |
| Encoder/platform absent from the show-control surface | widespread | 9 open Companion module requests, 2020–2026 |
| Stream keys travel through chat and shared docs | recurring | security guidance written against the practice; a real leaked config in a public issue |
| Excel is the medium for IP plans and run of show | recurring | broadcast IP literature concedes it; template market confirms format |
| Comms is the weak link in REMI and is solved ad hoc | recurring | trade-press account of a phone-call workaround; roundtable quote |
| Teams as contribution path degrades quality | recurring | multiple practitioner threads on Microsoft's own forums |
| Remote guests have no on-air indication | recurring | 2 open feature requests since 2020–2021 |
| The per-show "destination sheet" as a discrete artefact | **unverified** | [INFERENCE] only — confirm before building |
| German-market paperwork practice | **unverified** | German sources reachable were technique, not practice |
| First-person practitioner venting (Reddit, pro forums) | **absent** | host unreachable / not indexed |

---

## Sources

Grouped by directness. **[FETCHED]** pages were opened and read in this session. **[SEARCH-EXTRACT]**
URLs were named by the search tool, which returned page content, but the host could not be opened
directly through this session's egress proxy. **[PRIOR-SESSION]** URLs were read in the
2026-08-28 pass of this dossier.

### [FETCHED] — GitHub issues and READMEs read in this session

- https://github.com/obsproject/obs-studio/issues/13147 — encoder overload from upload stall damages the local recording (2026-02-20, closed as not planned)
- https://github.com/obsproject/obs-studio/issues/11877 — instability drops the stream key, not just the connection (2025-02-18)
- https://github.com/obsproject/obs-studio/issues/2496 — Dynamic Bitrate breaks Automatically Reconnect (2020-03-13, closed)
- https://github.com/obsproject/obs-studio/issues/4600 — random audio dropouts while streaming and recording (2021-04-26, still open, ~100 comments)
- https://github.com/obsproject/obs-studio/issues/4250 — SRT "Stream Key" field discarded, must be hand-built into streamid (2021, fixed 2022-11)
- https://github.com/obsproject/obs-studio/issues/2990 — SRT streamid not set or truncated at "?" (2020-05-27)
- https://github.com/sorayuki/obs-multi-rtmp/issues/448 — different settings per platform, unanswered (2024-10-26, open)
- https://github.com/sorayuki/obs-multi-rtmp/issues/458 — Twitch ingest drops at ~25 s, RTMP error 10054, 32–42% frame drops (2024-12-26, open)
- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/178 — stats unreachable, permanent offline scene, config posted (2024-10-23, open)
- https://github.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/issues/119 — sticky offline scene (2022-09-14)
- https://raw.githubusercontent.com/NOALBS/nginx-obs-automatic-low-bitrate-switching/v2/README.md — full configuration surface
- https://github.com/datarhei/restreamer/issues/823 — "Help with Stream Key" (2024-09-26, open)
- https://github.com/datarhei/restreamer/issues/961 — custom stream key (2026-01-07, open)
- https://github.com/datarhei/restreamer/issues/690 — two outputs configured, one silently missing (2024-02-12, open)
- https://github.com/datarhei/restreamer/issues/76 — one address in, orchestrated fan-out with per-network transcoding (2019, closed)
- https://github.com/BELABOX/belaUI/issues — issue list (rendered only partially)

### [SEARCH-EXTRACT] — trade press and practitioner-facing publications

- https://www.newscaststudio.com/2026/08/21/industry-insights-remi-moves-from-experiment-to-operating-model/ — REMI roundtable; Horne and Rayner quotes
- https://www.newscaststudio.com/2026/04/09/nab-show-preview-remote-production-grows-up-as-a-permanent-operating-model/
- https://rtsintercoms.com/news/2022/intercom-solutions-from-rts-play-key-role-in-pushing-ip-enabled-remote-broadcast-production-the-next-level-%E2%80%93-the-indie-engineer/ — three operators, two Bluetooth channels, graphics op on a phone call
- https://www.thebroadcastbridge.com/content/entry/6303/understanding-ip-broadcast-production-networks-basic-principles-of-ip — spreadsheets as the traditional IP record
- https://www.churchproduction.com/magazine/encoding-101-how-streaming-really-works/ — "it just works… until it doesn't" (2026-06-03)
- https://www.controlbooth.com/threads/help-with-cellular-bonding.47366/ — venue-independent streaming, bonding limits, Instagram workaround
- https://medium.com/@joelouis761/packet-level-intelligence-the-hidden-variable-determining-cellular-bonding-reliability-361b7e6814c1 — "50 states in 50 days" bonding inconsistency (single account)
- https://medium.com/innovation-labs-blog/examining-srt-streaming-over-4g-networks-925e71c45cdf
- https://blackdragoncap.com/perspectives/5-live-broadcast-disasters-and-what-they-teach-about-media-tech-in-2025/ — 2025 Oscars/World Cup stream failures (business blog; weak)
- https://yostream.io/blog/why-live-streams-fail/ — "lessons from 50 failed streams" (secondary)

### [SEARCH-EXTRACT] — platform, vendor and protocol documentation

- https://www.vmix.com/help23/StreamingMultipleDestinations.html and https://www.vmix.com/help23/StreamingMultiBitrate.html — multi-bitrate disabled with multiple destinations
- https://stream.twitch.tv/encoding/ and https://streamersize.com/blog/twitch-vs-youtube-bitrate-comparison/ — per-platform bitrate ceilings
- https://support.google.com/youtube/answer/2853702 (and /3006768) — encoder settings and live errors
- https://docs.castr.com/en/articles/5023371-backup-ingest-how-to-use-benefits-and-limitations — backup ingest parity requirement and rehearsal test
- https://doc.haivision.com/SRT/1.5.3/Haivision/srt-connection-modes , https://streamrus.github.io/onpremise-srt-server-docs/en/srt-basics.html , https://www.kiloview.com/downloads/User%20Manual/SRT%20related%20manuals/SRT%20%20Rendezvous%20Mode.pdf — caller/listener/rendezvous and NAT
- https://vajracast.com/srt-latency-tuning/ — 3–4× RTT versus fixed practical latency
- https://www.videosdk.live/developer-hub/rtmp/port-rtmp and https://www.dacast.com/support/knowledgebase/firewall-ports-for-rtmp-streaming/ — port 1935 blocking and fallback
- https://help.webcasts.com/books/live-events/page/onsite-encoding-requirements/export/html — onsite encoding requirements document
- https://trivisionstudios.com/conference-live-streaming-services-in-dc-a-planning-guide/ — dedicated upload planning
- https://docs.vdo.ninja/advanced-settings/other-parameters and https://docs.vdo.ninja/common-errors-and-known-issues/echo-or-feedback-issues — mix-minus and echo
- https://bitfocus.io/companion and https://www.crazyamazingdesigns.com/knowledge-base/bitfocus-companion-streamdeck-church-production — what Companion controls
- https://www.syncwords.com/products/automated-live-captions-using-srt-streaming — CEA-608 into SRT
- https://www.obsbot.com/blog/live-streaming/streaming-monitoring and https://touchstream.media/blog/live-stream-monitoring/ — second-device monitoring; fragmented consoles
- https://callaba.io/video-on-demand — live-to-VOD reprocessing

### [SEARCH-EXTRACT] — security and credential handling

- https://www.gitguardian.com/remediation/twitch-stream-key and https://www.gitguardian.com/remediation/stream-key
- https://onestream.live/blog/stream-leak-prevent-stream-hack/ — "stream keys live in one place, and that place is not your group chat"
- https://heystream.com/blog/twitch-stream-key-rtmp-setup — wrong destination as an expensive operator error; test-stream advice
- https://www.dexerto.com/entertainment/twitch-resets-stream-keys-for-everyone-but-says-passwords-are-safe-after-leak-1670117/

### [SEARCH-EXTRACT] — German-language sources

- https://www.film-tv-video.de/term-word/remote-production/ — definition of remote production
- https://www.film-tv-video.de/equipment/2022/08/31/liveu-stellt-rackmount-remi-encoder-lu810-und-lu610s-vor/ — LU810/LU610S bonding
- https://www.film-tv-video.de/productions/2022/01/26/chancen-und-herausforderungen-bei-remote-produktionen/ — Sony/MoovIT/Vizrt panel
- https://www.production-partner.de/basics/streaming-plattformen-verstehen-und-nutzen/ — multi-platform distribution means multiple encodes or platform-side fan-out
- https://www.production-partner.de/basics/tipps-fuer-ein-gelungenes-streaming/ — LTE modem as backup alongside a second line
- https://www.production-partner.de/story/tividoo-events-streaming-als-gesamtkonzept/ — two enterprise SRT hardware encoders in parallel
- https://www.uxstream.net/livestream-dienstleister/ — cheap providers, bluescreens and dropped lines; triple-secured internet as the professional differentiator
- https://www.livecom-gruppe.de/live-event-streaming-technische-anforderungen-und-loesungen/
- https://contentflow.live/wie-muss-ich-meinen-encoder-richtig-einstellen/ — 40% bandwidth headroom, 1–2 s keyframe interval
- https://help.movingimage.com/docs/de/livestreaming-encoding-settings — start encoders 15 minutes early, test all sources simultaneously
- https://www.lazi-akademie.de/wiki/messe-event/event-design/live-streaming-events/

### [SEARCH-EXTRACT] — role definition, job posts, event operations

- https://careers.paramount.com/job/New-York-Sr-Live-Event-Technology-Engineer-NY-10036/1374027700/
- https://www.metacareers.com/profile/job_details/1017266434469763/
- https://www.showbizjobs.com/jobs/nfl-seasonal-video-streaming-engineer-in-inglewood/jid-233wy7
- https://www.homerunent.com/blog/2026/7/7/event-operations-guide-managing-production-on-event-day — group chats fail on event day
- https://www.phaedrasolutions.com/blog/how-to-use-whatsapp-for-event-planning-without-hassle
- https://rundownstudio.app/templates/ — run-of-show templates in Excel/Sheets/Numbers
- https://www.switcherstudio.com/blog/the-ultimate-livestreaming-checklist-to-ensure-smooth-streaming , https://ecamm.com/blog/live-streaming-checklist/
- https://techcommunity.microsoft.com/discussions/microsoftteams/ms-teams-video-quality-is-terrible/1354190/replies/2085955 and https://learn.microsoft.com/en-us/answers/questions/4418410/help-in-teams-what-is-needed-to-output-video-at-fh — Teams contribution quality
- https://translators-usa.com/real-time-captioning-services — "captioning usually fails at the handoff points"
- https://weconnect.one/blogs/best-sim-for-liveu-encoder-in-europe-carrier-neutral-broadcasting-sim-compared/ — broadcast SIM management (vendor marketing)
- https://restream.io/integrations/multistreaming/go-live-on-facebook-and-youtube-at-the-same-time/ , https://livepush.io/products/multistreaming/index.html , https://streamyard.com/blog/how-to-multistream-to-youtube-twitch-tiktok-facebook-and-more , https://www.dacast.com/blog/simulcast-streaming/ — the multistreaming category and what it sells relief from

### [PRIOR-SESSION] — read in the 2026-08-28 pass, not re-opened here

Transport and bonding: Haivision/srt issues #460, #621, #656, #1210, #2016, #2157, #2600, #2749,
#2968, #3168, #3280; eerimoq/moblin #418, #89; BELABOX/srtla, OpenIRL/srtla-receiver and
irlserver/srtla_send READMEs.

Switcher, destinations and keys: obsproject/obs-studio #11079, #11016, #5572, #6557, #6813,
#6497, #4596, #11062, #13469, #12087, #13772, #11264, #13127, #12958, #6366, #7381, #8966, #8953,
#8635, #6398, #6298, #5599, #11864, #13228, #13064, #11118, #10584, #13506;
sorayuki/obs-multi-rtmp #344, #329, #88, #17, #305; datarhei/restreamer #278, #873.

Monitoring and fallback: NOALBS issues #157, #125, #120, #175, #164, #82, #47, #60;
loopy750/SRT-Stats-Monitor; roflb0y/SRTExporter; IRLToolkit/obs-websocket-http.

Remote contribution and control surface: steveseguin/vdo.ninja #1218, #569, #654, #898, #276,
#838, #665; bitfocus/companion-module-requests #177, #194, #540, #790, #815, #880, #1080, #1143,
#2075, #777; bitfocus/companion #1339, #2909, #3654.

### Corpus cross-references

- [`../METHOD.md`](../METHOD.md)
- [`../workflow-chain.md`](../workflow-chain.md)
- [`./technical-director.md`](./technical-director.md)
- [`./camera-operator.md`](./camera-operator.md)
- [`./video-engineer-shader.md`](./video-engineer-shader.md)
- [`../landscape/tally.md`](../landscape/tally.md)

### Local repositories (context, not independent demand)

- `/home/user/cable-planner` — README and CLAUDE.md (keytar credential rule, `lib/` placement, offline-first, `healProjectPositions` as the migration layer)
- `/home/user/av-planner-suite` — README
- `/home/user/tally-pi` — browser tally, ATEM, Companion
- `/home/user/Broadcast-intercom` — browser beltpacks, Companion control endpoint

### Still blocked, and therefore still missing

Direct fetch: reddit.com (also excluded from the search index available here), prosoundweb.com,
controlbooth.com, blue-room.org.uk, forum.blackmagicdesign.com, forums.vmix.com,
obsproject.com (forum and docs), videohelp.com, help.twitch.tv, haivision.com, srtalliance.org,
liveu.tv, teradek.com, resi.io, tvbeurope.com, thebroadcastbridge.com, newscaststudio.com,
churchproduction.com, film-tv-video.de, production-partner.de, en.wikipedia.org,
stackoverflow.com. Where those hosts appear above, the content reached me as a search extract,
not as a page I opened. The first-person practitioner layer — "here is my spreadsheet, here is
what went wrong last Tuesday" — remains the single largest gap in this dossier.
