# Gage demo script (final cut)

Hackathon: BUIDL CTC 2026 Fall (Creditcoin Attestcoin) · Target cut: 2:25 · VO: ~290 words (chain-timed demo, his pacing)
Judging: Attestcoin depth (core stated criterion) · product works end-to-end · innovation · UX/judge experience · technical quality
Hook shape: Ogilvy specific-fact opener (rotated; not the agent-danger shape) · callback closes on the opener numbers
Setup: demo Chrome fullscreen on Desktop 2, drawn cursor, avfoundation 30fps, silent beats recorded first, VO muxed after. No wallet popups (no wallet on camera; the payment fires via CLI). Explorer shown in-tab only, briefly.

---

## Scene 1: The numbers (0:00-0:14)
**Criterion:** innovation + credibility
**Show:** landing hero, top of page. Then a slow scroll begins.
**Say:** "Ten deals on two chains. Eight settled by a mathematical proof. One refunded when it expired. And not one bridge involved."
**Action:** hold 2s on hero (badge, headline), begin slow scroll to the strand specimen; pause there.
**Note:** every number is checkable on the console the viewer is about to see.

## Scene 2: The front door (0:14-0:34)
**Criterion:** product + judge experience
**Show:** scroll showcase: judge-path strip (90 second path) → problem stats ($2.2B, $2B+, $624M with sources) → thesis band ("A payment is a fact. Gage settles on facts.").
**Say:** "Cross-chain deals today run on trust. In a bridge that can be hacked. In an oracle that can lie. Gage removes both. A payment is a fact, and Gage settles deals on facts. The mechanism is four steps, and you can read all of them on the page."
**Action:** scroll: judge path (hold 2s) → stats (hold 2s) → thesis band (hold 2s) → mechanism grid (hold 2s).

## Scene 3: The console, live (0:34-0:58)
**Criterion:** Attestcoin depth + technical quality
**Show:** /console. Posture strip first (both contract addresses, both chains green). Then the deals table: settled chips, the cancelled chip on deal 5.
**Say:** "Here is the live console. No wallet, no signup. Every value is read straight from the contracts. Same contract address on both chains, and the settlement contract verifies Attestcoin proofs through the zero-x-F-D-2 precompile. Ten deals. Settled. Cancelled on expiry. The chain shows all of it."
**Action:** hold on posture strip 3s, scroll to table, hover two rows (a settled one, the cancelled one).

## Scene 4: The money moment (0:58-1:32)
**Criterion:** product end-to-end
**Show:** open deal #0011 detail: "awaiting payment", dashed strand, terms. Payment fires (off-camera `cast` timed to the beat). Row flips to "payment seen · proving". SPLICE HERE at the sentence break: part B recorded after settle, same page, reads as a time-lapse. Part B: strand solid, "gage released", settle tx line.
**Say:** "Deal eleven is open. The gage is locked on Creditcoin. Now the payment, on Sepolia." (beat) "There it is. Payment seen. The block gets attested, a Merkle proof is generated, and Creditcoin verifies the exact transaction. Nothing moved by trust. The payment receipt IS the settlement."
**Action:** part A: click row, hold; pay fires mid-scene; hold on "proving" state. Part B: same page after settle; strand snapped solid; hold 3s.

## Scene 5: Batch, on the record (1:32-1:52)
**Criterion:** Attestcoin depth (the lever nobody else used)
**Show:** blockscout tx page for the settleMany receipt 0xf0826186 in the same tab, brief; then back to console showing deals 8 and 9 settled.
**Say:** "And depth: ten payments can share one transaction. Here is the receipt, two payments proved together, two gages released, one transaction. Batch settlement is on-chain, not on a slide."
**Action:** blockscout tx in-tab 4s max, then back to console, hover deals 8 and 9.

## Scene 6: The honest edges (1:52-2:10)
**Criterion:** trust
**Show:** README honesty table (scroll the GitHub repo in-tab).
**Say:** "What we will not claim. It is testnet value. The demo counterparties are our own wallets. And the settlement worker is replaceable by anyone: the contract has no privileged relayer. If we vanished, every open deal would still settle."
**Action:** scroll the honesty table slowly, pause on the worker row.

## Scene 7: Close (2:10-2:30)
**Criterion:** all
**Show:** landing final CTA, then links: live URL, repo, both contract addresses.
**Say:** "Ten deals. Eight proofs. One batch. Zero bridges. Gage: pay on Ethereum, release on proof. The app, the contracts, and every receipt are linked below."
**Action:** hold links on screen 6s, no motion.

---

## Time budget
| Criterion | Allocated | Scenes |
|---|---|---|
| Attestcoin depth | 55s (38%) | 3, 4, 5 |
| Product end-to-end | 45s (31%) | 1, 4, 7 |
| Trust/honesty | 25s (17%) | 6 |
| Judge experience | 20s (14%) | 2, 3 |
| Total | 2:25 | |

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
