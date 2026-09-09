"use client";

import { Contract, JsonRpcProvider, formatEther } from "ethers";

/**
 * Chain reads for the console. Read-only, no wallet needed: the contracts are
 * the store. Addresses come from build env so a redeploy is a config flip.
 */

export const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
export const CC3_RPC = "https://rpc.cc3-testnet.creditcoin.network";

export const GAGE_DEAL_ADDRESS =
  process.env.NEXT_PUBLIC_GAGE_DEAL_ADDRESS ??
  "0xA93DD76Ce639Dd9BE4C780363d54706E098aa1c4";
export const GAGE_SETTLEMENT_ADDRESS =
  process.env.NEXT_PUBLIC_GAGE_SETTLEMENT_ADDRESS ?? ""; // empty until CC3 deploy

export const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";
export const CC3_EXPLORER = "https://creditcoin-testnet.blockscout.com";

const dealAbi = [
  "function nextDealId() view returns (uint256)",
  "function dealTotal(uint256) view returns (uint256)",
  "function paymentCount(uint256) view returns (uint256)",
  "function payments(uint256,uint256) view returns (address payer,uint96 amount,bytes32 ref,uint64 paidAt,bool reclaimed)",
];

const settlementAbi = [
  "function nextDealId() view returns (uint256)",
  "function deals(uint256) view returns (address maker,address taker,uint96 amount,uint64 expiry,uint96 paymentAmount,address sourceEmitter,bytes32 ref,uint8 state)",
];

export interface DealView {
  id: number;
  // creditcoin side
  maker?: string;
  taker?: string;
  gageAmount?: bigint; // wei CTC locked
  expiry?: number; // unix seconds
  paymentAmount?: bigint; // wei ETH expected
  ref?: string;
  ccState?: number; // 0 open, 1 settled, 2 cancelled
  // sepolia side
  paymentsSeen: number;
  escrowTotal: bigint; // wei ETH escrowed
  lastPayment?: { payer: string; amount: bigint; paidAt: number };
}

export type LoadPhase = "loading" | "ready" | "error";

export async function loadDeals(): Promise<{
  phase: LoadPhase;
  deals: DealView[];
  settlementLive: boolean;
  error?: string;
}> {
  const sepolia = new JsonRpcProvider(SEPOLIA_RPC);
  const deal = new Contract(GAGE_DEAL_ADDRESS, dealAbi, sepolia);

  let settlementLive = false;
  let settlement: Contract | null = null;
  const cc3 = new JsonRpcProvider(CC3_RPC);
  if (GAGE_SETTLEMENT_ADDRESS) {
    const code = await cc3.getCode(GAGE_SETTLEMENT_ADDRESS);
    if (code && code !== "0x") {
      settlementLive = true;
      settlement = new Contract(GAGE_SETTLEMENT_ADDRESS, settlementAbi, cc3);
    }
  }

  const nextId: bigint = await deal.nextDealId();
  const count = Number(nextId) - 1;
  const deals: DealView[] = [];

  for (let i = 1; i <= count; i++) {
    const view: DealView = { id: i, paymentsSeen: 0, escrowTotal: 0n };
    const [total, pCount] = await Promise.all([
      deal.dealTotal(i),
      deal.paymentCount(i),
    ]);
    view.escrowTotal = total;
    view.paymentsSeen = Number(pCount);
    if (view.paymentsSeen > 0) {
      const [payer, amount, , paidAt] = await deal.payments(
        i,
        view.paymentsSeen - 1,
      );
      view.lastPayment = { payer, amount, paidAt: Number(paidAt) };
    }
    if (settlement) {
      try {
        const d = await settlement.deals(i);
        view.maker = d.maker;
        view.taker = d.taker;
        view.gageAmount = d.amount;
        view.expiry = Number(d.expiry);
        view.paymentAmount = d.paymentAmount;
        view.ref = d.ref;
        view.ccState = Number(d.state);
      } catch {
        // deal id opened on sepolia only; leave creditcoin side undefined
      }
    }
    deals.push(view);
  }

  return { phase: "ready", deals, settlementLive };
}

/** Derived display state for a deal (color never the sole signal: chips pair glyph + label). */
export function dealState(d: DealView): {
  key: string;
  label: string;
  tone: "ok" | "warn" | "danger" | "accent" | "mute";
} {
  if (d.ccState === 1) return { key: "settled", label: "settled", tone: "ok" };
  if (d.ccState === 2) return { key: "cancelled", label: "cancelled", tone: "danger" };
  if (d.expiry && d.expiry * 1000 < Date.now())
    return { key: "expired", label: "expired · reclaimable", tone: "warn" };
  if (d.paymentsSeen > 0)
    return { key: "proving", label: "payment seen · proving", tone: "accent" };
  if (d.maker) return { key: "open", label: "open · awaiting payment", tone: "mute" };
  return { key: "registered", label: "registered on sepolia", tone: "mute" };
}

export function eth(n: bigint | undefined): string {
  if (n === undefined) return "·";
  return `${formatEther(n)} ETH`;
}

export function ctc(n: bigint | undefined): string {
  if (n === undefined) return "·";
  return `${formatEther(n)} CTC`;
}

export function short(addr?: string) {
  if (!addr) return "·";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
