/**
 * One-shot batch settle: proves N payments and submits settleMany in ONE
 * Creditcoin transaction. Deterministic exercise of the batch path.
 * Usage: npx tsx batch-settle.ts <dealId1> <dealId2> ...
 */
import { JsonRpcProvider, Wallet, Contract, AbiCoder, formatEther } from 'ethers';
import { proofProvider } from '@gluwa/usc-sdk';
import settlementAbi from './abi/GageSettlement.json' with { type: 'json' };

const env = (k: string, d?: string) => process.env[k] ?? d;
const SEPOLIA_RPC = env('SEPOLIA_RPC_URL', 'https://ethereum-sepolia-rpc.publicnode.com')!;
const CC3_RPC = env('CC3_RPC_URL', 'https://rpc.cc3-testnet.creditcoin.network')!;
const PROVER_URL = env('PROOF_BUILDER_URL', 'https://prover.cc3-testnet.creditcoin.network')!;
const PK = env('PRIVATE_KEY');
const DEAL_ADDR = env('GAGE_DEAL_ADDRESS')!;
const SETTLE_ADDR = env('GAGE_SETTLEMENT_ADDRESS')!;
const CHAIN_KEY = 1;
const PAYMENT_TOPIC0 = '0xd33aaa180016895d33ce7ad0841fe3c9e56cec30c0cf9a763f0e70825f732e3e';

async function main() {
  const ids = process.argv.slice(2).map(Number);
  if (!PK || !ids.length) throw new Error('usage: batch-settle.ts <dealId...> with env PRIVATE_KEY GAGE_*');
  const sepolia = new JsonRpcProvider(SEPOLIA_RPC);
  const cc3 = new JsonRpcProvider(CC3_RPC);
  const wallet = new Wallet(PK, cc3);
  const settlement = new Contract(SETTLE_ADDR, settlementAbi, wallet);
  const proofBuilder = new proofProvider.service.ProofBuilder(CHAIN_KEY, PROVER_URL, 30000);
  const coder = AbiCoder.defaultAbiCoder();

  const proofs: unknown[][] = [];
  for (const id of ids) {
    const head = await sepolia.getBlockNumber();
    const logs = await sepolia.getLogs({
      address: DEAL_ADDR,
      topics: [PAYMENT_TOPIC0, '0x' + BigInt(id).toString(16).padStart(64, '0'), null],
      fromBlock: head - 2000,
      toBlock: head,
    });
    const log = logs.at(-1);
    if (!log) throw new Error(`no PaymentMade log for deal ${id}`);
    const deal = await settlement.deals(id);
    if (Number(deal.state) !== 0) throw new Error(`deal ${id} not open`);
    console.log(`deal ${id}: payment at block ${log.blockNumber}, waiting attestation...`);
    await proofBuilder.waitUntilHeightAttested(CHAIN_KEY, log.blockNumber);
    const r = await proofBuilder.getProof(log.transactionHash);
    if (!r.success || !r.data) throw new Error(`proof failed: ${r.error}`);
    const d = r.data;
    proofs.push([
      CHAIN_KEY, d.headerNumber, d.txBytes, d.merkleProof.root,
      d.merkleProof.siblings.map((s: { hash: string; isLeft: boolean }) => [s.hash, s.isLeft]),
      d.continuityProof.lowerEndpointDigest, d.continuityProof.roots,
    ]);
    console.log(`deal ${id}: proof ready (height ${d.headerNumber})`);
  }

  console.log(`settleMany with ${proofs.length} proofs in one transaction...`);
  const tx = await settlement.settleMany(proofs, { gasLimit: 60_000_000 });
  const rec = await tx.wait();
  console.log(`BATCH SETTLED ${proofs.length} payments: ${rec?.hash}`);
}

main().catch((e) => { console.error('fatal:', e.message ?? e); process.exit(1); });
