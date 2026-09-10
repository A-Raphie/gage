/**
 * Gage worker: watches Sepolia GageDeal payments, waits for Creditcoin
 * attestation, fetches proofs from the hosted proof builder, and settles
 * deals on Creditcoin CC3 testnet.
 * Stateless and idempotent: safe to run on a cron (GH Actions) or forever.
 */
import { JsonRpcProvider, Wallet, Contract, AbiCoder, formatEther } from 'ethers';
import { proofProvider } from '@gluwa/usc-sdk';
import settlementAbi from './abi/GageSettlement.json';

const env = (k: string, d?: string) => process.env[k] ?? d;
const SEPOLIA_RPC = env('SEPOLIA_RPC_URL', 'https://ethereum-sepolia-rpc.publicnode.com')!;
const CC3_RPC = env('CC3_RPC_URL', 'https://rpc.cc3-testnet.creditcoin.network')!;
const PROVER_URL = env('PROOF_BUILDER_URL', 'https://prover.cc3-testnet.creditcoin.network')!;
const PROOF_TIMEOUT_MS = Number(env('PROOF_TIMEOUT_MS', '30000'));
const PK = env('PRIVATE_KEY');
const DEAL_ADDR = env('GAGE_DEAL_ADDRESS');
const SETTLE_ADDR = env('GAGE_SETTLEMENT_ADDRESS');
const CHAIN_KEY = Number(env('CHAIN_KEY', '1')); // 1 = Ethereum Sepolia on CC3 testnet
const START_BLOCK = Number(env('START_BLOCK', '0'));
const BATCH_MAX = Number(env('BATCH_MAX', '3'));
const POLL_MS = Number(env('POLL_MS', '15000'));
const CONFIRM_DEPTH = Number(env('CONFIRM_DEPTH', '4'));

// PaymentMade(uint256,address,uint256,bytes32)
const PAYMENT_TOPIC0 = '0xd33aaa180016895d33ce7ad0841fe3c9e56cec30c0cf9a763f0e70825f732e3e';
const coder = AbiCoder.defaultAbiCoder();

interface Pending {
  dealId: bigint;
  payer: string;
  amount: bigint;
  ref: string;
  txHash: string;
  blockNumber: number;
}

interface DealState {
  maker: string;
  taker: string;
  amount: bigint;
  expiry: bigint;
  paymentAmount: bigint;
  sourceEmitter: string;
  ref: string;
  state: number;
}

function log(...args: unknown[]) {
  console.log('[gage-worker]', ...args);
}

async function settleOne(settlement: Contract, p: Pending): Promise<string | null> {
  const proofBuilder = new proofProvider.service.ProofBuilder(CHAIN_KEY, PROVER_URL, PROOF_TIMEOUT_MS);
  await proofBuilder.waitUntilHeightAttested(CHAIN_KEY, p.blockNumber);
  const result = await proofBuilder.getProof(p.txHash);
  if (!result.success || !result.data) throw new Error('proof failed: ' + result.error);
  const d = result.data;
  log(`proof ready for deal ${p.dealId} (height ${d.headerNumber})`);
  const tx = await settlement.settle(
    CHAIN_KEY,
    d.headerNumber,
    d.txBytes,
    d.merkleProof.root,
    d.merkleProof.siblings,
    d.continuityProof.lowerEndpointDigest,
    d.continuityProof.roots,
    { gasLimit: 30_000_000 },
  );
  const rec = await tx.wait();
  return rec?.hash ?? null;
}

async function settleMany(settlement: Contract, batch: Pending[]): Promise<string | null> {
  const proofBuilder = new proofProvider.service.ProofBuilder(CHAIN_KEY, PROVER_URL, PROOF_TIMEOUT_MS);
  const proofs: unknown[][] = [];
  for (const p of batch) {
    await proofBuilder.waitUntilHeightAttested(CHAIN_KEY, p.blockNumber);
    const result = await proofBuilder.getProof(p.txHash);
    if (!result.success || !result.data) throw new Error('proof failed: ' + result.error);
    const d = result.data;
    proofs.push([
      CHAIN_KEY,
      d.headerNumber,
      d.txBytes,
      d.merkleProof.root,
      d.merkleProof.siblings.map((s: { hash: string; isLeft: boolean }) => [s.hash, s.isLeft]),
      d.continuityProof.lowerEndpointDigest,
      d.continuityProof.roots,
    ]);
  }
  log(`batch settling ${proofs.length} payments in one transaction`);
  const tx = await settlement.settleMany(proofs, { gasLimit: 60_000_000 });
  const rec = await tx.wait();
  return rec?.hash ?? null;
}

