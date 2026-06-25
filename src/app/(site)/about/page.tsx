import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Newsletter from "@/components/site/Newsletter";
import { ArrowRight, Mail, MapPin, Phone, Sparkles, Users } from "@/components/Icon";
import { authors } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are, what we publish, and why we built NexBlog.",
};

const values = [
  { title: "Write what matters", body: "Long-form, original, unhurried. We choose depth over volume — every essay should earn its place." },
  { title: "Respect the reader", body: "No dark patterns, no clickbait, no sponsored fluff. Reader trust is the only metric that compounds." },
  { title: "Build in public", body: "Our editorial calendar, traffic numbers and revenue are open. Transparency keeps us honest." },
];

const milestones = [
  { year: "2023", text: "NexBlog founded as a side-project newsletter." },
  { year: "2024", text: "Crossed 100k monthly readers; brought on three full-time editors." },
  { year: "2025", text: "Launched the writers' program and the open editorial calendar." },
  { year: "2026", text: "Half a million monthly readers across 14 niches." },
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
            We publish ideas that <span className="text-gradient-accent">earn the page.</span>
          </h1>
          <p className="mt-5 text-foreground-muted text-lg max-w-2xl mx-auto">
            NexBlog is a small, opinionated publication covering technology, AI, business,
            finance and the lives we build around them. We choose depth over volume and
            trust over reach.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[5/4] rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80&auto=format&fit=crop"
              alt="The team"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Our mission</h2>
            <p className="mt-4 text-foreground-muted leading-relaxed">
              The web is full of content. We're betting it's hungry for writing —
              for arguments that take a position, evidence that earns trust and
              prose that respects the reader's time.
            </p>
            <p className="mt-3 text-foreground-muted leading-relaxed">
              NexBlog exists to publish the long-form work the internet rewards
              the least and needs the most.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { v: "1.2k+", l: "Articles" },
                { v: "120+", l: "Writers" },
                { v: "480k", l: "Monthly readers" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-2xl font-bold">{s.v}</p>
                  <p className="text-xs text-foreground-subtle uppercase tracking-wider">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
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

      {/* Timeline */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="chip">Milestones</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">A short history</h2>
        </div>
        <ol className="mt-10 relative border-l border-white/10 ml-2">
          {milestones.map((m) => (
            <li key={m.year} className="pl-6 pb-8 relative">
              <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-gradient-accent" />
              <p className="text-sm text-foreground-subtle">{m.year}</p>
              <p className="mt-1 text-foreground">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="chip">
              <Users size={12} /> The team
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              The people behind it
            </h2>
          </div>
          <Link href="/contact" className="text-sm text-foreground-muted hover:text-foreground inline-flex items-center gap-1">
            Join us <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.slice(0, 6).map((a) => (
            <Link key={a.slug} href={`/author/${a.slug}`} className="card p-6 group">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden">
                  <Image src={a.avatar} alt={a.name} fill sizes="64px" className="object-cover" />
                </div>
                <div>
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-xs text-foreground-subtle">{a.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-foreground-muted line-clamp-3">{a.bio}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Contact strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="card p-8 grid sm:grid-cols-3 gap-6">
          <Info icon={<Mail size={18} />} label="Email" value="hello@nexblog.com" />
          <Info icon={<Phone size={18} />} label="Phone" value="+41 22 555 0142" />
          <Info icon={<MapPin size={18} />} label="HQ" value="Zürich, Switzerland" />
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
