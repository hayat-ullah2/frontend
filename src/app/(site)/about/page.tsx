import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Newsletter from "@/components/site/Newsletter";
import { ArrowRight, Mail, Sparkles, Users } from "@/components/Icon";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are, what we publish, and why we built Nexversal.",
};

const values = [
  {
    title: "Write what matters",
    body: "Long-form, original, unhurried. We choose depth over volume — every guide should earn its place and actually help you decide.",
  },
  {
    title: "Respect the reader",
    body: "No dark patterns, no clickbait, no sponsored fluff. When we recommend a tool, we say why — and we disclose affiliate links up front.",
  },
  {
    title: "Build in the open",
    body: "We publish our editorial standards, cite our sources, and correct mistakes openly. Trust is the only metric that compounds.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero */}
      <section className="relative">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 text-center">
          <span className="chip">
            <Sparkles size={12} /> About us
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            Practical guides to the tools that{" "}
            <span className="text-gradient-accent">actually ship.</span>
          </h1>
          <p className="mt-5 text-foreground-muted text-lg max-w-2xl mx-auto">
            Nexversal is an independent publication about AI tools and developer
            tooling for founders and engineers. We test what we write about and
            choose depth over volume.
          </p>
          <div className="mt-8">
            <Link href="/blog" className="btn-primary inline-flex">
              Browse articles <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[5/4] rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80&auto=format&fit=crop"
              alt="Working through a developer tooling comparison"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Our mission</h2>
            <p className="mt-4 text-foreground-muted leading-relaxed">
              There is no shortage of AI-tool listicles. There is a shortage of
              honest, hands-on guidance that helps a founder or engineer pick the
              right tool and get it working.
            </p>
            <p className="mt-3 text-foreground-muted leading-relaxed">
              Nexversal exists to publish exactly that — evaluated recommendations,
              real trade-offs, and setups you can actually follow.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="chip">What we believe</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Our values</h2>
          <p className="mt-3 text-foreground-muted">Three rules that guide every editorial decision.</p>
        </div>
        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div key={v.title} className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent grid place-items-center text-white font-bold">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-4 font-semibold text-lg">{v.title}</h3>
              <p className="mt-2 text-sm text-foreground-muted leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who writes Nexversal */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="chip">
          <Users size={12} /> The team
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
          Who writes Nexversal
        </h2>
        <p className="mt-4 text-foreground-muted leading-relaxed">
          Nexversal is independently written and edited. Every article is
          attributed to its author, whose credentials and links appear on their
          author page. We don&apos;t publish anonymous or AI-spun filler.
        </p>
        <div className="mt-6">
          <Link
            href="/contact"
            className="text-sm text-foreground-muted hover:text-foreground inline-flex items-center gap-1"
          >
            Want to write for us? Get in touch <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Contact strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="card p-8 grid sm:grid-cols-2 gap-6 items-center">
          <Info icon={<Mail size={18} />} label="Email" value="hello@nexversal.com" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-accent grid place-items-center text-white">
              <ArrowRight size={18} />
            </div>
            <div>
              <p className="text-xs text-foreground-subtle uppercase tracking-wider">
                Prefer a form?
              </p>
              <Link href="/contact" className="text-foreground font-medium hover:underline">
                Use our contact page
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Newsletter />
      </section>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-accent grid place-items-center text-white">
        {icon}
      </div>
      <div>
        <p className="text-xs text-foreground-subtle uppercase tracking-wider">{label}</p>
        <p className="text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
}
