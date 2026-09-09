import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg tracking-tight">
          Gage<span className="text-accent">.</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/#mechanism"
            className="text-sm text-mute transition-colors hover:text-ink"
          >
            How it works
          </Link>
          <Link
            href="/console"
            className="rounded-full border border-hairline-strong px-4 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Open console
          </Link>
        </nav>
      </div>
      {/* status strip: mono, real values only */}
      <div className="border-t border-hairline">
        <div className="microlabel mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-6 py-2 text-faint">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
            testnet
          </span>
          <span>sepolia · chainkey 1</span>
          <span>creditcoin cc3 · 102031</span>
          <span>attestcoin precompile 0x0FD2</span>
          <span>no wallet needed to read</span>
        </div>
      </div>
    </header>
  );
}
