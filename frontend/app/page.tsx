import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-zinc-900 to-gray-900 text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-32 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-400 uppercase tracking-widest">
          Powered by ALICE-Font
        </div>

        <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          ALICE Font CDN
        </h1>

        <p className="mt-6 max-w-2xl text-xl font-semibold text-violet-300 sm:text-2xl">
          Don&apos;t serve bloated fonts. Serve the law of glyphs.
        </p>

        <p className="mt-4 max-w-xl text-base text-gray-400">
          Smart font delivery powered by ALICE-Font. Compress, subset, and
          analyze typefaces at the edge — deliver only the glyphs your users
          need, in the format their browser demands.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard/console"
            className="rounded-lg bg-violet-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-400"
          >
            Open Font Console
          </Link>
          <Link
            href="#features"
            className="rounded-lg border border-white/20 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">
          Core Capabilities
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <FeatureCard
            icon="🗜"
            title="Font Compression"
            description="Convert and compress typefaces into WOFF2, WOFF, OTF, or TTF. Achieve up to 65% size reduction with quality-controlled encoding."
          />
          <FeatureCard
            icon="🔤"
            title="Unicode Subsetting"
            description="Deliver only the character ranges your page requires. Slice 22,000-glyph CJK fonts down to the 200 characters that matter."
          />
          <FeatureCard
            icon="📊"
            title="Font Analytics"
            description="Inspect glyph count, format, OpenType features, variable axes, and Unicode coverage before serving — no surprises at render time."
          />
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 sm:grid-cols-3">
          <StatBlock value="65%" label="Average size reduction (woff2)" />
          <StatBlock value="4" label="Output formats supported" />
          <StatBlock value="22K+" label="Glyphs handled in Noto Sans JP" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-gray-600">
        ALICE Font CDN &mdash; AGPL-3.0
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-violet-500/40 hover:bg-white/8">
      <div className="mb-3 text-3xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-400">{description}</p>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-extrabold text-violet-300">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
