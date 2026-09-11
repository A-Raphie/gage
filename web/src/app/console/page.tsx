"use client";

import { useCallback, useEffect, useState } from "react";
import { Contract, isAddress, parseEther } from "ethers";
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
  makeRef,
  dealAbi,
  settlementAbi,
  type DealView,
  type LoadPhase,
} from "@/lib/chain";
import { CC3_CHAIN_ID, SEPOLIA_CHAIN_ID, CHAIN_PARAMS, useInjectedWallet, short as shortAcct } from "@/lib/wallet";

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

function WalletChip() {
  const w = useInjectedWallet();
  if (!w.account) {
    return (
      <button
        onClick={() => void w.connect()}
        disabled={w.busy}
        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-deep active:scale-[0.98] disabled:opacity-50"
      >
        {w.hasWallet ? "Connect wallet" : "Install a wallet"}
      </button>
    );
  }
  const onC3 = w.chainId === CC3_CHAIN_ID;
  const onSep = w.chainId === SEPOLIA_CHAIN_ID;
  return (
    <div className="flex items-center gap-2">
      {!onC3 && !onSep && (
        <button
          onClick={() => void w.ensureChain(CC3_CHAIN_ID)}
          className="rounded-full border border-warn/50 px-4 py-2 text-sm text-warn transition-colors hover:border-warn"
        >
          Switch network
        </button>
      )}
      {onC3 && (
        <button
          onClick={() => void w.ensureChain(SEPOLIA_CHAIN_ID)}
          className="microlabel rounded-full border border-hairline-strong px-3 py-1.5 text-faint transition-colors hover:border-accent hover:text-accent"
        >
          {CHAIN_PARAMS[CC3_CHAIN_ID].symbol} · switch
        </button>
      )}
      {onSep && (
        <button
          onClick={() => void w.ensureChain(CC3_CHAIN_ID)}
          className="microlabel rounded-full border border-hairline-strong px-3 py-1.5 text-faint transition-colors hover:border-accent hover:text-accent"
        >
          {CHAIN_PARAMS[SEPOLIA_CHAIN_ID].symbol} · switch
        </button>
      )}
      <span className="hash rounded-full border border-ok/40 px-3 py-1.5 text-xs text-ok">
        <span aria-hidden>● </span>
        {shortAcct(w.account)}
      </span>
    </div>
  );
}

