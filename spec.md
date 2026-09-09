# Gage spec (compact)

## One-liner
Post a deal on Creditcoin, pay on Ethereum, and the Attestcoin transaction proof releases the other side automatically. No bridge, no oracle, no trust.

## How it works (the whole idea)
1. A deal maker posts terms on Creditcoin CC3 testnet and locks the Creditcoin-side value in `GageSettlement`: source chain (chainkey), token (address or native flag), amount, counterparty payout address, expiry, covenant note.
2. The counterparty pays the Ethereum-side amount into `GageDeal` on Sepolia. That payment emits `PaymentMade(dealId, payer, token, amount, ref)`.
3. The gage worker (stateless, idempotent, runs anywhere) sees the event, waits for the block to be attested on Creditcoin, fetches the Merkle + continuity proof from the hosted proof builder, and calls the BlockProver precompile 0x0FD2 via `verifyAndEmitSingle` (batch deals: one `verifyBatch` for up to 10 payments).
4. `GageSettlement` hears the verified transaction, decodes the exact `PaymentMade` event bytes, checks them against the deal terms, and releases the locked Creditcoin-side value to the counterparty. Expired deals refund the deal maker on-chain.

Status lives on-chain (the contracts are the store). The console reads chain state directly; the worker is replaceable stateless infrastructure.

## Architecture
- `contracts/src/sep/GageDeal.sol` - Sepolia escrow: `openDeal` mirrors dealId registry, `pay(dealId)` escrows payment, emits `PaymentMade`. `refund(dealId)` for expired deals.
- `contracts/src/cc/GageSettlement.sol` - Creditcoin ASC + business logic (combined pattern): `open` locks value, `settleSingle(proof...)` / `settleBatch(proof...)` call precompile 0x0FD2, decode event from verified txBytes against expected topic0 + deal terms, release. `cancelExpired`.
- `worker/` - TS, `@gluwa/usc-sdk` + ethers v6. Watches Sepolia logs, drives attestation + proofs, submits to CC3. Idempotent: skips deals already settled on-chain. Hosted by GitHub Actions cron (every 5 min) + runnable locally.
- `web/` - Next.js on Vercel. Landing (centered fold) + `/console` (deal list tables-first, deal view with the proof strand, new-deal flow). Reads chain state via public RPCs through server routes.

## Track + judging fit
- DeFi track. Depth of Attestcoin utilization: tx-proofs are the release mechanism (single + batch), precompile called directly from our ASC, worker uses the official SDK and hosted proof builder.
- Testnet deployment: Sepolia + Creditcoin CC3 testnet, verified explorer links.

## Submission package (DoraHacks fields)
Name, sector (DeFi), description, Attestcoin Integration Summary, repo + README, deck PDF, demo video URL, team info (Raphie solo).

## Task order (spike-first, footage-early)
1. [x] Spike: real Sepolia tx proven on CC3 testnet, gasless. DONE Sep 9.
2. Contracts (Foundry), deploy Sepolia + CC3 testnet, verify on explorers.
3. Worker end-to-end on a real deal; capture FIRST FOOTAGE as soon as a deal settles on camera.
4. Web: tokens, landing, console, strand. UI family before components.
5. Deck, video, DoraHacks form, claims-verify, ship rehearsal.

## Facts locked (from docs, Sep 9)
- CC3 testnet RPC https://rpc.cc3-testnet.creditcoin.network, chainId 102031.
- Prover https://prover.cc3-testnet.creditcoin.network. Sources: Sepolia chainkey 1, Ethereum mainnet chainkey 3.
- Precompiles: BlockProver 0x...0FD2, ChainInfo 0x...0FD3. Decoder 0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f (testnet).
- SDK: @gluwa/usc-sdk (ethers v6 peer). verifySingle = staticCall (gasless), verifyAndEmitSingle = tx with signer, verifyBatch = batch with shared continuity proof (max 10 txs, within 1000 blocks).
- Attestation: periodic, ~15s/block cadence claim; waitUntilHeightAttested polls (default 15s interval, 15m timeout).
- Deadline Sep 13 2026 23:59 ET. Winners Sep 20.
