# Gage Demo Director pass (final cut v2)

Per desktop-demo 2026-09-12 revision: product showcase, not tutorial. Every scene = setup → action → TRANSFORMATION → payoff.

## Demo Plan
- Core value proposition: a cross-chain deal settles when an Attestcoin proof of the payment lands; no bridge, no oracle operator.
- Strongest visual moments: the strand snapping solid (GAGE RELEASED); the deals table with its mixed real states; the batch receipt on Blockscout with the verified contract badge.
- Most impressive interaction: click Lock gage → a real deal appears on-chain and in the table seconds later. Click Pay → the row flips "payment seen · proving" live.
- Primary user workflow: maker locks → counterparty pays → proof settles, all visible in the console.
- Best wow: batch settlement (two payments, one transaction) + the verified contract on the explorer.
- Strongest final state: the settled table + links held on screen.
- NOT shown: CLI, worker logs, dev tooling (rule 11). Attestation waiting is compressed by the scene-4 splice, disclosed as a time-lapse in the VO flow.
- Scene order (data-creating scenes LAST per the drift rule): HOOK → LANDING SHOWCASE → ENTER PRODUCT (console read) → [WOW: batch receipt] → CORE WORKFLOW (lock → pay → settled strand) → HONESTY → FINAL RESULT.

## Hero moments (declared)
1. Lock-gage click → new row appears "awaiting payment" (transformation 1)
2. Pay click → row flips "payment seen · proving" (transformation 2)
3. Strand snaps solid "GAGE RELEASED" (payoff, splice over attestation)
4. settleMany receipt on Blockscout, verified badge (depth)
5. Final settled table + links (close)

## Scene briefs
| scene | beat | objective | action | payoff | exit |
|---|---|---|---|---|---|
| 1 hook | 19.2s | numbers earn trust | slow scroll hero → specimen strand | strand panel read | hold on strand |
| 2 front door | 26.9s | mechanism understood | scroll: judge path → stats → thesis → mechanism | "four steps" read | hold on mechanism |
| 3 enter product | 24.8s | console is live chain data | posture strip → table scroll → hover settled + cancelled rows | mixed real states seen | hold on table |
| 4a lock | 11.9s | locking is one click | Lock gage → form appears → Lock click → pending → tx hash → refresh | row #0013 appears "awaiting payment" | hold on new row |
| 4b1 pay | ~7.5s | paying is one click | open deal detail → Pay click → paid hash | row flips "payment seen · proving" | hold on flip |
| 4b2 settled | ~26.5s | the proof settles it | (time-lapse) deal detail: strand solid | "GAGE RELEASED" | hold 3s on strand |
| 5 batch | 17.9s | depth is on-chain | blockscout settleMany tx (4s) → console rows 8+9 | two payments one tx seen | hold on rows |
| 6 honesty | 26.3s | boundaries disclosed | github honesty table scroll | edges read | hold on worker row |
| 7 close | 11.5s | judge path recap | landing CTA → footer links | links readable | hold links 4s+ |

Notes:
- VO says "deal eleven"; the on-camera lock creates the next live id (13). Live activity outpacing the script reads as a living product; disclosed here. Option to regenerate the two scene-4 VO lines if he wants exact numbers.
- Deal 12 exists (route verification) and will show settled/proving in scene 3 - realism, not a mock.
- Worker must be alive for 4b2 (settles the on-camera deal).