async function main() {
  if (!PK || !DEAL_ADDR || !SETTLE_ADDR) {
    throw new Error('PRIVATE_KEY, GAGE_DEAL_ADDRESS, GAGE_SETTLEMENT_ADDRESS are required');
  }
  const sepolia = new JsonRpcProvider(SEPOLIA_RPC);
  const cc3 = new JsonRpcProvider(CC3_RPC);
  const wallet = new Wallet(PK, cc3);
  const settlement = new Contract(SETTLE_ADDR, settlementAbi, wallet);

  log(`deal=${DEAL_ADDR} settlement=${SETTLE_ADDR} chainKey=${CHAIN_KEY}`);
  log(`worker wallet: ${await wallet.getAddress()} balance ${formatEther(await cc3.getBalance(await wallet.getAddress()))} CTC`);

  const seen = new Set<string>();
  let from = START_BLOCK > 0 ? START_BLOCK : (await sepolia.getBlockNumber()) - 60;

  for (;;) {
    try {
      const head = await sepolia.getBlockNumber();
      const to = head - CONFIRM_DEPTH;
      if (to >= from) {
        const logs = await sepolia.getLogs({
          address: DEAL_ADDR,
          topics: [PAYMENT_TOPIC0, null, null],
          fromBlock: from,
          toBlock: to,
        });
        from = to + 1;

        const pending: Pending[] = [];
        for (const raw of logs) {
          const txHash = raw.transactionHash;
          if (seen.has(txHash)) continue;
          if (raw.topics.length !== 3) {
            seen.add(txHash);
            continue;
          }
          const dealId = BigInt(raw.topics[1]);
          const payer = '0x' + raw.topics[2].slice(26);
          const [amount, ref] = coder.decode(['uint256', 'bytes32'], raw.data);
          const blockNumber = raw.blockNumber;

          const deal = (await settlement.deals(dealId)) as DealState;
          const open = Number(deal.state) === 0;
          const matches =
            deal.sourceEmitter.toLowerCase() === DEAL_ADDR.toLowerCase() &&
            deal.paymentAmount === amount &&
            deal.ref === ref;
          if (!open || !matches) {
            // terminal for this payment: the deal is settled/cancelled or the
            // payment can never match; remember it so we stop asking.
            seen.add(txHash);
            log(`deal ${dealId}: not settleable (open=${open}, matches=${matches}) - skipping`);
            continue;
          }
          pending.push({ dealId, payer, amount, ref, txHash, blockNumber });
          log(`payment pending for deal ${dealId}: ${formatEther(amount)} ETH in block ${blockNumber} (${txHash})`);
        }

        if (pending.length > 1) {
          const batch = pending.slice(0, BATCH_MAX);
          const rest = pending.slice(BATCH_MAX);
          try {
            const hash = await settleMany(settlement, batch);
            log(`SETTLED batch of ${batch.length}: ${hash}`);
            batch.forEach((p) => seen.add(p.txHash));
          } catch (e) {
            log(`batch settle failed, falling back to singles: ${(e as Error).message}`);
            for (const p of batch) {
              try {
                log(`SETTLED deal ${p.dealId}: ${await settleOne(settlement, p)}`);
                seen.add(p.txHash);
              } catch (e2) {
                log(`settle failed for deal ${p.dealId}, will retry next tick: ${(e2 as Error).message}`);
              }
            }
          }
          for (const p of rest) {
            try {
              log(`SETTLED deal ${p.dealId}: ${await settleOne(settlement, p)}`);
              seen.add(p.txHash);
            } catch (e2) {
              log(`settle failed for deal ${p.dealId}, will retry next tick: ${(e2 as Error).message}`);
            }
          }
        } else if (pending.length === 1) {
          const p = pending[0];
          try {
            log(`SETTLED deal ${p.dealId}: ${await settleOne(settlement, p)}`);
            seen.add(p.txHash);
          } catch (e) {
            log(`settle failed for deal ${p.dealId}, will retry next tick: ${(e as Error).message}`);
          }
        }
      }
    } catch (e) {
      log('tick error:', (e as Error).message);
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main().catch((e) => {
  console.error('[gage-worker] fatal:', e);
  process.exit(1);
});
