"use client";

import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Strand } from "@/components/strand";
import {
  GAGE_DEAL_ADDRESS,
  GAGE_SETTLEMENT_ADDRESS,
  SEPOLIA_EXPLORER,
  CC3_EXPLORER,
  loadDeals,
  dealState,
  eth,
  ctc,
  short,
  shortRef,
  type DealView,
  type LoadPhase,
} from "@/lib/chain";

const toneClass: Record<string, string> = {
  ok: "text-ok border-ok/40",
  warn: "text-warn border-warn/40",
  danger: "text-danger border-danger/40",
  accent: "text-accent border-accent/40",
  mute: "text-mute border-hairline-strong",
};

function StateChip({ deal }: { deal: DealView }) {
  const s = dealState(deal);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${toneClass[s.tone]}`}
    >
      <span aria-hidden>
        {s.key === "settled" ? "◆" : s.key === "expired" ? "⚠" : "◇"}
      </span>
      {s.label}
    </span>
  );
}

export default function Console() {
  const [phase, setPhase] = useState<LoadPhase>("loading");
  const [deals, setDeals] = useState<DealView[]>([]);
  const [settlementLive, setSettlementLive] = useState(false);
  const [error, setError] = useState<string>();
  const [selected, setSelected] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await loadDeals();
      setDeals(r.deals);
      setSettlementLive(r.settlementLive);
      setPhase("ready");
      setError(undefined);
    } catch (e) {
      setPhase("error");
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 12000);
    return () => clearInterval(t);
  }, [refresh]);

  const selectedDeal = deals.find((d) => d.id === selected) ?? null;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl tracking-tight">
                Deal console
              </h1>
              <p className="mt-2 text-sm text-mute">
                Every value on this page is read live from the contracts. Deals
                are opened and paid by their parties; settlement runs itself.
              </p>
            </div>
            <button
              onClick={() => void refresh()}
              className="rounded-full border border-hairline-strong px-4 py-1.5 text-sm text-mute transition-colors hover:border-accent hover:text-accent"
            >
              Refresh now
            </button>
          </div>

          {/* contract posture strip */}
          <div className="microlabel mt-6 flex flex-wrap gap-x-6 gap-y-1 text-faint">
            <span className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
              gagedeal {short(GAGE_DEAL_ADDRESS)} · sepolia
            </span>
            <span className="flex items-center gap-2">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${settlementLive ? "bg-ok" : "bg-warn"}`}
                aria-hidden
              />
              gagesettlement{" "}
              {settlementLive
                ? `${short(GAGE_SETTLEMENT_ADDRESS)} · cc3`
                : "awaiting cc3 deployment"}
            </span>
          </div>

          {/* states: loading · error · empty · partial · ready */}
          {phase === "loading" && (
            <div className="mt-10 space-y-3" aria-label="loading deals">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-[var(--r-tile)] border border-hairline bg-surface"
                />
              ))}
            </div>
          )}

          {phase === "error" && (
            <div className="mt-10 rounded-[var(--r-panel)] border border-danger/40 bg-surface p-6">
              <p className="microlabel text-danger">rpc error</p>
              <p className="mt-2 text-sm text-mute">{error}</p>
              <button
                onClick={() => void refresh()}
                className="mt-4 rounded-full border border-hairline-strong px-4 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
              >
                Retry
              </button>
            </div>
          )}

          {phase === "ready" && !settlementLive && (
            <div className="mt-10 rounded-[var(--r-panel)] border border-warn/40 bg-surface p-5">
              <p className="microlabel text-warn">
                ⚠ settlement side unreachable
              </p>
              <p className="mt-2 text-sm text-mute">
                The Creditcoin CC3 RPC did not answer. Deal terms will appear
                when it does; nothing on this page is mocked.
              </p>
            </div>
          )}

          {phase === "ready" && deals.length === 0 && settlementLive && (
            <div className="mt-10 rounded-[var(--r-panel)] border border-hairline bg-surface p-10 text-center">
              <p className="font-display text-xl">No deals yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-mute">
                A deal appears here the moment its maker locks a gage on
                Creditcoin.
              </p>
            </div>
          )}

          {phase === "ready" && deals.length > 0 && (
            <div className="mt-10 overflow-x-auto rounded-[var(--r-panel)] border border-hairline">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="microlabel border-b border-hairline bg-surface text-left text-faint">
                    <th className="px-4 py-3 font-normal">deal</th>
                    <th className="px-4 py-3 font-normal">gage (cc3)</th>
                    <th className="px-4 py-3 font-normal">payment (sep)</th>
                    <th className="px-4 py-3 font-normal">escrowed</th>
                    <th className="px-4 py-3 font-normal">expiry</th>
                    <th className="px-4 py-3 font-normal">state</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => setSelected(d.id)}
                      className="cursor-pointer border-b border-hairline transition-colors last:border-0 hover:bg-raised"
                    >
                      <td className="num px-4 py-3">
                        #{String(d.id).padStart(4, "0")}
                      </td>
                      <td className="num px-4 py-3 text-mute">
                        {ctc(d.gageAmount)}
                      </td>
                      <td className="num px-4 py-3 text-mute">
                        {eth(d.paymentAmount)}
                      </td>
                      <td className="num px-4 py-3 text-mute">
                        {eth(d.escrowTotal)}
                      </td>
                      <td className="num px-4 py-3 text-mute">
                        {d.expiry
                          ? new Date(d.expiry * 1000)
                              .toISOString()
                              .slice(0, 16)
                              .replace("T", " ")
                          : "·"}
                      </td>
                      <td className="px-4 py-3">
                        <StateChip deal={d} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* deal detail with the live strand */}
          {selectedDeal && (
            <section className="mt-12">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-2xl">
                  Deal #{String(selectedDeal.id).padStart(4, "0")}
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm text-mute transition-colors hover:text-accent"
                >
                  Close
                </button>
              </div>
              <div className="mt-4">
                <Strand
                  compact
                  state={
                    selectedDeal.ccState === 1
                      ? "settled"
                      : selectedDeal.paymentsSeen > 0
                        ? "paid"
                        : "awaiting"
                  }
                  sourceName="Sepolia"
                  targetName="Creditcoin CC3"
                  sourceAmount={`${eth(selectedDeal.escrowTotal)} escrowed`}
                  targetAmount={ctc(selectedDeal.gageAmount)}
                />
              </div>
              <dl className="mt-6 grid gap-px overflow-hidden rounded-[var(--r-panel)] border border-hairline bg-hairline sm:grid-cols-3">
                {[
                  ["maker", short(selectedDeal.maker)],
                  ["taker", short(selectedDeal.taker)],
                  ["ref", shortRef(selectedDeal.ref)],
                ].map(([k, v]) => (
                  <div key={k} className="bg-surface p-4">
                    <dt className="microlabel text-faint">{k}</dt>
                    <dd className="hash mt-1 text-sm">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-4 text-xs text-faint">
                sepolia explorer:{" "}
                <a
                  className="text-mute underline decoration-hairline-strong underline-offset-4 hover:text-accent"
                  href={`${SEPOLIA_EXPLORER}/address/${GAGE_DEAL_ADDRESS}`}
                  rel="noreferrer"
                >
                  {short(GAGE_DEAL_ADDRESS)}
                </a>
                {" · "}cc3 explorer:{" "}
                <a
                  className="text-mute underline decoration-hairline-strong underline-offset-4 hover:text-accent"
                  href={`${CC3_EXPLORER}/address/${GAGE_SETTLEMENT_ADDRESS}`}
                  rel="noreferrer"
                >
                  {short(GAGE_SETTLEMENT_ADDRESS)}
                </a>
              </p>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
