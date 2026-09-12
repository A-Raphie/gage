import { NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet, parseEther } from "ethers";

/**
 * Operator console: signs real transactions server-side against the deployed
 * Gage contracts. Disclosed in the UI as "operator console · testnet key".
 * Disabled unless OPERATOR_KEY is configured; amounts are capped for safety.
 */

export const runtime = "nodejs";

const CC3_RPC = "https://rpc.cc3-testnet.creditcoin.network";
const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const GAGE_ADDRESS =
  process.env.NEXT_PUBLIC_GAGE_SETTLEMENT_ADDRESS ??
  "0xA93DD76Ce639Dd9BE4C780363d54706E098aa1c4";

const settlementAbi = [
  "function deals(uint256) view returns (address maker,address taker,uint96 amount,uint64 expiry,uint96 paymentAmount,address sourceEmitter,bytes32 ref,uint8 state)",
  "function open(address taker,uint64 expiry,uint96 paymentAmount,address sourceEmitter,bytes32 ref) payable returns (uint256 dealId)",
];
const dealAbi = ["function pay(uint256 dealId, bytes32 ref) payable"];

function randomRef(): string {
  const h = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 64; i++) out += h[Math.floor(Math.random() * 16)];
  return out;
}

export async function POST(req: Request) {
  const key = process.env.OPERATOR_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "operator console disabled: no operator key configured" },
      { status: 503 },
    );
  }

  let body: { action?: string; taker?: string; gage?: string; payment?: string; hours?: number; dealId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  try {
    if (body.action === "lock") {
      const gage = parseEther((body.gage ?? "1").slice(0, 8));
      const payment = parseEther((body.payment ?? "0.001").slice(0, 10));
      if (gage <= 0n || gage > parseEther("5")) {
        return NextResponse.json({ error: "gage must be between 0 and 5 CTC" }, { status: 400 });
      }
      if (payment <= 0n || payment > parseEther("0.01")) {
        return NextResponse.json({ error: "payment must be between 0 and 0.01 ETH" }, { status: 400 });
      }
      const hours = Math.min(Math.max(Number(body.hours) || 24, 1), 168);
      const provider = new JsonRpcProvider(CC3_RPC);
      const wallet = new Wallet(key, provider);
      const c = new Contract(GAGE_ADDRESS, settlementAbi, wallet);
      const tx = await c.open(
        wallet.address, // self-deal: the operator locks against itself for the demo
        Math.floor(Date.now() / 1000) + hours * 3600,
        payment,
        GAGE_ADDRESS,
        randomRef(),
        { value: gage },
      );
      const rec = await tx.wait();
      return NextResponse.json({ hash: rec?.hash ?? tx.hash });
    }

    if (body.action === "pay") {
      const dealId = Number(body.dealId);
      if (!Number.isInteger(dealId) || dealId < 1) {
        return NextResponse.json({ error: "dealId required" }, { status: 400 });
      }
      const cc3 = new JsonRpcProvider(CC3_RPC);
      const reader = new Contract(GAGE_ADDRESS, settlementAbi, cc3);
      const d = await reader.deals(dealId);
      if (Number(d.state) !== 0) {
        return NextResponse.json({ error: `deal ${dealId} is not open` }, { status: 400 });
      }
      const provider = new JsonRpcProvider(SEPOLIA_RPC);
      const wallet = new Wallet(key, provider);
      const c = new Contract(GAGE_ADDRESS, dealAbi, wallet);
      const tx = await c.pay(dealId, d.ref, { value: d.paymentAmount });
      const rec = await tx.wait();
      return NextResponse.json({ hash: rec?.hash ?? tx.hash });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message?.slice(0, 240) ?? "operator action failed" },
      { status: 500 },
    );
  }
}
