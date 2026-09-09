# Gage design brief

Proof-settled deal escrow on Creditcoin Attestcoin. Event: BUIDL CTC 2026 Fall, DeFi track, deadline Sep 13 2026 23:59 ET.

## Style Genome — Gage

- **Mode:** G (layered neutral: near-black canvas, hairline-separated raised surfaces, one restrained accent on interactive elements only, depth from layering never glow), hybridized one level with Mode E's evidence discipline (status strips, every number carries its source). Not Mode A: no neon, no glow buttons; the sponsor's calm hairline system is the material.
- **Axis pushes:** typography (Tektur display numerals pushed to poster scale clamp 5rem+ as graphics; JetBrains Mono for all evidence incl. `//`-style annotations, a grammar the sponsor itself uses); motion (state-transition choreography only: the strand moves when chain state moves, nothing loops); layout (centered editorial fold per the landed remlo lesson + tables-first console).
- **Axes held conventional:** dark field, hairline elevation (sponsor tokens are literally hairline-based), pill buttons (sponsor grammar), standard nav.
- **Neutral reference of the build:** the sponsor's own creditcoin.org, verified LIVE this build (rendered + CSS bundle mined): true-black field, Tektur hero with blue second line, mono `//` stat sublabels, blue pill CTA + ghost secondary, stat row with display numerals. Different from previous builds' references (dreamdex.io, a0.awsstatic.com, keeperhub.com).
- **Signature move:** THE PROOF STRAND (see brief below).
- **Ledger check:** tally v3 = dark + indigo + Source Code Pro mono + provenance-line signature; lading = light split planes + faithfulness diff; verger = warm paper + orange + decision bell. Gage differs on hue family (Creditcoin blue #4976FF, not violet), display face (Tektur, unused in ledger), and signature mechanics (fan-in strand geometry, not a line/diff/bell).
- **Clone test:** beside creditcoin.org: same tokens but centered editorial fold, evidence-dense console, and the strand geometry; their 3D-render hero is replaced by a live product panel. Beside tally v3: different accent hue, different display face, different signature. A judge knowing both references sees a distinct build.

## Design brief: Gage

- **Consensus default (banned):** purple/blue gradient hero, glassmorphic stat-card bento, glowing orbs, emoji feature icons, generic two-chain bridge diagram with arrows, "Powered by" footer. Field evidence: 8+ lending clones in the pile; assume their skin too.
- **Axes pushed (2-3, concept-justified):**
  1. **Typography: Tektur display + mono-evidence.** Tektur is Creditcoin's own display font (verified in their CSS bundle, unused by any recent ledger entry). Oversized display numerals and headings; JetBrains Mono for every piece of evidence (tx hashes, block heights, txIndex); Inter for body. Justification: the product's substance is cryptographic evidence; mono makes hashes first-class, Tektur wears the sponsor's actual face.
  2. **Motion: state-transition choreography.** Nothing loops; motion fires only when real chain state advances (event-driven, scarcity on purpose). Justification: a settlement product earns streaming confirmations, not ambient animation.
  3. **Signature layout element: THE PROOF STRAND** (below).
- **Axes kept conventional:** dark field (sponsor's actual canvas), centered one-column landing fold with py-32 rhythm, hairline elevation (sponsor has literal hairline tokens), tables-first deal console. Familiarity anchor: the conventional centered dark hero.
- **Sponsor synthesis (verified from creditcoin.org CSS Sep 9, not guessed):** canvas #0C0E10, canvas-soft #111417, hairline #1F2428 / #2A3440, ink #F0EFEE, mute #AAACAE, faint #6E7073, accent #4976FF (their "buidl-blue"), deep accent #3A67F5, soft #7A9FFF. Fonts: Tektur (display), JetBrains Mono (evidence), Inter (body). Radius feel: minimal; hairlines carry structure.
- **Signature move: THE PROOF STRAND.** Every deal renders as a two-sided bond: the payment token on the Ethereum side and the release token on the Creditcoin side, connected by a drawn strand between them. The strand is dashed and slack while the payment is unattested; it carries live proof data (block height, txIndex) as it takes tension; it snaps solid in accent blue at the moment the precompile verifies, and the Creditcoin token flips to released. Batch deals: up to 10 strands fan into a single proof node (verifyBatch is the depth lever). Mechanism test: the strand IS the Attestcoin proof, not decoration. 5-minute test: real bindings (proof-builder API, precompile events, per-deal geometry, live attestation polling) put it far past template reach. Demo test: the money moment of the video is the strand completing live. Scarcity: animates only on transitions; idle deals are still.
- **Avoid-list (ledger-checked):** receipt timelines (Recourse owns), intent/execution diffs (Lading), stamps/document-paper textures (Assay/Scrip/Reeve), stillness-as-pitch and provenance-line verdict cards (Tally), warm parish paper (Verger), desaturated verdict pairs (Recourse/Tally), generic bridge-diagram hero (consensus).
- **Familiarity anchor:** dark centered hero on the sponsor's canvas. The divergence budget is spent on Tektur scale + the strand, not on exotic layout.
- **Craft floor:** body 16px+, line-height 1.4-1.5, measures 45-90ch, mono microcopy at +0.08em tracking when caps, AA contrast on ink, never color alone for state (strand states pair glyph + label + motion).

## Chains to
semantic-tokens → component-harvest → ui-craft → deterministic-design → ui-ux-audit