function NewDealPanel({
  onDone,
  onClose,
}: {
  onDone: () => void;
  onClose: () => void;
}) {
  const w = useInjectedWallet();
  const [taker, setTaker] = useState("0x000000000000000000000000000000000000dEaD");
  const [gage, setGage] = useState("1");
  const [payment, setPayment] = useState("0.001");
  const [expiryHours, setExpiryHours] = useState(24);
  const [ref] = useState(makeRef);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setErr(null);
    if (!isAddress(taker)) {
      setErr("Taker must be a valid address.");
      return;
    }
    let gageWei: bigint;
    let paymentWei: bigint;
    try {
      gageWei = parseEther(gage || "0");
      paymentWei = parseEther(payment || "0");
    } catch {
      setErr("Amounts must be decimal numbers.");
      return;
    }
    if (gageWei <= 0n || paymentWei <= 0n) {
      setErr("Amounts must be greater than zero.");
      return;
    }
    setPending(true);
    try {
      const hash = await w.write(CC3_CHAIN_ID, (signer) => {
        const c = new Contract(GAGE_SETTLEMENT_ADDRESS, settlementAbi, signer);
        return c.open(
          taker,
          Math.floor(Date.now() / 1000) + expiryHours * 3600,
          paymentWei,
          GAGE_DEAL_ADDRESS,
          ref,
          { value: gageWei },
        );
      });
      setTxHash(hash);
      onDone();
    } catch (e) {
      setErr((e as Error).message.slice(0, 200));
    } finally {
      setPending(false);
    }
  }, [taker, gage, payment, expiryHours, ref, w, onDone]);

  if (txHash) {
    return (
      <div className="mt-8 rounded-[var(--r-panel)] border border-ok/40 bg-surface p-6">
        <p className="microlabel text-ok">◆ gage locked</p>
        <p className="mt-2 text-sm text-mute">
          Deal opened on Creditcoin. It appears in the table below; the
          counterparty pays from its row.
        </p>
        <p className="hash mt-2 text-xs text-faint">tx {txHash}</p>
        <button
          onClick={onClose}
          className="mt-4 rounded-full border border-hairline-strong px-4 py-1.5 text-sm text-mute transition-colors hover:border-accent hover:text-accent"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-[var(--r-panel)] border border-hairline bg-surface p-6">
      <div className="flex items-center justify-between">
        <p className="microlabel text-faint">open a deal · locks your gage on creditcoin</p>
        <button
          onClick={onClose}
          className="text-sm text-mute transition-colors hover:text-accent"
        >
          Close
        </button>
      </div>

      {!w.account ? (
        <div className="mt-4">
          <p className="text-sm text-mute">
            {w.hasWallet
              ? "Connect a wallet to lock the gage. This opens a deal on Creditcoin CC3 with your CTC."
              : "No injected wallet found. Install MetaMask or Rabby, then connect."}
          </p>
          {w.hasWallet && (
            <button
              onClick={() => void w.connect()}
              className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-deep"
            >
              Connect wallet
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="microlabel text-faint">taker (payout address on creditcoin)</span>
            <input
              value={taker}
              onChange={(e) => setTaker(e.target.value)}
              className="hash mt-1.5 w-full rounded-[var(--r-tile)] border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink focus:border-accent"
              spellCheck={false}
            />
          </label>
          <label className="block">
            <span className="microlabel text-faint">expires in</span>
            <select
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
              className="mt-1.5 w-full rounded-[var(--r-tile)] border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink focus:border-accent"
            >
              <option value={24}>24 hours</option>
              <option value={72}>3 days</option>
              <option value={168}>7 days</option>
            </select>
          </label>
          <label className="block">
            <span className="microlabel text-faint">gage size (CTC, locked from you)</span>
            <input
              value={gage}
              onChange={(e) => setGage(e.target.value)}
              inputMode="decimal"
              className="num mt-1.5 w-full rounded-[var(--r-tile)] border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="microlabel text-faint">payment (ETH, expected from the payer)</span>
            <input
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              inputMode="decimal"
              className="num mt-1.5 w-full rounded-[var(--r-tile)] border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink focus:border-accent"
            />
          </label>
          <p className="hash text-xs text-faint sm:col-span-2">ref {shortRef(ref)}</p>
          {err && <p className="text-sm text-danger sm:col-span-2">{err}</p>}
          <div className="sm:col-span-2">
            <button
              onClick={() => void submit()}
              disabled={pending || w.busy}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-deep active:scale-[0.98] disabled:opacity-50"
            >
              {pending ? "Locking gage…" : "Lock gage · open deal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PayButton({ deal, onDone }: { deal: DealView; onDone: () => void }) {
  const w = useInjectedWallet();
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const amount = deal.paymentAmount !== undefined ? eth(deal.paymentAmount) : "ETH";

  const pay = useCallback(async () => {
    setErr(null);
    setPending(true);
    try {
      const h = await w.write(SEPOLIA_CHAIN_ID, (signer) => {
        const c = new Contract(GAGE_DEAL_ADDRESS, dealAbi, signer);
        return c.pay(deal.id, deal.ref, { value: deal.paymentAmount });
      });
      setHash(h);
      onDone();
    } catch (e) {
      setErr((e as Error).message.slice(0, 200));
    } finally {
      setPending(false);
    }
  }, [deal, w, onDone]);

  if (hash) {
    return <p className="hash text-xs text-ok">◆ paid · tx {hash.slice(0, 10)}…</p>;
  }

  return (
    <div>
      <button
        onClick={() => void pay()}
        disabled={pending || w.busy || deal.paymentAmount === undefined}
        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-deep active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? "Paying…" : `Pay ${amount} on Sepolia`}
      </button>
      {!w.account && (
        <p className="mt-2 text-xs text-faint">
          Connect a wallet first (button above). The payment lands in the Sepolia
          escrow; the worker proves it and the gage releases.
        </p>
      )}
      {err && <p className="mt-2 text-xs text-danger">{err}</p>}
    </div>
  );
}

export default function Console() {
  const [phase, setPhase] = useState<LoadPhase>("loading");
  const [deals, setDeals] = useState<DealView[]>([]);
  const [settlementLive, setSettlementLive] = useState(false);
  const [error, setError] = useState<string>();
  const [selected, setSelected] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

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
  const canPay = (d: DealView) =>
    d.ccState === 0 && d.expiry !== undefined && d.expiry * 1000 > Date.now();

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
                Every value on this page is read live from the contracts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPanelOpen((v) => !v)}
                className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-deep active:scale-[0.98]"
              >
                Open a deal
              </button>
              <WalletChip />
            </div>
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

          {panelOpen && (
            <NewDealPanel
              onDone={() => void refresh()}
              onClose={() => setPanelOpen(false)}
            />
          )}

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
                ⚠ settlement side deploying
              </p>
              <p className="mt-2 text-sm text-mute">
                GageSettlement deploys on Creditcoin CC3 the moment the testnet
                wallet is funded; deals will show their Creditcoin side then.
              </p>
            </div>
          )}

          {phase === "ready" && deals.length === 0 && settlementLive && (
            <div className="mt-10 rounded-[var(--r-panel)] border border-hairline bg-surface p-10 text-center">
              <p className="font-display text-xl">No deals yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-mute">
                Open the first one: lock a gage on Creditcoin, hand the payment
                to your counterparty, and the proof does the rest.
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

              {canPay(selectedDeal) && (
                <div className="mt-6 rounded-[var(--r-panel)] border border-hairline bg-surface p-5">
                  <p className="microlabel text-faint">counterparty action</p>
                  <div className="mt-3">
                    <PayButton deal={selectedDeal} onDone={() => void refresh()} />
                  </div>
                </div>
              )}

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
