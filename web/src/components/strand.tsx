"use client";

/**
 * THE PROOF STRAND: Gage's signature component.
 * A deal rendered as two tokens (payment on the source chain, release on
 * Creditcoin) connected by a strand that carries the proof. The strand is
 * slack and dashed while nothing is proven, takes on proof data (height,
 * tx index) as attestation lands, snaps solid at verification, and the
 * release token flips when settled. Motion fires only on state transitions.
 */

export type StrandState =
  | "awaiting" // deal open, no payment yet
  | "paid" // payment seen on source chain, not yet attested
  | "attested" // block attested, proof generatable
  | "verified" // precompile verified, releasing
  | "settled" // gage released
  | "expired"; // deal expired, maker refunded

export interface StrandProps {
  state: StrandState;
  /** source-side label, e.g. "Sepolia" */
  sourceName: string;
  /** creditcoin-side label, e.g. "Creditcoin CC3" */
  targetName: string;
  sourceAmount: string; // preformatted, e.g. "0.500 ETH"
  targetAmount: string; // e.g. "800 CTC"
  /** payment tx hash on the source chain (empty while awaiting) */
  paymentTx?: string;
  /** attested source block height */
  height?: number;
  /** transaction index inside the block (from the proof) */
  txIndex?: number;
  /** settle tx hash on Creditcoin (empty until settled) */
  settleTx?: string;
  /** batch mode: how many payments feed this strand */
  payments?: number;
  compact?: boolean;
}

const stateLabel: Record<StrandState, string> = {
  awaiting: "awaiting payment",
  paid: "payment seen · attestation pending",
  attested: "block attested · proof ready",
  verified: "proof verified on Creditcoin",
  settled: "gage released",
  expired: "expired · gage refunded",
};

const stateTone: Record<StrandState, string> = {
  awaiting: "text-mute",
  paid: "text-accent-soft",
  attested: "text-accent-soft",
  verified: "text-accent",
  settled: "text-ok",
  expired: "text-warn",
};

function shortHash(h?: string) {
  if (!h) return "";
  return h.startsWith("0x") ? `${h.slice(0, 8)}…${h.slice(-6)}` : h;
}

