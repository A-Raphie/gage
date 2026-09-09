// Gage spike: prove one real Sepolia transaction on Creditcoin CC3 testnet.
// Gasless: verifySingle is a static call against the BlockProver precompile.
import { JsonRpcProvider, ethers } from 'ethers';
import { chainInfo, blockProver, proofProvider } from '@gluwa/usc-sdk';

const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const CC3_RPC = 'https://rpc.cc3-testnet.creditcoin.network';
const PROVER_URL = 'https://prover.cc3-testnet.creditcoin.network';

async function main() {
  const sourceProvider = new JsonRpcProvider(SEPOLIA_RPC);
  const creditcoinProvider = new JsonRpcProvider(CC3_RPC);

  const net = await creditcoinProvider.getNetwork();
  console.log('[1] Creditcoin CC3 testnet chainId:', net.chainId.toString());

  // Pick a settled Sepolia tx (a few blocks back so attestation has caught up)
  const head = await sourceProvider.getBlockNumber();
  const block = await sourceProvider.getBlock(head - 40);
  if (!block || block.transactions.length === 0) throw new Error('no txs in target block');
  const txHash = block.transactions[0];
  console.log('[2] Sepolia tx:', txHash, '(block', block.number + ')');

  const chainInfoProvider = new chainInfo.PrecompileChainInfoProvider(creditcoinProvider);
  const supported = await chainInfoProvider.getSupportedChains();
  console.log('[3] supported source chains:', JSON.stringify(supported));

  const proofBuilder = new proofProvider.service.ProofBuilder(1, PROVER_URL, 8000);

  console.log('[4] waiting for attestation of block', block.number, '...');
  await proofBuilder.waitUntilHeightAttested(1, block.number);
  console.log('[4] block attested');

  const result = await proofBuilder.getProof(txHash);
  if (!result.success || !result.data) throw new Error('proof generation failed: ' + result.error);
  const { chainKey, headerNumber, txBytes, merkleProof, continuityProof } = result.data;
  console.log('[5] proof generated: chainKey', chainKey, 'height', headerNumber);

  const prover = new blockProver.PrecompileBlockProver(creditcoinProvider);
  const verified = await prover.verifySingle(chainKey, headerNumber, txBytes, merkleProof, continuityProof);
  console.log('[6] VERIFICATION ON CC3 TESTNET:', verified ? 'SUCCESS' : 'FAILED');
  if (!verified) process.exit(1);
}

main().catch((e) => {
  console.error('SPIKE FAILED:', e.message ?? e);
  process.exit(1);
});
