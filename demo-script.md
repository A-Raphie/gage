# Gage demo script (final cut)

Hackathon: BUIDL CTC 2026 Fall (Creditcoin Attestcoin) · Target cut: 3:00 · VO: ~400 words (his calibration, Sep 12)
Judging: Attestcoin depth (core stated criterion) · product works end-to-end · innovation · UX/judge experience · technical quality
Hook shape: Ogilvy specific-fact opener (rotated; not the agent-danger shape) · callback closes on the opener numbers
Setup: demo Chrome fullscreen on Desktop 2, drawn cursor, avfoundation 30fps, silent beats recorded first, VO muxed after. No wallet popups (no wallet on camera; the payment fires via CLI). Explorer shown in-tab only, briefly.

---

## Scene 1: The numbers (0:00-0:16)
**Criterion:** innovation + credibility
**Show:** landing hero, top of page. Then a slow scroll begins toward the strand specimen.
**Say:** "Ten deals on two chains. Eight settled by a mathematical proof. One refunded when it expired. And not one bridge involved. This is the receipt for all of it, and by the end of this video you will know how to check every number yourself."
**Action:** hold 3s on hero (badge, headline), begin slow scroll to the strand specimen; pause there 3s.
**Note:** every number is checkable on the console the viewer is about to see.

## Scene 2: The front door (0:16-0:42)
**Criterion:** product + judge experience
**Show:** scroll showcase: judge-path strip (90 second path) → problem stats ($2.2B, $2B+, $624M with sources) → thesis band ("A payment is a fact. Gage settles on facts.").
**Say:** "Cross-chain deals today run on trust. In a bridge that can be hacked: two billion dollars of bridge hacks in a single year. Or in an oracle operator everyone has to believe. Gage removes both from the deal entirely. A payment is a fact. And Gage settles deals on facts. The whole mechanism is four steps, printed right on the page."
**Action:** scroll: judge path (hold 3s) → stats (hold 3s) → thesis band (hold 3s) → mechanism grid (hold 3s).

## Scene 3: The console, live (0:42-1:12)
**Criterion:** Attestcoin depth + technical quality
**Show:** /console. Posture strip first (both contract addresses, both chains green). Then the deals table: settled chips, the cancelled chip on deal 5.
**Say:** "Here is the live console. No wallet. No signup. Every value on this page is read directly from the contracts, right now. GageDeal holds the payments on Sepolia. GageSettlement holds the gages on Creditcoin. Same address on both chains. The settlement contract verifies Attestcoin proofs through the zero F D two precompile. Settled. Cancelled on expiry. The chain remembers all of it."
**Action:** hold on posture strip 4s, scroll to table, hover a settled row, then hover the cancelled row (deal 5).

## Scene 4: The money moment (1:12-2:00)
**Criterion:** product end-to-end
**Show:** open deal #0011 detail: "awaiting payment", dashed strand, terms. Payment fires (off-camera `cast` timed to the beat). Row flips to "payment seen · proving". SPLICE HERE at the sentence break: part B recorded after settle, same page, reads as a time-lapse. Part B: strand solid, "gage released", settle tx line.
**Say:** "Deal eleven is open. The gage is locked on Creditcoin, and the terms are fixed: one payment, one reference, one payout address. Now the payment, on Sepolia." (beat) "There it is. Payment seen. Now the chain work happens on its own. Creditcoin's attestor set witnesses that exact Ethereum block. A Merkle proof and a continuity proof are generated for the payment. The settlement contract checks both, synchronously, through the precompile. It decodes the proved payment, matches the amount and the reference against the deal terms, and releases the gage in the very same transaction. Nothing moved by trust. The payment receipt is the settlement."
**Action:** part A: click row, hold; pay fires mid-scene; hold on "proving" state. Part B: same page after settle; strand snapped solid; hold 3s.

## Scene 5: Batch, on the record (2:00-2:22)
**Criterion:** Attestcoin depth (the lever nobody else used)
**Show:** blockscout tx page for the settleMany receipt 0xf0826186 in the same tab, brief; then back to console showing deals 8 and 9 settled.
**Say:** "And depth. Up to ten payments can share one Creditcoin transaction. Here is the receipt on the explorer: two payments, proved together, two gages released, one transaction, one hash. That is batch settlement running on-chain. Not on a slide."
**Action:** blockscout tx in-tab 4s max, then back to console, hover deals 8 and 9.

## Scene 6: The honest edges (2:22-2:44)
**Criterion:** trust
**Show:** README honesty table (scroll the GitHub repo in-tab).
**Say:** "What we will not claim. This is testnet value. The counterparties in the demo are our own wallets, disclosed in the readme. The settlement worker is a cron job, and it is replaceable by anyone: the contract has no privileged relayer. If we disappeared tonight, every open deal would still settle. And the expiry refund you saw earlier was real value returning on-chain."
**Action:** scroll the honesty table slowly, pause on the worker row 3s.

## Scene 7: Close (2:44-3:00)
**Criterion:** all
**Show:** landing final CTA, then links: live URL, repo, both contract addresses.
**Say:** "Ten deals. Eight proofs. One batch. Zero bridges. Gage: pay on Ethereum, release on proof. The app, the contracts, and every receipt are linked below. Check them."
**Action:** hold links on screen 6s, no motion.

---

## Time budget
| Criterion | Allocated | Scenes |
|---|---|---|
| Attestcoin depth | 70s (39%) | 3, 4, 5 |
| Product end-to-end | 50s (28%) | 1, 4, 7 |
| Trust/honesty | 30s (17%) | 6 |
| Judge experience | 30s (16%) | 2, 3 |
| Total | 3:00 | |

## Submission checklist
- [x] Live URL shown: https://gage-omega.vercel.app
- [x] GitHub shown: https://github.com/A-Raphie/gage
- [x] Contract address shown: 0xA93DD76Ce639Dd9BE4C780363d54706E098aa1c4 (both chains)
- [x] Chain/explorer shown: Sepolia + Creditcoin CC3 testnet, Blockscout in-tab
- [x] Demo video: this recording (silent beats first, VO muxed after his audio)

## Recording notes
- Deal #0011 must be staged (registered + gage locked, UNPAID) before part A.
- Part B records only after the worker settles deal 11; splice point = the sentence "Now the payment, on Sepolia." | break | "There it is."
- The pay fires off-camera via cast timed to the beat; row flip must be visible within part A's last 4s (console polls every 12s: fire the pay right after part A's click).
- Land on Desktop 2, park 0,1111, avfoundation, grey-trim in mux, demo-final-gate on the voiced cut.
- VO word count: 400. At his pacing that is ~2:40 of speech; pauses land the cut at 3:00 exactly.
