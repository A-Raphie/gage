import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Strand } from "@/components/strand";
import { LiveProof } from "@/components/live-proof";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* hero */}
        <section className="mx-auto max-w-3xl px-6 pt-24 pb-16 text-center sm:pt-32">
          <p className="microlabel text-accent">
            proof-settled escrow · attestcoin protocol
          </p>
          <h1 className="mt-6 font-display text-4xl leading-[0.95] tracking-tight sm:text-7xl">
            Pay on Ethereum.
            <br />
            <span className="text-accent">Release on proof.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-mute">
            A deal is opened on Creditcoin with the gage locked. You pay on
            Ethereum. Attestcoin proves that exact payment to a Creditcoin
            contract, and the gage releases automatically. No bridge holds your
            money. No oracle operator can lie.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/console"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-deep active:scale-[0.98]"
            >
              Open the console
            </a>
            <a
              href="#mechanism"
              className="rounded-full border border-hairline-strong px-6 py-2.5 text-sm text-mute transition-colors hover:border-accent hover:text-accent"
            >
              Read the mechanism
            </a>
          </div>
          <p className="hash mt-6 break-all px-2 text-xs text-faint">
            live on sepolia · 0xA93DD76Ce639Dd9BE4C780363d54706E098aa1c4
          </p>
          <LiveProof />

          {/* hero visual: a real proof from our run, labeled as a specimen deal */}
          <div className="mt-16 text-left">
            <p className="microlabel mb-3 text-faint">
              specimen deal · real proof data from our testnet run
            </p>
            <Strand
              state="settled"
              sourceName="Sepolia"
              targetName="Creditcoin CC3"
              sourceAmount="0.500 ETH escrowed"
              targetAmount="800 CTC"
              paymentTx="0x45044474aa2691ad1c1d7a6f472fa63f834791a466e579e7303d33612d1fe93a"
              height={11669038}
            />
          </div>
        </section>

        {/* judge path */}
        <section aria-label="90 second judge path" className="border-t border-hairline bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <p className="microlabel text-faint">the 90 second path</p>
            <ol className="mt-4 grid gap-px overflow-hidden rounded-[var(--r-panel)] border border-hairline bg-hairline sm:grid-cols-3">
              {[
                { n: "01", t: "Open the console", d: "Live reads from both chains. No wallet, no signup." },
                { n: "02", t: "Open deal #0001", d: "Terms, the proof strand, and the settled state." },
                { n: "03", t: "Verify it yourself", d: "Explorer links on every deal; every claim on this page is exercised." },
              ].map((s2) => (
                <li key={s2.n} className="bg-surface p-5">
                  <p className="num text-sm text-accent">{s2.n}</p>
                  <p className="mt-2 font-medium">{s2.t}</p>
                  <p className="mt-1 text-sm text-mute">{s2.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 01 · the problem */}
        <section className="border-t border-hairline">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="microlabel text-faint">01 · the problem</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
              Cross-chain deals still run on trust in a stranger
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--r-panel)] border border-hairline bg-hairline sm:grid-cols-3">
              {[
                {
                  n: "$2.2B",
                  label: "stolen from crypto protocols in 2024",
                  src: "Chainalysis, Jan 2025",
                },
                {
                  n: "$2B+",
                  label: "of 2022 thefts came from bridges alone",
                  src: "Chainalysis, 2022 crime report",
                },
                {
                  n: "$624M",
                  label: "lost in a single bridge hack (Ronin)",
                  src: "Ronin postmortem, Mar 2022",
                },
              ].map((s) => (
                <div key={s.n} className="bg-surface p-6">
                  <p className="font-display text-4xl text-accent">{s.n}</p>
                  <p className="mt-3 text-sm text-mute">{s.label}</p>
                  <p className="microlabel mt-3 text-faint">{s.src}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* thesis band */}
        <section className="border-t border-hairline bg-surface">
          <div className="mx-auto max-w-3xl px-6 py-28 text-center">
            <p className="font-display text-3xl leading-snug sm:text-4xl">
              A payment is a fact.
              <br />
              <span className="text-accent">Gage settles on facts.</span>
            </p>
            <p className="mx-auto mt-6 max-w-lg text-mute">
              Attestcoin turns a Sepolia transaction into something a Creditcoin
              contract can verify by itself, synchronously, with no committee of
              signers to trust. The proof is the settlement.
            </p>
          </div>
        </section>

        {/* 02 · mechanism */}
        <section id="mechanism" className="scroll-mt-20 border-t border-hairline">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="microlabel text-faint">02 · mechanism</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
              Four steps, zero trusted parties
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--r-panel)] border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  n: "01",
                  t: "The gage is locked",
                  d: "The deal maker posts terms on Creditcoin: amount, counterparty, expiry, payment reference. The gage locks in the same transaction.",
                },
                {
                  n: "02",
                  t: "The payment lands on Sepolia",
                  d: "The counterparty pays into the GageDeal escrow. The payment emits one unambiguous event with the deal id attached.",
                },
                {
                  n: "03",
                  t: "Attestcoin proves it",
                  d: "The block is attested on Creditcoin, then a Merkle and continuity proof for that exact transaction is checked by the native verifier precompile 0x0FD2.",
                },
                {
                  n: "04",
                  t: "The gage releases",
                  d: "The contract decodes the proved payment, checks it against the deal terms, and pays the counterparty in the same transaction. Anyone can submit the proof.",
                },
              ].map((s) => (
                <div key={s.n} className="bg-surface p-6">
                  <p className="num text-sm text-accent">{s.n}</p>
                  <p className="mt-3 font-medium">{s.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{s.d}</p>
                </div>
              ))}
            </div>
            <p className="hash mt-8 overflow-x-auto whitespace-nowrap rounded-[var(--r-tile)] border border-hairline bg-surface px-4 py-3 text-xs text-accent-soft">
              pay(sepolia) → attest(cc3) → prove(0x0FD2) → release(cc3)
            </p>

            {/* can / cannot */}
            <div className="mt-16 grid gap-px overflow-hidden rounded-[var(--r-panel)] border border-hairline bg-hairline sm:grid-cols-2">
              <div className="bg-surface p-6">
                <p className="microlabel text-ok">what gage does</p>
                <ul className="mt-4 space-y-3 text-sm text-mute">
                  <li>✓ release the gage only on a proved, matching payment</li>
                  <li>✓ let anyone submit the proof: no privileged relayer</li>
                  <li>✓ batch: up to 10 payments verified in one Creditcoin transaction</li>
                  <li>✓ refund the maker if no payment proves before expiry</li>
                  <li>✓ refund the payer if a deal dies after payment (3 day window)</li>
                </ul>
              </div>
              <div className="bg-surface p-6">
                <p className="microlabel text-danger">what gage will not do</p>
                <ul className="mt-4 space-y-3 text-sm text-mute">
                  <li>✗ move tokens through a bridge or a liquidity pool</li>
                  <li>✗ trust an oracle committee, a multisig, or our own team</li>
                  <li>✗ settle on a price feed: payments are proofs, not estimates</li>
                  <li>✗ hold custody of your keys or your funds between deals</li>
                  <li>✗ touch mainnet value: this deployment is testnet only</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 03 · faq */}
        <section className="border-t border-hairline bg-surface">
          <div className="mx-auto max-w-3xl px-6 py-24">
            <p className="microlabel text-faint">03 · honest questions</p>
            <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              Asked and answered
            </h2>
            <dl className="mt-12 space-y-10">
              {[
                {
                  q: "What if the payment never happens?",
                  a: "The deal expires and the maker reclaims the gage with one transaction. If a payment did land but the deal died, the payer reclaims the escrow after a three day window. Every path out is on-chain and self-executable.",
                },
                {
                  q: "Why is this not just another oracle?",
                  a: "An oracle tells a contract what someone observed. Attestcoin proves what happened: the inclusion proof pins the exact transaction in the exact block of the source chain, and the Creditcoin contract verifies the cryptography itself. There is no operator whose lie would be accepted.",
                },
                {
                  q: "Who can trigger the settlement?",
                  a: "Anyone. The settle function is permissionless and the proof is deduplicated on-chain, so the worker that submits it has no special power. If we disappeared tomorrow, every open deal would still settle.",
                },
              ].map((f) => (
                <div key={f.q}>
                  <dt className="font-medium">{f.q}</dt>
                  <dd className="mt-2 leading-relaxed text-mute">{f.a}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-16 text-center">
              <a
                href="/console"
                className="inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-deep active:scale-[0.98]"
              >
                Open the console
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
