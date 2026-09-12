"use client";

import { Contract, JsonRpcProvider, formatEther } from "ethers";
import { randomBytes } from "node:crypto";

/**
 * Chain reads + write ABIs for the console. Read-only, no wallet needed: the
 * contracts are the store. The CC3 settlement registry is canonical: a deal
 * exists the moment the maker locks the gage; Sepolia payment data merges by id.
 */

export const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
export const CC3_RPC = "https://rpc.cc3-testnet.creditcoin.network";

export const GAGE_DEAL_ADDRESS =
  process.env.NEXT_PUBLIC_GAGE_DEAL_ADDRESS ??
  "0xA93DD76Ce639Dd9BE4C780363d54706E098aa1c4";
export const GAGE_SETTLEMENT_ADDRESS =
  process.env.NEXT_PUBLIC_GAGE_SETTLEMENT_ADDRESS ??
  "0xA93DD76Ce639Dd9BE4C780363d54706E098aa1c4";

export const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";
export const CC3_EXPLORER = "https://creditcoin-testnet.blockscout.com";

export const dealAbi = [
  "function nextDealId() view returns (uint256)",
  "function dealTotal(uint256) view returns (uint256)",
  "function paymentCount(uint256) view returns (uint256)",
  "function payments(uint256,uint256) view returns (address payer,uint96 amount,bytes32 ref,uint64 paidAt,bool reclaimed)",
  "function registerDeal() returns (uint256)",
  "function pay(uint256 dealId, bytes32 ref) payable",
];

export const settlementAbi = [
  "function nextDealId() view returns (uint256)",
  "function deals(uint256) view returns (address maker,address taker,uint96 amount,uint64 expiry,uint96 paymentAmount,address sourceEmitter,bytes32 ref,uint8 state)",
  "function open(address taker,uint64 expiry,uint96 paymentAmount,address sourceEmitter,bytes32 ref) payable returns (uint256 dealId)",
  "function cancelExpired(uint256 dealId)",
];

/** Random 32-byte payment reference for a new deal. */
export function makeRef(): string {
  return "0x" + randomBytes(32).toString("hex");
}

/** Short human rendering of a ref (first 4 bytes). */
export function shortRef(ref?: string): string {
  if (!ref) return "·";
  return "0x" + ref.slice(2, 10);
}

export interface DealView {
  id: number;
  // creditcoin side (canonical terms)
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
  const cc3 = new JsonRpcProvider(CC3_RPC);
  const settlement = new Contract(GAGE_SETTLEMENT_ADDRESS, settlementAbi, cc3);

  let settlementLive = false;
  try {
    const code = await cc3.getCode(GAGE_SETTLEMENT_ADDRESS);
    settlementLive = !!code && code !== "0x";
  } catch {
    settlementLive = false;
  }
  if (!settlementLive) {
    return { phase: "ready", deals: [], settlementLive };
  }

  const nextId: bigint = await settlement.nextDealId();
  const count = Number(nextId) - 1;
  const deals: DealView[] = [];

  const terms = await Promise.all(
    Array.from({ length: count }, (_, k) => settlement.deals(k + 1).catch(() => null)),
  );
  const sepoliaSides = await Promise.all(
    Array.from({ length: count }, (_, k) =>
      Promise.all([deal.dealTotal(k + 1), deal.paymentCount(k + 1)]).catch(() => null),
    ),
  );
  for (let i = 1; i <= count; i++) {
    const d = terms[i - 1];
    if (!d) continue;
    const view: DealView = {
      id: i,
      maker: d.maker,
      taker: d.taker,
      gageAmount: d.amount,
      expiry: Number(d.expiry),
      paymentAmount: d.paymentAmount,
      ref: d.ref,
      ccState: Number(d.state),
      paymentsSeen: 0,
      escrowTotal: 0n,
    };
    const side = sepoliaSides[i - 1];
    if (side) {
      const [total, pCount] = side;
      view.escrowTotal = total;
      view.paymentsSeen = Number(pCount);
      if (view.paymentsSeen > 0) {
        try {
          const [payer, amount, , paidAt] = await deal.payments(
            i,
            view.paymentsSeen - 1,
          );
          view.lastPayment = { payer, amount, paidAt: Number(paidAt) };
        } catch {
          // last-payment detail is optional
        }
      }
    }
    deals.push(view);
  }

  return { phase: "ready", deals, settlementLive };
}

/** Derived display state for a deal (chips pair glyph + label; color never the sole signal). */
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
