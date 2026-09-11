import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <p className="microlabel text-faint">404 · nothing settled here</p>
          <h1 className="mt-6 font-display text-5xl tracking-tight">
            Page not found.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-mute">
            This route does not exist on Gage. The deals are all in the
            console, and every one of them is on-chain.
          </p>
          <a
            href="/console"
            className="mt-8 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-deep"
          >
            Open the console
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
