import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <p className="font-display text-base">Gage</p>
          <p className="mt-2 text-sm text-faint">
            Deployed on Ethereum Sepolia and Creditcoin CC3 testnet. Reading is
            free and needs no wallet. Deals on this site are testnet value only.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm sm:items-end">
          <Link
            href="/console"
            className="text-mute transition-colors hover:text-accent"
          >
            Console
          </Link>
          <a
            href="https://docs.attestcoin.org/"
            className="text-mute transition-colors hover:text-accent"
            rel="noreferrer"
          >
            Attestcoin docs
          </a>
          <p className="text-faint">
            built by{" "}
            <a
              href="https://x.com/a_raphie"
              className="text-mute underline decoration-hairline-strong underline-offset-4 transition-colors hover:text-accent"
              rel="noreferrer"
            >
              Raphie
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
