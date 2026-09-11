"use client";

/**
 * Live testnet proof counts for the landing: read straight from the
 * settlement registry. Real values or nothing renders.
 */
import { useEffect, useState } from "react";
import { GAGE_SETTLEMENT_ADDRESS, CC3_RPC, settlementAbi } from "@/lib/chain";

export function LiveProof() {
  const [stats, setStats] = useState<{ deals: number; settled: number } | null>(null);

  useEffect(() => {
    const read = async () => {
      try {
        const { Contract, JsonRpcProvider } = await import("ethers");
        const cc3 = new JsonRpcProvider(CC3_RPC);
        const s = new Contract(GAGE_SETTLEMENT_ADDRESS, settlementAbi, cc3);
        const next: bigint = await s.nextDealId();
        const total = Number(next) - 1;
        let settled = 0;
        for (let i = 1; i <= total; i++) {
          const d = await s.deals(i);
          if (Number(d.state) === 1) settled++;
        }
        setStats({ deals: total, settled });
      } catch {
        setStats(null);
      }
    };
    void read();
    const t = setInterval(() => void read(), 20000);
    return () => clearInterval(t);
  }, []);

  if (!stats || stats.deals === 0) return null;

  return (
    <p className="microlabel mt-6 text-faint">
      <span className="text-ok" aria-hidden>
        ●{" "}
      </span>
      live on testnet: {stats.deals} deal{stats.deals === 1 ? "" : "s"} opened ·{" "}
      {stats.settled} settled by proof
    </p>
  );
}