export function Strand({
  state,
  sourceName,
  targetName,
  sourceAmount,
  targetAmount,
  paymentTx,
  height,
  txIndex,
  settleTx,
  payments = 1,
  compact = false,
}: StrandProps) {
  const w = 760;
  const h = compact ? 170 : 210;
  const cy = h / 2 + 6;
  const xL = 128;
  const xR = w - 128;
  const midX = w / 2;

  const awaiting = state === "awaiting";
  const expired = state === "expired";
  const verified = state === "verified" || state === "settled";
  const attested = state === "attested" || verified;

  const strandColor = expired
    ? "var(--warn)"
    : verified
      ? "var(--accent)"
      : attested
        ? "var(--accent-soft)"
        : "var(--hairline-strong)";

  // batch mode: payments fan in from the left
  const fan = payments > 1;
  const fanOffsets = fan ? [-34, 0, 34] : [0];

  return (
    <figure
      className="w-full rounded-[var(--r-panel)] border border-hairline bg-surface"
      aria-label={`deal strand: ${stateLabel[state]}`}
    >
      <figcaption className="flex items-center justify-between border-b border-hairline px-5 py-3">
        <span className={`microlabel ${stateTone[state]}`}>
          <span aria-hidden>{verified ? "◆" : expired ? "◇" : "◇"}</span>{" "}
          {stateLabel[state]}
        </span>
        <span className="microlabel text-faint">
          {fan ? `${payments} payments · one proof` : "one payment · one proof"}
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="block w-full"
        role="img"
        aria-hidden={false}
      >
        {/* the strand */}
        {fanOffsets.map((dy, i) => (
          <path
            key={i}
            d={`M ${xL} ${cy + dy} C ${midX - 120} ${cy + dy}, ${midX - 60} ${cy}, ${midX} ${cy} S ${xR - 140} ${cy}, ${xR} ${cy}`}
            fill="none"
            stroke={strandColor}
            strokeWidth={verified ? 2.5 : 2}
            strokeDasharray={verified ? "none" : "7 7"}
            className="transition-all duration-700 ease-out"
            opacity={expired ? 0.5 : 1}
          />
        ))}

        {/* proof data tick: appears at attestation, carries the real numbers */}
        <g
          className="transition-opacity duration-700"
          opacity={attested && height !== undefined ? 1 : 0}
        >
          <rect
            x={midX - 92}
            y={cy - 46}
            width={184}
            height={30}
            rx={6}
            fill="var(--surface)"
            stroke={verified ? "var(--accent)" : "var(--hairline-strong)"}
          />
          <text
            x={midX}
            y={cy - 26}
            textAnchor="middle"
            fill={verified ? "var(--accent)" : "var(--accent-soft)"}
            className="num"
            fontSize="12"
          >
            {`h ${height ?? "·······"}${txIndex !== undefined ? ` · i ${txIndex}` : ""}`}
          </text>
        </g>

        {/* source token (left) */}
        <g>
          <circle
            cx={xL}
            cy={cy}
            r={38}
            fill="var(--raised)"
            stroke={
              state === "awaiting" ? "var(--hairline-strong)" : strandColor
            }
            strokeWidth={2}
            className="transition-colors duration-700"
          />
          <text
            x={xL}
            y={cy - 4}
            textAnchor="middle"
            fill="var(--ink)"
            className="num"
            fontSize="13"
          >
            {fan ? `×${payments}` : "ETH"}
          </text>
          <text
            x={xL}
            y={cy + 14}
            textAnchor="middle"
            fill="var(--faint)"
            className="num"
            fontSize="9"
          >
            {fan ? "payments" : "escrow"}
          </text>
        </g>

        {/* target token (right) */}
        <g>
          <circle
            cx={xR}
            cy={cy}
            r={38}
            fill={state === "settled" ? "var(--accent)" : "var(--raised)"}
            stroke={
              state === "settled"
                ? "var(--accent)"
                : verified
                  ? "var(--accent)"
                  : "var(--hairline-strong)"
            }
            strokeWidth={2}
            className="transition-colors duration-700"
          />
          {state === "settled" ? (
            <path
              d={`M ${xR - 12} ${cy} l 8 9 l 16 -17`}
              stroke="var(--on-accent)"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <>
              <text
                x={xR}
                y={cy - 4}
                textAnchor="middle"
                fill="var(--ink)"
                className="num"
                fontSize="13"
              >
                GAGE
              </text>
              <text
                x={xR}
                y={cy + 14}
                textAnchor="middle"
                fill="var(--faint)"
                className="num"
                fontSize="9"
              >
                locked
              </text>
            </>
          )}
        </g>

        {/* side labels */}
        <text
          x={xL}
          y={cy + 68}
          textAnchor="middle"
          fill="var(--mute)"
          className="num"
          fontSize="12"
        >
          {sourceAmount}
        </text>
        <text
          x={xL}
          y={cy + 86}
          textAnchor="middle"
          fill="var(--faint)"
          className="microlabel"
          fontSize="9"
        >
          {sourceName}
        </text>
        <text
          x={xR}
          y={cy + 68}
          textAnchor="middle"
          fill="var(--mute)"
          className="num"
          fontSize="12"
        >
          {state === "settled" ? `${targetAmount} paid` : targetAmount}
        </text>
        <text
          x={xR}
          y={cy + 86}
          textAnchor="middle"
          fill="var(--faint)"
          className="microlabel"
          fontSize="9"
        >
          {targetName}
        </text>

        {/* evidence line under the strand */}
        {(paymentTx || settleTx) && (
          <text
            x={midX}
            y={h - 10}
            textAnchor="middle"
            fill="var(--faint)"
            className="hash"
            fontSize="10"
          >
            {paymentTx ? `pay ${shortHash(paymentTx)}` : ""}
            {paymentTx && settleTx ? "  →  " : ""}
            {settleTx ? `settle ${shortHash(settleTx)}` : ""}
          </text>
        )}
      </svg>
    </figure>
  );
}
